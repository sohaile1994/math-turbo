import { createContext, useContext, useState } from "react";
import { Screen, Category, GameMode } from "../enums";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [screen,     setScreen]     = useState(Screen.MAIN_MENU);
  const [category,   setCategory]   = useState(Category.ARITHMETIC);
  const [op,         setOp]         = useState("+");   // arithmetic operation
  const [mode,       setMode]       = useState(GameMode.PRACTICE);
  const [finalScore, setFinalScore] = useState(0);
  const [startedAt,  setStartedAt]  = useState(null);

  const startGame = ({ category: cat, mode: m, op: o }) => {
    setCategory(cat);
    setOp(o ?? "+");
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
  const goToAdmin       = () => setScreen(Screen.ADMIN);
  const goToSuperAdmin  = () => setScreen(Screen.SUPER_ADMIN);

  return (
    <GameContext.Provider value={{
      screen,
      category,
      op,
      mode,
      finalScore,
      startedAt,
      startGame,
      endGame,
      goToMenu,
      goToLeaderboard,
      goToAdmin,
      goToSuperAdmin,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
