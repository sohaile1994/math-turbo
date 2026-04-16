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

export const ProblemProvider = ({ children, category }) => {
  const settings    = useSettings();
  const { op }      = useGame();
  const { score }   = useScore();

  const settingsRef = useRef(settings);
  const opRef       = useRef(op);
  const scoreRef    = useRef(score);

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

  const [problem, setProblem] = useState(() => generateProblem(category, buildSettings()));

  const nextProblem = useCallback((settingsOverride) => {
    setProblem(generateProblem(category, buildSettings(settingsOverride)));
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ProblemContext.Provider value={{ problem, nextProblem }}>
      {children}
    </ProblemContext.Provider>
  );
};

export const useProblem = () => useContext(ProblemContext);
