import { tursoQuery, arg } from "./turso";
import { hashPassword }    from "./auth";

const TABLE_FOR_GRADE = { 6: "users_6", 7: "users_7", 8: "users_8", 9: "users_9" };
const BASE_ID         = { 6: 1,   7: 51,  8: 101, 9: 151 };
const MAX_ID          = { 6: 50,  7: 100, 8: 150, 9: 200 };

/** Returns all students from all grade tables, sorted by name within each grade. */
export async function listStudents() {
  const data = await tursoQuery([
    { type: "execute", stmt: { sql: "SELECT id, username, display_name, grade FROM users_6 ORDER BY display_name" } },
    { type: "execute", stmt: { sql: "SELECT id, username, display_name, grade FROM users_7 ORDER BY display_name" } },
    { type: "execute", stmt: { sql: "SELECT id, username, display_name, grade FROM users_8 ORDER BY display_name" } },
    { type: "execute", stmt: { sql: "SELECT id, username, display_name, grade FROM users_9 ORDER BY display_name" } },
  ]);
  return [0, 1, 2, 3].flatMap((i) => {
    const rows = data.results[i]?.response?.result?.rows ?? [];
    return rows.map((r) => ({
      id:          Number(r[0].value),
      username:    r[1].value,
      displayName: r[2].value,
      grade:       Number(r[3].value),
    }));
  });
}

/**
 * Add a new student. Username should be their full school email.
 * Default password is Zenith123$.
 */
export async function addStudent(displayName, grade, username) {
  const table   = TABLE_FOR_GRADE[grade];
  const maxSlot = MAX_ID[grade];
  if (!table) throw new Error(`Invalid grade: ${grade}`);

  // Find the next available ID for this grade range
  const idData = await tursoQuery([
    { type: "execute", stmt: { sql: `SELECT MAX(id) FROM ${table}` } },
  ]);
  const currentMax = Number(idData.results[0]?.response?.result?.rows?.[0]?.[0]?.value ?? BASE_ID[grade] - 1);
  const newId = currentMax + 1;
  if (newId > maxSlot) throw new Error(`Grade ${grade} is at capacity (${maxSlot - BASE_ID[grade] + 1} max)`);

  const hash = await hashPassword("Zenith123$");
  await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: `INSERT INTO ${table} (id, username, display_name, grade, password_hash) VALUES (?, ?, ?, ?, ?)`,
        args: [
          arg("integer", newId),
          arg("text",    username),
          arg("text",    displayName),
          arg("integer", grade),
          arg("text",    hash),
        ],
      },
    },
  ]);
  return { id: newId, username, displayName, grade };
}

/** Remove a student and wipe their scores. */
export async function removeStudent(userId, grade) {
  const table = TABLE_FOR_GRADE[grade];
  if (!table) throw new Error(`Invalid grade: ${grade}`);
  await tursoQuery([
    { type: "execute", stmt: { sql: `DELETE FROM ${table} WHERE id = ?`,           args: [arg("integer", userId)] } },
    { type: "execute", stmt: { sql: "DELETE FROM best_scores WHERE user_id = ?",   args: [arg("integer", userId)] } },
  ]);
}

// ─── Teacher management (administrator only) ──────────────────────────────────

/** Returns all teachers from users_teacher, sorted by name. */
export async function listTeachers() {
  const data = await tursoQuery([
    { type: "execute", stmt: { sql: "SELECT id, username, display_name FROM users_teacher ORDER BY display_name" } },
  ]);
  const rows = data.results[0]?.response?.result?.rows ?? [];
  return rows.map((r) => ({
    id:          Number(r[0].value),
    username:    r[1].value,
    displayName: r[2].value,
  }));
}

/** Add a new teacher. Default password is Zenith123$. */
export async function addTeacher(displayName, username) {
  const idData = await tursoQuery([
    { type: "execute", stmt: { sql: "SELECT MAX(id) FROM users_teacher" } },
  ]);
  const currentMax = Number(idData.results[0]?.response?.result?.rows?.[0]?.[0]?.value ?? 200);
  const newId = currentMax + 1;

  const hash = await hashPassword("Zenith123$");
  await tursoQuery([
    {
      type: "execute",
      stmt: {
        sql: "INSERT INTO users_teacher (id, username, display_name, grade, password_hash) VALUES (?, ?, ?, ?, ?)",
        args: [
          arg("integer", newId),
          arg("text",    username),
          arg("text",    displayName),
          arg("integer", 0),
          arg("text",    hash),
        ],
      },
    },
  ]);
  return { id: newId, username, displayName };
}

/** Remove a teacher. */
export async function removeTeacher(userId) {
  await tursoQuery([
    { type: "execute", stmt: { sql: "DELETE FROM users_teacher WHERE id = ?", args: [arg("integer", userId)] } },
  ]);
}

/** Reset a teacher's password. */
export async function resetTeacherPassword(userId, newPassword) {
  const hash = await hashPassword(newPassword);
  await tursoQuery([
    { type: "execute", stmt: { sql: "UPDATE users_teacher SET password_hash = ? WHERE id = ?", args: [arg("text", hash), arg("integer", userId)] } },
  ]);
}

/**
 * Update a student's name and/or email. Optionally change password.
 * ID is never changed so best_scores stay linked.
 */
export async function updateStudent(userId, grade, displayName, username, newPassword) {
  const table = TABLE_FOR_GRADE[grade];
  if (!table) throw new Error(`Invalid grade: ${grade}`);

  if (newPassword) {
    const hash = await hashPassword(newPassword);
    await tursoQuery([
      {
        type: "execute",
        stmt: {
          sql: `UPDATE ${table} SET display_name = ?, username = ?, password_hash = ? WHERE id = ?`,
          args: [arg("text", displayName), arg("text", username), arg("text", hash), arg("integer", userId)],
        },
      },
    ]);
  } else {
    await tursoQuery([
      {
        type: "execute",
        stmt: {
          sql: `UPDATE ${table} SET display_name = ?, username = ? WHERE id = ?`,
          args: [arg("text", displayName), arg("text", username), arg("integer", userId)],
        },
      },
    ]);
  }
}

/** Reset a student's password back to the default. */
export async function resetStudentPassword(userId, grade, newPassword) {
  const table = TABLE_FOR_GRADE[grade];
  if (!table) throw new Error(`Invalid grade: ${grade}`);
  const hash = await hashPassword(newPassword);
  await tursoQuery([
    { type: "execute", stmt: { sql: `UPDATE ${table} SET password_hash = ? WHERE id = ?`, args: [arg("text", hash), arg("integer", userId)] } },
  ]);
}
