import { useEffect, useState } from "react";
import { useGame, gradeBonusPct } from "../../context/GameContext";
import { useAuth }   from "../../context/AuthContext";
import { saveScore, saveGuestScore, containsProfanity } from "../../lib/scores";
import { GameMode }  from "../../enums";

// SSS thresholds: algebra = 35,000 | everything else = 100,000
// 7 tiers (D→SSS), equally spaced in 6 steps from 0 to SSS.
function getLetterGrade(score, category) {
  const sss  = category === "algebra" ? 35000 : 100000;
  const step = sss / 6;
  if (score >= Math.round(step * 6)) return { letter: "SSS", color: "#ff2222" };
  if (score >= Math.round(step * 5)) return { letter: "SS",  color: "#ff00cc" };
  if (score >= Math.round(step * 4)) return { letter: "S",   color: "#ff6600" };
  if (score >= Math.round(step * 3)) return { letter: "A",   color: "#ffea00" };
  if (score >= Math.round(step * 2)) return { letter: "B",   color: "#00ff88" };
  if (score >= Math.round(step * 1)) return { letter: "C",   color: "#00e5ff" };
  return                              { letter: "D",   color: "#999" };
}

const GRADE_MESSAGES = {
  D:   "Keep practising — every attempt makes you stronger!",
  C:   "Good effort! Push a little harder for a B!",
  B:   "Solid work! You're close — can you reach A rank?",
  A:   "Excellent! One more level to S — you've got this!",
  S:   "Amazing performance! SS rank is within reach!",
  SS:  "Outstanding! One final push and you hit SSS!",
  SSS: "LEGENDARY! You're an absolute math machine!",
};

function gradeLabel(gradeLevel) {
  if (gradeLevel === 0) return "Grade K";
  return `Grade ${gradeLevel}`;
}

// subject key used for guest score saving (matches scores.js SUBJECT_TABLE keys)
function subjectKey(category, op) {
  return category === "arithmetic" ? `arithmetic_${op}` : category;
}

export default function GameOver() {
  const { finalScore, rawScore, livesAtEnd, gradeLevel, goToMenu, category, op, mode, startedAt } = useGame();
  const { user }  = useAuth();
  const isGuest   = user?.role === "guest";

  const { letter, color } = getLetterGrade(finalScore, category);

  const gradePct   = gradeBonusPct(gradeLevel);
  const livesPct   = Math.round(30 * livesAtEnd);
  const gradeBonus = Math.round(rawScore * gradePct / 100);
  const livesBonus = Math.round(rawScore * 0.3 * livesAtEnd);

  // Student competitive save
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (isGuest || mode !== GameMode.COMPETITIVE || !user) return;
    const durationSecs = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    saveScore(user.id, category, finalScore, durationSecs)
      .then(() => setSaved(true))
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Guest score save
  const [guestName,  setGuestName]  = useState("");
  const [nameError,  setNameError]  = useState("");
  const [guestSaved, setGuestSaved] = useState(false);
  const [saving,     setSaving]     = useState(false);

  async function handleGuestSave() {
    const name = guestName.trim();
    if (!name) { setNameError("Please enter a name."); return; }
    if (name.length > 24) { setNameError("Name must be 24 characters or fewer."); return; }
    if (containsProfanity(name)) { setNameError("Please choose an appropriate name."); return; }
    setSaving(true);
    setNameError("");
    try {
      await saveGuestScore(name, subjectKey(category, op), finalScore);
      setGuestSaved(true);
    } catch {
      setNameError("Could not save score. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="game-over-screen">
      <div className="go-title">GAME OVER</div>

      {mode === GameMode.COMPETITIVE && !isGuest && (
        <div className="go-mode-badge">🏆 Competitive</div>
      )}

      <div className="go-grade" style={{ color, textShadow: `0 0 30px ${color}` }}>
        {letter}
      </div>

      <div className="go-score">
        {finalScore.toLocaleString()} pts
      </div>

      <div className="go-bonus-breakdown">
        <div className="go-breakdown-row base">
          <span className="go-bd-label">Base score</span>
          <span className="go-bd-value">{rawScore.toLocaleString()} pts</span>
        </div>

        {gradeBonus > 0 && (
          <div className="go-breakdown-row grade-row">
            <span className="go-bd-label">
              {gradeLabel(gradeLevel)} bonus
              <span className="go-bd-pct">(+{gradePct}%)</span>
            </span>
            <span className="go-bd-value positive">+{gradeBonus.toLocaleString()}</span>
          </div>
        )}

        {livesBonus > 0 && (
          <div className="go-breakdown-row lives-row">
            <span className="go-bd-label">
              <span className="go-bd-xs">
                {Array.from({ length: livesAtEnd }, (_, i) => <span key={i}>✕</span>)}
              </span>
              Lives bonus
              <span className="go-bd-pct">(+{livesPct}%)</span>
            </span>
            <span className="go-bd-value positive">+{livesBonus.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="go-message">
        {GRADE_MESSAGES[letter]}
      </div>

      {/* Student competitive save status */}
      {!isGuest && mode === GameMode.COMPETITIVE && (
        <div className={`go-save-status ${saved ? "saved" : "saving"}`}>
          {saved ? "✓ Score saved to leaderboard!" : "Saving score…"}
        </div>
      )}

      {/* Guest score save */}
      {isGuest && !guestSaved && (
        <div className="go-guest-save">
          <p className="go-guest-save-label">Want to save your score to the leaderboard?</p>
          <div className="go-guest-input-row">
            <input
              className="go-guest-input"
              type="text"
              placeholder="Enter a name…"
              maxLength={24}
              value={guestName}
              onChange={(e) => { setGuestName(e.target.value); setNameError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleGuestSave()}
              disabled={saving}
            />
            <button
              className="go-guest-submit-btn"
              onClick={handleGuestSave}
              disabled={saving || !guestName.trim()}
            >
              {saving ? "…" : "Save"}
            </button>
          </div>
          {nameError && <p className="go-guest-error">{nameError}</p>}
        </div>
      )}

      {isGuest && guestSaved && (
        <div className="go-save-status saved">✓ Score saved!</div>
      )}

      <button className="menu-btn" onClick={goToMenu}>
        ↩ Main Menu
      </button>
    </div>
  );
}
