import { useEffect, useRef, useState } from "react";
import { useGame }   from "../context/GameContext";
import { GameMode }  from "../enums";

import { GradeProvider }    from "../context/GradeContext";
import { ScoreProvider }    from "../context/ScoreContext";
import { LivesProvider }    from "../context/LivesContext";
import { SettingsProvider } from "../context/SettingsContext";
import { ProblemProvider }  from "../context/ProblemContext";
import { AnswerProvider }   from "../context/AnswerContext";
import { useScore }         from "../context/ScoreContext";
import { useLives }         from "../context/LivesContext";

import ProblemLayout       from "./ProblemLayout";
import AnswerFeedback      from "./AnswerFeedback";
import CalculatorInput     from "./CalculatorInput";
import ScoreDisplay        from "./ScoreDisplay";
import GradeDisplay        from "./game/GradeDisplay";
import LivesDisplay        from "./game/LivesDisplay";
import BoosterNotification from "./game/BoosterNotification";
import SettingsPanel       from "./game/SettingsPanel";

// ── Inner content — has access to all providers ──────────────────
function GameContent() {
  const { endGame, mode } = useGame();
  const { score }         = useScore();
  const { isGameOver }    = useLives();
  const scoreRef          = useRef(score);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    if (isGameOver) endGame(scoreRef.current);
  }, [isGameOver, endGame]);

  const quit = () => endGame(scoreRef.current);

  return (
    <div className="game-panel">
      {/* Header */}
      <div className="game-header">
        <GradeDisplay />
        <div className="header-right">
          <button
            className="settings-btn"
            onClick={() => setShowSettings(s => !s)}
            title="Settings"
          >
            ⚙️
          </button>
          {mode !== GameMode.PRACTICE && <LivesDisplay />}
          <button className="quit-btn" onClick={quit} title="Quit">✕</button>
        </div>
      </div>

      {/* Settings panel (overlay inside card) */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

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
          <SettingsProvider>
            <ProblemProvider category={category}>
              <AnswerProvider>
                <GameContent />
              </AnswerProvider>
            </ProblemProvider>
          </SettingsProvider>
        </LivesProvider>
      </ScoreProvider>
    </GradeProvider>
  );
}
