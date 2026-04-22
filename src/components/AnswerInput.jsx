import { useEffect, useRef } from "react";
import { useAnswer } from "../context/AnswerContext";

export default function AnswerInput() {
  const { answer, setAnswer, submit, locked } = useAnswer();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (locked) return;
      // If the input is already focused, let the native input handle it
      if (document.activeElement === inputRef.current) return;

      if (e.key === "Enter") {
        submit();
        return;
      }

      if (/^[0-9\-]$/.test(e.key) || (e.key === "." && !answer.includes("."))) {
        e.preventDefault();
        setAnswer(prev => prev + e.key);
        inputRef.current?.focus();
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setAnswer(prev => prev.slice(0, -1));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submit, setAnswer, locked, answer]);

  const handleChange = (e) => {
    if (locked) return;
    const val = e.target.value;
    // Block a second decimal point
    if ((val.match(/\./g) || []).length > 1) return;
    setAnswer(val);
  };

  return (
    <div className="answer-row">
      <input
        ref={inputRef}
        className="answer-input"
        value={answer}
        onChange={handleChange}
        onKeyDown={e => e.key === "Enter" && submit()}
        disabled={locked}
        placeholder="?"
        style={{ textAlign: "center" }}
      />
    </div>
  );
}
