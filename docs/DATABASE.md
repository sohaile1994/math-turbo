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

### `users_k` / `users_1` … `users_9`

One table per grade stores student accounts (K = `users_k`, Grade 1 = `users_1`, … Grade 9 = `users_9`).

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Manually assigned; ranges are grade-specific |
| `username` | TEXT UNIQUE | **AES-256-GCM encrypted** (deterministic IV for SQL lookup) |
| `display_name` | TEXT | **AES-256-GCM encrypted** (random IV) |
| `grade` | INTEGER | 0 = Kindergarten, 1–9 = Grade 1–9 |
| `school_year` | TEXT | e.g. `2024-2025` |
| `hide_leaderboard` | INTEGER | `1` = opt out of leaderboard display |
| `password_hash` | TEXT | SHA-256 hash |

---

### `users_teacher`

Stores teacher accounts.

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-assigned |
| `username` | TEXT UNIQUE | **AES-256-GCM encrypted** (deterministic IV for SQL lookup) |
| `display_name` | TEXT | **AES-256-GCM encrypted** (random IV) |
| `grade` | INTEGER | Always `0` for teachers |
| `password_hash` | TEXT | SHA-256 hash |

---

### `users_admin`

The admin account is hardcoded in `src/lib/auth.js` and is **not stored in the database**.

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

## Field Encryption

All student and teacher PII (`username` and `display_name`) is encrypted at rest using **AES-256-GCM** via the Web Crypto API (`src/lib/fieldCrypto.js`).

| Field | Scheme | Why |
|---|---|---|
| `username` | Deterministic AES-256-GCM (fixed IV) | Must produce the same ciphertext every time so `WHERE username = ?` lookups work |
| `display_name` | Probabilistic AES-256-GCM (random IV) | Different ciphertext per write — stronger privacy for names |
| `password_hash` | SHA-256 (one-way hash) | Passwords are never stored in any recoverable form |

The encryption key is derived with PBKDF2 (SHA-256, 50 000 iterations) from a compile-time secret. This provides **database-at-rest obscuration** — anyone with direct DB access sees only ciphertext.

On first load the app runs a migration that re-encrypts any plaintext rows left over from before this feature was added. Migration state is tracked in `localStorage` under `math_crypto_fields_v1`.

---

## Local Storage

Some state is persisted in the browser's `localStorage` to survive page refreshes:

| Key | Content |
|---|---|
| `math_turbo_session` | Serialised user session object (role, name, grade) |
| `math_turbo_settings` | Player settings (difficulty preferences) |

No sensitive data is stored unprotected — passwords are stored only as SHA-256 hashes, and all student/teacher names and usernames are AES-256-GCM encrypted before being written to the database.
