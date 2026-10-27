
import { useState } from "react";
import "./Dashboard.css";

function BookDetails({ book, onNavigate }) {
  const [notice, setNotice] = useState("");
  const [reserving, setReserving] = useState(false);

  // Support both MongoDB fields and the existing frontend fields.
  const bookId = book?._id ?? book?.id;
  const copies = book?.availableCopies ?? book?.copies ?? 0;

  const handleReserve = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setNotice("Please log in before reserving a book.");
      return;
    }

    if (!bookId) {
      setNotice("Unable to identify this book. Please return to the catalog.");
      return;
    }

    setReserving(true);
    setNotice("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reserve this book.");
      }

      setNotice(
        data.message ||
          "Book reserved successfully! Your reservation is pending approval."
      );
    } catch (error) {
      setNotice(
        error instanceof TypeError
          ? "Unable to connect to the server. Please try again."
          : error.message
      );
    } finally {
      setReserving(false);
    }
  };

  // Handle a missing book BEFORE accessing its properties.
  if (!book) {
    return (
      <section className="library-page">
        <header className="library-page-header">
          <button
            type="button"
            className="library-brand"
            onClick={() => onNavigate("dashboard")}
          >
            <span className="catalog-brand-icon" aria-hidden="true">📚</span>
            <span>
              Digital <span className="brand-light">Library</span>
            </span>
          </button>

          <button
            type="button"
            className="library-nav-button"
            onClick={() => onNavigate("dashboard")}
          >
            Dashboard
          </button>
        </header>

        <main className="catalog-content catalog-empty">
          <span aria-hidden="true">▤</span>
          <h1>Choose a book to view its details</h1>
          <p>Open the catalog and select a book to see its information.</p>

          <button
            type="button"
            className="dashboard-primary-action"
            onClick={() => onNavigate("books")}
          >
            Browse books <span aria-hidden="true">→</span>
          </button>
        </main>
      </section>
    );
  }

  return (
    <section className="library-page catalog-page">
      <header className="library-page-header">
        <button
          type="button"
          className="library-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <span className="catalog-brand-icon" aria-hidden="true">📚</span>
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

      <main className="catalog-content">
        <section className="catalog-detail">
          <button
            type="button"
            className="catalog-back"
            onClick={() => onNavigate("books")}
          >
            <span aria-hidden="true">←</span> Back to catalog
          </button>

          <div className="catalog-detail-layout">
            <div
              className={`catalog-cover catalog-cover-${book.palette || "classic"} catalog-detail-cover`}
              aria-label={`Illustrated cover for ${book.title}`}
              role="img"
            >
              <span className="cover-ornament" aria-hidden="true">✳</span>
              <span className="cover-rule" aria-hidden="true" />
              <span className="cover-title">{book.title}</span>
              <span className="cover-author">{book.author}</span>
              <span className="cover-mark">{book.mark || "✦"}</span>
            </div>

            <div className="catalog-detail-copy">
              <p className="library-eyebrow">{book.category}</p>
              <h1>{book.title}</h1>
              <p className="catalog-detail-author">By {book.author}</p>
              <p className="catalog-detail-description">
                {book.description || "No description is available for this book yet."}
              </p>

              <div className="book-detail-facts">
                <div>
                  <span>Category</span>
                  <strong>{book.category}</strong>
                </div>

                <div>
                  <span>Availability</span>
                  <strong
                    className={
                      copies > 0
                        ? "catalog-availability available"
                        : "catalog-availability unavailable"
                    }
                  >
                    {copies > 0
                      ? `${copies} copies available`
                      : "Currently unavailable"}
                  </strong>
                </div>

                <div>
                  <span>Author</span>
                  <strong>{book.author}</strong>
                </div>
              </div>

              {notice && (
                <p className="catalog-notice" role="status">
                  {notice}
                </p>
              )}

              <button
                type="button"
                className="dashboard-primary-action"
                disabled={copies === 0 || reserving}
                onClick={handleReserve}
              >
                {reserving
                  ? "Reserving..."
                  : copies > 0
                    ? "Reserve this book"
                    : "Not available"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </section>
  );
}

export default BookDetails;
