# Math-Turbo

A gamified math practice app for students in Kindergarten through Grade 9. Students race against a timer, earn points and grade bonuses, collect boosters, and compete on per-subject leaderboards. Teachers and admins manage accounts through a built-in admin panel.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Game Mechanics](#game-mechanics)
- [User Roles](#user-roles)
- [Database](#database)
- [Scripts](#scripts)
- [Documentation](#documentation)

---

## Features

- **Two game modes** — Practice (no timer, no leaderboard) and Competitive (5-minute countdown, scored, ranked)
- **Six math subjects** — Counting, Addition, Subtraction, Multiplication, Division, and PEMDAS/Algebra
- **Dynamic difficulty** — Problem ranges scale with score; new tier banners notify players of rank-ups
- **Grade bonuses** — Younger students earn larger score multipliers to level the playing field
- **Booster drops** — Random power-ups (Extra Life, Score Boost, Grade Freeze, Double Combo) appear during play
- **Leaderboard** — Per-subject rankings with rank badges, grade labels, session duration, and play date
- **Role-based access** — Student, Guest, Teacher, and Admin roles with separate dashboards
- **Guest mode** — Play without an account; scores post to a guest-only leaderboard
- **Student privacy** — Usernames and display names for all students and teachers are encrypted at rest in the database using AES-256-GCM; passwords are stored as SHA-256 hashes

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, custom CSS |
| Build | Vite 7 |
| Animation | GSAP 3 |
| Icons | React Icons 5 |
| Database | Turso (SQLite over HTTP) |
| Auth | Custom session auth, SHA-256 password hashing, AES-256-GCM field encryption |
| Hosting | Netlify (recommended) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Turso](https://turso.tech) account and database (free tier works)

### Installation

```bash
git clone https://github.com/your-username/math-turbo.git
cd math-turbo
npm install
```

### Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local and fill in your Turso credentials
```

### Run the dev server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_TURSO_URL` | Your Turso database URL (`https://your-db.turso.io`) |
| `VITE_TURSO_TOKEN` | Your Turso auth token |
| `VITE_FIELD_KEY` | AES-256-GCM key material for student/teacher field encryption — must stay consistent across deployments |
| `VITE_ADMIN_PASSWORD` | Password for the built-in admin account |
| `VITE_RESET_CODE` | Auth code required to reset a student password |

Copy `.env.local.example` to `.env.local` for local development. For Netlify deployments, set the same variables in the Netlify dashboard under **Site settings > Environment variables**.

---

## Project Structure

```
math-turbo/
├── src/
│   ├── components/
│   │   ├── screens/        # Full-page views (Login, MainMenu, GameScreen, etc.)
│   │   └── game/           # In-game overlays and UI elements
│   ├── context/            # React Context providers (Auth, Score, Lives, Timer, …)
│   ├── generators/         # Math problem generators (per operation)
│   ├── lib/
│   │   ├── auth.js         # Login, session, password reset
│   │   ├── scores.js       # Leaderboard read/write
│   │   ├── admin.js        # Teacher/admin operations
│   │   └── turso.js        # Low-level Turso HTTP wrapper
│   ├── utils/              # Shared utility functions
│   ├── enums.js            # Game constants (screens, modes, categories)
│   └── App.jsx             # Root component and screen routing
├── public/                 # Static assets
├── .env.local.example      # Environment variable template
├── vite.config.js
└── package.json
```

---

## Game Mechanics

### Scoring

| Component | Formula |
|---|---|
| Base | 100 pts per correct answer |
| Streak bonus | +20 pts per consecutive correct (max +100) |
| Grade bonus | 0%–1000% multiplier (K = 1000%, Grade 9+ = 0%) |
| Lives bonus | `0.3 × remaining lives × raw score` |
| Score Boost booster | 2× multiplier for next 5 problems |

### Difficulty Tiers (Competitive mode)

| Score range | Number range |
|---|---|
| 0 – 4 999 | 1 – 9 |
| 5 000 – 9 999 | 1 – 14 |
| 10 000+ | +5 per 5 000-point tier |

### Boosters (12% drop rate)

| Booster | Weight | Effect |
|---|---|---|
| Grade Freeze | 40% | Prevents grade downgrade for next problem |
| Score Boost | 30% | 2× score multiplier for 5 problems |
| Extra Life | 20% | Gain one life (max 3) |
| Double Combo | 10% | Doubles combo multiplier |

### Timer

- Competitive sessions run for **5 minutes**.
- Clock turns yellow below 3 minutes and red below 1 minute.
- Game ends when time runs out or all lives are lost.

---

## User Roles

| Role | Capabilities |
|---|---|
| **Student** | Practice, compete, view personal stats and leaderboard |
| **Guest** | Practice and compete on the guest-only leaderboard; no persistent account |
| **Teacher** | All student capabilities + manage students in their class via the Admin Panel |
| **Admin** | Full system administration (all users, all classes) |

---

## Database

Math-Turbo uses [Turso](https://turso.tech) (SQLite over HTTP). The app initialises its own schema on first run using versioned init keys, so no manual migration is needed.

All student and teacher **usernames** and **display names** are encrypted with AES-256-GCM before being written to the database. Passwords are never stored in plaintext — only their SHA-256 hash is saved. Existing plaintext records are automatically migrated to encrypted form on first load.

### Tables

| Table | Purpose |
|---|---|
| `users_student` | Student accounts (grade, teacher assignment) |
| `users_teacher` | Teacher accounts |
| `users_admin` | Admin accounts |
| `scores_<subject>` | Per-subject leaderboard entries |

Subject tables: `scores_counting`, `scores_addition`, `scores_subtraction`, `scores_multiplication`, `scores_division`, `scores_pemdas`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Documentation

Extended documentation lives in the [`docs/`](docs/) folder:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Game Mechanics Deep Dive](docs/GAME_MECHANICS.md)
- [Database Schema](docs/DATABASE.md)
- [Admin & Teacher Guide](docs/ADMIN_GUIDE.md)
