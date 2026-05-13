import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { initDB, login } from "../../lib/auth";
import { initScoresDB, initGuestScoresDB } from "../../lib/scores";
import ResetPasswordModal from "./ResetPasswordModal";

export default function LoginScreen() {
  const { loginUser } = useAuth();

  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [initError,    setInitError]    = useState("");
  const [showReset,    setShowReset]    = useState(false);

  function handleGuestLogin() {
    loginUser({ id: null, displayName: "Guest", grade: null, role: "guest" });
  }

  useEffect(() => {
    Promise.all([initDB(), initScoresDB(), initGuestScoresDB()])
      .catch((err) => {
        console.error("DB init failed:", err);
        setInitError(
          import.meta.env.VITE_TURSO_URL
            ? "Could not connect to the database. Please refresh."
            : "Database not configured. Set VITE_TURSO_URL and VITE_TURSO_TOKEN."
        );
      })
      .finally(() => setInitializing(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await login(username.trim(), password);
      if (!user) {
        setError("Incorrect email or password. Try again.");
      } else {
        loginUser(user);
      }
    } catch {
      setError("Connection error. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* ── Hero ── */}
        <div className="login-hero">
          <div className="hero-decoration hero-dec-1">✦</div>
          <div className="hero-decoration hero-dec-2">★</div>
          <div className="hero-decoration hero-dec-3">◆</div>
          <h1 className="menu-title">
            <span className="title-math">MATH</span>
            <br />
            <span className="title-blaster">TURBO</span>
          </h1>
          <p className="menu-subtitle">Log in to play!</p>
          <button
            className="guest-login-btn"
            onClick={handleGuestLogin}
            disabled={initializing}
          >
            Play as Guest
          </button>
        </div>

        {/* ── Body ── */}
        {initializing ? (
          <div className="login-loading">
            <div className="loading-spinner" />
            <p>Loading…</p>
          </div>
        ) : initError ? (
          <div className="login-loading">
            <p className="login-error" style={{ textAlign: "left" }}>{initError}</p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className="login-input"
                type="text"
                placeholder="your@zenithacademy.org"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="login-pw">Password</label>
              <div className="login-input-wrap">
                <input
                  id="login-pw"
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-pw-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}

            <button
              className="login-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Play! ▶"}
            </button>

            <button
              type="button"
              className="reset-pw-link"
              onClick={() => setShowReset(true)}
              disabled={loading}
            >
              Need to reset your password?
            </button>
          </form>
        )}
      </div>

      {showReset && <ResetPasswordModal onClose={() => setShowReset(false)} />}
    </div>
  );
}
