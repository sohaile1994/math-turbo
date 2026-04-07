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
// EXPONENTS  (power · root · rule · sci notation)
// ──────────────────────────────────────────────────────────────────

/** Renders  base^exp  inline with superscript */
function ExpTerm({ base, exp }) {
  return (
    <span className="exp-term">
      <span className="exp-base">{base}</span>
      <sup className="exp-power">{exp}</sup>
    </span>
  );
}

/** Renders  coeff × 10^power  inline */
function SciTerm({ coeff, power }) {
  return (
    <span className="sci-term">
      {coeff}&thinsp;&times;&thinsp;10<sup>{power}</sup>
    </span>
  );
}

function ExponentLayout({ problem }) {
  const { type } = problem;

  // ── Exponent product / quotient rule ────────────────────────────
  if (type === "exponent_rule") {
    const label = problem.subtype === "product"
      ? "Product Rule" : "Quotient Rule";
    return (
      <div className="problem-card expression-layout">
        <BoosterBadge type={problem.booster} />
        <div className="category-label">{label}</div>
        <div className="expression-text exponent-expr">
          <ExpTerm base={problem.base} exp={problem.exp1} />
          <span className="sci-op">{problem.op}</span>
          <ExpTerm base={problem.base} exp={problem.exp2} />
          <span className="sci-op">=</span>
          <span className="exp-base">{problem.base}</span>
          <sup className="exp-power sci-unknown">?</sup>
        </div>
        <div className="rule-hint">What is the exponent?</div>
        <div className="equals-row">
          <span className="algebra-x-label">exp =</span>
          <AnswerInput />
        </div>
      </div>
    );
  }

  // ── Scientific notation arithmetic / multiply / divide ──────────
  if (type === "sci_notation") {
    const label = problem.subtype === "arith"
      ? "Scientific Notation"
      : problem.subtype === "multiply" ? "Sci Notation ×" : "Sci Notation ÷";

    const needsParens = problem.subtype !== "arith";
    return (
      <div className="problem-card expression-layout">
        <BoosterBadge type={problem.booster} />
        <div className="category-label">{label}</div>
        <div className="expression-text sci-expr">
          {needsParens && <span>(</span>}
          <SciTerm coeff={problem.coeff1} power={problem.power1} />
          {needsParens && <span>)</span>}
          <span className="sci-op">{problem.op}</span>
          {needsParens && <span>(</span>}
          <SciTerm coeff={problem.coeff2} power={problem.power2} />
          {needsParens && <span>)</span>}
        </div>
        <div className="equals-row">
          <span className="equals">=</span>
          <AnswerInput />
        </div>
      </div>
    );
  }

  // ── Basic power ─────────────────────────────────────────────────
  if (type === "exponent_power") {
    return (
      <div className="problem-card expression-layout">
        <BoosterBadge type={problem.booster} />
        <div className="category-label">Exponents</div>
        <div className="expression-text exponent-expr">
          <ExpTerm base={problem.base} exp={problem.exp} />
        </div>
        <div className="equals-row">
          <span className="equals">=</span>
          <AnswerInput />
        </div>
      </div>
    );
  }

  // ── Square / cube root ──────────────────────────────────────────
  const rootLabel = problem.rootDegree === 3 ? "Cube Root" : "Square Root";
  return (
    <div className="problem-card expression-layout">
      <BoosterBadge type={problem.booster} />
      <div className="category-label">{rootLabel}</div>
      <div className="expression-text exponent-expr">
        {problem.rootDegree === 3 && <sup className="root-degree">3</sup>}
        <span className="sqrt-radical">√</span>
        <span className="exp-base">{problem.value}</span>
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
    case "counting":        return <CountingLayout   problem={problem} />;
    case "arithmetic":      return <ArithmeticLayout problem={problem} />;
    case "pemdas":          return <PEMDASLayout      problem={problem} />;
    case "exponent_power":
    case "exponent_sqrt":
    case "exponent_rule":
    case "sci_notation":    return <ExponentLayout   problem={problem} />;
    case "algebra":         return <AlgebraLayout    problem={problem} />;
    default:                return null;
  }
}
