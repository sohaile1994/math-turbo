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
    const msg = STREAK_MESSAGES[streak] ?? "Correct!";
    return (
      <div key={feedbackKey} className="feedback correct-fb">
        <span>{msg}</span>
        {pointsEarned != null && <span className="pts-badge">+{pointsEarned}</span>}
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
