
const express = require("express");
const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Book = require("../models/Book");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { addCalendarDays } = require("../services/libraryDates");

const router = express.Router();
const ACTIVE_RESERVATION_STATUSES = ["pending", "approved"];
const MAX_ACTIVE_RESERVATIONS = 5;

// Only librarians can manage all reservations.
function librarianOnly(req, res, next) {
  if (req.user.role !== "librarian") {
    return res.status(403).json({
      message: "Librarian access is required.",
    });
  }

  next();
}

// Create a reservation for the logged-in member.
router.post("/", authMiddleware, async (req, res) => {
  let session;

  try {
    if (req.user.role !== "member") {
      return res.status(403).json({
        message: "Only members can reserve books.",
      });
    }

    const { bookId } = req.body;

    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({
        message: "Please provide a valid book ID.",
      });
    }

    session = await mongoose.startSession();

    let reservation;

    await session.withTransaction(async () => {
      const memberUpdate = await User.updateOne(
        { _id: req.user.id },
        { $inc: { reservationLockVersion: 1 } },
        { session }
      );

      if (memberUpdate.matchedCount === 0) {
        const error = new Error("Member account not found.");
        error.statusCode = 404;
        throw error;
      }

      const activeReservationFilter = {
        member: req.user.id,
        status: { $in: ACTIVE_RESERVATION_STATUSES },
      };

      const outstandingBorrow = await Reservation.exists({
        member: req.user.id,
        status: "borrowed",
      }).session(session);

      if (outstandingBorrow) {
        const error = new Error(
          "You cannot reserve another book until all borrowed books have been returned."
        );
        error.statusCode = 409;
        throw error;
      }

      const alreadyReserved = await Reservation.exists({
        ...activeReservationFilter,
        book: bookId,
      }).session(session);

      if (alreadyReserved) {
        const error = new Error(
          "You already have an active reservation for this book."
        );
        error.statusCode = 409;
        throw error;
      }

      const activeReservationCount = await Reservation.countDocuments(
        activeReservationFilter
      ).session(session);

      if (activeReservationCount >= MAX_ACTIVE_RESERVATIONS) {
        const error = new Error(
          `You've reached the ${MAX_ACTIVE_RESERVATIONS}-book limit. You can have up to ${MAX_ACTIVE_RESERVATIONS} active reservations at a time.`
        );
        error.statusCode = 409;
        throw error;
      }

      const reservedBook = await Book.findOneAndUpdate(
        {
          _id: bookId,
          availableCopies: { $gt: 0 },
        },
        { $inc: { availableCopies: -1 } },
        { new: true, session }
      );

      if (!reservedBook) {
        const bookExists = await Book.exists({ _id: bookId }).session(
          session
        );
        const error = new Error(
          bookExists
            ? "This book is currently unavailable."
            : "Book not found."
        );
        error.statusCode = bookExists ? 409 : 404;
        throw error;
      }

      [reservation] = await Reservation.create(
        [
          {
            member: req.user.id,
            book: reservedBook._id,
            status: "pending",
          },
        ],
        { session }
      );
    });

    return res.status(201).json({
      message:
        "Book reserved successfully! Your reservation is pending approval.",
      reservation,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Error creating reservation:", error);

    return res.status(500).json({
      message: "Unable to create the reservation.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// Allow members to cancel their own active reservations.
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  let session;

  try {
    if (req.user.role !== "member") {
      return res.status(403).json({
        message: "Only members can cancel their reservations.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID.",
      });
    }

    session = await mongoose.startSession();

    let cancelledReservation;

    await session.withTransaction(async () => {
      const memberUpdate = await User.updateOne(
        { _id: req.user.id },
        { $inc: { reservationLockVersion: 1 } },
        { session }
      );

      if (memberUpdate.matchedCount === 0) {
        const error = new Error("Member account not found.");
        error.statusCode = 404;
        throw error;
      }

      cancelledReservation = await Reservation.findOneAndUpdate(
        {
          _id: req.params.id,
          member: req.user.id,
          status: { $in: ACTIVE_RESERVATION_STATUSES },
        },
        { $set: { status: "cancelled" } },
        { new: true, session }
      );

      if (!cancelledReservation) {
        const ownedReservation = await Reservation.exists({
          _id: req.params.id,
          member: req.user.id,
        }).session(session);
        const error = new Error(
          ownedReservation
            ? "This reservation is no longer active."
            : "Reservation not found."
        );
        error.statusCode = ownedReservation ? 409 : 404;
        throw error;
      }

      const restoredBook = await Book.findOneAndUpdate(
        { _id: cancelledReservation.book },
        { $inc: { availableCopies: 1 } },
        { new: true, session }
      );

      if (!restoredBook) {
        const error = new Error(
          "The book could not be found. No changes were saved."
        );
        error.statusCode = 409;
        throw error;
      }
    });

    return res.status(200).json({
      message: "Reservation cancelled and book availability restored.",
      reservation: cancelledReservation,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Error cancelling reservation:", error);

    return res.status(500).json({
      message: "Unable to cancel the reservation.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// Record when a member physically collects an approved book.
router.patch("/:id/borrow", authMiddleware, librarianOnly, async (req, res) => {
  let session;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID.",
      });
    }

    session = await mongoose.startSession();

    let borrowedReservation;

    await session.withTransaction(async () => {
      const borrowedAt = new Date();
      const timeZone = process.env.LIBRARY_TIMEZONE || "Asia/Colombo";
      const dueDate = addCalendarDays(borrowedAt, 30, timeZone);

      borrowedReservation = await Reservation.findOneAndUpdate(
        { _id: req.params.id, status: "approved" },
        {
          $set: {
            status: "borrowed",
            borrowedAt,
            dueDate,
            returnedAt: null,
            reminderStatus: "pending",
            reminderSentAt: null,
          },
        },
        { new: true, session }
      );

      if (!borrowedReservation) {
        const exists = await Reservation.exists({
          _id: req.params.id,
        }).session(session);
        const error = new Error(
          exists
            ? "Only approved reservations can be marked as borrowed."
            : "Reservation not found."
        );
        error.statusCode = exists ? 409 : 404;
        throw error;
      }

      await User.updateOne(
        { _id: borrowedReservation.member },
        { $inc: { reservationLockVersion: 1 } },
        { session }
      );
    });

    return res.status(200).json({
      message: "Book marked as borrowed. The return deadline is in 30 days.",
      reservation: borrowedReservation,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Error marking reservation as borrowed:", error);
    return res.status(500).json({
      message: "Unable to mark the book as borrowed.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// Record a physical return and restore one available copy.
router.patch("/:id/return", authMiddleware, librarianOnly, async (req, res) => {
  let session;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reservation ID.",
      });
    }

    session = await mongoose.startSession();

    let returnedReservation;

    await session.withTransaction(async () => {
      returnedReservation = await Reservation.findOneAndUpdate(
        { _id: req.params.id, status: "borrowed" },
        {
          $set: {
            status: "returned",
            returnedAt: new Date(),
          },
        },
        { new: true, session }
      );

      if (!returnedReservation) {
        const exists = await Reservation.exists({
          _id: req.params.id,
        }).session(session);
        const error = new Error(
          exists
            ? "Only borrowed books can be marked as returned."
            : "Reservation not found."
        );
        error.statusCode = exists ? 409 : 404;
        throw error;
      }

      const restoredBook = await Book.findOneAndUpdate(
        {
          _id: returnedReservation.book,
          $expr: { $lt: ["$availableCopies", "$totalCopies"] },
        },
        { $inc: { availableCopies: 1 } },
        { new: true, session }
      );

      if (!restoredBook) {
        const error = new Error(
          "Book availability could not be restored. No changes were saved."
        );
        error.statusCode = 409;
        throw error;
      }

      await User.updateOne(
        { _id: returnedReservation.member },
        { $inc: { reservationLockVersion: 1 } },
        { session }
      );
    });

    return res.status(200).json({
      message: "Book marked as returned and availability restored.",
      reservation: returnedReservation,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Error marking reservation as returned:", error);
    return res.status(500).json({
      message: "Unable to mark the book as returned.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// Get reservations belonging to the logged-in member.
router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "member") {
      return res.status(403).json({
        message: "This page is for members only.",
      });
    }

    const reservations = await Reservation.find({
      member: req.user.id,
    })
      .populate("book")
      .sort({ createdAt: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching member reservations:", error);

    return res.status(500).json({
      message: "Unable to fetch your reservations.",
    });
  }
});

// Get all reservations for the librarian.
router.get("/", authMiddleware, librarianOnly, async (req, res) => {
  try {
    const reservations = await Reservation.find({
      status: { $ne: "cancelled" },
    })
      .populate("member", "name email")
      .populate("book", "title author category coverImage")
      .sort({ createdAt: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching all reservations:", error);

    return res.status(500).json({
      message: "Unable to fetch reservations.",
    });
  }
});

// Approve or reject a pending reservation.
router.patch(
  "/:id/status",
  authMiddleware,
  librarianOnly,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid reservation ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected.",
      });
    }

    let session;

    try {
      session = await mongoose.startSession();

      let updatedReservation;

      await session.withTransaction(async () => {
        // Only a pending reservation can be decided once.
        updatedReservation = await Reservation.findOneAndUpdate(
          { _id: id, status: "pending" },
          { $set: { status } },
          { new: true, session }
        );

        if (!updatedReservation) {
          const exists = await Reservation.exists({ _id: id }).session(
            session
          );

          const error = new Error(
            exists
              ? "This reservation has already been processed."
              : "Reservation not found."
          );

          error.statusCode = exists ? 409 : 404;
          throw error;
        }

        // A rejected reservation releases its previously reserved copy.
        if (status === "rejected") {
          const restoredBook = await Book.findOneAndUpdate(
            { _id: updatedReservation.book },
            { $inc: { availableCopies: 1 } },
            { new: true, session }
          );

          if (!restoredBook) {
            const error = new Error(
              "The book could not be found. No changes were saved."
            );

            error.statusCode = 409;
            throw error;
          }
        }
      });

      return res.status(200).json({
        message:
          status === "approved"
            ? "Reservation approved successfully."
            : "Reservation rejected and book availability restored.",
        reservation: updatedReservation,
      });
    } catch (error) {
      console.error("Error updating reservation:", error);

      return res.status(error.statusCode || 500).json({
        message:
          error.statusCode
            ? error.message
            : "Unable to update the reservation.",
      });
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
);

module.exports = router;
