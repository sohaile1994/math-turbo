import { createContext, useContext, useState } from "react";
import { Screen, Category, GameMode } from "../enums";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [screen,     setScreen]     = useState(Screen.MAIN_MENU);
  const [category,   setCategory]   = useState(Category.ARITHMETIC);
  const [mode,       setMode]       = useState(GameMode.PRACTICE);
  const [finalScore, setFinalScore] = useState(0);
  const [startedAt,  setStartedAt]  = useState(null);

  const startGame = ({ category: cat, mode: m }) => {
    setCategory(cat);
    setMode(m ?? GameMode.PRACTICE);
    setStartedAt(Date.now());
    setScreen(Screen.GAME);
  };

  const endGame = (score) => {
    setFinalScore(score);
    setScreen(Screen.GAME_OVER);
  };

  const goToMenu        = () => setScreen(Screen.MAIN_MENU);
  const goToLeaderboard = () => setScreen(Screen.LEADERBOARD);

  return (
    <GameContext.Provider value={{
      screen,
      category,
      mode,
      finalScore,
      startedAt,
      startGame,
      endGame,
      goToMenu,
      goToLeaderboard,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
