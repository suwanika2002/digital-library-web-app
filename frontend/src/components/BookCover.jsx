import { useState } from "react";

function BookCover({ book, className = "" }) {
  const [failedCoverUrl, setFailedCoverUrl] = useState("");
  const hasCoverImage =
    Boolean(book.coverImage) && failedCoverUrl !== book.coverImage;

  return (
    <div
      className={`catalog-cover catalog-cover-${book.palette || "classic"} ${
        hasCoverImage ? "has-cover-image" : ""
      } ${className}`}
      role="img"
      aria-label={`Cover of ${book.title} by ${book.author}`}
    >
      {hasCoverImage ? (
        <img
          className="catalog-cover-image"
          src={book.coverImage}
          alt=""
          onError={() => setFailedCoverUrl(book.coverImage)}
        />
      ) : (
        <>
          <span className="cover-ornament" aria-hidden="true">✳</span>
          <span className="cover-rule" aria-hidden="true" />
          <span className="cover-title">{book.title}</span>
          <span className="cover-author">{book.author}</span>
          <span className="cover-mark">{book.mark || "✦"}</span>
        </>
      )}
    </div>
  );
}

export default BookCover;
