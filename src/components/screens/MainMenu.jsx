import { useState } from "react";
import { useGame }        from "../../context/GameContext";
import { Category, GameMode } from "../../enums";

const CATEGORIES = [
  {
    id: Category.COUNTING,
    emoji: "🔢",
    label: "Counting",
    level: "Beginner",
    desc: "Count objects & learn numbers",
  },
  {
    id: Category.ARITHMETIC,
    emoji: "➕",
    label: "Arithmetic",
    level: "Easy",
    desc: "+ − × ÷ operations",
  },
  {
    id: Category.PEMDAS,
    emoji: "📐",
    label: "PEMDAS",
    level: "Medium",
    desc: "Order of operations",
  },
  {
    id: Category.EXPONENTS,
    emoji: "⚡",
    label: "Exponents",
    level: "Medium",
    desc: "Powers & square roots",
  },
  {
    id: Category.ALGEBRA,
    emoji: "🔣",
    label: "Algebra",
    level: "Hard",
    desc: "Solve for x",
  },
];

const LEVEL_COLORS = {
  Beginner: "#00ff88",
  Easy:     "#00e5ff",
  Medium:   "#ffea00",
  Hard:     "#ff6600",
};

export default function MainMenu() {
  const { startGame }       = useGame();
  const [category, setCategory] = useState(null);
  const [mode, setMode]         = useState(null);

  const canStart = category !== null && mode !== null;

  return (
    <div className="main-menu">
      <h1 className="menu-title">
        <span className="title-math">MATH</span>
        <span className="title-blaster"> BLASTER</span>
      </h1>
      <p className="menu-subtitle">Choose your challenge</p>

      {/* ── Category grid ── */}
      <section className="menu-section">
        <h2 className="section-heading">📚 Topic</h2>
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-card ${category === cat.id ? "selected" : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              <div className="cat-emoji">{cat.emoji}</div>
              <div className="cat-name">{cat.label}</div>
              <div
                className="cat-level"
                style={{ color: LEVEL_COLORS[cat.level] }}
              >
                {cat.level}
              </div>
              <div className="cat-desc">{cat.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Mode select ── */}
      <section className="menu-section">
        <h2 className="section-heading">🎮 Mode</h2>
        <div className="mode-buttons">
          <button
            className={`mode-btn ${mode === GameMode.PRACTICE ? "selected" : ""}`}
            onClick={() => setMode(GameMode.PRACTICE)}
          >
            <div className="mode-icon">📚</div>
            <div className="mode-name">PRACTICE</div>
            <div className="mode-desc">Unlimited lives · Relaxed grade decay</div>
          </button>
          <button
            className={`mode-btn ${mode === GameMode.ENDLESS ? "selected" : ""}`}
            onClick={() => setMode(GameMode.ENDLESS)}
          >
            <div className="mode-icon">🔥</div>
            <div className="mode-name">ENDLESS</div>
            <div className="mode-desc">3 lives · Fast grade decay · High score</div>
          </button>
        </div>
      </section>

      {/* ── Start button ── */}
      <button
        className={`start-btn ${canStart ? "ready" : "not-ready"}`}
        disabled={!canStart}
        onClick={() => canStart && startGame({ category, mode })}
      >
        {canStart ? "▶  START" : "Select topic & mode"}
      </button>
    </div>
  );
}
