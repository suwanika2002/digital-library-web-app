import "./Dashboard.css";
import DashboardCardArt from "../components/DashboardCardArt";

function MemberDashboard({ onNavigate, onLogout }) {
  const destinations = [
    {
      page: "books",
      number: "01",
      title: "Browse books",
      description: "Search the collection and find your next read.",
      icon: "⌕",
      art: "books",
    },
    {
      page: "reservations",
      number: "02",
      title: "My reservations",
      description: "Keep track of the books you have reserved.",
      icon: "▤",
      art: "reservations",
    },
    {
      page: "bookDetails",
      number: "03",
      title: "Book details",
      description: "View availability and information about a book.",
      icon: "↗",
      art: "details",
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

        <p className="sidebar-label">MEMBER MENU</p>
        <nav className="sidebar-nav" aria-label="Member navigation">
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
            <span aria-hidden="true">▤</span> Browse books
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <span className="profile-avatar" aria-hidden="true">M</span>
            <span className="profile-copy">
              <strong>Library member</strong>
              <span>Reading space</span>
            </span>
          </div>
          <button type="button" className="sidebar-logout" onClick={onLogout}>
            <span aria-hidden="true">↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <span>Member space <span aria-hidden="true">/</span> Overview</span>
          <span className="topbar-status"><span aria-hidden="true">●</span> Digital Library</span>
        </header>
        <div className="dashboard-content">
          <section className="dashboard-heading">
            <div>
              <p className="dashboard-eyebrow">YOUR READING SPACE</p>
              <h1>Find your next chapter.</h1>
              <p className="dashboard-intro">
                Browse the shelves, keep track of your reading, and discover something new.
              </p>
            </div>
            <button
              type="button"
              className="dashboard-primary-action"
              onClick={() => onNavigate("books")}
            >
              <span aria-hidden="true">＋</span> Explore the collection
            </button>
          </section>

          <div className="dashboard-demo-notice">
            <span className="notice-dot" aria-hidden="true">i</span>
            Demo dashboard — sign-in and library data are not connected yet.
          </div>

          <section className="dashboard-feature">
            <div className="feature-copy">
              <p className="feature-kicker">A GOOD BOOK IS WAITING</p>
              <h2>Make a little room for a new story.</h2>
              <p>Explore the collection and find a book worth getting lost in.</p>
              <button
                type="button"
                className="feature-link"
                onClick={() => onNavigate("books")}
              >
                Browse all books <span aria-hidden="true">→</span>
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
              <p className="dashboard-eyebrow">QUICK ACCESS</p>
              <h2>Where would you like to go?</h2>
            </div>
          </div>

          <section className="dashboard-cards" aria-label="Library pages">
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
        <footer className="dashboard-footer">
          <p>© 2026 Digital Library · Book Reservation System</p>
        </footer>
      </main>
    </div>
  );
}

export default MemberDashboard;