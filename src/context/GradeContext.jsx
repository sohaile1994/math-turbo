import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { GradeLevel, GameMode } from "../enums";

const GradeContext = createContext();

// How many consecutive correct answers are needed per grade tier
const GRADE_THRESHOLDS = [
  { grade: GradeLevel.D,   minCombo: 0  },
  { grade: GradeLevel.C,   minCombo: 3  },
  { grade: GradeLevel.B,   minCombo: 6  },
  { grade: GradeLevel.A,   minCombo: 10 },
  { grade: GradeLevel.S,   minCombo: 15 },
  { grade: GradeLevel.SS,  minCombo: 21 },
  { grade: GradeLevel.SSS, minCombo: 28 },
];

export const GRADE_MULTIPLIERS = {
  [GradeLevel.D]:   1,
  [GradeLevel.C]:   1.5,
  [GradeLevel.B]:   2,
  [GradeLevel.A]:   3,
  [GradeLevel.S]:   5,
  [GradeLevel.SS]:  7,
  [GradeLevel.SSS]: 10,
};

export const GRADE_COLORS = {
  [GradeLevel.D]:   "#999",
  [GradeLevel.C]:   "#00e5ff",
  [GradeLevel.B]:   "#00ff88",
  [GradeLevel.A]:   "#ffea00",
  [GradeLevel.S]:   "#ff6600",
  [GradeLevel.SS]:  "#ff00cc",
  [GradeLevel.SSS]: "#ff2222",
};

function gradeFromCombo(combo) {
  for (let i = GRADE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (combo >= GRADE_THRESHOLDS[i].minCombo) return GRADE_THRESHOLDS[i].grade;
  }
  return GradeLevel.D;
}

export const GradeProvider = ({ children, mode }) => {
  const [combo, setCombo]               = useState(0);
  const [grade, setGrade]               = useState(GradeLevel.D);
  const [frozen, setFrozen]             = useState(false);
  const [freezeSecsLeft, setFreezeSecsLeft] = useState(0);

  // Use refs so setInterval callbacks see the latest values without restarts
  const frozenRef           = useRef(false);
  const decayIntervalRef    = useRef(null);
  const freezeCountdownRef  = useRef(null);

  // Decay speed: 5 s per combo point in endless, 9 s in practice
  const decayMs = mode === GameMode.ENDLESS ? 5000 : 9000;

  // Sync grade whenever combo changes
  useEffect(() => {
    setGrade(gradeFromCombo(combo));
  }, [combo]);

  // Decay loop — restarts only when decayMs changes (i.e. never mid-game)
  useEffect(() => {
    decayIntervalRef.current = setInterval(() => {
      if (!frozenRef.current) {
        setCombo(c => Math.max(0, c - 1));
      }
    }, decayMs);
    return () => clearInterval(decayIntervalRef.current);
  }, [decayMs]);

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
      grade,
      frozen,
      freezeSecsLeft,
      multiplier: GRADE_MULTIPLIERS[grade] ?? 1,
      incrementCombo,
      resetGrade,
      activateGradeFreeze,
    }}>
      {children}
    </GradeContext.Provider>
  );
};

export const useGrade = () => useContext(GradeContext);
