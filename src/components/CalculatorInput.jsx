import { useRef } from "react";
import { useAnswer } from "../context/AnswerContext";

const DIGIT_ROWS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  ["-", "0", "."],
];

export default function CalculatorInput() {
  const { answer, setAnswer, submit, locked } = useAnswer();
  const lastPressTime = useRef(0);
  const THROTTLE = 80;

  const press = (val) => {
    if (locked) return;
    const now = Date.now();
    if (now - lastPressTime.current < THROTTLE) return;
    lastPressTime.current = now;
    setAnswer(prev => prev + val);
  };

  const back = () => {
    if (locked) return;
    setAnswer(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (locked || !answer) return;
    submit();
  };

  const disabled = locked;

  return (
    <div className="calc">
      {/* Action row */}
      <div className="calc-action-row">
        <button
          className="calc-key back-key"
          onClick={back}
          disabled={disabled}
        >
          ⌫
        </button>
        <button
          className="calc-key submit-key"
          onClick={handleSubmit}
          disabled={disabled}
        >
          ENTER
        </button>
      </div>

      {/* Number pad */}
      <div className="calc-grid">
        {DIGIT_ROWS.map((row) =>
          row.map((key) => (
            <button
              key={key}
              className="calc-key"
              onClick={() => press(key)}
              disabled={disabled}
            >
              {key}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
