import { useMemo, useState } from "react";
import "./Dashboard.css";

const initialReservations = [
  {
    id: "DL-1042",
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    palette: "sage",
    reservedOn: "Oct 14, 2026",
    pickupBy: "Oct 22, 2026",
    status: "Ready for pickup",
  },
  {
    id: "DL-1038",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    palette: "rose",
    reservedOn: "Oct 12, 2026",
    pickupBy: "Oct 21, 2026",
    status: "Reserved",
  },
  {
    id: "DL-0981",
    title: "Little Women",
    author: "Louisa May Alcott",
    palette: "ochre",
    reservedOn: "Sep 02, 2026",
    pickupBy: "Returned Sep 18",
    status: "Returned",
  },
];

const reservationFilters = ["All", "Active", "History"];

function MyReservations({ onNavigate }) {
  const [reservations, setReservations] = useState(initialReservations);
  const [filter, setFilter] = useState("All");
  const [cancelledId, setCancelledId] = useState(null);

  const filteredReservations = useMemo(
    () =>
      reservations.filter((reservation) => {
        if (filter === "Active") {
          return ["Reserved", "Ready for pickup"].includes(reservation.status);
        }
        if (filter === "History") {
          return ["Returned", "Cancelled"].includes(reservation.status);
        }
        return true;
      }),
    [filter, reservations],
  );

  const confirmCancellation = () => {
    setReservations((currentReservations) =>
      currentReservations.map((reservation) =>
        reservation.id === cancelledId
          ? { ...reservation, status: "Cancelled" }
          : reservation,
      ),
    );
    setCancelledId(null);
  };

  return (
    <section className="library-page reservations-page">
      <header className="library-page-header">
        <button
          type="button"
          className="library-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <span className="reservations-brand-icon" aria-hidden="true">📚</span>
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

        <div className="reservations-demo-note">
          <span className="notice-dot" aria-hidden="true">i</span>
          Sample reservations for preview — changes are only saved in this
          session.
        </div>

        <section className="reservations-summary" aria-label="Reservation summary">
          <div>
            <span>Active reservations</span>
            <strong>
              {reservations.filter((item) =>
                ["Reserved", "Ready for pickup"].includes(item.status),
              ).length}
            </strong>
          </div>
          <div>
            <span>Ready for pickup</span>
            <strong>
              {reservations.filter((item) => item.status === "Ready for pickup").length}
            </strong>
          </div>
          <div>
            <span>Reading history</span>
            <strong>
              {reservations.filter((item) =>
                ["Returned", "Cancelled"].includes(item.status),
              ).length}
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
                className={filter === item ? "reservation-filter active" : "reservation-filter"}
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <section className="reservation-list" aria-label="Reservations">
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => (
              <article className="reservation-item" key={reservation.id}>
                <div
                  className={`reservation-mini-cover catalog-cover-${reservation.palette}`}
                  aria-hidden="true"
                >
                  <span>✳</span>
                  <strong>{reservation.title}</strong>
                  <small>{reservation.author}</small>
                </div>
                <div className="reservation-book-info">
                  <span className="reservation-id">RESERVATION {reservation.id}</span>
                  <h3>{reservation.title}</h3>
                  <p>By {reservation.author}</p>
                  <div className="reservation-dates">
                    <span>
                      <small>Reserved</small>
                      {reservation.reservedOn}
                    </span>
                    <span>
                      <small>
                        {reservation.status === "Returned" ? "Return date" : "Pickup by"}
                      </small>
                      {reservation.pickupBy}
                    </span>
                  </div>
                </div>
                <div className="reservation-item-actions">
                  <span
                    className={`reservation-status reservation-status-${reservation.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    <span aria-hidden="true">●</span> {reservation.status}
                  </span>
                  {["Reserved", "Ready for pickup"].includes(reservation.status) && (
                    <button
                      type="button"
                      className="reservation-cancel"
                      onClick={() => setCancelledId(reservation.id)}
                    >
                      Cancel reservation
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="reservation-empty">
              <span aria-hidden="true">▤</span>
              <h3>No reservations in this list</h3>
              <p>Browse the collection to find your next book.</p>
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
      </main>

      {cancelledId && (
        <div
          className="reservation-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCancelledId(null);
          }}
        >
          <section
            className="reservation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-reservation-title"
          >
            <span className="dialog-icon" aria-hidden="true">!</span>
            <h2 id="cancel-reservation-title">Cancel this reservation?</h2>
            <p>
              This demo will mark the reservation as cancelled in the current
              session.
            </p>
            <div className="reservation-dialog-actions">
              <button
                type="button"
                className="library-back-button"
                onClick={() => setCancelledId(null)}
              >
                Keep reservation
              </button>
              <button
                type="button"
                className="reservation-confirm-cancel"
                onClick={confirmCancellation}
              >
                Cancel reservation
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default MyReservations;