import { useCallback, useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api/reservations";

function LibrarianHistory({ onNavigate }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchHistory = useCallback(async () => {
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
      throw new Error(data.message || "Unable to load reservation history.");
    }

    if (!Array.isArray(data)) {
      throw new Error("The server returned an unexpected response.");
    }

    return data.filter((reservation) =>
      ["returned", "rejected"].includes(reservation.status)
    );
  }, []);

  const showLoadError = useCallback((loadError) => {
      setError(
        loadError instanceof TypeError
          ? "Cannot connect to the server. Check that your backend is running."
          : loadError.message
      );
  }, []);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setReservations(await fetchHistory());
    } catch (loadError) {
      showLoadError(loadError);
    } finally {
      setLoading(false);
    }
  }, [fetchHistory, showLoadError]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialHistory = async () => {
      try {
        const history = await fetchHistory();

        if (!cancelled) {
          setReservations(history);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          showLoadError(loadError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialHistory();

    return () => {
      cancelled = true;
    };
  }, [fetchHistory, showLoadError]);

  const visibleHistory = useMemo(
    () =>
      reservations.filter(
        (reservation) => filter === "all" || reservation.status === filter
      ),
    [filter, reservations]
  );

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleDateString();
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
        <div className="library-header-actions">
          <button
            type="button"
            className="library-nav-button"
            onClick={() => onNavigate("reservations")}
          >
            Reservations
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
            <h1>Reservation history</h1>
            <p>
              Completed loans and closed requests are kept here for reference.
            </p>
          </div>
          <button
            type="button"
            className="dashboard-primary-action"
            onClick={loadHistory}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </section>

        <section className="borrowing-summary" aria-label="History summary">
          <div>
            <span>Books returned</span>
            <strong>
              {
                reservations.filter(
                  (reservation) => reservation.status === "returned"
                ).length
              }
            </strong>
          </div>
          <div>
            <span>Requests closed without borrowing</span>
            <strong>
              {
                reservations.filter(
                  (reservation) => reservation.status === "rejected"
                ).length
              }
            </strong>
          </div>
        </section>

        {error && (
          <div role="alert" className="borrowing-error">
            <p>{error}</p>
            <button type="button" onClick={loadHistory}>
              Try again
            </button>
          </div>
        )}

        <section className="manage-books-panel" aria-label="Reservation history">
          <div className="manage-books-toolbar">
            <div>
              <h2>Closed reservations</h2>
              <p>Returned books and rejected requests</p>
            </div>
            <label className="manage-books-search">
              <span aria-hidden="true">⌕</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter history"
              >
                <option value="all">All history</option>
                <option value="returned">Returned books</option>
                <option value="rejected">Rejected requests</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="manage-books-empty">
              <p>Loading reservation history...</p>
            </div>
          ) : error ? (
            <div className="manage-books-empty" role="status">
              <p>History could not be loaded.</p>
            </div>
          ) : visibleHistory.length === 0 ? (
            <div className="manage-books-empty">
              <h2>No history yet</h2>
              <p>
                Returned books and rejected requests will appear here when
                completed.
              </p>
            </div>
          ) : (
            <div className="manage-books-table-wrap">
              <table className="manage-books-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Book</th>
                    <th>Reserved</th>
                    <th>Borrowed</th>
                    <th>Due date</th>
                    <th>Returned</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHistory.map((reservation) => (
                    <tr key={reservation._id}>
                      <td>
                        <div className="manage-book-title">
                          <span>
                            <strong>
                              {reservation.member?.name || "Unknown member"}
                            </strong>
                            <small>
                              {reservation.member?.email || "Email unavailable"}
                            </small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="manage-book-title">
                          <span>
                            <strong>
                              {reservation.book?.title || "Book unavailable"}
                            </strong>
                            <small>{reservation.book?.author || ""}</small>
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
                      <td>{formatDate(reservation.returnedAt)}</td>
                      <td>
                        <span
                          className={`manage-book-status ${
                            reservation.status === "returned"
                              ? "in-stock"
                              : "out-of-stock"
                          }`}
                        >
                          {reservation.status === "returned"
                            ? "Returned"
                            : "Rejected"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </section>
  );
}

export default LibrarianHistory;
