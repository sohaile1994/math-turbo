import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { Category } from "../enums";
import { useSettings } from "./SettingsContext";
import { useGame } from "./GameContext";
import { useScore } from "./ScoreContext";
import {
  generateCounting,
  generateArithmetic,
  generatePEMDAS,
  generateAlgebra,
} from "../generators";

const ProblemContext = createContext();

function generateProblem(category, settings) {
  switch (category) {
    case Category.COUNTING:   return generateCounting(settings);
    case Category.ARITHMETIC: return generateArithmetic(settings);
    case Category.PEMDAS:     return generatePEMDAS(settings);
    case Category.ALGEBRA:    return generateAlgebra(settings);
    default:                  return generateArithmetic(settings);
  }
}

// Returns the leading operand used to detect repeated problems.
// Returns null for problem types where no clear first number exists.
function firstNumber(problem) {
  if (!problem) return null;
  if (problem.type === "counting")   return problem.count;
  if (problem.type === "arithmetic") return problem.a;
  // PEMDAS / algebra: parse the leading digit(s) from the display string
  const match = problem.displayQuestion?.match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

export const ProblemProvider = ({ children, category }) => {
  const settings    = useSettings();
  const { op }      = useGame();
  const { score }   = useScore();

  const settingsRef  = useRef(settings);
  const opRef        = useRef(op);
  const scoreRef     = useRef(score);
  const lastFirstRef = useRef(null);

  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { opRef.current = op; }, [op]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Always reads the latest score/op from refs — no override needed for normal flow
  const buildSettings = (override) => ({
    ...settingsRef.current,
    op:    opRef.current,
    score: scoreRef.current,
    ...(override ?? {}),
  });

  const [problem, setProblem] = useState(() => {
    const p = generateProblem(category, buildSettings());
    lastFirstRef.current = firstNumber(p);
    return p;
  });

  const nextProblem = useCallback((settingsOverride) => {
    const prev = lastFirstRef.current;
    let candidate;
    let tries = 0;
    do {
      candidate = generateProblem(category, buildSettings(settingsOverride));
      tries++;
    } while (firstNumber(candidate) === prev && tries < 10);
    lastFirstRef.current = firstNumber(candidate);
    setProblem(candidate);
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ProblemContext.Provider value={{ problem, nextProblem }}>
      {children}
    </ProblemContext.Provider>
  );
};

export const useProblem = () => useContext(ProblemContext);
