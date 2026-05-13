import { useLives } from "../../context/LivesContext";

export default function LivesDisplay() {
  const { lives, maxLives } = useLives();

  return (
    <div className="lives-display">
      {Array.from({ length: maxLives }, (_, i) => (
        <span key={i} className={`life-x ${i < lives ? "alive" : "dead"}`}>
          ✕
        </span>
      ))}
    </div>
  );
}
