import { useState } from "react";
import { resetPassword } from "../../lib/auth";

export default function ResetPasswordModal({ onClose }) {
  const [username,  setUsername]  = useState("");
  const [authCode,  setAuthCode]  = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !authCode || !newPw || !confirmPw) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("New passwords don't match.");
      return;
    }
    if (newPw.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword(username.trim(), authCode, newPw);
      setSuccess(true);
    } catch (err) {
      if (err.message === "Invalid auth code") {
        setError("Incorrect authorization code. Ask your teacher.");
      } else if (err.message === "User not found") {
        setError("No account found with that email.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="modal-title">Reset Password</h2>

        {success ? (
          <div className="reset-success">
            <div className="success-icon">✓</div>
            <p>Password updated! Log in with your new password.</p>
            <button className="login-submit-btn" onClick={onClose}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <p className="modal-note">
              You need the <strong>authorization code</strong> from your teacher to reset your password.
            </p>

            <div className="login-field">
              <label className="login-label">Your Email</label>
              <input
                className="login-input"
                type="text"
                placeholder="your@zenithacademy.org"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="login-field">
              <label className="login-label">Authorization Code</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label className="login-label">New Password</label>
              <input
                className="login-input"
                type="password"
                placeholder="At least 8 characters"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="login-field">
              <label className="login-label">Confirm New Password</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button className="login-submit-btn" type="submit" disabled={loading}>
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
