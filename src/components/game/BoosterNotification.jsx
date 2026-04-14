import { useAnswer } from "../../context/AnswerContext";
import { useGrade }  from "../../context/GradeContext";
import { useScore }  from "../../context/ScoreContext";
import { BoosterType } from "../../enums";

const BOOSTER_STYLE = {
  [BoosterType.GRADE_FREEZE]: { icon: "❄️", label: "GRADE SHIELD", color: "#00e5ff" },
  [BoosterType.EXTRA_LIFE]:   { icon: "❤️", label: "EXTRA LIFE!",  color: "#ff4d4d" },
  [BoosterType.SCORE_BOOST]:  { icon: "⚡", label: "SCORE BOOST!", color: "#ffea00" },
  [BoosterType.DOUBLE_COMBO]: { icon: "🔥", label: "DOUBLE COMBO!",color: "#ff6600" },
};

export default function BoosterNotification() {
  const { boosterAwarded }          = useAnswer();
  const { frozen, freezeSecsLeft }  = useGrade();
  const { scoreBoostLeft }          = useScore();

  return (
    <div className="booster-area">
      {boosterAwarded && (() => {
        const s = BOOSTER_STYLE[boosterAwarded];
        return (
          <div className="booster-popup" style={{ borderColor: s.color, color: s.color }}>
            {s.icon} {s.label}
          </div>
        );
      })()}

      <div className="active-effects">
        {frozen && (
          <span className="effect-badge" style={{ color: "#00e5ff" }}>
            ❄️ {freezeSecsLeft}s
          </span>
        )}
        {scoreBoostLeft > 0 && (
          <span className="effect-badge" style={{ color: "#ffea00" }}>
            ⚡ ×2 ({scoreBoostLeft})
          </span>
        )}
      </div>
    </div>
  );
}
