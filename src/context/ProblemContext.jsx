import { createContext, useContext, useState, useCallback } from "react";
import { Category } from "../enums";
import {
  generateCounting,
  generateArithmetic,
  generatePEMDAS,
  generateExponent,
  generateAlgebra,
} from "../generators";

const ProblemContext = createContext();

function generateProblem(category) {
  switch (category) {
    case Category.COUNTING:   return generateCounting();
    case Category.ARITHMETIC: return generateArithmetic();
    case Category.PEMDAS:     return generatePEMDAS();
    case Category.EXPONENTS:  return generateExponent();
    case Category.ALGEBRA:    return generateAlgebra();
    default:                  return generateArithmetic();
  }
}

export const ProblemProvider = ({ children, category }) => {
  const [problem, setProblem] = useState(() => generateProblem(category));

  const nextProblem = useCallback(() => {
    setProblem(generateProblem(category));
  }, [category]);

  return (
    <ProblemContext.Provider value={{ problem, nextProblem }}>
      {children}
    </ProblemContext.Provider>
  );
};

export const useProblem = () => useContext(ProblemContext);
