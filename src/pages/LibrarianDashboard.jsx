import "./Dashboard.css";
import DashboardCardArt from "../components/DashboardCardArt";

function LibrarianDashboard({ onNavigate, onLogout }) {
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
    {
      page: "account",
      number: "03",
      title: "Register a member",
      description: "Open the account registration page.",
      icon: "＋",
      art: "account",
    },
  ];

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <button
          type="button"
          className="dashboard-brand"
          onClick={() => onNavigate("dashboard")}
        >
          <span className="dashboard-logo-icon" aria-hidden="true">📚</span>
          <span>Digital <span className="brand-light">Library</span></span>
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
            <span className="profile-avatar librarian-avatar" aria-hidden="true">L</span>
            <span className="profile-copy">
              <strong>Library team</strong>
              <span>Librarian space</span>
            </span>
          </div>
          <button type="button" className="sidebar-logout" onClick={onLogout}>
            <span aria-hidden="true">↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <span>Librarian space <span aria-hidden="true">/</span> Overview</span>
          <span className="topbar-status"><span aria-hidden="true">●</span> Digital Library</span>
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

          <div className="dashboard-demo-notice">
            <span className="notice-dot" aria-hidden="true">i</span>
            Demo dashboard — sign-in and library data are not connected yet.
          </div>

          <section className="dashboard-feature librarian-feature">
            <div className="feature-copy">
              <p className="feature-kicker">COLLECTION TOOLS</p>
              <h2>Every great library starts with a well-kept collection.</h2>
              <p>Review books or open reservations to continue managing library services.</p>
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

          <section className="dashboard-cards" aria-label="Librarian pages">
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
                  <span className="dashboard-card-icon" aria-hidden="true">
                    {destination.icon}
                  </span>
                  <span className="dashboard-card-number">{destination.number}</span>
                </span>
                <span className="dashboard-card-title">{destination.title}</span>
                <span className="dashboard-card-description">{destination.description}</span>
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