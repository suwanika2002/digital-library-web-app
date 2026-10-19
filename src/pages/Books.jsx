import { useMemo, useState } from "react";
import "./Dashboard.css";

const books = [
  {
    id: 1,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "Classic",
    copies: 4,
    palette: "rose",
    mark: "J.A.",
    description:
      "Elizabeth Bennet navigates first impressions, family expectations, and the complicated road to love.",
  },
  {
    id: 2,
    title: "Frankenstein",
    author: "Mary Shelley",
    category: "Gothic",
    copies: 2,
    palette: "forest",
    mark: "M.S.",
    description:
      "A daring experiment gives life to a being whose search for belonging turns into a haunting tragedy.",
  },
  {
    id: 3,
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    category: "Fiction",
    copies: 3,
    palette: "sage",
    mark: "F.H.B.",
    description:
      "A hidden garden helps a lonely girl and her companions discover friendship, hope, and renewal.",
  },
  {
    id: 4,
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    category: "Mystery",
    copies: 0,
    palette: "blue",
    mark: "S.H.",
    description:
      "Join Sherlock Holmes and Dr. Watson as they untangle a collection of curious London mysteries.",
  },
  {
    id: 5,
    title: "Little Women",
    author: "Louisa May Alcott",
    category: "Fiction",
    copies: 1,
    palette: "ochre",
    mark: "L.M.A.",
    description:
      "The four March sisters grow up, dream big, and find their own paths through life and family.",
  },
  {
    id: 6,
    title: "Dracula",
    author: "Bram Stoker",
    category: "Gothic",
    copies: 2,
    palette: "plum",
    mark: "B.S.",
    description:
      "A series of journal entries charts the chilling arrival of Count Dracula in Victorian England.",
  },
  {
    id: 7,
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    category: "Fantasy",
    copies: 5,
    palette: "lilac",
    mark: "L.C.",
    description:
      "Follow Alice down the rabbit hole into a playful world where nothing is quite as it seems.",
  },
  {
    id: 8,
    title: "The Time Machine",
    author: "H. G. Wells",
    category: "Science fiction",
    copies: 2,
    palette: "teal",
    mark: "H.G.W.",
    description:
      "An inventor travels far into the future and discovers a world transformed in unexpected ways.",
  },
];

const categories = ["All books", ...new Set(books.map((book) => book.category))];

function Books({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All books");
  const [selectedBook, setSelectedBook] = useState(null);
  const [notice, setNotice] = useState("");

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return books.filter((book) => {
      const matchesCategory =
        category === "All books" || book.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${book.title} ${book.author} ${book.category}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const openBook = (book) => {
    setSelectedBook(book);
    setNotice("");
  };

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
        {selectedBook ? (
          <section className="catalog-detail">
            <button
              type="button"
              className="catalog-back"
              onClick={() => {
                setSelectedBook(null);
                setNotice("");
              }}
            >
              <span aria-hidden="true">←</span> Back to catalog
            </button>
            <div className="catalog-detail-layout">
              <div
                className={`catalog-cover catalog-cover-${selectedBook.palette} catalog-detail-cover`}
                aria-label={`Illustrated cover for ${selectedBook.title}`}
                role="img"
              >
                <span className="cover-ornament" aria-hidden="true">✳</span>
                <span className="cover-rule" aria-hidden="true" />
                <span className="cover-title">{selectedBook.title}</span>
                <span className="cover-author">{selectedBook.author}</span>
                <span className="cover-mark">{selectedBook.mark}</span>
              </div>
              <div className="catalog-detail-copy">
                <p className="library-eyebrow">{selectedBook.category}</p>
                <h1>{selectedBook.title}</h1>
                <p className="catalog-detail-author">By {selectedBook.author}</p>
                <p className="catalog-detail-description">
                  {selectedBook.description}
                </p>
                <p
                  className={
                    selectedBook.copies > 0
                      ? "catalog-availability available"
                      : "catalog-availability unavailable"
                  }
                >
                  {selectedBook.copies > 0
                    ? `${selectedBook.copies} copies available`
                    : "Currently unavailable"}
                </p>
                {notice && (
                  <p className="catalog-notice" role="status">
                    {notice}
                  </p>
                )}
                <button
                  type="button"
                  className="dashboard-primary-action"
                  onClick={() =>
                    setNotice(
                      "Reservations are not connected yet. Please contact the library.",
                    )
                  }
                >
                  Reserve this book
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
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

            <div className="catalog-demo-note">
              Sample catalog for preview — book inventory is not connected yet.
            </div>

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
              <div className="catalog-filters" role="group" aria-label="Filter by category">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      category === item
                        ? "catalog-filter active"
                        : "catalog-filter"
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
                      className={`catalog-cover catalog-cover-${book.palette}`}
                      onClick={() => openBook(book)}
                      aria-label={`View ${book.title} by ${book.author}`}
                    >
                      <span className="cover-ornament" aria-hidden="true">✳</span>
                      <span className="cover-rule" aria-hidden="true" />
                      <span className="cover-title">{book.title}</span>
                      <span className="cover-author">{book.author}</span>
                      <span className="cover-mark">{book.mark}</span>
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
                          onClick={() => openBook(book)}
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
                    setCategory("All books");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </section>
  );
}

export default Books;