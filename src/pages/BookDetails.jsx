
import { useState } from "react";
import BookCover from "../components/BookCover";
import "./Dashboard.css";

function BookDetails({ book, onNavigate, onBookReserved }) {
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");
  const [reserving, setReserving] = useState(false);

  const bookId = book?._id ?? book?.id;
  const copies = Math.max(
    0,
    Number(book?.availableCopies ?? book?.copies ?? 0) || 0
  );

  const available = copies > 0;

  const showNotice = (message, type = "info") => {
    setNotice(message);
    setNoticeType(type);
  };

  const handleReserve = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      showNotice("Please log in before reserving a book.", "error");
      return;
    }

    if (!bookId) {
      showNotice(
        "Unable to identify this book. Please return to the catalog.",
        "error"
      );
      return;
    }

    if (!available || reserving) return;

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

      showNotice(
        data.message ||
          "Book reserved successfully! Your reservation is pending approval.",
        "success"
      );

      if (onBookReserved) {
        await onBookReserved();
      }
    } catch (error) {
      showNotice(
        error instanceof TypeError
          ? "Unable to connect to the server. Please try again."
          : error.message,
        "error"
      );
    } finally {
      setReserving(false);
    }
  };

  if (!book) {
    return (
      <section className="library-page">
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
            Dashboard
          </button>
        </header>

        <main className="catalog-content catalog-empty">
          <span aria-hidden="true">📖</span>
          <h2>Choose a book to view its details</h2>
          <p>Explore the catalog to find your next read.</p>
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
          Dashboard
        </button>
      </header>

      <main className="catalog-content book-detail-page">
        <button
          type="button"
          className="catalog-back"
          onClick={() => onNavigate("books")}
        >
          <span aria-hidden="true">←</span> Back to catalog
        </button>

        <div className="book-detail-heading">
          <p className="library-eyebrow">DISCOVER YOUR NEXT READ</p>
          <h1>Book details</h1>
          <p>Explore the story, discover the author, and reserve your copy.</p>
        </div>

        <section className="catalog-detail book-detail-card">
          <div className="catalog-detail-layout">
            <div className="book-detail-art">
              <div className="book-detail-cover-wrap">
                <BookCover
                  book={book}
                  className="catalog-detail-cover"
                />
              </div>
              <p className="book-detail-cover-caption">
                <span aria-hidden="true">✦</span> From our library collection
              </p>
            </div>

            <div className="catalog-detail-copy book-detail-information">
              <div className="book-detail-badges">
                <span className="book-detail-category">
                  {book.category || "General"}
                </span>
                <span className="book-detail-language">
                  {book.language || "English"}
                </span>
              </div>

              <h2>{book.title}</h2>
              <p className="catalog-detail-author">
                Written by <strong>{book.author || "Unknown author"}</strong>
              </p>

              <div className="book-detail-description-block">
                <h3>About this book</h3>
                <p className="catalog-detail-description">
                  {book.description ||
                    "A description for this book has not been added yet. Explore the title and author to learn more."}
                </p>
              </div>

              <div className="book-detail-availability">
                <div className="book-detail-availability-icon" aria-hidden="true">
                  {available ? "✓" : "–"}
                </div>
                <div className="book-detail-availability-copy">
                  <span>Library availability</span>
                  <strong className={available ? "is-available" : "is-unavailable"}>
                    {available
                      ? `${copies} ${copies === 1 ? "copy" : "copies"} available`
                      : "Currently unavailable"}
                  </strong>
                  <p>
                    {available
                      ? "You can request a reservation for this book."
                      : "Please check back later for availability."}
                  </p>
                </div>
              </div>

              <div className="book-detail-facts">
                <div>
                  <span>Author</span>
                  <strong>{book.author || "Not specified"}</strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>{book.category || "General"}</strong>
                </div>
                <div>
                  <span>Language</span>
                  <strong>{book.language || "English"}</strong>
                </div>
              </div>

              {notice && (
                <p
                  className={`catalog-notice book-detail-notice ${noticeType}`}
                  role="status"
                  aria-live="polite"
                >
                  {notice}
                </p>
              )}

              <button
                type="button"
                className="dashboard-primary-action book-detail-reserve"
                disabled={!available || reserving}
                onClick={handleReserve}
              >
                {reserving
                  ? "Reserving your copy..."
                  : available
                    ? "Reserve this book"
                    : "Currently unavailable"}
                {!reserving && available && (
                  <span aria-hidden="true">→</span>
                )}
              </button>

              <p className="book-detail-reservation-note">
                <span aria-hidden="true">ⓘ</span>
                Your reservation may require librarian approval.
              </p>
            </div>
          </div>
        </section>
      </main>
    </section>
  );
}

export default BookDetails;
