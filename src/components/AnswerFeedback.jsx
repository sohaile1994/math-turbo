import { useAnswer } from "../context/AnswerContext";

export default function AnswerFeedback() {
  const { feedback, correctAnswerStr, pointsEarned, boosterAwarded } = useAnswer();

  return (
    <div className="feedback-area">
      {feedback === "correct" && (
        <div className="feedback correct-fb">
          ✅ Correct!
          {pointsEarned != null && (
            <span className="points-earned"> +{pointsEarned} pts</span>
          )}
        </div>
      )}

      {feedback === "retry" && (
        <div className="feedback retry-fb">⚠️ Try again!</div>
      )}

      {feedback === "wrong" && (
        <div className="feedback wrong-fb">
          ❌ Answer: <strong>{correctAnswerStr}</strong>
        </div>
      )}

      {!feedback && <div className="feedback-placeholder">&nbsp;</div>}
    </div>
  );
}
