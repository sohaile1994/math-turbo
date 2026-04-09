import { useGame } from "../../context/GameContext";
import { Category, GameMode } from "../../enums";

const CATEGORIES = [
  {
    id: Category.COUNTING,
    emoji: "🔢",
    label: "Counting",
    desc: "Count objects & learn numbers",
    color: "#FF6B6B",
    glow: "#FF6B6B",
    gradient: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
  },
  {
    id: Category.ARITHMETIC,
    emoji: "➕",
    label: "Arithmetic",
    desc: "+ − × ÷ operations",
    color: "#4ECDC4",
    glow: "#4ECDC4",
    gradient: "linear-gradient(135deg, #4ECDC4, #44A8D0)",
  },
  {
    id: Category.PEMDAS,
    emoji: "📐",
    label: "Order of Ops",
    desc: "Parentheses & operations",
    color: "#A78BFA",
    glow: "#A78BFA",
    gradient: "linear-gradient(135deg, #A78BFA, #EC4899)",
  },
  {
    id: Category.ALGEBRA,
    emoji: "🔣",
    label: "Algebra",
    desc: "Solve for x",
    color: "#F59E0B",
    glow: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
  },
];

export default function MainMenu() {
  const { startGame } = useGame();

  return (
    <div className="main-menu">
      <div className="menu-hero">
        <div className="hero-decoration hero-dec-1">✦</div>
        <div className="hero-decoration hero-dec-2">★</div>
        <div className="hero-decoration hero-dec-3">◆</div>
        <h1 className="menu-title">
          <span className="title-math">MATH</span>
          <br />
          <span className="title-blaster">BLASTER</span>
        </h1>
        <p className="menu-subtitle">Pick a topic and go!</p>
      </div>

      <div className="category-grid-2x2">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.id}
            className="category-card-2x2"
            style={{
              "--card-gradient": cat.gradient,
              "--card-glow": cat.glow,
              animationDelay: `${i * 0.08}s`,
            }}
            onClick={() => startGame({ category: cat.id, mode: GameMode.ENDLESS })}
          >
            <div className="card-inner">
              <div className="cat-emoji-big">{cat.emoji}</div>
              <div className="cat-name-big">{cat.label}</div>
              <div className="cat-desc-small">{cat.desc}</div>
              <div className="card-play-hint">TAP TO PLAY ▶</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
