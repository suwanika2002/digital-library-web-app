
import { useCallback, useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const reservationFilters = ["Reserved books", "History"];

function MyReservations({ onNavigate }) {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState("Reserved books");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [cancellingId, setCancellingId] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState("");

  const requestReservations = useCallback(async () => {
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

    let loadedNotifications;
    let loadedNotificationError = "";

    try {
      const notificationResponse = await fetch(
        "http://localhost:5000/api/notifications/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const notificationData = await notificationResponse.json();

      if (!notificationResponse.ok || !Array.isArray(notificationData)) {
        throw new Error(
          notificationData.message || "Unable to load notifications."
        );
      }

      loadedNotifications = notificationData;
    } catch (notificationLoadError) {
      loadedNotificationError =
        notificationLoadError instanceof TypeError
          ? "Unable to connect to the server to load notifications."
          : notificationLoadError.message;
    }

    return {
      reservations: data,
      notifications: loadedNotifications,
      notificationError: loadedNotificationError,
    };
  }, []);

  const applyReservationData = (data) => {
    setError("");
    setReservations(data.reservations);
    if (data.notifications) setNotifications(data.notifications);
    setNotificationError(data.notificationError);
  };

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      applyReservationData(await requestReservations());
    } catch (err) {
      setError(err.message || "Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  }, [requestReservations]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const data = await requestReservations();
        if (!ignore) applyReservationData(data);
      } catch (err) {
        if (!ignore) setError(err.message || "Unable to load reservations.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void load();
    return () => {
      ignore = true;
    };
  }, [requestReservations]);

  const markNotificationRead = async (notificationId) => {
    const token = localStorage.getItem("authToken");

    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update notification.");
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? data.notification
            : notification
        )
      );
      setNotificationError("");
    } catch (notificationUpdateError) {
      setNotificationError(
        notificationUpdateError instanceof TypeError
          ? "Unable to connect to the server to update the notification."
          : notificationUpdateError.message
      );
    }
  };

  const cancelReservation = async (reservationId) => {
    const token = localStorage.getItem("authToken");

    if (!token || cancellingId) return;

    setCancellingId(reservationId);
    setNotice(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/reservations/${reservationId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel this reservation.");
      }

      setReservations((currentReservations) =>
        currentReservations.map((reservation) =>
          reservation._id === reservationId
            ? { ...reservation, status: "cancelled" }
            : reservation
        )
      );
      setNotice({
        type: "success",
        message: data.message || "Reservation cancelled successfully.",
      });
    } catch (cancelError) {
      setNotice({
        type: "error",
        message:
          cancelError instanceof TypeError
            ? "Unable to connect to the server. Please try again."
            : cancelError.message,
      });
    } finally {
      setCancellingId("");
    }
  };

  const getStatus = (status) => {
    const labels = {
      pending: "Pending approval",
      approved: "Approved",
      borrowed: "Borrowed",
      returned: "Returned",
      rejected: "Rejected",
      cancelled: "Cancelled",
    };

    return labels[status] || status || "Unknown";
  };

  const isActive = (status) =>
    ["pending", "approved", "borrowed"].includes(status);

  const isHistory = (status) =>
    ["returned", "rejected", "cancelled"].includes(status);

  const filteredReservations = useMemo(
    () =>
      reservations.filter((reservation) => {
        if (filter === "Reserved books") return isActive(reservation.status);
        return isHistory(reservation.status);
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

        {notice && (
          <p
            className={`reservation-notice ${notice.type}`}
            role={notice.type === "error" ? "alert" : "status"}
            aria-live={notice.type === "error" ? "assertive" : "polite"}
          >
            {notice.message}
          </p>
        )}

        <section className="member-notifications" aria-label="Notifications">
          <div className="member-notifications-heading">
            <h2>Notifications</h2>
            <span>
              {notifications.filter((notification) => !notification.readAt).length} unread
            </span>
          </div>
          {notificationError && (
            <p className="member-notification-error" role="alert">
              {notificationError}
            </p>
          )}
          {notifications.length > 0 ? (
            <ul className="member-notification-list">
              {notifications.map((notification) => (
                <li
                  className={
                    notification.readAt
                      ? "member-notification read"
                      : "member-notification"
                  }
                  key={notification._id}
                >
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <small>{formatDate(notification.createdAt)}</small>
                  </div>
                  {!notification.readAt && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(notification._id)}
                    >
                      Mark read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            !notificationError && (
              <p className="member-notifications-empty">
                You have no notifications.
              </p>
            )
          )}
        </section>

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
                        {reservation.borrowedAt && (
                          <span>
                            <small>Borrowed</small>
                            {formatDate(reservation.borrowedAt)}
                          </span>
                        )}
                        {reservation.dueDate && (
                          <span>
                            <small>Due date</small>
                            {formatDate(reservation.dueDate)}
                          </span>
                        )}
                        {reservation.returnedAt && (
                          <span>
                            <small>Returned</small>
                            {formatDate(reservation.returnedAt)}
                          </span>
                        )}
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
                      {["pending", "approved"].includes(reservation.status) && (
                        <button
                          type="button"
                          className="reservation-cancel"
                          disabled={Boolean(cancellingId)}
                          onClick={() => cancelReservation(reservation._id)}
                        >
                          {cancellingId === reservation._id
                            ? "Removing..."
                            : "Remove reservation"}
                        </button>
                      )}
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
