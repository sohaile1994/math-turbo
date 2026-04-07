import { createContext, useContext, useState } from "react";

const SettingsContext = createContext();

const ALL_OPS = ["+", "-", "×", "÷"];

export const SettingsProvider = ({ children }) => {
  // Which arithmetic operations are active (at least one must always be on)
  const [selectedOps, setSelectedOps] = useState(ALL_OPS);
  const [allowNegatives, setAllowNegatives] = useState(false);
  const [allowDecimals, setAllowDecimals]   = useState(false);
  // Easy | Medium | Hard — controls algebra template complexity
  const [difficulty, setDifficulty]         = useState("medium");

  const toggleOp = (op) => {
    setSelectedOps(prev => {
      if (prev.includes(op)) {
        if (prev.length === 1) return prev; // always keep at least one
        return prev.filter(o => o !== op);
      }
      return [...prev, op];
    });
  };

  return (
    <SettingsContext.Provider value={{
      selectedOps,
      toggleOp,
      allowNegatives,
      setAllowNegatives,
      allowDecimals,
      setAllowDecimals,
      difficulty,
      setDifficulty,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
