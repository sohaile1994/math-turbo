import { createContext, useContext, useState, useRef } from "react";
import { useProblem }  from "./ProblemContext";
import { useScore }    from "./ScoreContext";
import { useGrade }    from "./GradeContext";
import { useLives }    from "./LivesContext";
import { checkAnswer, formatCorrectAnswer } from "../utils/answerChecker";
import { BoosterType } from "../enums";

const AnswerContext = createContext();

const STREAK_TARGET = 7;
const STREAK_BONUS  = 1500; // base bonus points for hitting 7 in a row

export const AnswerProvider = ({ children }) => {
  const { problem, nextProblem }                                    = useProblem();
  const { registerCorrect, registerWrong, registerBonus, activateScoreBoost } = useScore();
  const { multiplier, incrementCombo, resetGrade, activateGradeFreeze }       = useGrade();
  const { loseLife, gainLife }                                      = useLives();

  const [answer, setAnswer]             = useState("");
  const [feedback, setFeedback]         = useState(null); // null | "correct" | "wrong" | "streak7" | "retry"
  const [locked, setLocked]             = useState(false);
  const [attempts, setAttempts]         = useState(0);
  const [correctAnswerStr, setCorrectAnswerStr] = useState(null);
  const [pointsEarned, setPointsEarned]         = useState(null);
  const [boosterAwarded, setBoosterAwarded]     = useState(null);
  const [streak, setStreak]                     = useState(0);
  const [feedbackKey, setFeedbackKey]           = useState(0); // increments to re-trigger animation

  const feedbackTimerRef = useRef(null);

  const submit = () => {
    if (locked || !answer.trim()) return;

    const isCorrect = checkAnswer(problem, answer);

    if (isCorrect) {
      const isDoubleCombo = problem.booster === BoosterType.DOUBLE_COMBO;
      incrementCombo(isDoubleCombo);

      const pts = registerCorrect(multiplier);
      setPointsEarned(pts);
      setAnswer("");

      // ── Activate booster effects ──
      let awarded = null;
      if (problem.booster) {
        switch (problem.booster) {
          case BoosterType.GRADE_FREEZE: activateGradeFreeze(12); break;
          case BoosterType.EXTRA_LIFE:   gainLife();               break;
          case BoosterType.SCORE_BOOST:  activateScoreBoost(5);    break;
          case BoosterType.DOUBLE_COMBO: /* handled above */        break;
          default: break;
        }
        awarded = problem.booster;
      }
      setBoosterAwarded(awarded);
      setAttempts(0);

      // ── Streak logic ──
      const newStreak = streak + 1;

      if (newStreak >= STREAK_TARGET) {
        const bonus = Math.round(STREAK_BONUS * multiplier);
        registerBonus(bonus);
        setStreak(0);
        setFeedback("streak7");
        setFeedbackKey(k => k + 1);

        // Clear feedback after 3s for the big celebration
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = setTimeout(() => {
          setFeedback(null);
          setPointsEarned(null);
          setBoosterAwarded(null);
        }, 3000);
      } else {
        setStreak(newStreak);
        setFeedback("correct");
        setFeedbackKey(k => k + 1);

        // Reset 2s feedback timer — cancels any running timer from previous correct
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = setTimeout(() => {
          setFeedback(null);
          setPointsEarned(null);
          setBoosterAwarded(null);
        }, 2000);
      }

      // Advance to next problem immediately
      setTimeout(() => nextProblem(), 80);
      return;
    }

    // ── Wrong answer ──
    registerWrong();
    setStreak(0);
    setAnswer("");

    if (attempts === 0) {
      // First mistake: lose a heart, let them try again
      loseLife();
      resetGrade();
      setAttempts(1);
      setFeedback("retry");
      return;
    }

    // Second mistake: lose another heart, show answer, block inputs for 2s
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
