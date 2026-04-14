import { useState } from "react";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { Category, GameMode } from "../../enums";
import StatsModal from "./StatsModal";

const CATEGORIES = [
  {
    id: Category.COUNTING,
    emoji: "🔢",
    label: "Counting",
    desc: "Count objects & learn numbers",
    gradient: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
    glow: "#FF6B6B",
  },
  {
    id: Category.ARITHMETIC,
    emoji: "➕",
    label: "Arithmetic",
    desc: "+ − × ÷ operations",
    gradient: "linear-gradient(135deg, #4ECDC4, #44A8D0)",
    glow: "#4ECDC4",
  },
  {
    id: Category.PEMDAS,
    emoji: "📐",
    label: "Order of Ops",
    desc: "Parentheses & operations",
    gradient: "linear-gradient(135deg, #A78BFA, #EC4899)",
    glow: "#A78BFA",
  },
  {
    id: Category.ALGEBRA,
    emoji: "🔣",
    label: "Algebra",
    desc: "Solve for x",
    gradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
    glow: "#F59E0B",
  },
];

export default function MainMenu() {
  const { startGame, goToLeaderboard } = useGame();
  const { user, logoutUser }           = useAuth();
  const [selectedMode, setSelectedMode] = useState(GameMode.COMPETITIVE);
  const [showStats, setShowStats]       = useState(false);

  const isCompetitive = selectedMode === GameMode.COMPETITIVE;

  return (
    <div className={`main-menu${isCompetitive ? " main-menu-competitive" : ""}`}>
      {/* ── Hero ── */}
      <div className="menu-hero">
        <div className="hero-decoration hero-dec-1">✦</div>
        <div className="hero-decoration hero-dec-2">★</div>
        <div className="hero-decoration hero-dec-3">◆</div>
        <h1 className="menu-title">
          <span className="title-math">MATH</span>
          <br />
          <span className="title-blaster">BLASTER</span>
        </h1>
        <p className="menu-subtitle">Pick a mode and topic!</p>

        {/* User bar */}
        {user && (
          <div className="menu-user-bar">
            <span className="menu-user-name">👋 {user.displayName}</span>
            <button className="menu-icon-btn" onClick={() => setShowStats(true)} title="My Stats">📊</button>
            <button className="menu-icon-btn lb-icon-btn" onClick={goToLeaderboard} title="Leaderboard">🏆</button>
            <button className="menu-logout-btn" onClick={logoutUser}>Log out</button>
          </div>
        )}
      </div>

      {/* ── Mode selector ── */}
      <div className="mode-selector">
        <button
          className={`mode-btn${selectedMode === GameMode.PRACTICE ? " active" : ""}`}
          onClick={() => setSelectedMode(GameMode.PRACTICE)}
        >
          <span className="mode-icon">🎮</span>
          <span className="mode-label">Practice</span>
          <span className="mode-desc">Free play, custom settings</span>
        </button>
        <button
          className={`mode-btn${selectedMode === GameMode.COMPETITIVE ? " active competitive" : ""}`}
          onClick={() => setSelectedMode(GameMode.COMPETITIVE)}
        >
          <span className="mode-icon">🏆</span>
          <span className="mode-label">Competitive</span>
          <span className="mode-desc">10 min timer · leaderboard</span>
        </button>
      </div>

      {/* Competitive active banner */}
      {isCompetitive && (
        <div className="comp-active-banner">
          <span className="comp-active-title">🏆 COMPETITIVE MODE</span>
          <span className="comp-active-sub">10 min timer · scores saved to leaderboard · settings locked</span>
        </div>
      )}

      {/* ── Category grid ── */}
      <div className="category-grid-2x2">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.id}
            className="category-card-2x2"
            style={{
              "--card-gradient": cat.gradient,
              "--card-glow":     cat.glow,
              animationDelay:    `${i * 0.08}s`,
            }}
            onClick={() => startGame({ category: cat.id, mode: selectedMode })}
          >
            <div className="card-inner">
              <div className="cat-emoji-big">{cat.emoji}</div>
              <div className="cat-name-big">{cat.label}</div>
              <div className="cat-desc-small">{cat.desc}</div>
              <div className="card-play-hint">
                {isCompetitive ? "COMPETE ▶" : "TAP TO PLAY ▶"}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Stats modal */}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </div>
  );
}
