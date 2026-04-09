import { createContext, useContext, useState } from "react";

const SettingsContext = createContext();

const ALL_OPS = ["+", "-", "×", "÷"];

export const SettingsProvider = ({ children }) => {
  // Which arithmetic operations are active (at least one must always be on)
  const [selectedOps, setSelectedOps] = useState(["+"]); // radio: one at a time
  const [allowNegatives, setAllowNegatives] = useState(false);
  const [allowDecimals, setAllowDecimals]   = useState(false);
  const [difficulty, setDifficulty]         = useState("medium");
  const [valueMin, setValueMin]             = useState(1);
  const [valueMax, setValueMax]             = useState(9);

  // Radio-style: selecting an op deselects all others
  const selectOp = (op) => setSelectedOps([op]);

  return (
    <SettingsContext.Provider value={{
      selectedOps,
      selectOp,
      allowNegatives,
      setAllowNegatives,
      allowDecimals,
      setAllowDecimals,
      difficulty,
      setDifficulty,
      valueMin,
      setValueMin,
      valueMax,
      setValueMax,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
