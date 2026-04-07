import { useLives } from "../../context/LivesContext";

export default function LivesDisplay() {
  const { lives, isEndless } = useLives();

  if (!isEndless) {
    return (
      <div className="lives-display">
        <span className="life-heart">∞</span>
      </div>
    );
  }

  // Show up to 5 slots; filled hearts = remaining lives
  const slots = Math.max(lives, 0);
  const maxSlots = 5;

  return (
    <div className="lives-display">
      {Array.from({ length: maxSlots }, (_, i) => (
        <span
          key={i}
          className={`life-heart ${i < lives ? "alive" : "dead"}`}
        >
          {i < lives ? "❤️" : "🖤"}
        </span>
      ))}
    </div>
  );
}
