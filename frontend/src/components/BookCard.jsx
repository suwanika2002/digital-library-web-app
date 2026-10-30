
function BookCard({ book, onViewDetails }) {
  return (
    <article className="book-card">
      <div className="book-cover">
        <img
          src={book.image}
          alt={`Cover of ${book.title}`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div className="book-info">
        <span className="book-category">{book.category}</span>

        <h3>{book.title}</h3>

        <p className="book-author">By {book.author}</p>

        <p className="book-availability">
          {book.availableCopies > 0
            ? `${book.availableCopies} copies available`
            : "Currently unavailable"}
        </p>

        <button
          className="btn-green"
          type="button"
          onClick={() => onViewDetails(book)}
        >
          View details
        </button>
      </div>
    </article>
  );
}

export default BookCard;
