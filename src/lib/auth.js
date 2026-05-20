import { tursoQuery, arg } from "./turso";
import { encryptField, encryptUsername, decryptField, isEncrypted } from "./fieldCrypto";

const DB_INIT_KEY        = "math_db_init_v10";
const SESSION_KEY        = "math_session";
const CRYPTO_MIGRATION_KEY = "math_crypto_fields_v1";

export function getSchoolYear() {
  const now  = new Date();
  const year = now.getFullYear();
  return now < new Date(year, 5, 1) // before June 1
    ? `${year - 1}-${year}`
    : `${year}-${year + 1}`;
}

export async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Seed data ────────────────────────────────────────────────────────────────
// ID ranges (globally unique across all grade and teacher tables):
//   Grade K  →  501 –  600
//   Grade 1  →  601 –  700
//   Grade 2  →  701 –  800
//   Grade 3  →  801 –  900
//   Grade 4  →  901 – 1000
//   Grade 5  → 1001 – 1100
//   Grade 6  →    1 –   50
//   Grade 7  →   51 –  100
//   Grade 8  →  101 –  150
//   Grade 9  →  151 –  200
//   Teacher  →  201+  (auto-assigned from users_teacher MAX)
// Username = email prefix before @zenithacademy.org (or custom if no email)

// student seed data removed from history

// student seed data removed from history

// student seed data removed from history

// student seed data removed from history

// student seed data removed from history

// student seed data removed from history

// student seed data removed from history

// student seed data removed from history

// student seed data removed from history

