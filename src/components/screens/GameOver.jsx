import { useEffect, useState } from "react";
import { useGame }  from "../../context/GameContext";
import { useAuth }  from "../../context/AuthContext";
import { saveScore } from "../../lib/scores";
import { GameMode } from "../../enums";

function getLetterGrade(score) {
  if (score >= 10000) return { letter: "SSS", color: "#ff2222" };
  if (score >= 5000)  return { letter: "SS",  color: "#ff00cc" };
  if (score >= 2500)  return { letter: "S",   color: "#ff6600" };
  if (score >= 1000)  return { letter: "A",   color: "#ffea00" };
  if (score >= 500)   return { letter: "B",   color: "#00ff88" };
  if (score >= 200)   return { letter: "C",   color: "#00e5ff" };
  return               { letter: "D",   color: "#999" };
}

export default function GameOver() {
  const { finalScore, goToMenu, category, mode, startedAt } = useGame();
  const { user }  = useAuth();
  const { letter, color } = getLetterGrade(finalScore);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (mode !== GameMode.COMPETITIVE || !user) return;
    const durationSecs = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    saveScore(user.id, category, finalScore, durationSecs)
      .then(() => setSaved(true))
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="game-over-screen">
      <div className="go-title">GAME OVER</div>

      {mode === GameMode.COMPETITIVE && (
        <div className="go-mode-badge">🏆 Competitive</div>
      )}

      <div className="go-grade" style={{ color, textShadow: `0 0 30px ${color}` }}>
        {letter}
      </div>

      <div className="go-score">
        {finalScore.toLocaleString()} pts
      </div>

      <div className="go-message">
        {finalScore === 0 && "Keep practising — you've got this!"}
        {finalScore > 0 && finalScore < 500 && "Nice start! Keep going!"}
        {finalScore >= 500 && finalScore < 2500 && "Great work! Push for S rank!"}
        {finalScore >= 2500 && "Incredible! You're a math machine!"}
      </div>

      {mode === GameMode.COMPETITIVE && (
        <div className={`go-save-status ${saved ? "saved" : "saving"}`}>
          {saved ? "✓ Score saved to leaderboard!" : "Saving score…"}
        </div>
      )}

      <button className="menu-btn" onClick={goToMenu}>
        ↩ Main Menu
      </button>
    </div>
  );
}
