
const express = require("express");
const mongoose = require("mongoose");
const Book = require("../models/Book");
const Reservation = require("../models/Reservation");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const BOOK_LANGUAGES = ["English", "Sinhala"];
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_COVER_IMAGE_LENGTH = 2048;
const { parse } = require("csv-parse/sync");

function validateOptionalText(value, field, maxLength) {
  if (value === undefined) return null;

  if (typeof value !== "string") {
    return `${field} must be a string.`;
  }

  if (value.trim().length > maxLength) {
    return `${field} must be ${maxLength} characters or fewer.`;
  }

  return null;
}

function isValidCoverImageUrl(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function validateCoverImage(value) {
  const textError = validateOptionalText(
    value,
    "Cover image",
    MAX_COVER_IMAGE_LENGTH
  );

  if (textError) return textError;
  if (value !== undefined && !isValidCoverImageUrl(value.trim())) {
    return "Cover image must be a valid HTTP or HTTPS URL.";
  }

  return null;
}

// Only authenticated librarians can manage books.
function librarianOnly(req, res, next) {
  if (req.user.role !== "librarian") {
    return res.status(403).json({
      message: "Only librarians can manage books.",
    });
  }

  next();
}

// Get all books (public catalog).

/**
 * Bulk import books from CSV (librarian only).
 * Expected columns:
 * title, author, category, description, language, copies
 * Optional column: coverImage
 */
router.post("/bulk-import", authMiddleware, librarianOnly, async (req, res) => {
  try {
    const { csv } = req.body;
    const updateExistingOnly = req.body.updateExistingOnly === true;

    if (typeof csv !== "string" || !csv.trim()) {
      return res.status(400).json({
        message: "Please provide CSV content.",
      });
    }

    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
      relax_column_count: false,
    });

    if (records.length === 0) {
      return res.status(400).json({
        message: "The CSV file contains no book records.",
      });
    }

    if (records.length > 500) {
      return res.status(400).json({
        message: "Import up to 500 books at a time.",
      });
    }

    const requiredColumns = [
      "title",
      "author",
      "category",
      "description",
      "language",
      "copies",
    ];

    const csvColumns = Object.keys(records[0] || {});
    const missingColumns = requiredColumns.filter(
      (column) => !csvColumns.includes(column)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        message: `Missing CSV columns: ${missingColumns.join(", ")}`,
      });
    }

    const seenInFile = new Set();
    const newBooks = [];
    const coverUpdates = [];
    const errors = [];
    let duplicates = 0;
    let booksNotFound = 0;

    for (let index = 0; index < records.length; index += 1) {
      const row = records[index];
      const title = row.title?.trim();
      const author = row.author?.trim();
      const category = row.category?.trim();
      const description = row.description?.trim() || "";
      const language = row.language?.trim();
      const copiesText = row.copies?.trim();
      const coverImage = row.coverImage?.trim() || "";
      const copies = Number(copiesText);

      const rowNumber = index + 2;

      if (!title || !author || !category) {
        errors.push(`Row ${rowNumber}: title, author, and category are required.`);
        continue;
      }

      const descriptionError = validateOptionalText(
        description,
        "Description",
        MAX_DESCRIPTION_LENGTH
      );
      const coverImageError = validateCoverImage(coverImage);

      if (descriptionError || coverImageError) {
        errors.push(
          `Row ${rowNumber}: ${descriptionError || coverImageError}`
        );
        continue;
      }

      if (!BOOK_LANGUAGES.includes(language)) {
        errors.push(`Row ${rowNumber}: language must be English or Sinhala.`);
        continue;
      }

      if (
        copiesText === "" ||
        !Number.isSafeInteger(copies) ||
        copies < 0
      ) {
        errors.push(`Row ${rowNumber}: copies must be a whole number of 0 or more.`);
        continue;
      }

      const key = `${title.toLowerCase()}|${author.toLowerCase()}|${language.toLowerCase()}`;

      if (seenInFile.has(key)) {
        duplicates += 1;
        continue;
      }

      seenInFile.add(key);

      const existingBook = await Book.findOne({
        title: { $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        author: { $regex: `^${author.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        language,
      }).select("_id coverImage");

      if (existingBook) {
        duplicates += 1;
        if (
          coverImage &&
          (updateExistingOnly || !existingBook.coverImage)
        ) {
          coverUpdates.push({
            updateOne: {
              filter: { _id: existingBook._id },
              update: { $set: { coverImage } },
            },
          });
        }
        continue;
      }

      if (updateExistingOnly) {
        booksNotFound += 1;
        continue;
      }

      newBooks.push({
        title,
        author,
        category,
        description,
        language,
        coverImage,
        totalCopies: copies,
        availableCopies: copies,
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "The CSV contains invalid rows. No books were imported.",
        errors,
        duplicatesSkipped: duplicates,
      });
    }

    if (newBooks.length === 0 && coverUpdates.length === 0) {
      return res.status(200).json({
        message: updateExistingOnly
          ? "No existing books needed cover updates."
          : "No new books to import.",
        imported: 0,
        coversUpdated: 0,
        duplicatesSkipped: duplicates,
        booksNotFound,
      });
    }

    const result =
      newBooks.length > 0
        ? await Book.insertMany(newBooks, { ordered: true })
        : [];
    const coverResult =
      coverUpdates.length > 0
        ? await Book.bulkWrite(coverUpdates)
        : null;

    return res.status(201).json({
      message: updateExistingOnly
        ? "Cover image import completed."
        : "CSV import completed.",
      imported: result.length,
      coversUpdated: coverResult?.modifiedCount || 0,
      duplicatesSkipped: duplicates,
      booksNotFound,
    });
  } catch (error) {
    console.error("Error importing books:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A duplicate book was detected. Please check your CSV and try again.",
      });
    }

    return res.status(400).json({
      message: "Unable to import the CSV. Check its format and column names.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    return res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).json({
      message: "Unable to fetch books.",
    });
  }
});


// Get one book by ID.
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid book ID.",
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    return res.status(500).json({
      message: "Unable to fetch book.",
    });
  }
});

// Add a book (librarian only).
router.post("/", authMiddleware, librarianOnly, async (req, res) => {
  try {
    const body = req.body || {};
    const {
      title,
      author,
      category,
      language,
      description,
      coverImage,
    } = body;
    const availableCopies = Number(body.availableCopies);

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof author !== "string" ||
      !author.trim() ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        message: "Title, author, and category are required.",
      });
    }

    const descriptionError = validateOptionalText(
      description,
      "Description",
      MAX_DESCRIPTION_LENGTH
    );
    const coverImageError = validateCoverImage(coverImage);

    if (descriptionError || coverImageError) {
      return res.status(400).json({
        message: descriptionError || coverImageError,
      });
    }

    if (language !== undefined && !BOOK_LANGUAGES.includes(language)) {
      return res.status(400).json({
        message: "Language must be English or Sinhala.",
      });
    }

    if (
      body.availableCopies === undefined ||
      body.availableCopies === null ||
      body.availableCopies === "" ||
      !Number.isSafeInteger(availableCopies) ||
      availableCopies < 0
    ) {
      return res.status(400).json({
        message: "Available copies must be a whole number of 0 or more.",
      });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      language: language || "English",
      description: description?.trim() || "",
      coverImage: coverImage?.trim() || "",
      totalCopies: availableCopies,
      availableCopies,
    });

    return res.status(201).json({
      message: "Book added successfully.",
      book,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A book with these details already exists.",
      });
    }

    if (error.name === "ValidationError") {
      const validationMessages = Object.values(error.errors || {})
        .map((validationError) => validationError.message)
        .filter(Boolean);

      return res.status(400).json({
        message: validationMessages.length
          ? `The book details are invalid: ${validationMessages.join(" ")}`
          : "The book details are invalid.",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "One or more book fields have an invalid value.",
      });
    }

    console.error("Error adding book:", error);
    return res.status(500).json({
      message: "Unable to add book.",
    });
  }
});

// Edit book details and maintain inventory consistency.
router.put("/:id", authMiddleware, librarianOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid book ID.",
      });
    }

    const body = req.body || {};
    const {
      title,
      author,
      category,
      language,
      description,
      coverImage,
    } = body;
    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Title is required.",
        });
      }
      updates.title = title.trim();
    }

    if (author !== undefined) {
      if (typeof author !== "string" || !author.trim()) {
        return res.status(400).json({
          message: "Author is required.",
        });
      }
      updates.author = author.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({
          message: "Category is required.",
        });
      }
      updates.category = category.trim();
    }

    if (language !== undefined) {
      if (!BOOK_LANGUAGES.includes(language)) {
        return res.status(400).json({
          message: "Language must be English or Sinhala.",
        });
      }
      updates.language = language;
    }

    const descriptionError = validateOptionalText(
      description,
      "Description",
      MAX_DESCRIPTION_LENGTH
    );
    const coverImageError = validateCoverImage(coverImage);

    if (descriptionError || coverImageError) {
      return res.status(400).json({
        message: descriptionError || coverImageError,
      });
    }

    if (description !== undefined) {
      updates.description = description.trim();
    }

    if (coverImage !== undefined) {
      updates.coverImage = coverImage.trim();
    }

    // If the librarian changes available copies, preserve the number
    // of copies already reserved by members.
    let newAvailableCopies;

    if (body.availableCopies !== undefined) {
      newAvailableCopies = Number(body.availableCopies);

      if (
        body.availableCopies === null ||
        body.availableCopies === "" ||
        !Number.isSafeInteger(newAvailableCopies) ||
        newAvailableCopies < 0
      ) {
        return res.status(400).json({
          message: "Available copies must be a whole number of 0 or more.",
        });
      }
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    if (newAvailableCopies !== undefined) {
      // Pending and approved reservations both occupy a copy.
      const reservedCopies = await Reservation.countDocuments({
        book: book._id,
        status: { $in: ["pending", "approved"] },
      });

      book.availableCopies = newAvailableCopies;
      book.totalCopies = newAvailableCopies + reservedCopies;
    }

    Object.assign(book, updates);

    await book.save();

    return res.status(200).json({
      message: "Book updated successfully.",
      book,
    });
  } catch (error) {
    console.error("Error updating book:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "The book details are invalid.",
      });
    }

    return res.status(500).json({
      message: "Unable to update book.",
    });
  }
});

// Delete a book (librarian only).
router.delete("/:id", authMiddleware, librarianOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid book ID.",
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    const hasReservations = await Reservation.exists({
      book: book._id,
    });

    if (hasReservations) {
      return res.status(409).json({
        message:
          "This book has reservation records and cannot be deleted.",
      });
    }

    await book.deleteOne();

    return res.status(200).json({
      message: "Book removed successfully.",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(500).json({
      message: "Unable to delete book.",
    });
  }
});

module.exports = router;
