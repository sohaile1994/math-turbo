import { useScore } from "../context/ScoreContext";
import { useGrade, GRADE_COLORS } from "../context/GradeContext";

export default function ScoreDisplay() {
  const { score }         = useScore();
  const { grade }         = useGrade();
  const color             = GRADE_COLORS[grade];

  return (
    <div className="score-display" style={{ color }}>
      {score.toLocaleString()} pts
    </div>
  );
}
