import { useRef } from "react";
import { useAnswer } from "../context/AnswerContext";


export default function CalculatorInput() {
  const { answer, setAnswer, submit, feedback } = useAnswer();
  const lastPressTime = useRef(0);
  const delay = 100; // 0.1s throttle

  const acceptInput = feedback !== "wrong";

  const press = (val) => {
    if (!acceptInput) return;

    const now = Date.now();
    if (now - lastPressTime.current < delay) return;
    lastPressTime.current = now;

    setAnswer(prev => prev + val);
  };

  const clear = () => {
    if (!acceptInput) return;
    setAnswer("");
  };

  const back = () => {
    if (!acceptInput) return;
    setAnswer(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (!acceptInput || !answer) return; // prevent empty submit
    submit();
  };

  const buttons = [
    "1","2","3",
    "4","5","6",
    "7","8","9", "-",
    "0", "  ",
  ];

  return (
    <div className="calc">
      <div className="calc-grid">

        {/* Submit button at the top, spanning 2 columns */}
          <div
             className="calc-key back-key"
             onClick={back}
             style={{
               opacity: acceptInput ? 1 : 0.5,
               pointerEvents: acceptInput ? "auto" : "none"
             }}
           >
             <p>⌫</p>
           </div>
        <div
          className="calc-key submit-key"
          onClick={handleSubmit}
          style={{
            gridColumn: "span 2",
            opacity: acceptInput ? 1 : 0.5,
            pointerEvents: acceptInput ? "auto" : "none"
          }}
        >
          <p>SUBMIT</p>
        </div>

        {/* Clear button top-right */}

        {/* Number buttons */}
        {buttons.map(b => (
          <div
            key={b}
            className="calc-key"
            onClick={() => press(b)}
            style={{
              opacity: acceptInput ? 1 : 0.5,
              pointerEvents: acceptInput ? "auto" : "none"
            }}
          >
            <p>{b}</p>
          </div>
        ))}

        {/* Back button at the bottom-right */}
        
      </div>
    </div>
  );
}
