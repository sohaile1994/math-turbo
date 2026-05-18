# Game Mechanics Deep Dive

## Game Modes

### Practice Mode
- No timer.
- Scores are not posted to the leaderboard.
- All subjects and operations are available.
- Useful for learning or warming up without pressure.

### Competitive Mode
- 5-minute countdown timer.
- Score is submitted to the leaderboard at the end of the session if it beats the player's personal best.
- Difficulty scales with score (see Difficulty Tiers below).
- Timer turns yellow below 3 minutes and red below 1 minute.

---

## Subjects

| Subject | Operations |
|---|---|
| Counting | Visual item counting (emoji-based) |
| Addition | `a + b = ?` |
| Subtraction | `a - b = ?` |
| Multiplication | `a × b = ?` (max 12 × 12) |
| Division | `a ÷ b = ?` (max divisor 12) |
| PEMDAS | Order-of-operations expressions |
| Algebra | Algebraic expressions with a variable |

---

## Lives System

- Players start with **3 lives**.
- A wrong answer costs one life.
- Game over when lives reach 0.
- Lives can be recovered (up to max 3) via the Extra Life booster.

---

## Scoring Formula

```
final_score = (base + streak_bonus) × grade_bonus × lives_bonus × boost_multiplier
```

### Base score
- 100 points per correct answer.

### Streak bonus
- +20 points for each consecutive correct answer.
- Caps at +100 (streak of 5+).
- Resets to 0 on a wrong answer.

### Grade bonus multiplier
Younger students receive a higher multiplier to keep leaderboards competitive across grades.

| Grade | Multiplier |
|---|---|
| Kindergarten | 1000% (10×) |
| Grade 1 | 900% (9×) |
| Grade 2 | 800% (8×) |
| Grade 3 | 700% (7×) |
| Grade 4 | 600% (6×) |
| Grade 5 | 500% (5×) |
| Grade 6 | 400% (4×) |
| Grade 7 | 300% (3×) |
| Grade 8 | 200% (2×) |
| Grade 9+ | 0% (1×) |

### Lives bonus
```
lives_bonus = 1 + (0.3 × remaining_lives)
```
Finishing with 3 lives gives a 90% bonus on top of the raw score.

### Score Boost booster
Activating the Score Boost booster doubles the multiplier for the next 5 problems.

---

## Difficulty Tiers (Competitive)

Problem number ranges expand as the player's score increases.

| Score range | Operand range | Label |
|---|---|---|
| 0 – 4 999 | 1 – 9 | Easy |
| 5 000 – 9 999 | 1 – 14 | Medium |
| 10 000 – 14 999 | 1 – 19 | Hard |
| 15 000+ | +5 per 5 000 pts | Hard+ |

Multiplication and Division caps remain at 12 regardless of tier, to match curriculum expectations.

A **tier banner** is shown momentarily when the player crosses into a new tier.

---

## Boosters

Boosters appear randomly during problem generation at a 12% overall drop rate. When a booster is available it is presented as part of the problem UI before the next question.

| Booster | Drop weight | Duration | Effect |
|---|---|---|---|
| Grade Freeze | 40% | 1 problem | Prevents letter grade from dropping if the answer is wrong |
| Score Boost | 30% | 5 problems | 2× score multiplier |
| Extra Life | 20% | Instant | +1 life (up to max 3) |
| Double Combo | 10% | 1 problem | Doubles the current streak multiplier |

---

## Letter Grade

Players earn a letter grade (D, C, B, A, S, SS, SSS) based on their accuracy during the session. The grade is displayed on screen in real time and affects score bonuses. The Grade Freeze booster prevents the grade from dropping on a wrong answer.

---

## Anti-Repetition

Problem generators track the previous operand to avoid dealing the same first number twice in a row. This keeps sessions feeling varied.
