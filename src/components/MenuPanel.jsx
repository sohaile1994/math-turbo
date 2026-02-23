import { useMenu } from "../context/MenuContext";
import { useState, useRef, useEffect } from "react";
import { Operation } from "../enums";

export default function MenuPanel() {
 const { config, updateConfig, isMenuOpen, setIsMenuOpen } = useMenu();

  const panelRef = useRef();



  // Close menu if click happens outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const update = (key, value) => {
    updateConfig({ [key]: value });

    // Automatically close menu if operator is changed
    if (key === "operator") setIsMenuOpen(false);
  };

  return (
    <div className="menu-wrapper">
      <button
        className="menu-toggle"
        onClick={() => setIsMenuOpen(prev => !prev)}
      >
        Settings ⚡
      </button>

      <div
        ref={panelRef}
        className={`menu-panel arcade-panel ${isMenuOpen ? "open" : ""}`}

      >
        <label>
          Min:
          <input
            type="number"
            value={config.min}
            onChange={e => update("min", Number(e.target.value))}
          />
        </label>

        <label>
          Max:
          <input
            type="number"
            value={config.max}
            onChange={e => update("max", Number(e.target.value))}
          />
        </label>

        <div className="operator-buttons">
          {Object.values(Operation).map(op => (
            <button
              key={op}
              className={config.operator === op ? "active box" : "box"}
              onClick={() => update("operator", op)}
            >
              {op}
            </button>
          ))}
        </div>

      <label className="negatives-row">
        <span className="negatives-label">Negatives:</span>

        <input
          type="checkbox"
          checked={config.allowNegatives}
          onChange={e => update("allowNegatives", e.target.checked)}
        />

        <span
          className={`negatives-box ${
            config.allowNegatives ? "active" : ""
          }`}
        >
          {config.allowNegatives ? "X" : ""}
        </span>
      </label>


      </div>
    </div>
  );
}