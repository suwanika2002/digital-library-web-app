
import "./App.css";
import heroImage from "./images/WhatsApp Image 2026-10-06 at 14.02.50.jpeg";
import Navbar from "./components/Navbar";

function Welcome({ goToLogin, goToDashboard }) {
  const steps = [
    {
      number: "01",
      title: "Sign in",
      text: "Create a free account or log in.",
    },
    {
      number: "02",
      title: "Search",
      text: "Find books by title, author or category.",
    },
    {
      number: "03",
      title: "Check availability",
      text: "See how many copies are free.",
    },
    {
      number: "04",
      title: "Reserve",
      text: "Reserve your copy with one click.",
    },
  ];

  const handleHomeClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="welcome-page">
      {/* Hero and navigation */}
      <header className="hero">
        <Navbar
          onLoginClick={goToLogin}
          onHomeClick={handleHomeClick}
          onDashboardClick={goToDashboard}
        />

        <div className="hero-content">
          <div className="hero-text">
            <p className="small-title">
              Search · Check availability · Reserve
            </p>

            <h1>
              Welcome in.
              <br />
              <span>Your next chapter</span> is on the shelf.
            </h1>

            <p className="hero-desc">
              Browse the library from anywhere, see if a book is available,
              and reserve it online.
            </p>

            <button className="btn-gold" onClick={goToLogin}>
              Get started
            </button>
          </div>

          <div className="hero-image">
            <img
              src={heroImage}
              alt="Books and reading space in the digital library"
            />
          </div>
        </div>
      </header>

      {/* How the library works */}
      <section id="how" className="section">
        <p className="small-title dark">How it works</p>

        <h2 className="section-title">
          From shelf to hand in four steps
        </h2>

        <div className="steps">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Member and librarian sections */}
      <section id="roles" className="section roles">
        <article className="role-card member">
          <p className="small-title green">For members</p>

          <h2>Your reading, all in one place</h2>

          <ul>
            <li>✔ Search books and view details</li>
            <li>✔ Reserve and cancel books</li>
            <li>✔ See your reservation history</li>
          </ul>

          <button className="btn-green" onClick={goToLogin}>
            Become a member
          </button>
        </article>

        <article className="role-card librarian">
          <p className="small-title">For librarians</p>

          <h2>Run the collection with ease</h2>

          <ul>
            <li>✔ Add, edit and delete books</li>
            <li>✔ View and manage reservations</li>
            <li>✔ Manage users</li>
          </ul>

          <button className="btn-gold" onClick={goToLogin}>
            Librarian sign in
          </button>
        </article>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <h2>
            Take a book. <span>Share a book.</span>
          </h2>

        </div>

        <p className="footer-bottom">
          © 2026 Digital Library · Book Reservation System
        </p>
      </footer>
    </div>
  );
}

export default Welcome;
