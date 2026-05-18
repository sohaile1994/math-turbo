# Architecture Overview

## High-Level Structure

Math-Turbo is a React single-page application backed by a Turso (SQLite) database accessed directly from the browser over HTTP. There is no dedicated server — all backend calls go through the Turso HTTP API.

```
Browser (React SPA)
    │
    ├─ UI layer         src/components/
    ├─ State layer       src/context/
    ├─ Logic layer       src/generators/ + src/lib/
    └─ Data layer        Turso HTTP API (external)
```

---

## State Management

All runtime state is managed with React Context. Each context owns one slice of game state and exposes it via a custom hook.

| Context | What it owns |
|---|---|
| `AuthContext` | Current user session (role, name, grade, teacher) |
| `GameContext` | Active screen, game mode, selected category/operation |
| `ScoreContext` | Current score, streak counter, active boosters |
| `LivesContext` | Life count, game-over condition |
| `ProblemContext` | Current problem, answer validation |
| `GradeContext` | Letter grade (D → SSS) |
| `TimerContext` | Countdown value, running/stopped flag |
| `SettingsContext` | Player-configurable difficulty settings |
| `AnswerContext` | Raw keypad input and submission state |

Contexts are composed in `App.jsx` — each provider wraps the subtree that needs it.

---

## Screen Routing

There is no React Router. Navigation is handled by a `screen` value in `GameContext`. `App.jsx` renders the correct screen component based on that value.

```
SCREEN enum
  ├─ LOGIN
  ├─ MAIN_MENU
  ├─ GAME
  ├─ GAME_OVER
  ├─ LEADERBOARD
  ├─ ADMIN
  └─ SUPER_ADMIN
```

---

## Problem Generation

Each math category has its own generator in `src/generators/`. Generators are pure functions that take the current score and game mode and return a problem object:

```js
{ question, answer, operands, operation, booster? }
```

Dynamic ranges scale with score tier (see [Game Mechanics](GAME_MECHANICS.md)). Generators also embed booster drops at a 12% rate using a weighted random selection.

---

## Authentication

- Passwords are hashed client-side with SHA-256 before being sent to Turso.
- Sessions are persisted in `localStorage` so users stay logged in across page refreshes.
- Role is stored on the session object and checked at the component level to gate admin screens.
- Password reset is handled via a code flow stored in the database.

---

## Data Flow: Competitive Score Submission

```
Game ends (time out or 0 lives)
    │
    ▼
ScoreContext calculates final score (base + streak + grade + lives bonuses)
    │
    ▼
GameOverScreen displays breakdown
    │
    ▼
scores.js checks if score > personal best in Turso
    │
    ├─ Yes → upsert leaderboard row, update personal best
    └─ No  → skip write
```

---

## Styling

- All styles are plain CSS in `src/App.css` and `src/index.css`.
- The app targets a max-width of 480 px for a consistent mobile-first layout.
- GSAP is used for entrance animations (slide-up, floating decorations) and booster pop effects.
- Two fonts: **Fredoka One** for headings and buttons; **Nunito** for body text.
