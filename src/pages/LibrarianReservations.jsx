
import { useCallback, useEffect, useState } from "react";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api/reservations";

function LibrarianReservations({ onNavigate }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState("");

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load reservations."
        );
      }

      setReservations(data);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check that your backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const updateStatus = async (reservationId, status) => {
    if (processingId) return;

    setProcessingId(reservationId);
    setError("");
    setNotice("");

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/${reservationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update reservation."
        );
      }

      // Reload from the server to show the latest status.
      await loadReservations();

      setNotice(
        data.message ||
          `Reservation ${status} successfully.`
      );
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Please try again."
          : err.message
      );
    } finally {
      setProcessingId("");
    }
  };

  const visibleReservations = reservations.filter((reservation) => {
    if (filter === "pending") {
      return reservation.status === "pending";
    }

    if (filter === "processed") {
      return reservation.status !== "pending";
    }

    return true;
  });

  const pendingCount = reservations.filter(
    (reservation) => reservation.status === "pending"
  ).length;

  const statusLabel = {
    pending: "Pending approval",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };

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
          Back to dashboard
        </button>
      </header>

      <main className="manage-books-content">
        <section className="manage-books-heading">
          <div>
            <p className="library-eyebrow">LIBRARIAN WORKSPACE</p>
            <h1>Manage reservations</h1>
            <p>
              Review member requests and approve or reject pending reservations.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-primary-action"
            onClick={loadReservations}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </section>

        <div className="manage-books-demo-note">
          <span className="notice-dot" aria-hidden="true">i</span>
          {reservations.length} total reservations · {pendingCount} awaiting approval
        </div>

        {notice && (
          <p className="manage-books-notice" role="status">
            {notice}
          </p>
        )}

        {error && (
          <div role="alert" className="registration-message registration-error">
            {error}
            <button type="button" onClick={loadReservations}>
              Try again
            </button>
          </div>
        )}

        <section className="manage-books-panel" aria-label="Reservations">
          <div className="manage-books-toolbar">
            <div>
              <h2>Member reservations</h2>
              <p>Review each request below</p>
            </div>

            <label className="manage-books-search">
              <span aria-hidden="true">⌕</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter reservations"
              >
                <option value="all">All reservations</option>
                <option value="pending">Pending approval</option>
                <option value="processed">Processed</option>
              </select>
            </label>
          </div>

          {loading ? (
            <p>Loading reservations...</p>
          ) : visibleReservations.length === 0 ? (
            <div className="manage-books-empty">
              <h2>No reservations found</h2>
              <p>
                {filter === "pending"
                  ? "There are no requests waiting for approval."
                  : "No reservations match this filter."}
              </p>
            </div>
          ) : (
            <div className="manage-books-table-wrap">
              <table className="manage-books-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Book</th>
                    <th>Reservation date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleReservations.map((reservation) => {
                    const member = reservation.member;
                    const book = reservation.book;
                    const pending = reservation.status === "pending";
                    const busy = processingId === reservation._id;

                    return (
                      <tr key={reservation._id}>
                        <td>
                          <div className="manage-book-title">
                            <span>
                              <strong>
                                {member?.name || "Unknown member"}
                              </strong>
                              <small>
                                {member?.email || "Email unavailable"}
                              </small>
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="manage-book-title">
                            <span>
                              <strong>
                                {book?.title || "Book unavailable"}
                              </strong>
                              <small>{book?.author || ""}</small>
                            </span>
                          </div>
                        </td>

                        <td>
                          {reservation.reservationDate
                            ? new Date(
                                reservation.reservationDate
                              ).toLocaleDateString()
                            : reservation.createdAt
                              ? new Date(
                                  reservation.createdAt
                                ).toLocaleDateString()
                              : "—"}
                        </td>

                        <td>
                          <span
                            className={
                              pending
                                ? "manage-book-status out-of-stock"
                                : "manage-book-status in-stock"
                            }
                          >
                            {statusLabel[reservation.status] ||
                              reservation.status}
                          </span>
                        </td>

                        <td>
                          {pending ? (
                            <div className="manage-book-actions">
                              <button
                                type="button"
                                disabled={Boolean(processingId)}
                                onClick={() =>
                                  updateStatus(
                                    reservation._id,
                                    "approved"
                                  )
                                }
                              >
                                {busy ? "Saving..." : "Approve"}
                              </button>

                              <button
                                type="button"
                                className="delete-action"
                                disabled={Boolean(processingId)}
                                onClick={() =>
                                  updateStatus(
                                    reservation._id,
                                    "rejected"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span>Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </section>
  );
}

export default LibrarianReservations;
