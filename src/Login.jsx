import { useState } from "react";
import "./Login.css";
import sideImage from "./images/image.png";

function Login({ goBack, onLogin, onRegister }) {
  const [role, setRole] = useState("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "" || password === "") {
      setError("Please enter your email and password.");
      setMessage("");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setMessage("");
      return;
    }

    setError("");
    onLogin(role);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img src={sideImage} alt="Book exchange shelf" />
        <div className="login-left-text">
          <h2>
            Take a book. <span>Share a book.</span>
          </h2>
          <p>Search, check availability and reserve books online.</p>
        </div>
      </div>

      <div className="login-right">
        <button className="back-link" type="button" onClick={goBack}>
          <span aria-hidden="true">←</span> Back to home
        </button>

        <div className="login-box">
          <p className="login-logo">
            <span aria-hidden="true">📚</span> Digital Library
          </p>
          <h1>Welcome back</h1>
          <p className="login-subtitle">Log in to continue to your account.</p>

          <div
            className="role-switch"
            role="group"
            aria-label="Choose account type"
          >
            <button
              type="button"
              aria-pressed={role === "member"}
              className={role === "member" ? "role-btn active" : "role-btn"}
              onClick={() => {
                setRole("member");
                setError("");
                setMessage("");
              }}
            >
              Member
            </button>
            <button
              type="button"
              aria-pressed={role === "librarian"}
              className={role === "librarian" ? "role-btn active" : "role-btn"}
              onClick={() => {
                setRole("librarian");
                setError("");
                setMessage("");
              }}
            >
              Librarian
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setMessage("");
              }}
            />

            <label htmlFor="password">Password</label>
            <div className="password-box">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                  setMessage("");
                }}
              />
              <button
                type="button"
                className="show-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="login-options">
              <label className="remember" htmlFor="remember">
                <input id="remember" name="remember" type="checkbox" />
                Remember me
              </label>
              <button
                type="button"
                className="text-action"
                onClick={() => {
                  setError("");
                  setMessage("For password help, please contact your librarian.");
                }}
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="form-message error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="form-message notice" role="status">
                {message}
              </p>
            )}

            <button type="submit" className="login-btn">
              Log in as {role === "member" ? "Member" : "Librarian"}
            </button>
          </form>

          {role === "member" && (
            <p className="signup-text">
              New to the library?{" "}
              <button
                type="button"
                className="text-action"
                onClick={onRegister}
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;