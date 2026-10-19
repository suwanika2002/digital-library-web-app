import { useState } from "react";
import "./Dashboard.css";

function Register({ onNavigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    if (!form.agreeToTerms) {
      setError("Please agree to the library account terms to continue.");
      return;
    }

    setMessage(
      "Your form is valid, but account creation is not connected yet. Your information has not been saved.",
    );
  };

  return (
    <section className="library-page registration-page">
      <header className="library-page-header">
        <button
          type="button"
          className="library-brand"
          onClick={() => onNavigate("welcome")}
        >
          <span className="registration-brand-icon" aria-hidden="true">
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

      <main className="registration-layout">
        <aside className="registration-intro">
          <p className="library-eyebrow">JOIN THE LIBRARY</p>
          <h1>A new chapter starts here.</h1>
          <p>
            Create your member profile to explore the collection and keep your
            reservations together.
          </p>
          <div className="registration-book-art" aria-hidden="true">
            <span className="registration-book registration-book-one" />
            <span className="registration-book registration-book-two" />
            <span className="registration-book registration-book-three" />
            <span className="registration-art-sparkle">✦</span>
          </div>
          <ul>
            <li><span aria-hidden="true">✓</span> Discover books from anywhere</li>
            <li><span aria-hidden="true">✓</span> Keep track of reservations</li>
            <li><span aria-hidden="true">✓</span> Find your next favorite read</li>
          </ul>
        </aside>

        <div className="registration-form-panel">
          <div className="registration-form-heading">
            <span className="registration-step">MEMBER ACCOUNT</span>
            <h2>Create your account</h2>
            <p>Fill in your details to get started.</p>
          </div>

          <form className="registration-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={form.name}
              onChange={updateField}
              required
            />

            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={updateField}
              required
            />

            <div className="registration-password-fields">
              <div>
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  value={form.password}
                  onChange={updateField}
                  required
                />
              </div>
              <div>
                <label htmlFor="register-confirm-password">Confirm password</label>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  minLength={8}
                  value={form.confirmPassword}
                  onChange={updateField}
                  required
                />
              </div>
            </div>

            <label className="registration-terms" htmlFor="register-terms">
              <input
                id="register-terms"
                name="agreeToTerms"
                type="checkbox"
                checked={form.agreeToTerms}
                onChange={updateField}
                required
              />
              <span>
                I agree to use my library account responsibly and follow the
                borrowing guidelines.
              </span>
            </label>

            {error && (
              <p className="registration-message registration-error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="registration-message registration-success" role="status">
                {message}
              </p>
            )}

            <button type="submit" className="registration-submit">
              Create member account <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="registration-login-link">
            Already have an account?{" "}
            <button type="button" onClick={() => onNavigate("login")}>
              Log in
            </button>
          </p>
        </div>
      </main>

      <footer className="registration-footer">
        <span>© 2026 Digital Library</span>
        <span>For member registration</span>
      </footer>
    </section>
  );
}

export default Register;