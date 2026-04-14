import { createContext, useContext, useState, useEffect, useRef } from "react";

const TimerContext = createContext();

const INITIAL_SECONDS = 600; // 10 minutes

export const TimerProvider = ({ children, isCompetitive }) => {
  const [timeLeft, setTimeLeft] = useState(INITIAL_SECONDS);
  const runningRef = useRef(isCompetitive);

  // Stop timer if game ends (parent unmounts), reset on remount
  useEffect(() => {
    if (!isCompetitive) return;
    runningRef.current = true;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          runningRef.current = false;
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isCompetitive]);

  const addTime = (seconds) => {
    if (!isCompetitive) return;
    setTimeLeft((t) => t + seconds);
  };

  const isExpired = isCompetitive && timeLeft <= 0;

  return (
    <TimerContext.Provider value={{ timeLeft, isExpired, addTime }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
