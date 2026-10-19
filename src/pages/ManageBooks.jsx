import { useMemo, useState } from "react";
import "./Dashboard.css";

const emptyBook = {
  title: "",
  author: "",
  category: "",
  copies: "1",
  description: "",
};

function ManageBooks({ books, onBooksChange, onNavigate }) {
  const [query, setQuery] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [bookToDelete, setBookToDelete] = useState(null);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return books;

    return books.filter((book) =>
      `${book.title} ${book.author} ${book.category}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [books, query]);

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
    setEditingBook(book.id);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      copies: String(book.copies),
      description: book.description,
    });
    setFormError("");
    setNotice("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const title = form.title.trim();
    const author = form.author.trim();
    const category = form.category.trim();
    const copies = Number(form.copies);

    if (!title || !author || !category) {
      setFormError("Enter the title, author, and category.");
      return;
    }

    if (!Number.isInteger(copies) || copies < 0) {
      setFormError("Available copies must be a whole number of 0 or more.");
      return;
    }

    const existingBook =
      editingBook === "new"
        ? null
        : books.find((book) => book.id === editingBook);

    if (editingBook !== "new" && !existingBook) {
      setFormError("This book is no longer in the collection. Close and try again.");
      return;
    }

    const updatedBook = {
      ...(editingBook === "new"
        ? {
            id: books.reduce((largestId, book) => Math.max(largestId, book.id), 0) + 1,
            palette: "teal",
            mark: author
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 3)
              .toUpperCase(),
          }
        : existingBook),
      title,
      author,
      category,
      copies,
      description: form.description.trim(),
    };

    if (editingBook === "new") {
      onBooksChange((currentBooks) => [...currentBooks, updatedBook]);
      setNotice(`Added "${title}" to the collection.`);
    } else {
      onBooksChange((currentBooks) =>
        currentBooks.map((book) =>
          book.id === editingBook ? updatedBook : book,
        ),
      );
      setNotice(`Updated "${title}".`);
    }
    closeEditor();
  };

  const confirmDelete = () => {
    const deletedTitle = bookToDelete.title;
    onBooksChange((currentBooks) =>
      currentBooks.filter((book) => book.id !== bookToDelete.id),
    );
    if (editingBook === bookToDelete.id) closeEditor();
    setBookToDelete(null);
    setNotice(`Removed "${deletedTitle}" from the collection.`);
  };

  return (
    <section className="library-page manage-books-page">
      <header className="library-page-header">
        <button
          type="button"
          className="library-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <span className="catalog-brand-icon" aria-hidden="true">📚</span>
          <span>Digital <span className="brand-light">Library</span></span>
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
            <p className="library-eyebrow">LIBRARIAN WORKSPACE</p>
            <h1>Manage the collection</h1>
            <p>Add new titles, update book information, or keep availability current.</p>
          </div>
          <button
            type="button"
            className="dashboard-primary-action"
            onClick={startAdding}
          >
            <span aria-hidden="true">＋</span> Add a book
          </button>
        </section>

        <div className="manage-books-demo-note">
          <span className="notice-dot" aria-hidden="true">i</span>
          Demo collection — changes are shared with Browse Books for this
          session only and are not saved to a server.
        </div>

        {notice && (
          <p className="manage-books-notice" role="status">
            {notice}
          </p>
        )}

        <section className="manage-books-panel" aria-label="Book collection">
          <div className="manage-books-toolbar">
            <div>
              <h2>Collection</h2>
              <p>{books.length} {books.length === 1 ? "title" : "titles"}</p>
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
                    <th scope="col">Available</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id}>
                      <td>
                        <div className="manage-book-title">
                          <span className={`manage-book-mark catalog-cover-${book.palette}`}>
                            {book.mark}
                          </span>
                          <span>
                            <strong>{book.title}</strong>
                            <small>{book.author}</small>
                          </span>
                        </div>
                      </td>
                      <td><span className="manage-book-category">{book.category}</span></td>
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
                          {book.copies > 0 ? "Available" : "Out of stock"}
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
              <button type="button" onClick={() => setQuery("")}>Clear search</button>
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
                <p className="library-eyebrow">COLLECTION DETAILS</p>
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

            <form className="manage-book-form" onSubmit={handleSubmit}>
              <label htmlFor="manage-title">Title</label>
              <input
                id="manage-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
                autoFocus
              />
              <label htmlFor="manage-author">Author</label>
              <input
                id="manage-author"
                value={form.author}
                onChange={(event) => setForm({ ...form, author: event.target.value })}
                required
              />
              <div className="manage-book-form-row">
                <div>
                  <label htmlFor="manage-category">Category</label>
                  <input
                    id="manage-category"
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    list="book-category-options"
                    required
                  />
                  <datalist id="book-category-options">
                    {[...new Set(books.map((book) => book.category))].map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="manage-copies">Available copies</label>
                  <input
                    id="manage-copies"
                    type="number"
                    min="0"
                    step="1"
                    value={form.copies}
                    onChange={(event) => setForm({ ...form, copies: event.target.value })}
                    required
                  />
                </div>
              </div>
              <label htmlFor="manage-description">Description <span>(optional)</span></label>
              <textarea
                id="manage-description"
                rows="3"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />

              {formError && (
                <p className="registration-message registration-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="manage-book-form-actions">
                <button type="button" onClick={closeEditor}>Cancel</button>
                <button type="submit" className="dashboard-primary-action">
                  {editingBook === "new" ? "Add to collection" : "Save changes"}
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
            <span className="dialog-icon" aria-hidden="true">!</span>
            <h2 id="remove-book-title">Remove this book?</h2>
            <p>
              “{bookToDelete.title}” will be removed from the demo collection
              for this session.
            </p>
            <div className="reservation-dialog-actions">
              <button
                type="button"
                className="library-back-button"
                onClick={() => setBookToDelete(null)}
              >
                Keep book
              </button>
              <button
                type="button"
                className="reservation-confirm-cancel"
                onClick={confirmDelete}
              >
                Remove book
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default ManageBooks;
