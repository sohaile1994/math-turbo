import { useEffect, useRef, useState } from "react";
import { useAnswer } from "../context/AnswerContext";
import { useMenu } from "../context/MenuContext";


export default function AnswerInput() {
  const { answer, setAnswer, submit, feedback } = useAnswer();
const { isMenuOpen } = useMenu();

  const lastKeyTime = useRef(0);
  const delay = 100; // 0.1 seconds
  const [acceptInput, setAcceptInput] = useState(true);

  // Only disable input when feedback === "wrong" (second wrong attempt)
  useEffect(() => {
    if (feedback === "wrong") {
      setAcceptInput(false);
      const timeout = setTimeout(() => setAcceptInput(true), 2000); // 2s disable
      return () => clearTimeout(timeout);
    }
  }, [feedback]);

  useEffect(() => {
    const handleKey = (e) => {
    if (!acceptInput || isMenuOpen) return;

      const now = Date.now();
      if (now - lastKeyTime.current < delay) return; // throttle
      lastKeyTime.current = now;

      if (e.key === "Enter") {
        submit();
        return;
      }

      if (/^[0-9.]$/.test(e.key)) {
        e.preventDefault(); // prevent input onChange double trigger
        setAnswer(prev => prev + e.key);
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setAnswer(prev => prev.slice(0, -1));
        return;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submit, setAnswer, acceptInput]);

  return (
    <div className="answer-row">
      <input
        className="answer-input"
        value={answer}
        onChange={e => acceptInput && setAnswer(e.target.value)}
        disabled={!acceptInput}
        style={{ textAlign: "right" }}
      />
     
    </div>
  );
}
