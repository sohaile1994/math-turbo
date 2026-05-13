import { useState } from "react";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { Category, GameMode } from "../../enums";
import StatsModal from "./StatsModal";

const ARITHMETIC_OPS = [
  { op: "+", label: "Addition",       emoji: "➕", desc: "Add numbers",      gradient: "linear-gradient(135deg,#4ECDC4,#44A8D0)", glow: "#4ECDC4" },
  { op: "-", label: "Subtraction",    emoji: "➖", desc: "Subtract numbers", gradient: "linear-gradient(135deg,#A78BFA,#EC4899)", glow: "#A78BFA" },
  { op: "×", label: "Multiplication", emoji: "✖️", desc: "Times tables",     gradient: "linear-gradient(135deg,#F59E0B,#EF4444)", glow: "#F59E0B" },
  { op: "÷", label: "Division",       emoji: "➗", desc: "Divide numbers",   gradient: "linear-gradient(135deg,#6BCB77,#4D9F53)", glow: "#6BCB77" },
];

export default function MainMenu() {
  const { startGame, goToLeaderboard, goToAdmin, goToSuperAdmin } = useGame();
  const { user, logoutUser, isTeacher, isAdmin }                  = useAuth();
  const [selectedMode, setSelectedMode] = useState(GameMode.COMPETITIVE);
  const [showStats, setShowStats]       = useState(false);

  const isCompetitive = selectedMode === GameMode.COMPETITIVE;

  function SubjectCard({ gradient, glow, emoji, label, desc, onClick, delay = 0 }) {
    return (
      <button
        className="category-card-2x2"
        style={{ "--card-gradient": gradient, "--card-glow": glow, animationDelay: `${delay}s` }}
        onClick={onClick}
      >
        <div className="card-inner">
          <div className="cat-emoji-big">{emoji}</div>
          <div className="cat-name-big">{label}</div>
          <div className="cat-desc-small">{desc}</div>
        </div>
      </button>
    );
  }

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
          <span className="title-blaster">TURBO</span>
        </h1>
        <p className="menu-subtitle">Pick a mode and topic!</p>

        {user && (
          <div className="menu-user-bar">
            <span className="menu-user-name">👋 {user.displayName}</span>
            <button className="menu-icon-btn" onClick={() => setShowStats(true)} title="My Stats">📊</button>
            <button className="menu-icon-btn lb-icon-btn" onClick={goToLeaderboard} title="Leaderboard">🏆</button>
            {isTeacher && (
              <button className="menu-icon-btn admin-icon-btn" onClick={goToAdmin} title="Manage Students">⚙️</button>
            )}
            {isAdmin && (
              <button className="menu-icon-btn superadmin-icon-btn" onClick={goToSuperAdmin} title="Manage Teachers">👑</button>
            )}
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

      {isCompetitive && (
        <div className="comp-active-banner">
          <span className="comp-active-title">🏆 COMPETITIVE MODE</span>
          <span className="comp-active-sub">10 min timer · scores saved to leaderboard · settings locked</span>
        </div>
      )}

      {/* ── 6 subject layout: [counting] [+  -] [algebra] ── */
      /*                                  [×  ÷]            */}
      <div className="subject-sections">
        {/* Left: Counting */}
        <SubjectCard
          gradient="linear-gradient(135deg,#FF6B6B,#FF8E53)"
          glow="#FF6B6B"
          emoji="🔢"
          label="Counting"
          desc="Count objects & numbers"
          delay={0}
          onClick={() => startGame({ category: Category.COUNTING, mode: selectedMode })}
        />

        {/* Middle: 4 arithmetic ops */}
        <div className="arithmetic-grid">
          {ARITHMETIC_OPS.map(({ op, label, emoji, desc, gradient, glow }, i) => (
            <SubjectCard
              key={op}
              gradient={gradient}
              glow={glow}
              emoji={emoji}
              label={label}
              desc={desc}
              delay={i * 0.06}
              onClick={() => startGame({ category: Category.ARITHMETIC, op, mode: selectedMode })}
            />
          ))}
        </div>

        {/* Right: Algebra */}
        <SubjectCard
          gradient="linear-gradient(135deg,#FF9F43,#EE5A24)"
          glow="#FF9F43"
          emoji="🔣"
          label="Algebra"
          desc="Solve for x"
          delay={0.24}
          onClick={() => startGame({ category: Category.ALGEBRA, mode: selectedMode })}
        />
      </div>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </div>
  );
}
