import { createContext, useContext, useState } from "react";
import { useProblem } from "./ProblemContext";
import { useScore } from "./ScoreContext";
import { Operation } from "../enums";

const AnswerContext = createContext();

export const AnswerProvider = ({ children }) => {
  const { problem, nextProblem } = useProblem();
  const {  registerCorrect, registerWrong } = useScore();

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [lastProblem, setLastProblem] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);

  // Calculate correct answer based on current problem
  const calculateCorrectAnswer = () => {
    switch (problem.op) {
      case Operation.ADD:
        return problem.a + problem.b;
      case Operation.SUBTRACT:
        return problem.a - problem.b;
      case Operation.MULTIPLY:
        return problem.a * problem.b;
      case Operation.DIVIDE:
        return problem.a / problem.b;
      default:
        return 0;
    }
  };

  const submit = () => {
    if (!answer || answer.trim() === "") return; // block empty answer

    const correct = calculateCorrectAnswer();
    const numericAnswer = Number(answer);
    setCorrectAnswer(correct);

    if (numericAnswer === correct) {
      // Correct answer
      setFeedback("correct");
      registerCorrect(); // update score & streak
      setAttempts(0);
      setAnswer("");
      nextProblem();
      return;
    }

    if (attempts === 0) {
      // First wrong attempt
      setAttempts(1);
      setFeedback("retry");
      // Deduct points for retry
      registerWrong();
      setAnswer("");
      return;
    }

    // Wrong answer on second attempt
    setLastProblem(problem);
    setFeedback("wrong");
    registerWrong(); // deduct points
    setAttempts(0);
    setAnswer("");

    // Reset feedback after delay and move to next problem
    setTimeout(() => {
      setFeedback(null);
      nextProblem();
    }, 3000);
  };

  return (
    <AnswerContext.Provider
      value={{
        answer,
        setAnswer,
        submit,
        feedback,
        correctAnswer,
        lastProblem,
      }}
    >
      {children}
    </AnswerContext.Provider>
  );
};

export const useAnswer = () => useContext(AnswerContext);