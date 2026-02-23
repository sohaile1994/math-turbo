import { useProblem } from "../context/ProblemContext";
import ValueDisplay from "./ValueDisplay";
import HorizontalLine from "./HorizontalLine";
import AnswerInput from "./AnswerInput";

export default function ProblemLayout() {
  const { problem } = useProblem();
  const { a, b, op } = problem;

  // division layout
  if (op === "/") {
    return (
      <div className="division-layout">

        <div className="fraction">
          <ValueDisplay value={a} />
          <HorizontalLine />
          <ValueDisplay value={b} />
        </div>

        <div className="equals">=</div>
        <AnswerInput />

      </div>
    );
  }

  // vertical arithmetic layout
  return (
    <div className="vertical-layout">

      <div className="top-number">
        <ValueDisplay value={a} />
      </div>

      <div className="bottom-row">
        <div className="operator">{op}</div>
        <ValueDisplay value={b} />
      </div>

      <HorizontalLine />
      <AnswerInput />

    </div>
  );
}
