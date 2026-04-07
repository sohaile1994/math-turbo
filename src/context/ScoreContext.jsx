import { createContext, useContext, useState } from "react";

const ScoreContext = createContext();

export const ScoreProvider = ({ children }) => {
  const [score, setScore]               = useState(0);
  const [scoreBoostLeft, setScoreBoostLeft] = useState(0); // problems left with 2× boost

  /**
   * Call on correct answer.
   * @param {number} multiplier  - Grade multiplier (1 – 10)
   * @param {boolean} doubleCombo - DOUBLE_COMBO booster active (not score related, but passed for context)
   * @returns {number} points earned this round
   */
  const registerCorrect = (multiplier = 1) => {
    const boostFactor = scoreBoostLeft > 0 ? 2 : 1;
    const points = Math.round(100 * multiplier * boostFactor);
    setScore(s => s + points);
    if (scoreBoostLeft > 0) setScoreBoostLeft(b => b - 1);
    return points;
  };

  /** Call on wrong answer (either attempt). */
  const registerWrong = () => {
    setScore(s => Math.max(0, s - 50));
  };

  const activateScoreBoost = (problems = 5) => {
    setScoreBoostLeft(b => b + problems);
  };

  const resetScore = () => {
    setScore(0);
    setScoreBoostLeft(0);
  };

  return (
    <ScoreContext.Provider value={{
      score,
      scoreBoostLeft,
      registerCorrect,
      registerWrong,
      activateScoreBoost,
      resetScore,
    }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => useContext(ScoreContext);
