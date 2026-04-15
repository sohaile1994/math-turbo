import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserStats } from "../../lib/scores";
import { Category } from "../../enums";

const SUBJECTS = [
  { id: Category.COUNTING,   label: "Counting",     emoji: "🔢", gradient: "linear-gradient(135deg,#FF6B6B,#FF8E53)" },
  { id: Category.ARITHMETIC, label: "Arithmetic",   emoji: "➕", gradient: "linear-gradient(135deg,#4ECDC4,#44A8D0)" },
  { id: Category.PEMDAS,     label: "Order of Ops", emoji: "📐", gradient: "linear-gradient(135deg,#A78BFA,#EC4899)" },
  { id: Category.ALGEBRA,    label: "Algebra",      emoji: "🔣", gradient: "linear-gradient(135deg,#F59E0B,#EF4444)" },
];

function gradeLabel(g) { return g === 0 ? "Staff" : `${g}th Grade`; }

export default function StatsModal({ onClose }) {
  const { user }                 = useAuth();
  const [stats, setStats]        = useState(null);
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserStats(user.id)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

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
            <div className="stats-grade">{user ? gradeLabel(user.grade) : ""}</div>
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
      </div>
    </div>
  );
}
