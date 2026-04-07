import { useProblem }   from "../context/ProblemContext";
import { useAnswer }    from "../context/AnswerContext";
import AnswerInput      from "./AnswerInput";
import { BOOSTER_LABELS } from "../generators";

// ──────────────────────────────────────────────────────────────────
// Booster badge shown on the problem card
// ──────────────────────────────────────────────────────────────────
function BoosterBadge({ type }) {
  if (!type) return null;
  return (
    <div className="booster-badge">🎁 {BOOSTER_LABELS[type]}</div>
  );
}

// ──────────────────────────────────────────────────────────────────
// COUNTING
// ──────────────────────────────────────────────────────────────────
function CountingLayout({ problem }) {
  return (
    <div className="problem-card counting-layout">
      <BoosterBadge type={problem.booster} />
      <div className="counting-prompt">How many?</div>
      <div className="counting-items">
        {Array.from({ length: problem.count }, (_, i) => (
          <span key={i} className="counting-item">{problem.item}</span>
        ))}
      </div>
      <AnswerInput />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ARITHMETIC
// ──────────────────────────────────────────────────────────────────
function ArithmeticLayout({ problem }) {
  const { a, b, op } = problem;

  if (op === "÷") {
    return (
      <div className="problem-card division-layout">
        <BoosterBadge type={problem.booster} />
        <div className="fraction">
          <span className="value-display">{a}</span>
          <div className="horizontal-line" />
          <span className="value-display">{b}</span>
        </div>
        <div className="equals">=</div>
        <AnswerInput />
      </div>
    );
  }

  return (
    <div className="problem-card vertical-layout">
      <BoosterBadge type={problem.booster} />
      <div className="top-number">
        <span className="value-display">{a}</span>
      </div>
      <div className="bottom-row">
        <span className="operator">{op}</span>
        <span className="value-display">{b}</span>
      </div>
      <div className="horizontal-line" />
      <AnswerInput />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// PEMDAS
// ──────────────────────────────────────────────────────────────────
function PEMDASLayout({ problem }) {
  return (
    <div className="problem-card expression-layout">
      <BoosterBadge type={problem.booster} />
      <div className="category-label">Order of Operations</div>
      <div className="expression-text">{problem.expression}</div>
      <div className="equals-row">
        <span className="equals">=</span>
        <AnswerInput />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// EXPONENTS
// ──────────────────────────────────────────────────────────────────
function ExponentLayout({ problem }) {
  const isPower = problem.type === "exponent_power";

  return (
    <div className="problem-card expression-layout">
      <BoosterBadge type={problem.booster} />
      <div className="category-label">
        {isPower ? "Exponents" : problem.rootDegree === 3 ? "Cube Root" : "Square Root"}
      </div>

      <div className="expression-text exponent-expr">
        {isPower ? (
          <>
            <span className="exp-base">{problem.base}</span>
            <sup className="exp-power">{problem.exp}</sup>
          </>
        ) : problem.rootDegree === 3 ? (
          <>
            <sup className="root-degree">3</sup>
            <span className="sqrt-radical">√</span>
            <span className="exp-base">{problem.value}</span>
          </>
        ) : (
          <>
            <span className="sqrt-radical">√</span>
            <span className="exp-base">{problem.value}</span>
          </>
        )}
      </div>

      <div className="equals-row">
        <span className="equals">=</span>
        <AnswerInput />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ALGEBRA
// ──────────────────────────────────────────────────────────────────
function AlgebraLayout({ problem }) {
  return (
    <div className="problem-card expression-layout">
      <BoosterBadge type={problem.booster} />
      <div className="category-label">Solve for x</div>
      <div className="expression-text">{problem.expression}</div>
      <div className="equals-row algebra-row">
        <span className="algebra-x-label">x =</span>
        <AnswerInput />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ROUTER
// ──────────────────────────────────────────────────────────────────
export default function ProblemLayout() {
  const { problem } = useProblem();

  switch (problem.type) {
    case "counting":       return <CountingLayout    problem={problem} />;
    case "arithmetic":     return <ArithmeticLayout  problem={problem} />;
    case "pemdas":         return <PEMDASLayout       problem={problem} />;
    case "exponent_power":
    case "exponent_sqrt":  return <ExponentLayout     problem={problem} />;
    case "algebra":        return <AlgebraLayout      problem={problem} />;
    default:               return null;
  }
}
