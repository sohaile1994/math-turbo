import { createContext, useContext, useState, useRef } from "react";
import { useProblem }  from "./ProblemContext";
import { useScore }    from "./ScoreContext";
import { useGrade }    from "./GradeContext";
import { useLives }    from "./LivesContext";
import { checkAnswer, formatCorrectAnswer } from "../utils/answerChecker";
import { BoosterType } from "../enums";

const AnswerContext = createContext();

export const AnswerProvider = ({ children }) => {
  const { problem, nextProblem }                                         = useProblem();
  const { registerCorrect, registerWrong, activateScoreBoost }          = useScore();
  const { incrementCombo, resetGrade, activateGradeFreeze }             = useGrade();
  const { loseLife, gainLife }                                           = useLives();

  const [answer,           setAnswer]           = useState("");
  const [feedback,         setFeedback]         = useState(null);
  const [locked,           setLocked]           = useState(false);
  const [attempts,         setAttempts]         = useState(0);
  const [correctAnswerStr, setCorrectAnswerStr] = useState(null);
  const [pointsEarned,     setPointsEarned]     = useState(null);
  const [boosterAwarded,   setBoosterAwarded]   = useState(null);
  const [streak,           setStreak]           = useState(0);
  const [feedbackKey,      setFeedbackKey]      = useState(0);

  const feedbackTimerRef = useRef(null);

  const submit = () => {
    if (locked || !answer.trim()) return;

    const isCorrect = checkAnswer(problem, answer);

    if (isCorrect) {
      const isDoubleCombo = problem.booster === BoosterType.DOUBLE_COMBO;
      incrementCombo(isDoubleCombo);

      // streak is the number of consecutive correct answers BEFORE this one (0-based index)
      const pts = registerCorrect(streak);
      setPointsEarned(pts);
      setAnswer("");

      // ── Booster effects ──
      let awarded = null;
      if (problem.booster) {
        switch (problem.booster) {
          case BoosterType.GRADE_FREEZE:
            activateGradeFreeze(12);
            break;
          case BoosterType.EXTRA_LIFE:
            gainLife();
            break;
          case BoosterType.SCORE_BOOST:
            activateScoreBoost(5);
            break;
          case BoosterType.DOUBLE_COMBO:
            /* handled above via incrementCombo(true) */
            break;
          default:
            break;
        }
        awarded = problem.booster;
      }
      setBoosterAwarded(awarded);
      setAttempts(0);
      setStreak(s => s + 1);

      setFeedback("correct");
      setFeedbackKey((k) => k + 1);

      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback(null);
        setPointsEarned(null);
        setBoosterAwarded(null);
      }, 2000);

      setTimeout(() => nextProblem(), 80);
      return;
    }

    // ── Wrong answer ──
    registerWrong();
    setStreak(0);
    setAnswer("");

    // First wrong attempt — warn but no life lost
    if (attempts === 0) {
      resetGrade();
      setAttempts(1);
      setFeedback("retry");
      return;
    }

    // Second wrong attempt — lose a life and show the answer
    loseLife();
    resetGrade();
    setAttempts(0);
    setCorrectAnswerStr(formatCorrectAnswer(problem));
    setFeedback("wrong");
    clearTimeout(feedbackTimerRef.current);
    setLocked(true);

    setTimeout(() => {
      setFeedback(null);
      setCorrectAnswerStr(null);
      setLocked(false);
      nextProblem();
    }, 2000);
  };

  return (
    <AnswerContext.Provider value={{
      answer,
      setAnswer,
      submit,
      feedback,
      feedbackKey,
      streak,
      correctAnswerStr,
      pointsEarned,
      boosterAwarded,
      locked,
    }}>
      {children}
    </AnswerContext.Provider>
  );
};

export const useAnswer = () => useContext(AnswerContext);
