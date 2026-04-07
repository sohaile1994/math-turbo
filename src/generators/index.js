import { BoosterType } from "../enums";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function maybeBooster() {
  if (Math.random() > 0.12) return null; // 12% chance
  const roll = Math.random();
  if (roll < 0.40) return BoosterType.GRADE_FREEZE;
  if (roll < 0.70) return BoosterType.SCORE_BOOST;
  if (roll < 0.90) return BoosterType.EXTRA_LIFE;
  return BoosterType.DOUBLE_COMBO;
}

const BOOSTER_LABELS = {
  [BoosterType.GRADE_FREEZE]: "❄️ GRADE SHIELD",
  [BoosterType.EXTRA_LIFE]: "❤️ EXTRA LIFE",
  [BoosterType.SCORE_BOOST]: "⚡ SCORE BOOST",
  [BoosterType.DOUBLE_COMBO]: "🔥 DOUBLE COMBO",
};

export { BOOSTER_LABELS };

// ─────────────────────────────────────────────
// COUNTING
// ─────────────────────────────────────────────

const COUNTING_ITEMS = [
  "⚽", "⭐", "🍎", "🎈", "🌸", "🦋", "🍕",
  "🎯", "💎", "🐸", "🔥", "🌈", "🍦", "🦄", "🐶",
];

export function generateCounting() {
  const count = randInt(1, 12);
  const item = COUNTING_ITEMS[Math.floor(Math.random() * COUNTING_ITEMS.length)];
  return {
    type: "counting",
    count,
    item,
    answer: count,
    answerType: "integer",
    displayQuestion: `How many ${item}?`,
    displayAnswer: String(count),
    booster: maybeBooster(),
  };
}

// ─────────────────────────────────────────────
// ARITHMETIC
// ─────────────────────────────────────────────

const OPS = ["+", "-", "×", "÷"];

export function generateArithmetic() {
  const op = OPS[Math.floor(Math.random() * OPS.length)];
  let a, b, answer;

  switch (op) {
    case "+":
      a = randInt(2, 25);
      b = randInt(2, 25);
      answer = a + b;
      break;
    case "-":
      a = randInt(5, 30);
      b = randInt(1, a); // b <= a so result >= 0
      answer = a - b;
      break;
    case "×":
      a = randInt(2, 12);
      b = randInt(2, 12);
      answer = a * b;
      break;
    case "÷":
      b = randInt(2, 12);
      answer = randInt(2, 12);
      a = b * answer; // ensure clean division
      break;
    default:
      a = 1; b = 1; answer = 2;
  }

  return {
    type: "arithmetic",
    a, b, op,
    answer,
    answerType: "integer",
    displayQuestion: `${a} ${op} ${b}`,
    displayAnswer: String(answer),
    booster: maybeBooster(),
  };
}

// ─────────────────────────────────────────────
// PEMDAS
// ─────────────────────────────────────────────

const TEMPLATES = [
  // a + b × c
  () => {
    const b = randInt(2, 9), c = randInt(2, 9), a = randInt(1, 20);
    const answer = a + b * c;
    return { expression: `${a} + ${b} × ${c}`, answer };
  },
  // (a + b) × c
  () => {
    const a = randInt(2, 8), b = randInt(2, 8), c = randInt(2, 7);
    const answer = (a + b) * c;
    return { expression: `(${a} + ${b}) × ${c}`, answer };
  },
  // a × b + c
  () => {
    const a = randInt(2, 9), b = randInt(2, 9), c = randInt(1, 15);
    const answer = a * b + c;
    return { expression: `${a} × ${b} + ${c}`, answer };
  },
  // a × (b + c)
  () => {
    const a = randInt(2, 8), b = randInt(2, 7), c = randInt(2, 7);
    const answer = a * (b + c);
    return { expression: `${a} × (${b} + ${c})`, answer };
  },
  // a - b × c  (a > b*c guaranteed)
  () => {
    const b = randInt(2, 5), c = randInt(2, 5);
    const bc = b * c;
    const a = randInt(bc + 1, bc + 20);
    const answer = a - bc;
    return { expression: `${a} - ${b} × ${c}`, answer };
  },
  // (a + b) × (c + d)
  () => {
    const a = randInt(2, 5), b = randInt(2, 5), c = randInt(2, 4), d = randInt(2, 4);
    const answer = (a + b) * (c + d);
    return { expression: `(${a} + ${b}) × (${c} + ${d})`, answer };
  },
  // a × b - c
  () => {
    const a = randInt(3, 9), b = randInt(3, 9);
    const c = randInt(1, a * b - 1);
    const answer = a * b - c;
    return { expression: `${a} × ${b} - ${c}`, answer };
  },
];