// student seed data removed from history

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function makeEncryptedInserts(table, gradeNum, users, hash, schoolYear) {
  const inserts = [];
  for (const u of users) {
    const encUsername    = await encryptUsername(u.username);
    const encDisplayName = await encryptField(u.name);
    inserts.push({
      type: "execute",
      stmt: {
        sql: `INSERT OR IGNORE INTO ${table} (id, username, display_name, grade, school_year, password_hash) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          arg("integer", u.id),
          arg("text",    encUsername),
          arg("text",    encDisplayName),
          arg("integer", gradeNum),
          arg("text",    schoolYear),
          arg("text",    hash),
        ],
      },
    });
  }
  return inserts;
}

const TABLE_SCHEMA = (name) =>
  `CREATE TABLE IF NOT EXISTS ${name} (
     id            INTEGER PRIMARY KEY,
     username      TEXT    NOT NULL UNIQUE,
     display_name  TEXT    NOT NULL,
     grade              INTEGER NOT NULL,
     school_year        TEXT    NOT NULL DEFAULT '',
     hide_leaderboard   INTEGER NOT NULL DEFAULT 0,
     password_hash      TEXT    NOT NULL
   )`;

// Exported so scores.js can reuse it in JOIN subqueries.
// Includes a literal `role` column so callers can distinguish teachers from students.
export const ALL_USERS_SQL =
  `SELECT id, username, display_name, grade, password_hash, 'teacher' AS role, 0 AS hide_leaderboard FROM users_teacher
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role, hide_leaderboard FROM users_k
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role, hide_leaderboard FROM users_1
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role, hide_leaderboard FROM users_2
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role, hide_leaderboard FROM users_3
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role, hide_leaderboard FROM users_4
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role, hide_leaderboard FROM users_5
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role, hide_leaderboard FROM users_6
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role, hide_leaderboard FROM users_7
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role, hide_leaderboard FROM users_8
   UNION ALL
   SELECT id, username, display_name, grade, password_hash, 'student' AS role, hide_leaderboard FROM users_9`;

// Hardcoded administrator — not stored in any DB table
const ADMIN_USERNAME = "admin@zenithacademy.org";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

// ─── Field encryption migration ───────────────────────────────────────────────

const ALL_USER_TABLES = [
  "users_k","users_1","users_2","users_3","users_4","users_5",
  "users_6","users_7","users_8","users_9","users_teacher",
];

async function migratePlaintextFields() {
  if (localStorage.getItem(CRYPTO_MIGRATION_KEY)) return;

  for (const table of ALL_USER_TABLES) {
    let rows;
    try {
      const data = await tursoQuery([{
        type: "execute",
        stmt: { sql: `SELECT id, username, display_name FROM ${table}` },
      }]);
      rows = data.results[0]?.response?.result?.rows ?? [];
    } catch { continue; } // table may not exist yet

    const updates = [];
    for (const row of rows) {
      const id          = Number(row[0].value);
      const username    = row[1].value;
      const displayName = row[2].value;
      if (isEncrypted(username) && isEncrypted(displayName)) continue;
      updates.push({
        type: "execute",
        stmt: {
          sql: `UPDATE ${table} SET username = ?, display_name = ? WHERE id = ?`,
          args: [
            arg("text",    isEncrypted(username)    ? username    : await encryptUsername(username)),
            arg("text",    isEncrypted(displayName) ? displayName : await encryptField(displayName)),
            arg("integer", id),
          ],
        },
      });
    }

    for (let i = 0; i < updates.length; i += 20) {
      await tursoQuery(updates.slice(i, i + 20));
    }
  }

  localStorage.setItem(CRYPTO_MIGRATION_KEY, "1");
}

// ─── DB init ──────────────────────────────────────────────────────────────────

export async function initDB() {
  await migratePlaintextFields();

  if (localStorage.getItem(DB_INIT_KEY)) return;

  // Detect which grade tables already exist
  const masterRes = await tursoQuery([
    {
      type: "execute",
      stmt: { sql: "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users_6', 'users_1')" },
    },
  ]);
  const existing = new Set(
    (masterRes.results[0]?.response?.result?.rows ?? []).map((r) => r[0].value)
  );

  const hash       = await hashPassword("Zenith123$");
  const schoolYear = getSchoolYear();

  // Create / seed K–5 tables if not yet initialized
  if (!existing.has("users_1")) {
    await tursoQuery([
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_k") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_1") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_2") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_3") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_4") } },
      { type: "execute", stmt: { sql: TABLE_SCHEMA("users_5") } },
    ]);
    const k5Inserts = [
      ...(await makeEncryptedInserts("users_k", 0, SEED_GRADE_K, hash, schoolYear)),
      ...(await makeEncryptedInserts("users_1", 1, SEED_GRADE1,  hash, schoolYear)),
      ...(await makeEncryptedInserts("users_2", 2, SEED_GRADE2,  hash, schoolYear)),
      ...(await makeEncryptedInserts("users_3", 3, SEED_GRADE3,  hash, schoolYear)),
      ...(await makeEncryptedInserts("users_4", 4, SEED_GRADE4,  hash, schoolYear)),
      ...(await makeEncryptedInserts("users_5", 5, SEED_GRADE5,  hash, schoolYear)),
    ];
    if (k5Inserts.length) await tursoQuery(k5Inserts);
  }

  // Create / seed grade 6–9 + teacher tables on fresh installs
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
    await tursoQuery(await makeEncryptedInserts("users_6", 6, SEED_GRADE6, hash, schoolYear));
    await tursoQuery(await makeEncryptedInserts("users_7", 7, SEED_GRADE7, hash, schoolYear));
    await tursoQuery(await makeEncryptedInserts("users_8", 8, SEED_GRADE8, hash, schoolYear));
    await tursoQuery(await makeEncryptedInserts("users_9", 9, SEED_GRADE9, hash, schoolYear));
  }

  // Add new columns to tables that existed before this init run.
  // Tables created above already have them; only pre-existing tables need ALTER TABLE.
  const tablesNeedingMigration = [
    ...(existing.has("users_1") ? ["users_k","users_1","users_2","users_3","users_4","users_5"] : []),
    ...(existing.has("users_6") ? ["users_6","users_7","users_8","users_9"] : []),
  ];
  if (tablesNeedingMigration.length > 0) {
    const probe = tablesNeedingMigration[0];

    const syCheck = await tursoQuery([
      { type: "execute", stmt: { sql: `SELECT COUNT(*) FROM pragma_table_info('${probe}') WHERE name='school_year'` } },
    ]);
    if (Number(syCheck.results[0]?.response?.result?.rows?.[0]?.[0]?.value ?? 0) === 0) {
      await tursoQuery(
        tablesNeedingMigration.map((t) => ({
          type: "execute",
          stmt: { sql: `ALTER TABLE ${t} ADD COLUMN school_year TEXT NOT NULL DEFAULT '${schoolYear}'` },
        }))
      );
    }

    const hlCheck = await tursoQuery([
      { type: "execute", stmt: { sql: `SELECT COUNT(*) FROM pragma_table_info('${probe}') WHERE name='hide_leaderboard'` } },
    ]);
    if (Number(hlCheck.results[0]?.response?.result?.rows?.[0]?.[0]?.value ?? 0) === 0) {
      await tursoQuery(
        tablesNeedingMigration.map((t) => ({
          type: "execute",
          stmt: { sql: `ALTER TABLE ${t} ADD COLUMN hide_leaderboard INTEGER NOT NULL DEFAULT 0` },
        }))
      );
    }
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
    return null;
  }

  const encUsername = await encryptUsername(username);

  const data = await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: `SELECT id, display_name, grade, username, role, hide_leaderboard
              FROM (${ALL_USERS_SQL})
              WHERE username = ? AND password_hash = ?
              LIMIT 1`,
        args: [arg("text", encUsername), arg("text", hash)],
      },
    },
  ]);
  const row = data.results[0]?.response?.result?.rows?.[0];
  if (!row) return null;
  return {
    id:              Number(row[0].value),
    displayName:     await decryptField(row[1].value),
    grade:           Number(row[2].value),
    username:        await decryptField(row[3].value),
    role:            row[4]?.value ?? "student",
    hideLeaderboard: Number(row[5]?.value ?? 0) === 1,
  };
}

export async function resetPassword(username, authCode, newPassword) {
  if (authCode !== import.meta.env.VITE_RESET_CODE) throw new Error("Invalid admin code");
  const newHash     = await hashPassword(newPassword);
  const encUsername = await encryptUsername(username.trim());
  await tursoQuery([
    { type: "execute", stmt: { sql: "UPDATE users_k SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", encUsername)] } },
    { type: "execute", stmt: { sql: "UPDATE users_1 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", encUsername)] } },
    { type: "execute", stmt: { sql: "UPDATE users_2 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", encUsername)] } },
    { type: "execute", stmt: { sql: "UPDATE users_3 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", encUsername)] } },
    { type: "execute", stmt: { sql: "UPDATE users_4 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", encUsername)] } },
    { type: "execute", stmt: { sql: "UPDATE users_5 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", encUsername)] } },
    { type: "execute", stmt: { sql: "UPDATE users_6 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", encUsername)] } },
    { type: "execute", stmt: { sql: "UPDATE users_7 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", encUsername)] } },
    { type: "execute", stmt: { sql: "UPDATE users_8 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", encUsername)] } },
    { type: "execute", stmt: { sql: "UPDATE users_9 SET password_hash = ? WHERE username = ?", args: [arg("text", newHash), arg("text", encUsername)] } },
  ]);
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export function getSession()      { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } }
export function saveSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
export function clearSession()    { localStorage.removeItem(SESSION_KEY); }
