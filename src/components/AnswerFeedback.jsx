import { useAnswer } from "../context/AnswerContext";

const STREAK_MESSAGES = [
  null,
  "Nice! ✓",
  "Keep it up! ✓✓",
  "🔥 On fire!",
  "💥 Combo x4!",
  "⚡ Unstoppable!",
  "🚀 COMBO x6!",
];

export default function AnswerFeedback() {
  const { feedback, feedbackKey, streak, correctAnswerStr, pointsEarned } = useAnswer();

  if (!feedback) return <div className="feedback-placeholder" />;

  if (feedback === "correct") {
    const msg   = STREAK_MESSAGES[streak] ?? "Correct!";
    const scale = 1 + (streak - 1) * 0.12; // grows with each streak level
    return (
      <div
        key={feedbackKey}
        className="feedback correct-fb"
        style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
      >
        <span>{msg}</span>
        {pointsEarned != null && <span className="pts-badge">+{pointsEarned}</span>}
      </div>
    );
  }

  if (feedback === "streak7") {
    return (
      <div key={feedbackKey} className="feedback streak7-fb">
        <span className="streak7-crown">🌟</span>
        <span>PERFECT 7!</span>
        <span className="pts-badge">+{pointsEarned}</span>
        <span className="streak7-crown">🌟</span>
      </div>
    );
  }

  if (feedback === "retry") {
    return (
      <div key={feedbackKey} className="feedback retry-fb">
        💔 Wrong — try again!
      </div>
    );
  }

  if (feedback === "wrong") {
    return (
      <div key={feedbackKey} className="feedback wrong-fb">
        ❌ Answer: <strong>{correctAnswerStr}</strong>
      </div>
    );
  }

  return <div className="feedback-placeholder" />;
}
