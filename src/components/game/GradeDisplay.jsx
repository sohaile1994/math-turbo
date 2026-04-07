import { useEffect, useRef } from "react";
import { useGrade, GRADE_COLORS } from "../../context/GradeContext";
import { gsap } from "gsap";

export default function GradeDisplay() {
  const { grade, combo, frozen, freezeSecsLeft } = useGrade();
  const color   = GRADE_COLORS[grade];
  const letterRef = useRef(null);
  const prevGrade = useRef(grade);

  // Animate grade letter when it changes
  useEffect(() => {
    if (grade !== prevGrade.current && letterRef.current) {
      gsap.fromTo(
        letterRef.current,
        { scale: 1.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }
      );
    }
    prevGrade.current = grade;
  }, [grade]);

  return (
    <div className="grade-display">
      <div
        ref={letterRef}
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
