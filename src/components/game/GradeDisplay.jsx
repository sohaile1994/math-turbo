import { useGrade, GRADE_COLORS, gradeFromScore } from "../../context/GradeContext";
import { useScore } from "../../context/ScoreContext";
import { useGame }  from "../../context/GameContext";

export default function GradeDisplay() {
  const { combo, frozen, freezeSecsLeft } = useGrade();
  const { score }    = useScore();
  const { category } = useGame();

  const grade = gradeFromScore(score, category);
  const color = GRADE_COLORS[grade];

  return (
    <div className="grade-display">
      <div
        className={`grade-letter ${grade === "SSS" ? "sss-glow" : ""}`}
        style={{ color, textShadow: `0 0 18px ${color}, 0 0 40px ${color}` }}
      >
        {grade}
      </div>
      <div className="grade-combo" style={{ color }}>
        combo {combo}
      </div>
      {frozen && (
        <div className="grade-frozen-badge">❄️ {freezeSecsLeft}s</div>
      )}
    </div>
  );
}
