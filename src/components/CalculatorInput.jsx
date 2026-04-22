import { useAnswer } from "../context/AnswerContext";

const DIGIT_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["±", "0", "."],
];

function BackspaceIcon() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 3H7.5L0.5 9L7.5 15H21V3Z"/>
      <path d="M16 6L10 12M10 6L16 12"/>
    </svg>
  );
}

export default function CalculatorInput() {
  const { answer, setAnswer, submit, locked } = useAnswer();

  const press = (val) => {
    if (locked) return;
    if (val === "±") {
      setAnswer(prev => prev.startsWith("-") ? prev.slice(1) : "-" + prev);
      return;
    }
    if (val === "." && answer.includes(".")) return;
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

  return (
    <div className="calc">
      {/* Action row */}
      <div className="calc-action-row">
        <button className="calc-key back-key" onClick={back} disabled={locked}>
          <BackspaceIcon />
        </button>
        <button className="calc-key submit-key" onClick={handleSubmit} disabled={locked}>
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
              disabled={locked}
            >
              {key}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
