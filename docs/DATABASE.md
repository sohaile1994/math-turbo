# Database Schema

Math-Turbo uses [Turso](https://turso.tech) — a SQLite database accessible over HTTP. The app initialises its own schema automatically on first run using versioned init keys, so no manual migration steps are required.

---

## Connection

The database is accessed via `src/lib/turso.js`, which wraps the Turso HTTP pipeline API. All queries are sent as JSON payloads to the database URL using the auth token from the environment variables.

```env
VITE_TURSO_URL=https://your-db-name.turso.io
VITE_TURSO_TOKEN=your-auth-token
```

---

## Tables

### `users_student`

Stores student accounts.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `email` | TEXT UNIQUE | Login identifier |
| `password_hash` | TEXT | SHA-256 hash |
| `display_name` | TEXT | Shown in-game and on leaderboard |
| `grade` | INTEGER | 0 = Kindergarten, 1–9 = Grade 1–9 |
| `teacher_id` | INTEGER | FK → `users_teacher.id` |
| `created_at` | TEXT | ISO timestamp |

---

### `users_teacher`

Stores teacher accounts.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `email` | TEXT UNIQUE | Login identifier |
| `password_hash` | TEXT | SHA-256 hash |
| `display_name` | TEXT | |
| `created_at` | TEXT | ISO timestamp |

---

### `users_admin`

Stores admin accounts.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `email` | TEXT UNIQUE | Login identifier |
| `password_hash` | TEXT | SHA-256 hash |
| `display_name` | TEXT | |
| `created_at` | TEXT | ISO timestamp |

---

### `scores_<subject>`

One table per subject stores leaderboard entries. Subject names: `counting`, `addition`, `subtraction`, `multiplication`, `division`, `pemdas`.

Example: `scores_addition`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `user_id` | INTEGER | FK → the user's id in their role table |
| `user_role` | TEXT | `student`, `guest` |
| `display_name` | TEXT | Denormalised for fast leaderboard reads |
| `grade` | INTEGER | Grade at time of play |
| `score` | INTEGER | Final score after all bonuses |
| `duration_seconds` | INTEGER | How long the session lasted |
| `played_at` | TEXT | ISO timestamp |

The leaderboard shows the **highest score** per player. On session end, the app checks if the new score exceeds the existing row and upserts if so.

---

## Init Keys

A special `init_keys` table tracks which schema versions have already been applied. This prevents duplicate table creation on subsequent page loads.

| Column | Type | Notes |
|---|---|---|
| `key` | TEXT PK | Version identifier (e.g. `v1_schema`) |
| `applied_at` | TEXT | ISO timestamp |

---

## Local Storage

Some state is persisted in the browser's `localStorage` to survive page refreshes:

| Key | Content |
|---|---|
| `math_turbo_session` | Serialised user session object (role, name, grade) |
| `math_turbo_settings` | Player settings (difficulty preferences) |

No sensitive data is stored unprotected — passwords are only ever sent to Turso as hashes.
