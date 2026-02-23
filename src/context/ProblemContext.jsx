import { createContext, useContext, useState, useEffect } from "react";
import { useMenu } from "./MenuContext";
import { Operation } from "../enums";

const ProblemContext = createContext();

function rand(min, max, allowNeg) {
  let n = Math.floor(Math.random() * (max - min + 1)) + min;
  if (allowNeg && Math.random() > 0.5) n *= -1;
  return n;
}

function generate(cfg) {
  let a = rand(cfg.min, cfg.max, cfg.allowNegatives);
  let b = rand(cfg.min, cfg.max, cfg.allowNegatives);

if (cfg.operator === Operation.SUBTRACT) {
  if (a < b) {
    const temp = a;
    a = b;
    b = temp;
  }
}
  if (cfg.operator === Operation.DIVIDE) {
    b = Math.max(1, Math.abs(b));
    const result = rand(cfg.min, cfg.max, cfg.allowNegatives);
    a = b * result;
  }

  return { a, b, op: cfg.operator };
}

function solve({ a, b, op }) {
  switch (op) {
    case Operation.ADD: return a + b;
    case Operation.SUBTRACT: return a - b;
    case Operation.MULTIPLY: return a * b;
    case Operation.DIVIDE: return a / b;
    default: return 0;
  }
}

export const ProblemProvider = ({ children }) => {
  const { config } = useMenu();
  const [problem, setProblem] = useState(() => generate(config));

  const nextProblem = () => setProblem(generate(config));

  // ⭐ NEW — single source of truth
  const getCorrectAnswer = () => solve(problem);

  const checkAnswer = val =>
    Number(val) === getCorrectAnswer();

  useEffect(() => {
    nextProblem();
  }, [config]);

  return (
    <ProblemContext.Provider value={{
      problem,
      nextProblem,
      checkAnswer,
      getCorrectAnswer   // ← expose this
    }}>
      {children}
    </ProblemContext.Provider>
  );
};

export const useProblem = () => useContext(ProblemContext);
