import "./Dashboard.css";
import DashboardCardArt from "../components/DashboardCardArt";

const adminDestinations = [
  {
    page: "books",
    number: "01",
    title: "Manage books",
    description: "Review the collection and book availability.",
    icon: "▤",
    art: "books",
  },
  {
    page: "reservations",
    number: "02",
    title: "Reservations",
    description: "Review reservations across the library.",
    icon: "↗",
    art: "reservations",
  },
  {
    page: "account",
    number: "03",
    title: "Manage members",
    description: "Open member registration and account tools.",
    icon: "＋",
    art: "account",
  },
];

const overviewStats = [
  { label: "Books in collection", value: "—", detail: "Collection total" },
  { label: "Active reservations", value: "—", detail: "Across all members" },
  { label: "Registered members", value: "—", detail: "Member accounts" },
];

function AdminDashboard({ onNavigate, onLogout }) {
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

        <p className="sidebar-label">ADMIN MENU</p>
        <nav className="sidebar-nav" aria-label="Admin navigation">
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
            onClick={() => onNavigate("books")}
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
          <button
            type="button"
            className="sidebar-link"
            onClick={() => onNavigate("account")}
          >
            <span aria-hidden="true">＋</span> Members
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <span className="profile-avatar admin-avatar" aria-hidden="true">
              A
            </span>
            <span className="profile-copy">
              <strong>Library admin</strong>
              <span>Administrator space</span>
            </span>
          </div>
          <button type="button" className="sidebar-logout" onClick={onLogout}>
            <span aria-hidden="true">↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <span>
            Admin space <span aria-hidden="true">/</span> Overview
          </span>
          <span className="topbar-status">
            <span aria-hidden="true">●</span> Digital Library
          </span>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-heading">
            <div>
              <p className="dashboard-eyebrow">ADMINISTRATION</p>
              <h1>Library at a glance.</h1>
              <p className="dashboard-intro">
                Oversee the collection, reservations, and member services from
                one place.
              </p>
            </div>
            <button
              type="button"
              className="dashboard-primary-action"
              onClick={() => onNavigate("books")}
            >
              <span aria-hidden="true">＋</span> Manage collection
            </button>
          </section>

          <div className="dashboard-demo-notice">
            <span className="notice-dot" aria-hidden="true">
              i
            </span>
            Admin preview — live library data and access controls are not
            connected yet.
          </div>

          <section className="admin-stats" aria-label="Library overview metrics">
            {overviewStats.map((stat) => (
              <article className="admin-stat" key={stat.label}>
                <span className="admin-stat-label">{stat.label}</span>
                <strong>{stat.value}</strong>
                <span className="admin-stat-detail">{stat.detail}</span>
              </article>
            ))}
          </section>

          <section className="dashboard-feature admin-feature">
            <div className="feature-copy">
              <p className="feature-kicker">ADMIN TOOLS</p>
              <h2>Keep every part of the library in good order.</h2>
              <p>
                Jump into collection management, reservation review, or member
                services.
              </p>
              <button
                type="button"
                className="feature-link"
                onClick={() => onNavigate("reservations")}
              >
                Review reservations <span aria-hidden="true">→</span>
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
              <p className="dashboard-eyebrow">ADMIN WORKSPACES</p>
              <h2>Manage library services</h2>
            </div>
          </div>

          <section className="dashboard-cards admin-cards" aria-label="Admin pages">
            {adminDestinations.map((destination) => (
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

export default AdminDashboard;
