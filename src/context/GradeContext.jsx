import { createContext, useContext, useState, useRef, useCallback } from "react";
import { GradeLevel } from "../enums";

const GradeContext = createContext();

// SSS thresholds mirror GameOver: algebra = 35,000, everything else = 100,000.
// 7 equally-spaced tiers from 0 → SSS.
export function gradeFromScore(score, category) {
  const sss  = category === "algebra" ? 35000 : 100000;
  const step = sss / 6;
  if (score >= Math.round(step * 6)) return GradeLevel.SSS;
  if (score >= Math.round(step * 5)) return GradeLevel.SS;
  if (score >= Math.round(step * 4)) return GradeLevel.S;
  if (score >= Math.round(step * 3)) return GradeLevel.A;
  if (score >= Math.round(step * 2)) return GradeLevel.B;
  if (score >= Math.round(step * 1)) return GradeLevel.C;
  return GradeLevel.D;
}

export const GRADE_COLORS = {
  [GradeLevel.D]:   "#9CA3AF",
  [GradeLevel.C]:   "#4ECDC4",
  [GradeLevel.B]:   "#6BCB77",
  [GradeLevel.A]:   "#F59E0B",
  [GradeLevel.S]:   "#FF8E53",
  [GradeLevel.SS]:  "#A78BFA",
  [GradeLevel.SSS]: "#FF6B9D",
};


export const GradeProvider = ({ children }) => {
  const [combo, setCombo]               = useState(0);
  const [frozen, setFrozen]             = useState(false);
  const [freezeSecsLeft, setFreezeSecsLeft] = useState(0);

  const frozenRef          = useRef(false);
  const freezeCountdownRef = useRef(null);

  const incrementCombo = useCallback((double = false) => {
    setCombo(c => c + (double ? 2 : 1));
  }, []);

  const resetGrade = useCallback(() => {
    setCombo(0);
  }, []);

  const activateGradeFreeze = useCallback((durationSecs = 10) => {
    frozenRef.current = true;
    setFrozen(true);
    setFreezeSecsLeft(durationSecs);

    clearInterval(freezeCountdownRef.current);
    let remaining = durationSecs;

    freezeCountdownRef.current = setInterval(() => {
      remaining -= 1;
      setFreezeSecsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(freezeCountdownRef.current);
        frozenRef.current = false;
        setFrozen(false);
      }
    }, 1000);
  }, []);

  return (
    <GradeContext.Provider value={{
      combo,
      frozen,
      freezeSecsLeft,
      incrementCombo,
      resetGrade,
      activateGradeFreeze,
    }}>
      {children}
    </GradeContext.Provider>
  );
};

export const useGrade = () => useContext(GradeContext);
