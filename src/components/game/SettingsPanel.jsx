import { useSettings } from "../../context/SettingsContext";
import { useGame }     from "../../context/GameContext";
import { useProblem }  from "../../context/ProblemContext";
import { Category }    from "../../enums";

const OPS = ["+", "-", "×", "÷"];

function Stepper({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="stepper">
      <button
        className="stepper-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >−</button>
      <span className="stepper-val">{value}</span>
      <button
        className="stepper-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >+</button>
    </div>
  );
}

export default function SettingsPanel({ onClose, onQuit }) {
  const {
    selectedOps, selectOp,
    allowNegatives, setAllowNegatives,
    allowDecimals,  setAllowDecimals,
    difficulty,     setDifficulty,
    valueMin,       setValueMin,
    valueMax,       setValueMax,
  } = useSettings();

  const { category } = useGame();
  const { nextProblem } = useProblem();
  const isArithmetic = category === Category.ARITHMETIC;
  const isAlgebra    = category === Category.ALGEBRA;

  const changeOp = (op) => {
    selectOp(op);
    nextProblem({ selectedOps: [op], allowNegatives, allowDecimals, valueMin, valueMax });
  };

  const changeNegatives = () => {
    const next = !allowNegatives;
    setAllowNegatives(next);
    nextProblem({ selectedOps, allowNegatives: next, allowDecimals, difficulty, valueMin, valueMax });
  };

  const changeDecimals = () => {
    const next = !allowDecimals;
    setAllowDecimals(next);
    nextProblem({ selectedOps, allowNegatives, allowDecimals: next, difficulty, valueMin, valueMax });
  };

  const changeDifficulty = (d) => {
    setDifficulty(d);
    nextProblem({ selectedOps, allowNegatives, allowDecimals, difficulty: d, valueMin, valueMax });
  };

  const changeMin = (v) => {
    const clamped = Math.min(v, valueMax - 1);
    setValueMin(clamped);
    nextProblem({ selectedOps, allowNegatives, allowDecimals, difficulty, valueMin: clamped, valueMax });
  };

  const changeMax = (v) => {
    const clamped = Math.max(v, valueMin + 1);
    setValueMax(clamped);
    nextProblem({ selectedOps, allowNegatives, allowDecimals, difficulty, valueMin, valueMax: clamped });
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <span>⚙️ Settings</span>
        <button className="settings-close" onClick={onClose}>Done</button>
      </div>

      {/* ── Operation radio (arithmetic only) ── */}
      {isArithmetic && (
        <div className="settings-row">
          <span className="settings-label">Operation</span>
          <div className="op-toggle-group">
            {OPS.map(op => (
              <button
                key={op}
                className={`op-toggle-btn ${selectedOps.includes(op) ? "active" : ""}`}
                onClick={() => changeOp(op)}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Value range (arithmetic only) ── */}
      {isArithmetic && (
        <div className="settings-row">
          <span className="settings-label">Range</span>
          <div className="range-control">
            <Stepper value={valueMin} onChange={changeMin} min={1} max={valueMax - 1} />
            <span className="range-sep">—</span>
            <Stepper value={valueMax} onChange={changeMax} min={valueMin + 1} max={50} />
          </div>
        </div>
      )}

      {/* ── Difficulty (algebra only) ── */}
      {isAlgebra && (
        <div className="settings-row">
          <span className="settings-label">Difficulty</span>
          <div className="op-toggle-group">
            {["easy","medium","hard"].map(d => (
              <button
                key={d}
                className={`op-toggle-btn ${difficulty === d ? "active" : ""}`}
                onClick={() => changeDifficulty(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Negatives ── */}
      {(isArithmetic || isAlgebra) && (
        <div className="settings-row">
          <span className="settings-label">Negatives</span>
          <button
            className={`toggle-pill ${allowNegatives ? "active" : ""}`}
            onClick={changeNegatives}
          >
            {allowNegatives ? "ON" : "OFF"}
          </button>
        </div>
      )}

      {/* ── Decimals (arithmetic only) ── */}
      {isArithmetic && (
        <div className="settings-row">
          <span className="settings-label">Decimals</span>
          <button
            className={`toggle-pill ${allowDecimals ? "active" : ""}`}
            onClick={changeDecimals}
          >
            {allowDecimals ? "ON" : "OFF"}
          </button>
        </div>
      )}

      {/* ── Quit ── */}
      <button className="quit-game-btn" onClick={onQuit}>
        ✕ Quit Game
      </button>
    </div>
  );
}
