import { createContext, useContext, useState } from "react";
import { Screen, Category, GameMode } from "../enums";

// Grade bonus rates (%) keyed by grade level. 0 = Kindergarten.
// Grades 1–6 are interpolated between K (700%) and 7th (20%).
export const GRADE_BONUS_PCT = {
  0: 1000, // K
  1:  800,
  2:  600,
  3:  400,
  4:  300,
  5:  200,
  6:  100,
  7:   50,
  8:   25,
  9:    0,
};

export function gradeBonusPct(gradeLevel) {
  return GRADE_BONUS_PCT[gradeLevel] ?? 0;
}

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [screen,     setScreen]     = useState(Screen.MAIN_MENU);
  const [category,   setCategory]   = useState(Category.ARITHMETIC);
  const [op,         setOp]         = useState("+");   // arithmetic operation
  const [mode,       setMode]       = useState(GameMode.PRACTICE);
  const [finalScore,      setFinalScore]      = useState(0);
  const [rawScore,        setRawScore]        = useState(0);
  const [livesAtEnd,      setLivesAtEnd]      = useState(0);
  const [gradeLevel,      setGradeLevel]      = useState(9);
  const [startedAt,       setStartedAt]       = useState(null);

  const startGame = ({ category: cat, mode: m, op: o }) => {
    setCategory(cat);
    setOp(o ?? "+");
    setMode(m ?? GameMode.PRACTICE);
    setStartedAt(Date.now());
    setScreen(Screen.GAME);
  };

  // Each bonus is computed independently from raw score, then summed.
  // lives bonus rate: 0.3 × livesLeft
  const endGame = (raw, livesLeft, studentGrade = 9) => {
    const gradeBonus = Math.round(raw * gradeBonusPct(studentGrade) / 100);
    const livesBonus = Math.round(raw * 0.3 * livesLeft);
    setRawScore(raw);
    setLivesAtEnd(livesLeft);
    setGradeLevel(studentGrade);
    setFinalScore(raw + gradeBonus + livesBonus);
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
      rawScore,
      livesAtEnd,
      gradeLevel,
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
