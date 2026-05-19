import { tursoQuery, arg } from "./turso";
import { ALL_USERS_SQL } from "./auth";
import { decryptField } from "./fieldCrypto";

const SCORES_INIT_KEY       = "math_scores_init_v4";
const GUEST_SCORES_INIT_KEY = "math_guest_scores_init_v1";

// ─── Profanity / inappropriate content filter ─────────────────────────────────
const BAD_WORDS = [
  // Profanity
  "fuck","shit","bitch","cunt","dick","pussy","cock","ass","bastard",
  "whore","slut","piss","nigger","nigga","faggot","fag","retard",
  "asshole","jackass","dumbass","bullshit","motherfucker","fucker",
  "damn","crap","prick","twat","wanker","boner","dildo",
  "tits","boobs","boob","titty","titties","vagina","penis","balls",
  "scrotum","anus","butthole","cum","jizz","spunk","bdsm",
  // Sexual content
  "porn","porno","pornography","hentai","nude","nudity","naked",
  "sex","sexy","sexual","intercourse","orgasm","erection","horny",
  "masturbate","masturbation","blowjob","handjob","anal","oral",
  "fetish","kink","kinky","rape","molest","grope","fondle",
  "stripper","escort","prostitute","hooker","onlyfans",
  // Child safety
  "pedophile","pedophilia","paedophile","paedophilia","pedo",
  "childporn","cp","grooming","lolicon","shotacon",
  // Violence / hate
  "kill","murder","suicide","terrorist","terrorism","genocide",
  "lynch","jihad","nazi","hitler","kkk","kkkmember",
  // Drugs
  "cocaine","heroin","meth","crack","weed","marijuana","drug","drugs",
  "stoner","drugdealer",
  // Other
  "meat","flesh","gore",
];

export function containsProfanity(text) {
  const normalized = text.toLowerCase().replace(/[^a-z]/g, "");
  return BAD_WORDS.some((w) => normalized.includes(w));
}

const SUBJECT_TABLE = {
  "counting":      "scores_counting",
  "arithmetic_+":  "scores_addition",
  "arithmetic_-":  "scores_subtraction",
  "arithmetic_×":  "scores_multiplication",
  "arithmetic_÷":  "scores_division",
  "algebra":       "scores_algebra",
};

const ALL_TABLES = Object.values(SUBJECT_TABLE);

function table(subject) {
  return SUBJECT_TABLE[subject] ?? null;
}

const CREATE_TABLE_SQL = (t) => `
  CREATE TABLE IF NOT EXISTS ${t} (
    user_id       INTEGER NOT NULL PRIMARY KEY,
    score         INTEGER NOT NULL DEFAULT 0,
    duration_secs INTEGER NOT NULL DEFAULT 0,
    played_at     INTEGER NOT NULL DEFAULT 0
  )`;

export async function initScoresDB() {
  if (localStorage.getItem(SCORES_INIT_KEY)) return;
  await tursoQuery([
    { type: "execute", stmt: { sql: "DROP TABLE IF EXISTS best_scores" } },
    ...ALL_TABLES.map((t) => ({
      type: "execute",
      stmt: { sql: CREATE_TABLE_SQL(t) },
    })),
  ]);
  localStorage.setItem(SCORES_INIT_KEY, "1");
}

export async function saveScore(userId, subject, score, durationSecs = 0) {
  const t = table(subject);
  if (!t) return;
  const now = Math.floor(Date.now() / 1000);
  await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: `INSERT INTO ${t} (user_id, score, duration_secs, played_at)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(user_id) DO UPDATE SET
                score         = CASE WHEN excluded.score > ${t}.score THEN excluded.score         ELSE ${t}.score         END,
                duration_secs = CASE WHEN excluded.score > ${t}.score THEN excluded.duration_secs ELSE ${t}.duration_secs END,
                played_at     = CASE WHEN excluded.score > ${t}.score THEN excluded.played_at     ELSE ${t}.played_at     END`,
        args: [
          arg("integer", userId),
          arg("integer", score),
          arg("integer", durationSecs),
          arg("integer", now),
        ],
      },
    },
  ]);
}

export async function getLeaderboard(subject) {
  const t = table(subject);
  if (!t) return [];
  const data = await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: `SELECT u.display_name, u.grade, s.score, s.duration_secs, s.played_at, s.user_id
              FROM ${t} s
              JOIN (${ALL_USERS_SQL}) u ON u.id = s.user_id
              WHERE u.hide_leaderboard = 0
              ORDER BY s.score DESC
              LIMIT 50`,
      },
    },
  ]);
  const rows = data.results[0]?.response?.result?.rows ?? [];
  const result = [];
  for (const r of rows) {
    result.push({
      displayName:  await decryptField(r[0].value),
      grade:        Number(r[1].value),
      score:        Number(r[2].value),
      durationSecs: Number(r[3].value ?? 0),
      playedAt:     Number(r[4].value ?? 0),
      userId:       Number(r[5].value),
    });
  }
  return result;
}

export async function getUserStats(userId) {
  const queries = ALL_TABLES.map((t) => ({
    type: "execute",
    stmt: {
      sql: `SELECT score FROM ${t} WHERE user_id = ?`,
      args: [arg("integer", userId)],
    },
  }));
  const data = await tursoQuery(queries);
  const subjects = Object.keys(SUBJECT_TABLE);
  const stats = {};
  subjects.forEach((subj, i) => {
    const rows = data.results[i]?.response?.result?.rows ?? [];
    stats[subj] = rows.length > 0 ? Number(rows[0][0].value) : null;
  });
  return stats;
}

// ─── Guest scores ─────────────────────────────────────────────────────────────

export async function initGuestScoresDB() {
  if (localStorage.getItem(GUEST_SCORES_INIT_KEY)) return;
  await tursoQuery([{
    type: "execute",
    stmt: {
      sql: `CREATE TABLE IF NOT EXISTS guest_scores (
              id           INTEGER PRIMARY KEY AUTOINCREMENT,
              display_name TEXT    NOT NULL,
              subject      TEXT    NOT NULL,
              score        INTEGER NOT NULL DEFAULT 0,
              played_at    INTEGER NOT NULL DEFAULT 0
            )`,
    },
  }]);
  localStorage.setItem(GUEST_SCORES_INIT_KEY, "1");
}

export async function saveGuestScore(displayName, subject, score) {
  const now = Math.floor(Date.now() / 1000);
  await tursoQuery([{
    type: "execute",
    stmt: {
      sql: `INSERT INTO guest_scores (display_name, subject, score, played_at) VALUES (?, ?, ?, ?)`,
      args: [arg("text", displayName), arg("text", subject), arg("integer", score), arg("integer", now)],
    },
  }]);
}

export async function getGuestLeaderboard(subject) {
  const data = await tursoQuery([{
    type: "execute",
    stmt: {
      sql: `SELECT display_name, score, played_at
            FROM guest_scores
            WHERE subject = ?
            ORDER BY score DESC
            LIMIT 50`,
      args: [arg("text", subject)],
    },
  }]);
  const rows = data.results[0]?.response?.result?.rows ?? [];
  return rows.map((r) => ({
    displayName:  r[0].value,
    score:        Number(r[1].value),
    playedAt:     Number(r[2].value ?? 0),
  }));
}
