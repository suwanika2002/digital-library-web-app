import { useMemo, useState } from "react";
import BookCover from "../components/BookCover";
import "./Dashboard.css";
function normalizeBook(book) {
  return {
    ...book,
    id: book._id || book.id,
    language: book.language || "English",
    copies: book.availableCopies ?? book.copies ?? 0,
    palette: book.palette || "classic",
    mark: book.mark || "✦",
  };
}
function Books({ books: rawBooks, onNavigate, onSelectBook }) {
  const books = rawBooks.map(normalizeBook);
  const [language, setLanguage] = useState("All languages");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All books");

  const languageFilteredBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          language === "All languages" || book.language === language
      ),
    [books, language]
  );

  const categories = useMemo(
    () => [
      "All books",
      ...new Set(languageFilteredBooks.map((book) => book.category)),
    ],
    [languageFilteredBooks]
  );

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return languageFilteredBooks.filter((book) => {
      const matchesCategory =
        category === "All books" || book.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${book.title} ${book.author} ${book.category} ${book.language}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [languageFilteredBooks, category, query]);

  return (
    <section className="library-page catalog-page">
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

      <main className="catalog-content">
        <section className="catalog-heading">
          <div>
            <p className="library-eyebrow">THE COLLECTION</p>
            <h1>Find a book to get lost in.</h1>
            <p>
              Browse timeless stories and discover something new on the
              shelves.
            </p>
          </div>
          <div className="catalog-count">
            <strong>{filteredBooks.length}</strong>
            <span>{filteredBooks.length === 1 ? "book" : "books"} shown</span>
          </div>
        </section>

        <label className="catalog-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, author, or category"
            aria-label="Search the book catalog"
          />
          <kbd>SEARCH</kbd>
        </label>

        <div className="catalog-filter-row">
          <label className="catalog-language-filter">
            <span>Language</span>
            <select
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value);
                setCategory("All books");
              }}
              aria-label="Filter by language"
            >
              <option value="All languages">All languages</option>
              <option value="English">English</option>
              <option value="Sinhala">Sinhala</option>
            </select>
          </label>

          <div
            className="catalog-filters"
            role="group"
            aria-label="Filter by category"
          >
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item ? "catalog-filter active" : "catalog-filter"
                }
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filteredBooks.length > 0 ? (
          <section className="catalog-grid" aria-label="Books">
            {filteredBooks.map((book) => (
              <article className="catalog-book" key={book.id}>
                <button
                  type="button"
                  className="catalog-cover-trigger"
                  onClick={() => onSelectBook(book)}
                  aria-label={`View ${book.title} by ${book.author}`}
                >
                  <BookCover book={book} />
                </button>
                <div className="catalog-book-info">
                  <span className="catalog-category">{book.category}</span>
                  <h2>{book.title}</h2>
                  <p>By {book.author}</p>
                  <div className="catalog-book-footer">
                    <span
                      className={
                        book.copies > 0
                          ? "catalog-availability available"
                          : "catalog-availability unavailable"
                      }
                    >
                      {book.copies > 0
                        ? `${book.copies} available`
                        : "Unavailable"}
                    </span>
                    <button
                      type="button"
                      className="catalog-view-button"
                      onClick={() => onSelectBook(book)}
                    >
                      Details <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="catalog-empty">
            <span aria-hidden="true">⌕</span>
            <h2>No books found</h2>
            <p>Try another title, author, or category.</p>
            <button
              type="button"
              className="catalog-view-button"
              onClick={() => {
                setQuery("");
                setLanguage("All languages");
                setCategory("All books");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </section>
  );
}

export default Books;