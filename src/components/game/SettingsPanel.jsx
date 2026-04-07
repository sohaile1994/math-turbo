import { useSettings } from "../../context/SettingsContext";
import { useGame }     from "../../context/GameContext";
import { Category }    from "../../enums";

const OPS = ["+", "-", "×", "÷"];

export default function SettingsPanel({ onClose }) {
  const {
    selectedOps, toggleOp,
    allowNegatives, setAllowNegatives,
    allowDecimals,  setAllowDecimals,
    difficulty,     setDifficulty,
  } = useSettings();

  const { category } = useGame();
  const isArithmetic = category === Category.ARITHMETIC;
  const isAlgebra    = category === Category.ALGEBRA;

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <span>⚙️ Settings</span>
        <button className="settings-close" onClick={onClose}>✕</button>
      </div>

      {/* ── Operation toggles (arithmetic only) ── */}
      {isArithmetic && (
        <div className="settings-row">
          <span className="settings-label">Operations</span>
          <div className="op-toggle-group">
            {OPS.map(op => (
              <button
                key={op}
                className={`op-toggle-btn ${selectedOps.includes(op) ? "active" : ""}`}
                onClick={() => toggleOp(op)}
              >
                {op}
              </button>
            ))}
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
                onClick={() => setDifficulty(d)}
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
            onClick={() => setAllowNegatives(v => !v)}
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
            onClick={() => setAllowDecimals(v => !v)}
          >
            {allowDecimals ? "ON" : "OFF"}
          </button>
        </div>
      )}
    </div>
  );
}
