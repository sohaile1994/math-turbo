import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Category } from "../enums";
import { useSettings } from "./SettingsContext";
import {
  generateCounting,
  generateArithmetic,
  generatePEMDAS,
  generateExponent,
  generateAlgebra,
} from "../generators";

const ProblemContext = createContext();

function generateProblem(category, settings) {
  switch (category) {
    case Category.COUNTING:   return generateCounting();
    case Category.ARITHMETIC: return generateArithmetic(settings);
    case Category.PEMDAS:     return generatePEMDAS();
    case Category.EXPONENTS:  return generateExponent();
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

  const nextProblem = useCallback(() => {
    setProblem(generateProblem(category, settingsRef.current));
  }, [category]);

  return (
    <ProblemContext.Provider value={{ problem, nextProblem }}>
      {children}
    </ProblemContext.Provider>
  );
};

export const useProblem = () => useContext(ProblemContext);
