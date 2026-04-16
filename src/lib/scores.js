import { tursoQuery, arg } from "./turso";
import { ALL_USERS_SQL } from "./auth";

const SCORES_INIT_KEY = "math_scores_init_v3";

export async function initScoresDB() {
  if (localStorage.getItem(SCORES_INIT_KEY)) return;
  await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: `CREATE TABLE IF NOT EXISTS best_scores (
          user_id       INTEGER NOT NULL,
          subject       TEXT    NOT NULL,
          score         INTEGER NOT NULL DEFAULT 0,
          duration_secs INTEGER NOT NULL DEFAULT 0,
          played_at     INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (user_id, subject)
        )`,
      },
    },
  ]);
  localStorage.setItem(SCORES_INIT_KEY, "1");
}

/**
 * Upsert a competitive score — only keeps the best.
 * If the new score is higher, overwrites score + duration + played_at.
 */
export async function saveScore(userId, subject, score, durationSecs = 0) {
  const now = Math.floor(Date.now() / 1000);
  await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: `INSERT INTO best_scores (user_id, subject, score, duration_secs, played_at)
              VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(user_id, subject) DO UPDATE SET
                score         = CASE WHEN excluded.score > best_scores.score THEN excluded.score         ELSE best_scores.score         END,
                duration_secs = CASE WHEN excluded.score > best_scores.score THEN excluded.duration_secs ELSE best_scores.duration_secs END,
                played_at     = CASE WHEN excluded.score > best_scores.score THEN excluded.played_at     ELSE best_scores.played_at     END`,
        args: [
          arg("integer", userId),
          arg("text",    subject),
          arg("integer", score),
          arg("integer", durationSecs),
          arg("integer", now),
        ],
      },
    },
  ]);
}

/**
 * Returns top competitive scores for a subject.
 * Each entry: { displayName, grade, score, durationSecs }
 */
export async function getLeaderboard(subject) {
  const data = await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: `SELECT u.display_name, u.grade, b.score, b.duration_secs, b.played_at
              FROM best_scores b
              JOIN (${ALL_USERS_SQL}) u ON u.id = b.user_id
              WHERE b.subject = ?
              ORDER BY b.score DESC
              LIMIT 50`,
        args: [arg("text", subject)],
      },
    },
  ]);
  const rows = data.results[0]?.response?.result?.rows ?? [];
  return rows.map((r) => ({
    displayName:  r[0].value,
    grade:        Number(r[1].value),
    score:        Number(r[2].value),
    durationSecs: Number(r[3].value ?? 0),
    playedAt:     Number(r[4].value ?? 0),
  }));
}

/**
 * Returns the user's best competitive score per subject.
 * Result: { counting, arithmetic, pemdas, algebra } (null if no score).
 */
export async function getUserStats(userId) {
  const data = await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: `SELECT subject, score
              FROM best_scores
              WHERE user_id = ?`,
        args: [arg("integer", userId)],
      },
    },
  ]);
  const rows = data.results[0]?.response?.result?.rows ?? [];
  const stats = {
    counting: null,
    "arithmetic_+": null, "arithmetic_-": null, "arithmetic_×": null, "arithmetic_÷": null,
    pemdas: null, algebra: null,
  };
  rows.forEach((r) => {
    const subj  = r[0].value;
    const score = Number(r[1].value);
    if (subj in stats) stats[subj] = score;
  });
  // also expose a combined arithmetic best (highest across all ops)
  const arithBest = Math.max(
    stats["arithmetic_+"] ?? 0, stats["arithmetic_-"] ?? 0,
    stats["arithmetic_×"] ?? 0, stats["arithmetic_÷"] ?? 0,
  );
  stats.arithmetic = arithBest > 0 ? arithBest : null;
  return stats;
}
