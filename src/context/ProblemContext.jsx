import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Category } from "../enums";
import { useSettings } from "./SettingsContext";
import {
  generateCounting,
  generateArithmetic,
  generatePEMDAS,
  generateAlgebra,
} from "../generators";

const ProblemContext = createContext();

function generateProblem(category, settings) {
  switch (category) {
    case Category.COUNTING:   return generateCounting();
    case Category.ARITHMETIC: return generateArithmetic(settings);
    case Category.PEMDAS:     return generatePEMDAS();
    case Category.ALGEBRA:    return generateAlgebra(settings);
    default:                  return generateArithmetic(settings);
  }
}

export const ProblemProvider = ({ children, category }) => {
  const settings    = useSettings();
  const settingsRef = useRef(settings);

  // Keep ref up-to-date so nextProblem always uses latest settings
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const [problem, setProblem] = useState(() => generateProblem(category, settings));

  // settingsOverride lets callers pass fresh settings before the ref syncs
  const nextProblem = useCallback((settingsOverride) => {
    setProblem(generateProblem(category, settingsOverride ?? settingsRef.current));
  }, [category]);

  return (
    <ProblemContext.Provider value={{ problem, nextProblem }}>
      {children}
    </ProblemContext.Provider>
  );
};

export const useProblem = () => useContext(ProblemContext);
