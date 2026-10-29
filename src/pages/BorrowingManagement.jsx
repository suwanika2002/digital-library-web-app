import { useCallback, useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api/reservations";

function BorrowingManagement({ onNavigate }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("ready");
  const [processingId, setProcessingId] = useState("");

  const fetchReservations = useCallback(async () => {
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
      throw new Error(data.message || "Unable to load borrowing records.");
    }

    if (!Array.isArray(data)) {
      throw new Error("The server returned an unexpected response.");
    }

    return data;
  }, []);

  const showLoadError = useCallback((loadError) => {
    setError(
      loadError instanceof TypeError
        ? "Cannot connect to the server. Check that your backend is running."
        : loadError.message
    );
  }, []);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setReservations(await fetchReservations());
    } catch (loadError) {
      showLoadError(loadError);
    } finally {
      setLoading(false);
    }
  }, [fetchReservations, showLoadError]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialReservations = async () => {
      try {
        const data = await fetchReservations();

        if (!cancelled) {
          setReservations(data);
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

    loadInitialReservations();

    return () => {
      cancelled = true;
    };
  }, [fetchReservations, showLoadError]);

  const updateLoanStatus = async (reservation, action) => {
    if (processingId) return;

    setProcessingId(reservation._id);
    setError("");
    setNotice("");

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API_URL}/${reservation._id}/${action}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update this book record.");
      }

      await loadReservations();
      setNotice(data.message || "Borrowing record updated successfully.");
    } catch (updateError) {
      setError(
        updateError instanceof TypeError
          ? "Cannot connect to the server. Please try again."
          : updateError.message
      );
    } finally {
      setProcessingId("");
    }
  };

  const actionableReservations = useMemo(
    () =>
      reservations.filter((reservation) =>
        ["approved", "borrowed"].includes(reservation.status)
      ),
    [reservations]
  );
  const visibleReservations = actionableReservations.filter((reservation) =>
    filter === "ready"
      ? reservation.status === "approved"
      : filter === "borrowed"
        ? reservation.status === "borrowed"
        : true
  );
  const memberGroups = visibleReservations.reduce((groups, reservation) => {
    const member = reservation.member || {};
    const memberId = member._id || "unknown-member";
    let group = groups.find((item) => item.id === memberId);

    if (!group) {
      group = {
        id: memberId,
        name: member.name || "Unknown member",
        email: member.email || "Email unavailable",
        reservations: [],
      };
      groups.push(group);
    }

    group.reservations.push(reservation);
    return groups;
  }, []);

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
            onClick={() => onNavigate("librarianHistory")}
          >
            History
          </button>
          <button
            type="button"
            className="library-nav-button"
            onClick={() => onNavigate("reservations")}
          >
            Manage reservations
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

      <main className="manage-books-content borrowing-management">
        <section className="manage-books-heading">
          <div>
            <p className="library-eyebrow">LIBRARIAN WORKSPACE</p>
            <h1>Borrowing & returns</h1>
            <p>
              Find a member and record each book when it is physically
              collected or returned.
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

        <section className="borrowing-summary" aria-label="Borrowing summary">
          <div>
            <span>Ready for collection</span>
            <strong>
              {
                actionableReservations.filter(
                  (reservation) => reservation.status === "approved"
                ).length
              }
            </strong>
          </div>
          <div>
            <span>Currently borrowed</span>
            <strong>
              {
                actionableReservations.filter(
                  (reservation) => reservation.status === "borrowed"
                ).length
              }
            </strong>
          </div>
        </section>

        {notice && (
          <p className="manage-books-notice" role="status">
            {notice}
          </p>
        )}
        {error && (
          <div role="alert" className="borrowing-error">
            <p>{error}</p>
            <button type="button" onClick={loadReservations}>
              Try again
            </button>
          </div>
        )}

        <section className="manage-books-panel" aria-label="Member book loans">
          <div className="manage-books-toolbar borrowing-toolbar">
            <div>
              <h2>Member books</h2>
              <p>Each action updates one book for that member.</p>
            </div>
            <div
              className="borrowing-filters"
              role="group"
              aria-label="Filter member books"
            >
              {[
                ["ready", "Ready for collection"],
                ["borrowed", "Borrowed"],
                ["all", "All"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={filter === value ? "active" : ""}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="manage-books-empty">
              <p>Loading member borrowing records...</p>
            </div>
          ) : !error && memberGroups.length === 0 ? (
            <div className="manage-books-empty">
              <h2>No books in this list</h2>
              <p>
                Approved books waiting for collection and borrowed books will
                appear here.
              </p>
            </div>
          ) : (
            <div className="borrowing-member-list">
              {memberGroups.map((member) => (
                <article className="borrowing-member" key={member.id}>
                  <header className="borrowing-member-heading">
                    <div>
                      <h3>{member.name}</h3>
                      <p>{member.email}</p>
                    </div>
                    <span>
                      {member.reservations.length}{" "}
                      {member.reservations.length === 1 ? "book" : "books"}
                    </span>
                  </header>

                  <ul className="borrowing-book-list">
                    {member.reservations.map((reservation) => {
                      const borrowed = reservation.status === "borrowed";
                      const book = reservation.book || {};
                      const busy = processingId === reservation._id;

                      return (
                        <li
                          className="borrowing-book"
                          key={reservation._id}
                        >
                          <div className="borrowing-book-info">
                            <strong>{book.title || "Book unavailable"}</strong>
                            <span>{book.author || "Unknown author"}</span>
                            <small>
                              {borrowed ? (
                                <>
                                  Borrowed {formatDate(reservation.borrowedAt)}
                                  {" · "}Due {formatDate(reservation.dueDate)}
                                </>
                              ) : (
                                <>
                                  Approved{" "}
                                  {formatDate(
                                    reservation.reservationDate ||
                                      reservation.createdAt
                                  )}
                                  {" · "}Waiting for collection
                                </>
                              )}
                            </small>
                          </div>
                          <span
                            className={`borrowing-status ${
                              borrowed ? "borrowed" : "ready"
                            }`}
                          >
                            {borrowed ? "Borrowed" : "Ready for collection"}
                          </span>
                          <button
                            type="button"
                            className={
                              borrowed
                                ? "borrowing-action return"
                                : "borrowing-action"
                            }
                            disabled={Boolean(processingId)}
                            onClick={() =>
                              updateLoanStatus(
                                reservation,
                                borrowed ? "return" : "borrow"
                              )
                            }
                          >
                            {busy
                              ? "Saving..."
                              : borrowed
                                ? "Mark as Returned"
                                : "Mark as Borrowed"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </section>
  );
}

export default BorrowingManagement;
