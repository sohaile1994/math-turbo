import { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { getLeaderboard } from "../../lib/scores";

const SUBJECTS = [
  { id: "counting",      label: "Counting",       emoji: "🔢" },
  { id: "arithmetic_+",  label: "Addition",        emoji: "➕" },
  { id: "arithmetic_-",  label: "Subtraction",     emoji: "➖" },
  { id: "arithmetic_×",  label: "Multiplication",  emoji: "✖️" },
  { id: "arithmetic_÷",  label: "Division",        emoji: "➗" },
  { id: "algebra",       label: "Algebra",         emoji: "🔣" },
];

const RANK_ICONS = ["🥇", "🥈", "🥉"];

function gradeLabel(g) { return g === 0 ? "Staff" : `${g}th`; }

function formatDuration(secs) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatDate(unixSecs) {
  if (!unixSecs) return null;
  const d = new Date(unixSecs * 1000);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function LeaderboardScreen() {
  const { goToMenu } = useGame();
  const [activeTab, setActiveTab] = useState("arithmetic_+");
  const [entries,   setEntries]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getLeaderboard(activeTab)
      .then(setEntries)
      .catch(() => setError("Could not load leaderboard."))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="lb-screen">
      <div className="lb-header">
        <button className="lb-back-btn" onClick={goToMenu}>← Back</button>
        <h2 className="lb-title">🏆 Leaderboard</h2>
        <div style={{ width: 60 }} />
      </div>

      <div className="lb-subject-sections">
        <button
          className={`lb-tab${activeTab === "counting" ? " active" : ""}`}
          onClick={() => setActiveTab("counting")}
        >
          <span className="lb-tab-emoji">🔢</span>
          <span className="lb-tab-label">Counting</span>
        </button>

        <div className="lb-arithmetic-grid">
          {[
            { id: "arithmetic_+", label: "Addition",       emoji: "➕" },
            { id: "arithmetic_-", label: "Subtraction",    emoji: "➖" },
            { id: "arithmetic_×", label: "Multiplication", emoji: "✖️" },
            { id: "arithmetic_÷", label: "Division",       emoji: "➗" },
          ].map((s) => (
            <button
              key={s.id}
              className={`lb-tab${activeTab === s.id ? " active" : ""}`}
              onClick={() => setActiveTab(s.id)}
            >
              <span className="lb-tab-emoji">{s.emoji}</span>
              <span className="lb-tab-label">{s.label}</span>
            </button>
          ))}
        </div>

        <button
          className={`lb-tab${activeTab === "algebra" ? " active" : ""}`}
          onClick={() => setActiveTab("algebra")}
        >
          <span className="lb-tab-emoji">🔣</span>
          <span className="lb-tab-label">Algebra</span>
        </button>
      </div>

      <div className="lb-content">
        {loading && (
          <div className="lb-loading">
            <div className="loading-spinner" />
            <p>Loading…</p>
          </div>
        )}

        {!loading && error && <p className="login-error">{error}</p>}

        {!loading && !error && entries.length === 0 && (
          <div className="lb-empty">
            <div className="lb-empty-icon">🎯</div>
            <p>No competitive scores yet for this subject.</p>
            <p className="lb-empty-sub">Be the first!</p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="lb-list">
            {entries.map((entry, i) => (
              <div
                key={i}
                className={`lb-row${i < 3 ? " lb-row-top" : ""}`}
                style={{ "--rank-delay": `${i * 0.04}s` }}
              >
                <div className="lb-rank">
                  {i < 3 ? RANK_ICONS[i] : <span className="lb-rank-num">{i + 1}</span>}
                </div>
                <div className="lb-info">
                  <span className="lb-name">{entry.displayName}</span>
                  <span className="lb-grade">
                    {gradeLabel(entry.grade)}
                    {formatDuration(entry.durationSecs) && (
                      <span className="lb-duration"> · ⏱ {formatDuration(entry.durationSecs)}</span>
                    )}
                    {formatDate(entry.playedAt) && (
                      <span className="lb-date"> · 📅 {formatDate(entry.playedAt)}</span>
                    )}
                  </span>
                </div>
                <div className="lb-score">
                  {entry.score.toLocaleString()}
                  <span className="lb-pts"> pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
