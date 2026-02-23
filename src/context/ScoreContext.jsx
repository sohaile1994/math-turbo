import { createContext, useContext, useState } from "react";

const ScoreContext = createContext();

export const ScoreProvider = ({ children }) => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const registerCorrect = () => {
    setScore(s => s + 100);
    setStreak(s => s + 1);
  };

  const registerWrong = () => {
    setScore(s => s - 100);
    setStreak(0);
  };

  return (
    <ScoreContext.Provider value={{
      score,
      streak,
      registerCorrect,
      registerWrong
    }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => useContext(ScoreContext);
