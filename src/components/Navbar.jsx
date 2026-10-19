
function Navbar({ onLoginClick, onHomeClick, onDashboardClick }) {
  return (
    <nav className="navbar">
      <button className="logo" type="button" onClick={onHomeClick}>
        <span className="dashboard-logo-icon" aria-hidden="true">📚</span>
        <span>
          Digital <span className="brand-light">Library</span>
        </span>
      </button>

      <div className="nav-links">
        <a href="#how">How it works</a>
        <a href="#roles">For librarians</a>

        <button className="btn-outline" onClick={onDashboardClick}>
          Dashboard
        </button>

        <button className="btn-outline" onClick={onLoginClick}>
          Log in
        </button>

        <button className="btn-gold" onClick={onLoginClick}>
          Create account
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