export function generatePEMDAS() {
  let result;
  let attempts = 0;
  do {
    const fn = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    result = fn();
    attempts++;
  } while (
    (result.answer <= 0 || result.answer > 200 || !Number.isInteger(result.answer)) &&
    attempts < 30
  );

  return {
    type: "pemdas",
    expression: result.expression,
    answer: result.answer,
    answerType: "integer",
    displayQuestion: result.expression,
    displayAnswer: String(result.answer),
    booster: maybeBooster(),
  };
}

// ─────────────────────────────────────────────
// EXPONENTS
// ─────────────────────────────────────────────

const PERFECT_SQUARES = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
const PERFECT_CUBES   = [8, 27, 64, 125, 216, 343];

export function generateExponent() {
  const kind = Math.random();

  if (kind < 0.45) {
    // Power: base^exp
    const base = randInt(2, 12);
    const exp  = randInt(2, 3);
    const answer = Math.pow(base, exp);
    return {
      type: "exponent_power",
      base, exp,
      answer,
      answerType: "integer",
      displayQuestion: `${base}^${exp}`,
      displayAnswer: String(answer),
      booster: maybeBooster(),
    };
  } else if (kind < 0.80) {
    // Square root of a perfect square
    const sq = PERFECT_SQUARES[Math.floor(Math.random() * PERFECT_SQUARES.length)];
    const answer = Math.round(Math.sqrt(sq));
    return {
      type: "exponent_sqrt",
      value: sq,
      rootDegree: 2,
      answer,
      answerType: "integer",
      displayQuestion: `√${sq}`,
      displayAnswer: String(answer),
      booster: maybeBooster(),
    };
  } else {
    // Cube root of a perfect cube
    const cu = PERFECT_CUBES[Math.floor(Math.random() * PERFECT_CUBES.length)];
    const answer = Math.round(Math.cbrt(cu));
    return {
      type: "exponent_sqrt",
      value: cu,
      rootDegree: 3,
      answer,
      answerType: "integer",
      displayQuestion: `³√${cu}`,
      displayAnswer: String(answer),
      booster: maybeBooster(),
    };
  }
}

// ─────────────────────────────────────────────
// ALGEBRA
// ─────────────────────────────────────────────

export function generateAlgebra() {
  // Form: a·x + b = c  →  x = (c - b) / a
  // Generate integer x first, then build the equation
  const a = randInt(1, 5);              // coefficient (≥1)
  const x = randInt(-10, 10);           // the answer
  const b = randInt(-12, 12);           // constant on left side
  const c = a * x + b;                  // right side

  let expression;
  if (a === 1 && b === 0) {
    expression = `x = ${c}`;
  } else if (a === 1) {
    expression = b > 0
      ? `x + ${b} = ${c}`
      : `x - ${Math.abs(b)} = ${c}`;
  } else if (b === 0) {
    expression = `${a}x = ${c}`;
  } else {
    expression = b > 0
      ? `${a}x + ${b} = ${c}`
      : `${a}x - ${Math.abs(b)} = ${c}`;
  }

  return {
    type: "algebra",
    a, b, c, x,
    expression,
    answer: x,
    answerType: "integer",
    displayQuestion: expression,
    displayAnswer: `x = ${x}`,
    booster: maybeBooster(),
  };
}
