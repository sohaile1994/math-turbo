import { createContext, useContext, useState } from "react";
import { useProblem }  from "./ProblemContext";
import { useScore }    from "./ScoreContext";
import { useGrade }    from "./GradeContext";
import { useLives }    from "./LivesContext";
import { checkAnswer, formatCorrectAnswer } from "../utils/answerChecker";
import { BoosterType } from "../enums";

const AnswerContext = createContext();

export const AnswerProvider = ({ children }) => {
  const { problem, nextProblem }                        = useProblem();
  const { registerCorrect, registerWrong, activateScoreBoost } = useScore();
  const { multiplier, incrementCombo, resetGrade, activateGradeFreeze } = useGrade();
  const { loseLife, gainLife }                          = useLives();

  const [answer, setAnswer]             = useState("");
  const [feedback, setFeedback]         = useState(null); // null | "correct" | "retry" | "wrong"
  const [attempts, setAttempts]         = useState(0);
  const [locked, setLocked]             = useState(false);
  const [correctAnswerStr, setCorrectAnswerStr] = useState(null);
  const [pointsEarned, setPointsEarned]         = useState(null);
  const [boosterAwarded, setBoosterAwarded]     = useState(null);

  const submit = () => {
    if (locked || !answer.trim()) return;

    const isCorrect = checkAnswer(problem, answer);

    if (isCorrect) {
      // ── Double combo booster: increment twice ──
      const isDoubleCombo = problem.booster === BoosterType.DOUBLE_COMBO;
      incrementCombo(isDoubleCombo);

      const pts = registerCorrect(multiplier);
      setPointsEarned(pts);
      setFeedback("correct");

      // ── Activate booster effects ──
      if (problem.booster) {
        switch (problem.booster) {
          case BoosterType.GRADE_FREEZE: activateGradeFreeze(12); break;
          case BoosterType.EXTRA_LIFE:   gainLife();               break;
          case BoosterType.SCORE_BOOST:  activateScoreBoost(5);    break;
          case BoosterType.DOUBLE_COMBO: /* handled above */        break;
          default: break;
        }
        setBoosterAwarded(problem.booster);
      } else {
        setBoosterAwarded(null);
      }

      setAttempts(0);
      setAnswer("");

      setTimeout(() => {
        setFeedback(null);
        setPointsEarned(null);
        setBoosterAwarded(null);
        nextProblem();
      }, 1200);

      return;
    }

    // ── Wrong answer ──
    registerWrong();

    if (attempts === 0) {
      // First mistake: warn and let them retry
      setAttempts(1);
      setFeedback("retry");
      setAnswer("");
      return;
    }

    // Second mistake: show answer, lose a life, reset grade
    setCorrectAnswerStr(formatCorrectAnswer(problem));
    setFeedback("wrong");
    setAttempts(0);
    setAnswer("");
    resetGrade();
    loseLife();
    setLocked(true);

    setTimeout(() => {
      setFeedback(null);
      setCorrectAnswerStr(null);
      setLocked(false);
      nextProblem();
    }, 3000);
  };

  return (
    <AnswerContext.Provider value={{
      answer,
      setAnswer,
      submit,
      feedback,
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
