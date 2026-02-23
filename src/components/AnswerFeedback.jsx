import { useAnswer } from "../context/AnswerContext";

export default function AnswerFeedback() {
  const { feedback, correctAnswer, lastProblem } = useAnswer();

  return (
    <div className="feedback">
      {feedback === "correct" && (
        <div className="correct">✅ Correct!</div>
      )}

      {feedback === "retry" && (
        <div className="retry">⚠ Try Again!</div>
      )}

      {feedback === "wrong" && lastProblem && (
        <div className="wrong">
          ❌ {lastProblem.a} {lastProblem.op} {lastProblem.b} = {correctAnswer}
        </div>
      )}

      {/* blank placeholder to keep layout consistent */}
      {!feedback && <div>&nbsp;</div>}
    </div>
  );
}
