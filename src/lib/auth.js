import { tursoQuery, arg } from "./turso";

const DB_INIT_KEY = "math_db_init_v6";
const SESSION_KEY = "math_session";

export async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Seed data ────────────────────────────────────────────────────────────────
// IDs are globally unique across all grade tables:
//   Grade 6  →   1 –  50
//   Grade 7  →  51 – 100
//   Grade 8  → 101 – 150
//   Grade 9  → 151 – 200
// Username = email prefix before @zenithacademy.org (or custom if no email)

// student seed data removed from history

// student seed data removed from history

// student seed data removed from history

// student seed data removed from history

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInserts(table, gradeNum, users, hash) {
  return users.map((u) => ({
    type: "execute",
    stmt: {
      sql: `INSERT OR IGNORE INTO ${table} (id, username, display_name, grade, password_hash) VALUES (?, ?, ?, ?, ?)`,
      args: [
        arg("integer", u.id),
        arg("text",    u.username),
        arg("text",    u.name),
        arg("integer", gradeNum),
        arg("text",    hash),
      ],
    },
  }));
}

const TABLE_SCHEMA = (name) =>
  `CREATE TABLE IF NOT EXISTS ${name} (
     id            INTEGER PRIMARY KEY,
     username      TEXT    NOT NULL UNIQUE,
     display_name  TEXT    NOT NULL,
     grade         INTEGER NOT NULL,
     password_hash TEXT    NOT NULL
   )`;

// Exported so scores.js can reuse it in JOIN subqueries
export const ALL_USERS_SQL =
  `SELECT id, username, display_name, grade, password_hash FROM users_6
   UNION ALL
   SELECT id, username, display_name, grade, password_hash FROM users_7
   UNION ALL
   SELECT id, username, display_name, grade, password_hash FROM users_8
   UNION ALL
   SELECT id, username, display_name, grade, password_hash FROM users_9`;

// ─── DB init ──────────────────────────────────────────────────────────────────

export async function initDB() {
  if (localStorage.getItem(DB_INIT_KEY)) return;

  // Verify tables exist (they were seeded server-side).
  // If any are missing for some reason, create and seed them.
  const check = await tursoQuery([
    { type: "execute", stmt: { sql: "SELECT COUNT(*) FROM users_6" } },
  ]).catch(() => null);

  if (!check) {
    // Tables missing — create and seed
    const hash = await hashPassword("Zenith123$");
    await tursoQuery([
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_6") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_7") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_8") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_9") } },
    ]);
    await tursoQuery(makeInserts("users_6", 6, SEED_GRADE6, hash));
    await tursoQuery(makeInserts("users_7", 7, SEED_GRADE7, hash));
    await tursoQuery(makeInserts("users_8", 8, SEED_GRADE8, hash));
    await tursoQuery(makeInserts("users_9", 9, SEED_GRADE9, hash));
  }

  localStorage.setItem(DB_INIT_KEY, "1");
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(username, rawPassword) {
  const hash = await hashPassword(rawPassword);
  const data = await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: `SELECT id, display_name, grade, username
              FROM (${ALL_USERS_SQL})
              WHERE username = ? AND password_hash = ?
              LIMIT 1`,
        args: [arg("text", username), arg("text", hash)],
      },
    },
  ]);
  const row = data.results[0]?.response?.result?.rows?.[0];
  if (!row) return null;
  return {
    id:          Number(row[0].value),
    displayName: row[1].value,
    grade:       Number(row[2].value),
    username:    row[3].value,
  };
}

export async function resetPassword(username, authCode, newPassword) {
  if (authCode !== "Viole1990%") throw new Error("Invalid admin code");
  const newHash = await hashPassword(newPassword);
  // UPDATE runs on all 4 tables — only one will match
  await tursoQuery([
    { type: "execute", stmt: { sql: "UPDATE users_6 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", username)] } },
    { type: "execute", stmt: { sql: "UPDATE users_7 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", username)] } },
    { type: "execute", stmt: { sql: "UPDATE users_8 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", username)] } },
    { type: "execute", stmt: { sql: "UPDATE users_9 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", username)] } },
  ]);
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export function getSession()      { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } }
export function saveSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
export function clearSession()    { localStorage.removeItem(SESSION_KEY); }
