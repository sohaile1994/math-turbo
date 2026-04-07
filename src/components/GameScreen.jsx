import { useEffect, useRef } from "react";
import { useGame }   from "../context/GameContext";
import { GameMode }  from "../enums";

import { GradeProvider }   from "../context/GradeContext";
import { ScoreProvider }   from "../context/ScoreContext";
import { LivesProvider }   from "../context/LivesContext";
import { ProblemProvider } from "../context/ProblemContext";
import { AnswerProvider }  from "../context/AnswerContext";
import { useScore }        from "../context/ScoreContext";
import { useLives }        from "../context/LivesContext";

import ProblemLayout        from "./ProblemLayout";
import AnswerFeedback       from "./AnswerFeedback";
import CalculatorInput      from "./CalculatorInput";
import ScoreDisplay         from "./ScoreDisplay";
import GradeDisplay         from "./game/GradeDisplay";
import LivesDisplay         from "./game/LivesDisplay";
import BoosterNotification  from "./game/BoosterNotification";

// ── Inner content — has access to all providers ──────────────────
function GameContent() {
  const { endGame, mode }  = useGame();
  const { score }          = useScore();
  const { isGameOver }     = useLives();
  const scoreRef           = useRef(score);

  // Keep scoreRef in sync so the game-over callback always has the latest value
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Detect game-over (endless mode, lives → 0)
  useEffect(() => {
    if (isGameOver) endGame(scoreRef.current);
  }, [isGameOver, endGame]);

  const quit = () => endGame(scoreRef.current);

  return (
    <div className="game-panel">
      {/* Header row */}
      <div className="game-header">
        <GradeDisplay />
        <div className="header-right">
          <LivesDisplay />
          <button className="quit-btn" onClick={quit} title="Quit">✕</button>
        </div>
      </div>

      <ScoreDisplay />
      <AnswerFeedback />
      <BoosterNotification />
      <ProblemLayout />
      <CalculatorInput />
    </div>
  );
}

// ── Outer shell — sets up all providers ────────────────────────
export default function GameScreen() {
  const { mode, category } = useGame();

  return (
    <GradeProvider mode={mode}>
      <ScoreProvider>
        <LivesProvider mode={mode}>
          <ProblemProvider category={category}>
            <AnswerProvider>
              <GameContent />
            </AnswerProvider>
          </ProblemProvider>
        </LivesProvider>
      </ScoreProvider>
    </GradeProvider>
  );
}
