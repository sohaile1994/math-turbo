import { useScore } from "../context/ScoreContext";
import { useGame }  from "../context/GameContext";
import { GRADE_COLORS, gradeFromScore } from "../context/GradeContext";

export default function ScoreDisplay() {
  const { score }    = useScore();
  const { category } = useGame();
  const color        = GRADE_COLORS[gradeFromScore(score, category)];

  return (
    <div className="score-display" style={{ color }}>
      {score.toLocaleString()} pts
    </div>
  );
}
