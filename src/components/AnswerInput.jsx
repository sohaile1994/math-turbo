import { useEffect, useRef } from "react";
import { useAnswer } from "../context/AnswerContext";

export default function AnswerInput() {
  const { answer, setAnswer, submit, locked } = useAnswer();
  const lastKeyTime = useRef(0);
  const THROTTLE = 80;

  useEffect(() => {
    const handleKey = (e) => {
      if (locked) return;

      const now = Date.now();
      if (now - lastKeyTime.current < THROTTLE) return;
      lastKeyTime.current = now;

      if (e.key === "Enter") {
        submit();
        return;
      }

      // Allow digits, minus sign, decimal point
      if (/^[0-9.\-]$/.test(e.key)) {
        e.preventDefault();
        setAnswer(prev => prev + e.key);
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setAnswer(prev => prev.slice(0, -1));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submit, setAnswer, locked]);

  return (
    <div className="answer-row">
      <input
        className="answer-input"
        value={answer}
        onChange={e => !locked && setAnswer(e.target.value)}
        disabled={locked}
        placeholder="?"
        style={{ textAlign: "center" }}
      />
    </div>
  );
}
