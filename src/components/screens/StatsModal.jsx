import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserStats } from "../../lib/scores";
import { setLeaderboardVisibility } from "../../lib/admin";

const SUBJECTS = [
  { id: "counting",     label: "Counting",       emoji: "🔢", gradient: "linear-gradient(135deg,#FF6B6B,#FF8E53)" },
  { id: "arithmetic_+", label: "Addition",        emoji: "➕", gradient: "linear-gradient(135deg,#4ECDC4,#44A8D0)" },
  { id: "arithmetic_-", label: "Subtraction",     emoji: "➖", gradient: "linear-gradient(135deg,#A78BFA,#EC4899)" },
  { id: "arithmetic_×", label: "Multiplication",  emoji: "✖️", gradient: "linear-gradient(135deg,#F59E0B,#EF4444)" },
  { id: "arithmetic_÷", label: "Division",        emoji: "➗", gradient: "linear-gradient(135deg,#6BCB77,#4D9F53)" },
  { id: "algebra",      label: "Algebra",         emoji: "🔣", gradient: "linear-gradient(135deg,#FF9F43,#EE5A24)" },
];

function gradeLabel(g, role) {
  if (role === "teacher") return "Staff";
  if (g === 0) return "Kindergarten";
  const suffix = g === 1 ? "st" : g === 2 ? "nd" : g === 3 ? "rd" : "th";
  return `${g}${suffix} Grade`;
}

export default function StatsModal({ onClose, viewUser }) {
  const { user: authUser, patchUser } = useAuth();
  const isOwnStats = !viewUser;
  const user       = viewUser ?? authUser;

  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [hidden,  setHidden]  = useState(authUser?.hideLeaderboard ?? false);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserStats(user.id)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  async function handlePrivacyToggle() {
    const next = !hidden;
    setSaving(true);
    try {
      await setLeaderboardVisibility(authUser.id, authUser.grade, next);
      patchUser({ hideLeaderboard: next });
      setHidden(next);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card stats-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Profile header */}
        <div className="stats-profile">
          <div className="stats-avatar">
            {user?.displayName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="stats-name">{user?.displayName}</div>
            <div className="stats-grade">{user ? gradeLabel(user.grade, user.role) : ""}</div>
          </div>
        </div>

        <div className="stats-section-label">Best Competitive Scores</div>

        {loading ? (
          <div className="login-loading" style={{ padding: "16px 0" }}>
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="stats-grid">
            {SUBJECTS.map((s) => {
              const score = stats?.[s.id];
              return (
                <div key={s.id} className="stats-subject-card" style={{ background: s.gradient }}>
                  <div className="stats-subj-emoji">{s.emoji}</div>
                  <div className="stats-subj-label">{s.label}</div>
                  <div className="stats-subj-score">
                    {score != null ? score.toLocaleString() : "—"}
                  </div>
                  {score != null && <div className="stats-subj-pts">pts</div>}
                </div>
              );
            })}
          </div>
        )}

        {isOwnStats && authUser?.role === "student" && (
          <button
            className={`stats-privacy-btn${hidden ? " stats-privacy-hidden" : ""}`}
            onClick={handlePrivacyToggle}
            disabled={saving}
          >
            {hidden ? "👁️ Hidden from leaderboard" : "👁️ Visible on leaderboard"}
          </button>
        )}
      </div>
    </div>
  );
}
