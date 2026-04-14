import { createContext, useContext, useState } from "react";

const LivesContext = createContext();

const MAX_LIVES = 3;

export const LivesProvider = ({ children }) => {
  const [lives, setLives] = useState(MAX_LIVES);

  const isGameOver = lives <= 0;

  const loseLife = () => setLives((l) => Math.max(0, l - 1));
  const gainLife = () => setLives((l) => Math.min(l + 1, 5));
  const resetLives = () => setLives(MAX_LIVES);

  return (
    <LivesContext.Provider value={{ lives, isGameOver, loseLife, gainLife, resetLives }}>
      {children}
    </LivesContext.Provider>
  );
};

export const useLives = () => useContext(LivesContext);
