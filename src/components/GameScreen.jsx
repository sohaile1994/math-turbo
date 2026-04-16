import { useEffect, useRef, useState } from "react";
import { useGame }      from "../context/GameContext";
import { useScore }     from "../context/ScoreContext";
import { useLives }     from "../context/LivesContext";
import { useTimer }     from "../context/TimerContext";
import { useSettings }  from "../context/SettingsContext";
import { useProblem }   from "../context/ProblemContext";
import { useAuth }                    from "../context/AuthContext";
import { saveScore, getUserStats }    from "../lib/scores";
import { GameMode }                   from "../enums";

import { GradeProvider }    from "../context/GradeContext";
import { ScoreProvider }    from "../context/ScoreContext";
import { LivesProvider }    from "../context/LivesContext";
import { TimerProvider }    from "../context/TimerContext";
import { SettingsProvider } from "../context/SettingsContext";
import { ProblemProvider }  from "../context/ProblemContext";
import { AnswerProvider }   from "../context/AnswerContext";

import ProblemLayout       from "./ProblemLayout";
import AnswerFeedback      from "./AnswerFeedback";
import CalculatorInput     from "./CalculatorInput";
import ScoreDisplay        from "./ScoreDisplay";
import GradeDisplay        from "./game/GradeDisplay";
import LivesDisplay        from "./game/LivesDisplay";
import BoosterNotification from "./game/BoosterNotification";
import SettingsPanel       from "./game/SettingsPanel";

// ── Competitive difficulty tier ─────────────────────────────────────────────
// Score 0–4999 → tier 0 → range 1-9
// Score 5000–9999 → tier 1 → range 1-14   (+5 every 5000 pts)
function tierFromScore(score) { return Math.floor(score / 5000); }
function rangeMaxFromTier(tier) { return 9 + tier * 5; }
function difficultyFromTier(tier) {
  if (tier <= 1) return "easy";
  if (tier <= 3) return "medium";
  return "hard";
}
function negativesFromTier(tier) { return tier >= 4; }

// ── Timer display ────────────────────────────────────────────────────────────
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TimerDisplay() {
  const { timeLeft } = useTimer();
  const red    = timeLeft < 60;   // < 1 min
  const yellow = timeLeft < 180;  // < 3 min
  const color  = red ? "#EF4444" : yellow ? "#F59E0B" : "#6BCB77";
  return (
    <div className={`timer-display${red ? " timer-urgent" : ""}`} style={{ color }}>
      ⏱ {formatTime(timeLeft)}
    </div>
  );
}

// ── Tier upgrade banner ──────────────────────────────────────────────────────
function TierBanner({ tier }) {
  return (
    <div className="tier-banner">
      🔥 Level Up! Range: 1–{rangeMaxFromTier(tier)}
    </div>
  );
}

// ── Inner game content ───────────────────────────────────────────────────────
function GameContent() {
  const { endGame, mode, category, op, startedAt } = useGame();
  const { score }          = useScore();
  const { isGameOver }     = useLives();
  const { isExpired }      = useTimer();
  useSettings(); // keep provider in scope
  const { nextProblem } = useProblem();
  const { user }        = useAuth();

  const scoreRef       = useRef(score);
  const tierRef        = useRef(-1);  // -1 so tier 0 triggers init on mount
  const personalBest   = useRef(null); // null = not yet loaded from DB
  const [showSettings, setShowSettings] = useState(false);
  const [tierBanner, setTierBanner]     = useState(null);

  const isCompetitive = mode === GameMode.COMPETITIVE;

  useEffect(() => { scoreRef.current = score; }, [score]);

  // On game start: fetch the player's current personal best for this subject
  // so we know the exact threshold we need to beat before writing to DB.
  useEffect(() => {
    if (!isCompetitive || !user) return;
    getUserStats(user.id)
      .then((stats) => { personalBest.current = stats[category] ?? 0; })
      .catch(() => { personalBest.current = 0; });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // subject key: arithmetic splits by operation, others use category name
  const subject = category === "arithmetic" ? `arithmetic_${op}` : category;

  // Save to leaderboard only when the player beats their personal best.
  useEffect(() => {
    if (!isCompetitive || !user || score === 0) return;
    if (personalBest.current === null) return;
    if (score <= personalBest.current) return;

    personalBest.current = score;
    const durationSecs = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    saveScore(user.id, subject, score, durationSecs).catch(() => {});
  }, [score]); // eslint-disable-line react-hooks/exhaustive-deps

  // End game when lives or timer run out
  useEffect(() => {
    if (isGameOver || isExpired) endGame(scoreRef.current);
  }, [isGameOver, isExpired, endGame]);

  // Progressive difficulty (competitive only)
  // Score flows into generators via ProblemContext's scoreRef — no nextProblem call needed here.
  // Only show the tier-up banner when the tier actually changes.
  useEffect(() => {
    if (!isCompetitive) return;
    const tier = tierFromScore(score);
    if (tier === tierRef.current) return;
    const prev = tierRef.current;
    tierRef.current = tier;

    if (tier > 0 && prev >= 0) {
      setTierBanner(tier);
      setTimeout(() => setTierBanner(null), 2500);
    }
  }, [score, isCompetitive]); // eslint-disable-line react-hooks/exhaustive-deps

  const quit = () => endGame(scoreRef.current);

  return (
    <div className="game-panel">
      {/* Tier upgrade banner */}
      {tierBanner !== null && <TierBanner tier={tierBanner} />}

      {/* Header */}
      <div className="game-header">
        <GradeDisplay />
        <div className="header-center">
          {isCompetitive && <TimerDisplay />}
        </div>
        <div className="header-right">
          {!isCompetitive && (
            <button
              className="settings-btn"
              onClick={() => setShowSettings((s) => !s)}
              title="Settings"
            >⚙️</button>
          )}
          {isCompetitive && (
            <span className="competitive-badge">🏆 COMP</span>
          )}
          <LivesDisplay />
        </div>
      </div>

      {/* Settings panel — practice only */}
      {showSettings && !isCompetitive && (
        <SettingsPanel onClose={() => setShowSettings(false)} onQuit={quit} />
      )}

      <ScoreDisplay />
      <AnswerFeedback />
      <BoosterNotification />
      <ProblemLayout />
      <CalculatorInput />

      {/* Quit always visible */}
      <button className="quit-game-btn-inline" onClick={quit}>
        ✕ {isCompetitive ? "End Session" : "Quit Game"}
      </button>
    </div>
  );
}

// ── Outer shell — providers ───────────────────────────────────────────────────
export default function GameScreen() {
  const { mode, category } = useGame();
  const isCompetitive      = mode === GameMode.COMPETITIVE;

  return (
    <GradeProvider>
      <ScoreProvider>
        <LivesProvider>
          <TimerProvider isCompetitive={isCompetitive}>
            <SettingsProvider>
              <ProblemProvider category={category}>
                <AnswerProvider>
                  <GameContent />
                </AnswerProvider>
              </ProblemProvider>
            </SettingsProvider>
          </TimerProvider>
        </LivesProvider>
      </ScoreProvider>
    </GradeProvider>
  );
}
