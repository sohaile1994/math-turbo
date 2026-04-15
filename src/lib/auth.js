import { tursoQuery, arg } from "./turso";

const DB_INIT_KEY = "math_db_init_v7";
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

// Exported so scores.js can reuse it in JOIN subqueries.
// Includes a literal `role` column so callers can distinguish teachers from students.
export const ALL_USERS_SQL =
  `SELECT id, username, display_name, grade, password_hash, 'teacher' AS role FROM users_teacher
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role FROM users_6
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role FROM users_7
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role FROM users_8
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role FROM users_9`;

// Hardcoded administrator — not stored in any DB table
const ADMIN_USERNAME = "admin@zenithacademy.org";
const ADMIN_PASSWORD = "Zenith123$";

// ─── DB init ──────────────────────────────────────────────────────────────────

export async function initDB() {
  if (localStorage.getItem(DB_INIT_KEY)) return;

  // Use sqlite_master to reliably detect which tables already exist.
  const masterRes = await tursoQuery([
    {
      type: "execute",
      stmt: { sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='users_6'" },
    },
  ]);
  const existing = new Set(
    (masterRes.results[0]?.response?.result?.rows ?? []).map((r) => r[0].value)
  );

  const hash = await hashPassword("Zenith123$");

  // Create / seed student + teacher tables if users_6 is missing
  if (!existing.has("users_6")) {
    await tursoQuery([
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_6") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_7") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_8") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_9") } },
      {
        type: "execute",
        stmt: {
          sql: `CREATE TABLE IF NOT EXISTS users_teacher (
                  id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE,
                  display_name TEXT NOT NULL, grade INTEGER NOT NULL DEFAULT 0,
                  password_hash TEXT NOT NULL)`,
        },
      },
    ]);
    await tursoQuery(makeInserts("users_6", 6, SEED_GRADE6, hash));
    await tursoQuery(makeInserts("users_7", 7, SEED_GRADE7, hash));
    await tursoQuery(makeInserts("users_8", 8, SEED_GRADE8, hash));
    await tursoQuery(makeInserts("users_9", 9, SEED_GRADE9, hash));
  }

  localStorage.setItem(DB_INIT_KEY, "1");
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(rawUsername, rawPassword) {
  const username = rawUsername.trim().toLowerCase();
  const hash     = await hashPassword(rawPassword);

  // Hardcoded administrator — checked before any DB query
  if (username === ADMIN_USERNAME) {
    if (hash === await hashPassword(ADMIN_PASSWORD)) {
      return { id: 0, displayName: "Administrator", grade: 0, username: ADMIN_USERNAME, role: "admin" };
    }
    return null; // wrong password for admin
  }

  const data = await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: `SELECT id, display_name, grade, username, role
              FROM (${ALL_USERS_SQL})
              WHERE LOWER(username) = ? AND password_hash = ?
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
    role:        row[4]?.value ?? "student",
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
