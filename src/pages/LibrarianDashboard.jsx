import { useEffect, useState } from "react";
import "./Dashboard.css";
import DashboardCardArt from "../components/DashboardCardArt";

function LibrarianDashboard({ onNavigate, onLogout }) {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableCopies: 0,
    totalReservations: 0,
    pendingReservations: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  // Dashboard navigation cards.
  const destinations = [
    {
      page: "manageBooks",
      number: "01",
      title: "Manage books",
      description: "Browse the collection and review book availability.",
      icon: "▤",
      art: "books",
    },
    {
      page: "reservations",
      number: "02",
      title: "Reservations",
      description: "Review the library's reservation page.",
      icon: "↗",
      art: "reservations",
    },
  ];

  // Load live statistics from the backend.
  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError("");

      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error(
            "Please log in again to view dashboard statistics."
          );
        }

        const [booksResponse, reservationsResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/books"),
            fetch("http://localhost:5000/api/reservations", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const booksData = await booksResponse.json();
        const reservationsData = await reservationsResponse.json();

        if (!booksResponse.ok) {
          throw new Error("Unable to load book statistics.");
        }

        if (!reservationsResponse.ok) {
          throw new Error(
            reservationsData.message ||
              "Unable to load reservation statistics."
          );
        }

        if (
          !Array.isArray(booksData) ||
          !Array.isArray(reservationsData)
        ) {
          throw new Error(
            "The server returned unexpected statistics data."
          );
        }

        if (cancelled) return;

        setStats({
          totalBooks: booksData.length,
          availableCopies: booksData.reduce(
            (total, book) =>
              total + Number(book.availableCopies ?? 0),
            0
          ),
          totalReservations: reservationsData.length,
          pendingReservations: reservationsData.filter(
            (reservation) => reservation.status === "pending"
          ).length,
        });
      } catch (error) {
        if (!cancelled) {
          setStatsError(error.message);
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <button
          type="button"
          className="dashboard-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <span className="dashboard-logo-icon" aria-hidden="true">
            📚
          </span>
          <span>
            Digital <span className="brand-light">Library</span>
          </span>
        </button>

        <p className="sidebar-label">LIBRARIAN MENU</p>

        <nav className="sidebar-nav" aria-label="Librarian navigation">
          <button
            type="button"
            className="sidebar-link active"
            aria-current="page"
            onClick={() => onNavigate("dashboard")}
          >
            <span aria-hidden="true">⌂</span> Overview
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={() => onNavigate("manageBooks")}
          >
            <span aria-hidden="true">▤</span> Manage books
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={() => onNavigate("reservations")}
          >
            <span aria-hidden="true">↗</span> Reservations
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
  <span
    className="profile-avatar librarian-avatar"
    aria-hidden="true"
  >
    {(JSON.parse(localStorage.getItem("authUser") || "{}").name || "L")
      .charAt(0)
      .toUpperCase()}
  </span>

  <span className="profile-copy">
    <strong>
      {JSON.parse(localStorage.getItem("authUser") || "{}").name ||
        "Librarian"}
    </strong>
    <span>
      {JSON.parse(localStorage.getItem("authUser") || "{}").email ||
        "Librarian space"}
    </span>
  </span>
</div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={onLogout}
          >
            <span aria-hidden="true">↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <span>
            Librarian space <span aria-hidden="true">/</span> Overview
          </span>
          <span className="topbar-status">
            <span aria-hidden="true">●</span> Digital Library
          </span>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-heading">
            <div>
              <p className="dashboard-eyebrow">LIBRARIAN SPACE</p>
              <h1>Library overview.</h1>
              <p className="dashboard-intro">
                Keep the collection organized and help readers find their next favorite.
              </p>
            </div>

            <button
              type="button"
              className="dashboard-primary-action"
              onClick={() => onNavigate("manageBooks")}
            >
              <span aria-hidden="true">＋</span> Browse collection
            </button>
          </section>

          {statsError && (
            <div className="dashboard-demo-notice" role="alert">
              <span className="notice-dot" aria-hidden="true">
                i
              </span>
              {statsError}
            </div>
          )}

          
<section
  aria-label="Library statistics"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    width: "100%",
    margin: "24px 0",
  }}
>
  {[
    { label: "Total books", value: stats.totalBooks, icon: "▤" },
    { label: "Available copies", value: stats.availableCopies, icon: "📚" },
    { label: "Total reservations", value: stats.totalReservations, icon: "↗" },
    { label: "Pending reservations", value: stats.pendingReservations, icon: "◷" },
  ].map((item) => (
    <article
      key={item.label}
      style={{
        boxSizing: "border-box",
        minWidth: 0,
        padding: "22px",
        border: "1px solid #e7ddcc",
        borderRadius: "12px",
        background: "#fffdf9",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "38px",
          height: "38px",
          borderRadius: "9px",
          background: "#f2e8d5",
          color: "#89621e",
          fontSize: "20px",
        }}
      >
        {item.icon}
      </span>

      <p style={{ margin: "14px 0 8px", color: "#796b5c", fontSize: "13px" }}>
        {item.label}
      </p>

      <strong
        style={{
          display: "block",
          color: "#24180f",
          fontFamily: "Georgia, serif",
          fontSize: "30px",
          fontWeight: 500,
        }}
      >
        {statsLoading ? "…" : item.value}
      </strong>
    </article>
  ))}
</section>


          <section className="dashboard-feature librarian-feature">
            <div className="feature-copy">
              <p className="feature-kicker">COLLECTION TOOLS</p>
              <h2>
                Every great library starts with a well-kept collection.
              </h2>
              <p>
                Review books or open reservations to continue managing library services.
              </p>
              <button
                type="button"
                className="feature-link"
                onClick={() => onNavigate("manageBooks")}
              >
                Manage the collection <span aria-hidden="true">→</span>
              </button>
            </div>

            <div className="feature-art" aria-hidden="true">
              <span className="art-book art-book-one" />
              <span className="art-book art-book-two" />
              <span className="art-book art-book-three" />
              <span className="art-sparkle">✦</span>
            </div>
          </section>

          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">LIBRARY TOOLS</p>
              <h2>Choose a workspace</h2>
            </div>
          </div>

          <section
            className="dashboard-cards"
            aria-label="Librarian pages"
          >
            {destinations.map((destination) => (
              <button
                type="button"
                className={`dashboard-card dashboard-card-${destination.art}`}
                key={destination.page}
                onClick={() => onNavigate(destination.page)}
              >
                <span className="dashboard-card-art">
                  <DashboardCardArt variant={destination.art} />
                </span>

                <span className="dashboard-card-top">
                  <span
                    className="dashboard-card-icon"
                    aria-hidden="true"
                  >
                    {destination.icon}
                  </span>
                  <span className="dashboard-card-number">
                    {destination.number}
                  </span>
                </span>

                <span className="dashboard-card-title">
                  {destination.title}
                </span>
                <span className="dashboard-card-description">
                  {destination.description}
                </span>
                <span className="dashboard-card-link">
                  Open page <span aria-hidden="true">→</span>
                </span>
              </button>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default LibrarianDashboard;
