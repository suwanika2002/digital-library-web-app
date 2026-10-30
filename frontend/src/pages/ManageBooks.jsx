import { useMemo, useState } from "react";
import "./Dashboard.css";

const API_BASE = "http://localhost:5000/api/books";

const emptyBook = {
  title: "",
  author: "",
  category: "",
  language: "English",
  copies: "1",
  description: "",
  coverImage: "",
};

function toUiBook(book) {
  const author = book.author || "";

  return {
    ...book,
    id: String(book.id ?? book._id ?? ""),
    copies: Number(book.availableCopies ?? book.copies ?? 0),
    palette: book.palette || "teal",
    mark:
      book.mark ||
      author
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 3)
        .toUpperCase(),
    description: book.description || "",
    coverImage: book.coverImage || "",
  };
}

function getBookId(book) {
  return String(book?.id ?? book?._id ?? "");
}

function ManageBooks({ books, onBooksChange, onNavigate }) {
  const [query, setQuery] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const displayBooks = useMemo(
    () => books.map(toUiBook),
    [books]
  );

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return displayBooks;

    return displayBooks.filter((book) =>
      `${book.title} ${book.author} ${book.category}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [displayBooks, query]);

  const closeEditor = () => {
    setEditingBook(null);
    setForm(emptyBook);
    setFormError("");
  };

  const startAdding = () => {
    setEditingBook("new");
    setForm(emptyBook);
    setFormError("");
    setNotice("");
  };

  const startEditing = (book) => {
    setEditingBook(getBookId(book));

    setForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      language: book.language || "English",
      copies: String(
        book.availableCopies ?? book.copies ?? 0
      ),
      description: book.description || "",
      coverImage: book.coverImage || "",
    });

    setFormError("");
    setNotice("");
  };

  // Add a new book or update an existing book in MongoDB.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    setFormError("");
    setNotice("");

    const title = form.title.trim();
    const author = form.author.trim();
    const category = form.category.trim();
    const language = form.language;
    const copies = Number(form.copies);

    if (!title || !author || !category) {
      setFormError(
        "Enter the title, author, and category."
      );
      return;
    }

    if (!Number.isInteger(copies) || copies < 0) {
      setFormError(
        "Available copies must be a whole number of 0 or more."
      );
      return;
    }

    const isNew = editingBook === "new";

    const existingBook = isNew
      ? null
      : displayBooks.find(
          (book) => getBookId(book) === String(editingBook)
        );

    if (!isNew && !existingBook) {
      setFormError(
        "This book is no longer in the collection. Close and try again."
      );
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      setFormError(
        "Please log in again before managing books."
      );
      return;
    }

    const payload = {
      title,
      author,
      category,
      language,
      description: form.description.trim(),
      coverImage: form.coverImage.trim(),
      availableCopies: copies,
    };

    setIsSaving(true);

    try {
      const response = await fetch(
        isNew
          ? API_BASE
          : `${API_BASE}/${getBookId(existingBook)}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to ${isNew ? "add" : "update"} this book.`
        );
      }

      // Use the returned book if the API provides it.
      // Otherwise reload the collection from the backend.
      const returnedBook = data.book || data;
      const hasBookId = returnedBook._id || returnedBook.id;

      if (hasBookId) {
        const savedBook = toUiBook(returnedBook);

        if (isNew) {
          onBooksChange((currentBooks) => [
            ...currentBooks.filter(
              (book) => getBookId(book) !== savedBook.id
            ),
            savedBook,
          ]);
        } else {
          onBooksChange((currentBooks) =>
            currentBooks.map((book) =>
              getBookId(book) === String(editingBook)
                ? savedBook
                : book
            )
          );
        }
      } else {
        const refreshResponse = await fetch(API_BASE);

        const refreshedBooks = await refreshResponse.json();

        if (!refreshResponse.ok || !Array.isArray(refreshedBooks)) {
          throw new Error(
            "The operation succeeded, but the book list could not be refreshed. Reload the page."
          );
        }

        onBooksChange(refreshedBooks.map(toUiBook));
      }

      setNotice(
        data.message ||
          (isNew
            ? `Added "${title}" to the collection.`
            : `Updated "${title}".`)
      );

      closeEditor();
    } catch (error) {
      setFormError(
        error instanceof TypeError
          ? "Unable to connect to the server. Check that the backend is running."
          : error.message
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a book from MongoDB.
  const confirmDelete = async () => {
    if (!bookToDelete || isDeleting) return;

    const deletedTitle = bookToDelete.title;
    const bookId = getBookId(bookToDelete);
    const token = localStorage.getItem("authToken");

    if (!token) {
      setNotice("Please log in again before managing books.");
      setBookToDelete(null);
      return;
    }

    setIsDeleting(true);
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/${bookId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to remove this book."
        );
      }

      onBooksChange((currentBooks) =>
        currentBooks.filter(
          (book) => getBookId(book) !== bookId
        )
      );

      if (String(editingBook) === bookId) {
        closeEditor();
      }

      setBookToDelete(null);

      setNotice(
        data.message ||
          `Removed "${deletedTitle}" from the collection.`
      );
    } catch (error) {
      setNotice(
        error instanceof TypeError
          ? "Unable to connect to the server. Check that the backend is running."
          : error.message
      );

      setBookToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Import books from a CSV file into MongoDB.
  const handleBulkImport = async (event, updateExistingOnly = false) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Allow CSV files only.
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setNotice("Please select a CSV file.");
      event.target.value = "";
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      setNotice("Please log in again before importing books.");
      event.target.value = "";
      return;
    }

    setIsImporting(true);
    setNotice("");

    try {
      const csv = await file.text();

      const response = await fetch(`${API_BASE}/bulk-import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ csv, updateExistingOnly }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorDetails = Array.isArray(data.errors)
          ? ` ${data.errors.slice(0, 5).join(" ")}`
          : "";

        throw new Error(
          (data.message || "Unable to import books.") + errorDetails
        );
      }

      // Refresh the collection from the backend.
      const refreshResponse = await fetch(API_BASE);

      if (!refreshResponse.ok) {
        throw new Error(
          "Import completed, but the book list could not be refreshed. Reload the page."
        );
      }

      const refreshedBooks = await refreshResponse.json();

      if (!Array.isArray(refreshedBooks)) {
        throw new Error(
          "Import completed, but the returned book list is invalid."
        );
      }

      onBooksChange(refreshedBooks);

      setNotice(
        `${data.message || "Import completed."} ` +
          `Imported: ${data.imported ?? 0}. ` +
          `Covers updated: ${data.coversUpdated ?? 0}. ` +
          `Duplicates skipped: ${data.duplicatesSkipped ?? 0}. ` +
          (updateExistingOnly
            ? `Books not found: ${data.booksNotFound ?? 0}.`
            : "")
      );
    } catch (error) {
      setNotice(
        error instanceof TypeError
          ? "Unable to connect to the server. Check that the backend is running."
          : error.message
      );
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  return (
    <section className="library-page manage-books-page">
      <header className="library-page-header">
        <button
          type="button"
          className="library-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <span className="catalog-brand-icon" aria-hidden="true">
            📚
          </span>
          <span>
            Digital <span className="brand-light">Library</span>
          </span>
        </button>

        <button
          type="button"
          className="library-nav-button"
          onClick={() => onNavigate("dashboard")}
        >
          Back to dashboard
        </button>
      </header>

      <main className="manage-books-content">
        <section className="manage-books-heading">
          <div>
            <p className="library-eyebrow">
              LIBRARIAN WORKSPACE
            </p>
            <h1>Manage the collection</h1>
            <p>
              Add new titles, update book information, or keep availability current.
            </p>
          </div>

         
  <div
    style={{
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      alignItems: "center",
    }}
  >
    <label
      className="dashboard-primary-action"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isImporting ? "wait" : "pointer",
        opacity: isImporting ? 0.6 : 1,
      }}
    >
      {isImporting ? "Importing..." : "Import CSV"}
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleBulkImport}
        disabled={isImporting}
        style={{ display: "none" }}
      />
    </label>

    <label
      className="dashboard-primary-action"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isImporting ? "wait" : "pointer",
        opacity: isImporting ? 0.6 : 1,
      }}
    >
      {isImporting ? "Importing..." : "Import cover images"}
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => handleBulkImport(event, true)}
        disabled={isImporting}
        style={{ display: "none" }}
      />
    </label>

    <button
      type="button"
      className="dashboard-primary-action"
      onClick={startAdding}
    >
      <span aria-hidden="true">＋</span> Add a book
    </button>
  </div>

        </section>

        {notice && (
          <p className="manage-books-notice" role="status">
            {notice}
          </p>
        )}

        <section
          className="manage-books-panel"
          aria-label="Book collection"
        >
          <div className="manage-books-toolbar">
            <div>
              <h2>Collection</h2>
              <p>
                {displayBooks.length}{" "}
                {displayBooks.length === 1 ? "title" : "titles"}
              </p>
            </div>

            <label className="manage-books-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search collection"
                placeholder="Search titles or authors"
              />
            </label>
          </div>

          {filteredBooks.length > 0 ? (
            <div className="manage-books-table-wrap">
              <table className="manage-books-table">
                <thead>
                  <tr>
                    <th scope="col">Book</th>
                    <th scope="col">Category</th>
                    <th scope="col">Language</th>
                    <th scope="col">Available</th>
                    <th scope="col">Status</th>
                    <th scope="col">
                      <span className="visually-hidden">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id}>
                      <td>
                        <div className="manage-book-title">
                          <span
                            className={`manage-book-mark catalog-cover-${book.palette}`}
                          >
                            {book.coverImage && (
                              <img
                                key={book.coverImage}
                                src={book.coverImage}
                                alt=""
                                onError={(event) => {
                                  event.currentTarget.hidden = true;
                                }}
                              />
                            )}
                            <span>{book.mark}</span>
                          </span>
                          <span>
                            <strong>{book.title}</strong>
                            <small>{book.author}</small>
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="manage-book-category">
                          {book.category}
                        </span>
                      </td>

                      <td>{book.language || "English"}</td>

                      <td>{book.copies}</td>

                      <td>
                        <span
                          className={
                            book.copies > 0
                              ? "manage-book-status in-stock"
                              : "manage-book-status out-of-stock"
                          }
                        >
                          <span aria-hidden="true">●</span>
                          {book.copies > 0
                            ? "Available"
                            : "Out of stock"}
                        </span>
                      </td>

                      <td>
                        <div className="manage-book-actions">
                          <button
                            type="button"
                            onClick={() => startEditing(book)}
                            aria-label={`Edit ${book.title}`}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-action"
                            onClick={() => setBookToDelete(book)}
                            aria-label={`Remove ${book.title}`}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="manage-books-empty">
              <span aria-hidden="true">⌕</span>
              <h2>No matching books</h2>
              <p>Try a different search, or add a new title.</p>
              <button
                type="button"
                onClick={() => setQuery("")}
              >
                Clear search
              </button>
            </div>
          )}
        </section>
      </main>

      {editingBook !== null && (
        <div className="reservation-dialog-backdrop">
          <section
            className="manage-book-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-book-dialog-title"
          >
            <div className="manage-book-dialog-heading">
              <div>
                <p className="library-eyebrow">
                  COLLECTION DETAILS
                </p>
                <h2 id="manage-book-dialog-title">
                  {editingBook === "new" ? "Add a book" : "Edit book"}
                </h2>
              </div>

              <button
                type="button"
                className="manage-book-dialog-close"
                onClick={closeEditor}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form
              className="manage-book-form"
              onSubmit={handleSubmit}
            >
              <label htmlFor="manage-title">Title</label>
              <input
                id="manage-title"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                required
                autoFocus
              />

              <label htmlFor="manage-author">Author</label>
              <input
                id="manage-author"
                value={form.author}
                onChange={(event) =>
                  setForm({ ...form, author: event.target.value })
                }
                required
              />

              <div className="manage-book-form-row manage-book-form-row-language">
                <div>
                  <label htmlFor="manage-category">
                    Category
                  </label>
                  <input
                    id="manage-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })
                    }
                    list="book-category-options"
                    required
                  />

                  <datalist id="book-category-options">
                    {[...new Set(
                      displayBooks.map((book) => book.category)
                    )].map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="manage-language">Language</label>
                  <select
                    id="manage-language"
                    value={form.language}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        language: event.target.value,
                      })
                    }
                    required
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="manage-copies">
                    Available copies
                  </label>
                  <input
                    id="manage-copies"
                    type="number"
                    min="0"
                    step="1"
                    value={form.copies}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        copies: event.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <label htmlFor="manage-description">
                Description <span>(optional)</span>
              </label>
              <textarea
                id="manage-description"
                rows="3"
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
              />

              <label htmlFor="manage-cover-image">
                Cover image URL <span>(optional)</span>
              </label>
              <input
                id="manage-cover-image"
                type="url"
                value={form.coverImage}
                onChange={(event) =>
                  setForm({
                    ...form,
                    coverImage: event.target.value,
                  })
                }
                placeholder="https://example.com/book-cover.jpg"
              />
              <p className="manage-book-form-help">
                Paste a direct link to the book cover image.
              </p>
              {form.coverImage && (
                <img
                  key={form.coverImage}
                  className="manage-book-cover-preview"
                  src={form.coverImage}
                  alt="Preview of the book cover"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                />
              )}

              {formError && (
                <p
                  className="registration-message registration-error"
                  role="alert"
                >
                  {formError}
                </p>
              )}

              <div className="manage-book-form-actions">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="dashboard-primary-action"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingBook === "new"
                      ? "Add to collection"
                      : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {bookToDelete && (
        <div className="reservation-dialog-backdrop">
          <section
            className="reservation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-book-title"
          >
            <span className="dialog-icon" aria-hidden="true">
              !
            </span>
            <h2 id="remove-book-title">
              Remove this book?
            </h2>
            <p>
              “{bookToDelete.title}” will be removed from the library database.
            </p>

            <div className="reservation-dialog-actions">
              <button
                type="button"
                className="library-back-button"
                onClick={() => setBookToDelete(null)}
                disabled={isDeleting}
              >
                Keep book
              </button>

              <button
                type="button"
                className="reservation-confirm-cancel"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Removing..." : "Remove book"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default ManageBooks;
