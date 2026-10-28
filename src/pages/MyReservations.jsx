
import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const reservationFilters = ["All", "Active", "History"];

function MyReservations({ onNavigate }) {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReservations = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Please log in to view your reservations.");
      }

      const response = await fetch(
        "http://localhost:5000/api/reservations/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load your reservations."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected response.");
      }

      setReservations(data);
    } catch (err) {
      setError(err.message || "Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const getStatus = (status) => {
    const labels = {
      pending: "Pending approval",
      approved: "Approved",
      rejected: "Rejected",
      cancelled: "Cancelled",
    };

    return labels[status] || status || "Unknown";
  };

  const isActive = (status) =>
    ["pending", "approved"].includes(status);

  const isHistory = (status) =>
    ["rejected", "cancelled"].includes(status);

  const filteredReservations = useMemo(
    () =>
      reservations.filter((reservation) => {
        if (filter === "Active") return isActive(reservation.status);
        if (filter === "History") return isHistory(reservation.status);
        return true;
      }),
    [filter, reservations]
  );

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <section className="library-page reservations-page">
      <header className="library-page-header">
        <button
          type="button"
          className="library-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <span className="reservations-brand-icon" aria-hidden="true">
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

      <main className="reservations-content">
        <section className="reservations-heading">
          <div>
            <p className="library-eyebrow">YOUR READING SPACE</p>
            <h1>My reservations</h1>
            <p>Keep an eye on the books you have set aside.</p>
          </div>

          <button
            type="button"
            className="dashboard-primary-action"
            onClick={() => onNavigate("books")}
          >
            <span aria-hidden="true">＋</span> Find another book
          </button>
        </section>

        <section
          className="reservations-summary"
          aria-label="Reservation summary"
        >
          <div>
            <span>Active reservations</span>
            <strong>
              {reservations.filter((item) => isActive(item.status)).length}
            </strong>
          </div>

          <div>
            <span>Pending approval</span>
            <strong>
              {reservations.filter((item) => item.status === "pending").length}
            </strong>
          </div>

          <div>
            <span>History</span>
            <strong>
              {reservations.filter((item) => isHistory(item.status)).length}
            </strong>
          </div>
        </section>

        <div className="reservations-toolbar">
          <h2>Your books</h2>

          <div
            className="reservation-filters"
            role="group"
            aria-label="Filter reservations"
          >
            {reservationFilters.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  filter === item
                    ? "reservation-filter active"
                    : "reservation-filter"
                }
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="reservation-empty">
            <p>Loading your reservations...</p>
          </div>
        ) : error ? (
          <div className="reservation-empty">
            <h3>Unable to load reservations</h3>
            <p>{error}</p>
            <button
              type="button"
              className="catalog-view-button"
              onClick={loadReservations}
            >
              Try again
            </button>
          </div>
        ) : (
          <section className="reservation-list" aria-label="Reservations">
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation) => {
                const book =
                  reservation.book &&
                  typeof reservation.book === "object"
                    ? reservation.book
                    : {};

                const title = book.title || "Book details unavailable";
                const author = book.author || "Unknown author";
                const statusLabel = getStatus(reservation.status);
                const palette = book.palette || "classic";

                return (
                  <article
                    className="reservation-item"
                    key={reservation._id}
                  >
                    <div
                      className={`reservation-mini-cover catalog-cover-${palette}`}
                      aria-hidden="true"
                    >
                      <span>✳</span>
                      <strong>{title}</strong>
                      <small>{author}</small>
                    </div>

                    <div className="reservation-book-info">
                      <span className="reservation-id">
                        RESERVATION{" "}
                        {reservation._id
                          ? reservation._id.slice(-8).toUpperCase()
                          : ""}
                      </span>

                      <h3>{title}</h3>
                      <p>By {author}</p>

                      <div className="reservation-dates">
                        <span>
                          <small>Reserved</small>
                          {formatDate(
                            reservation.reservationDate ||
                              reservation.createdAt
                          )}
                        </span>

                        <span>
                          <small>Status</small>
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    <div className="reservation-item-actions">
                      <span
                        className={`reservation-status reservation-status-${statusLabel
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        <span aria-hidden="true">●</span>{" "}
                        {statusLabel}
                      </span>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="reservation-empty">
                <span aria-hidden="true">▤</span>
                <h3>No reservations in this list</h3>
                <p>
                  Browse the collection to find your next book.
                </p>
                <button
                  type="button"
                  className="catalog-view-button"
                  onClick={() => onNavigate("books")}
                >
                  Browse books <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </section>
  );
}

export default MyReservations;
