
import { useCallback, useEffect, useState } from "react";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api/reservations";

function LibrarianReservations({ onNavigate }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState("");

  const requestReservations = useCallback(async () => {
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
      throw new Error(data.message || "Unable to load reservations.");
    }

    return data;
  }, []);

  const getLoadError = (err) =>
    err instanceof TypeError
      ? "Cannot connect to the server. Check that your backend is running."
      : err.message;

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setReservations(await requestReservations());
    } catch (err) {
      setError(getLoadError(err));
    } finally {
      setLoading(false);
    }
  }, [requestReservations]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const data = await requestReservations();
        if (!ignore) {
          setError("");
          setReservations(data);
        }
      } catch (err) {
        if (!ignore) setError(getLoadError(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void load();
    return () => {
      ignore = true;
    };
  }, [requestReservations]);

  const updateStatus = async (reservationId, status) => {
    if (processingId) return;

    setProcessingId(reservationId);
    setError("");
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const lifecycleAction = ["borrow", "return"].includes(status);
      const response = await fetch(
        `${API_URL}/${reservationId}/${lifecycleAction ? status : "status"}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          ...(!lifecycleAction && {
            body: JSON.stringify({ status }),
          }),
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

  const activeReservations = reservations.filter((reservation) =>
    ["pending", "approved", "borrowed"].includes(reservation.status)
  );
  const visibleReservations = activeReservations.filter((reservation) => {
    if (filter === "pending") {
      return reservation.status === "pending";
    }

    if (filter === "processed") {
      return ["approved", "borrowed"].includes(reservation.status);
    }

    return true;
  });

  const statusLabel = {
    pending: "Pending approval",
    approved: "Approved",
    borrowed: "Borrowed",
    returned: "Returned",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "—";

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

        <div className="library-header-actions">
          <button
            type="button"
            className="library-nav-button"
            onClick={() => onNavigate("librarianHistory")}
          >
            History
          </button>
          <button
            type="button"
            className="library-nav-button"
            onClick={() => onNavigate("dashboard")}
          >
            Back to dashboard
          </button>
        </div>
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
                    <th>Borrowed date</th>
                    <th>Due date</th>
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
                          {formatDate(
                            reservation.reservationDate || reservation.createdAt
                          )}
                        </td>

                        <td>{formatDate(reservation.borrowedAt)}</td>
                        <td>{formatDate(reservation.dueDate)}</td>
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
                            <span aria-label="No action required">—</span>
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
