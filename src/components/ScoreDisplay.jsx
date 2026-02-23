import { useScore } from "../context/ScoreContext";

export default function ScoreDisplay() {
  const { score, streak } = useScore();

  return (
    <div className="score-display">
      Score: {score} | Streak: {streak}
    </div>
  );
}
