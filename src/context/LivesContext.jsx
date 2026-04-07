import { createContext, useContext, useState } from "react";
import { GameMode } from "../enums";

const LivesContext = createContext();

export const LivesProvider = ({ children, mode }) => {
  const isEndless = mode === GameMode.ENDLESS;
  const [lives, setLives] = useState(isEndless ? 3 : Infinity);

  // Only endless mode can reach game-over
  const isGameOver = isEndless && lives <= 0;

  const loseLife = () => {
    if (isEndless) setLives(l => Math.max(0, l - 1));
  };

  const gainLife = () => {
    if (isEndless) setLives(l => Math.min(l + 1, 5));
  };

  const resetLives = () => setLives(isEndless ? 3 : Infinity);

  return (
    <LivesContext.Provider value={{ lives, isGameOver, isEndless, loseLife, gainLife, resetLives }}>
      {children}
    </LivesContext.Provider>
  );
};

export const useLives = () => useContext(LivesContext);
