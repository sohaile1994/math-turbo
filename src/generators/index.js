import { BoosterType } from "../enums";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybeBooster() {
  if (Math.random() > 0.12) return null;
  const roll = Math.random();
  if (roll < 0.40) return BoosterType.GRADE_FREEZE;
  if (roll < 0.70) return BoosterType.SCORE_BOOST;
  if (roll < 0.90) return BoosterType.EXTRA_LIFE;
  return BoosterType.DOUBLE_COMBO;
}

const BOOSTER_LABELS = {
  [BoosterType.GRADE_FREEZE]: "❄️ GRADE SHIELD",
  [BoosterType.EXTRA_LIFE]:   "❤️ EXTRA LIFE",
  [BoosterType.SCORE_BOOST]:  "⚡ SCORE BOOST",
  [BoosterType.DOUBLE_COMBO]: "🔥 DOUBLE COMBO",
};
export { BOOSTER_LABELS };

// ─────────────────────────────────────────────
// COUNTING  (score-based range)
//   0–4 999  : 1–5
//   5 000–9 999 : 1–10
//  10 000–14 999 : 1–15
//  15 000+  : 1–20
// ─────────────────────────────────────────────
const COUNTING_ITEMS = [
  "⚽","⭐","🍎","🎈","🌸","🦋","🍕","🎯","💎","🐸","🔥","🌈","🍦","🦄","🐶",
];

export function generateCounting(settings = {}) {
  const score = settings.score ?? 0;
  const perRow = score >= 25000 ? 10 : 5;
  const max = 5 + Math.floor(score / 1000);
  const count = randInt(1, max);
  const item  = pick(COUNTING_ITEMS);
  return {
    type: "counting", count, item, perRow,
    answer: count, answerType: "integer",
    displayQuestion: `How many ${item}?`, displayAnswer: String(count),
    booster: maybeBooster(),
  };
}

// ─────────────────────────────────────────────
// ARITHMETIC
// Both limits start at their base and grow by 1 every 2500 pts,
// alternating which limit increases (l1 goes first).
// × and ÷ cap at 12; + and − have no cap.
// ─────────────────────────────────────────────

function scaledLimits(score, base, cap = Infinity) {
  const steps = Math.floor(score / 2500);
  return [
    Math.min(cap, base + Math.ceil(steps / 2)),
    Math.min(cap, base + Math.floor(steps / 2)),
  ];
}

export function generateArithmetic(settings = {}) {
  const op    = settings.op ?? "+";
  const score = settings.score ?? 0;
  let a, b, answer;

  if (op === "+" || op === "-") {
    // Both limits grow together: +1 per 1000 pts, start at 9, no cap
    const hi = 9 + Math.floor(score / 1000);
    if (op === "+") {
      a = randInt(1, hi);
      b = randInt(1, hi);
      answer = a + b;
    } else {
      // Pick answer first (≥ 2) to avoid 0 or 1 results
      answer = randInt(2, hi);
      b      = randInt(1, hi);
      a      = answer + b;
    }
  } else {
    // l1 and l2 alternate growing every 2500 pts, start at 6, cap at 12
    const [l1, l2] = scaledLimits(score, 6, 12);
    if (op === "×") {
      a = randInt(2, l1);
      b = randInt(2, l2);
      answer = a * b;
    } else {
      b      = randInt(2, l1);
      answer = randInt(2, l2);
      a      = b * answer;
    }
  }

  return {
    type: "arithmetic", a, b, op,
    answer, answerType: "integer",
    displayQuestion: `${a} ${op} ${b}`, displayAnswer: String(answer),
    booster: maybeBooster(),
  };
}

// ─────────────────────────────────────────────
// PEMDAS  (score-based progression)
//   0–4 999   : 3 numbers, range 1–5, only + and −
//   5 000–9 999  : 3 numbers, range 1–5, add × and ÷ mixed with + / −
//  10 000–19 999 : range 1–9, same variety
//  20 000–29 999 : range 1–9, two multiplications or simple parens
//  30 000+   : range 1–9, full multi-step with parens
// ─────────────────────────────────────────────

// Tier 0 — 3 terms, range 1–5, only + / −
const PEMDAS_T0 = [
  () => { const [a,b,c]=[randInt(1,5),randInt(1,5),randInt(1,5)];                return { expr:`${a} + ${b} + ${c}`,   ans:a+b+c }; },
  () => { const a=randInt(2,5),b=randInt(1,a),c=randInt(1,5);                    return { expr:`${a} - ${b} + ${c}`,   ans:a-b+c }; },
  () => { const [a,b]=[randInt(2,5),randInt(1,5)],c=randInt(1,a+b);              return { expr:`${a} + ${b} - ${c}`,   ans:a+b-c }; },
  () => { const a=randInt(3,5),b=randInt(1,a-1),c=randInt(1,b);                  return { expr:`${a} - ${b} - ${c}`,   ans:a-b-c }; },
];

// Tier 1 — 3 terms, range 1–5, × or ÷ mixed with + / −
const PEMDAS_T1 = [
  ...PEMDAS_T0,
  () => { const [b,c,a]=[randInt(1,4),randInt(1,4),randInt(1,5)];                return { expr:`${a} + ${b} × ${c}`,   ans:a+b*c }; },
  () => { const [a,b,c]=[randInt(1,4),randInt(1,4),randInt(1,5)];                return { expr:`${a} × ${b} + ${c}`,   ans:a*b+c }; },
  () => { const b=randInt(1,3),c=randInt(1,3),bc=b*c,a=randInt(bc+1,bc+5);       return { expr:`${a} - ${b} × ${c}`,   ans:a-b*c }; },
  () => { const [a,b,c]=[randInt(1,4),randInt(1,4),randInt(1,4)];                return { expr:`${a} × ${b} - ${c}`,   ans:a*b-c }; },
];

// Tier 2 — range 1–9, one × or ÷ with + / −
const PEMDAS_T2 = [
  () => { const [a,b,c]=[randInt(1,9),randInt(1,9),randInt(1,9)];                return { expr:`${a} + ${b} + ${c}`,   ans:a+b+c }; },
  () => { const a=randInt(2,9),b=randInt(1,a),c=randInt(1,9);                    return { expr:`${a} - ${b} + ${c}`,   ans:a-b+c }; },
  () => { const [b,c,a]=[randInt(2,8),randInt(2,8),randInt(1,15)];               return { expr:`${a} + ${b} × ${c}`,   ans:a+b*c }; },
  () => { const [a,b,c]=[randInt(2,9),randInt(2,9),randInt(1,12)];               return { expr:`${a} × ${b} + ${c}`,   ans:a*b+c }; },
  () => { const b=randInt(2,5),c=randInt(2,5),bc=b*c,a=randInt(bc+1,bc+15);      return { expr:`${a} - ${b} × ${c}`,   ans:a-b*c }; },
  () => { const [a,b]=[randInt(3,9),randInt(3,9)],c=randInt(1,a*b-1);            return { expr:`${a} × ${b} - ${c}`,   ans:a*b-c }; },
  () => { const [a,b,c,d]=[randInt(1,9),randInt(2,7),randInt(2,7),randInt(1,8)]; return { expr:`${a} + ${b} × ${c} + ${d}`, ans:a+b*c+d }; },
];

// Tier 3 — range 1–9, two multiplications or simple parens
const PEMDAS_T3 = [
  ...PEMDAS_T2,
  () => { const [a,b,c]=[randInt(2,7),randInt(2,7),randInt(2,6)];                return { expr:`(${a} + ${b}) × ${c}`, ans:(a+b)*c }; },
  () => { const [a,b,c]=[randInt(2,7),randInt(2,6),randInt(2,6)];                return { expr:`${a} × (${b} + ${c})`, ans:a*(b+c) }; },
  () => { const [a,b,c,d]=[randInt(2,6),randInt(2,6),randInt(2,5),randInt(2,5)]; return { expr:`${a} × ${b} + ${c} × ${d}`, ans:a*b+c*d }; },
  () => { const [a,b,c,d]=[randInt(2,7),randInt(2,7),randInt(2,5),randInt(2,5)]; return { expr:`${a} × ${b} - ${c} × ${d}`, ans:a*b-c*d }; },
  () => { const [a,b,c,d]=[randInt(2,5),randInt(2,5),randInt(2,5),randInt(1,8)]; return { expr:`(${a} + ${b}) × ${c} + ${d}`, ans:(a+b)*c+d }; },
];

// Tier 4 — full parenthesised multi-step
const PEMDAS_T4 = [
  ...PEMDAS_T3,
  () => { const [a,b,c,d]=[randInt(2,5),randInt(2,5),randInt(2,4),randInt(2,4)]; return { expr:`(${a}+${b})×(${c}+${d})`,     ans:(a+b)*(c+d) }; },
  () => { const [a,b,c,d]=[randInt(2,5),randInt(2,5),randInt(3,5),randInt(1,3)]; return { expr:`(${a}+${b})×(${c}-${d})`,     ans:(a+b)*(c-d) }; },
  () => { const [a,b,c,d]=[randInt(2,4),randInt(2,4),randInt(2,4),randInt(2,4)]; return { expr:`(${a}×${b}) + (${c}×${d})`,   ans:a*b+c*d }; },
  () => { const [a,b,c,d]=[randInt(2,5),randInt(2,5),randInt(2,5),randInt(1,5)]; return { expr:`${a} × (${b} + ${c}) - ${d}`, ans:a*(b+c)-d }; },
  () => { const [a,b,c,d,e]=[randInt(2,5),randInt(2,5),randInt(2,4),randInt(2,4),randInt(1,8)]; return { expr:`${a}×${b} + ${c}×${d} - ${e}`, ans:a*b+c*d-e }; },
];

export function generatePEMDAS(settings = {}) {
  const score = settings.score ?? 0;
  let pool;
  if      (score >= 30000) pool = PEMDAS_T4;
  else if (score >= 20000) pool = PEMDAS_T3;
  else if (score >= 10000) pool = PEMDAS_T2;
  else if (score >= 5000)  pool = PEMDAS_T1;
  else                     pool = PEMDAS_T0;

  let result, tries = 0;
  do {
    result = pick(pool)();
    tries++;
  } while ((!Number.isInteger(result.ans) || result.ans <= 0 || result.ans > 9999) && tries < 40);

  return {
    type: "pemdas", expression: result.expr,
    answer: result.ans, answerType: "integer",
    displayQuestion: result.expr, displayAnswer: String(result.ans),
    booster: maybeBooster(),
  };
}

// ─────────────────────────────────────────────
// ALGEBRA — score-based tiers, limits scaled via scaledLimits()
//   coef : coefficient for ?x terms, cap 12
//   k    : constant values, no cap
// ─────────────────────────────────────────────

function xStr(a) { return a === 1 ? "x" : `${a}x`; }

function algTiers(coef, k) {
  const t0 = [
    () => { const b=randInt(1,k),   x=randInt(2,k),       c=x+b;     return { expression:`x + ${b} = ${c}`,               answer:x }; },
    () => { const b=randInt(1,k-1), x=randInt(b+2,k+b),   c=x-b;     return { expression:`x - ${b} = ${c}`,               answer:x }; },
    () => { const b=randInt(1,k),   x=randInt(2,k),       c=x+b;     return { expression:`${b} + x = ${c}`,               answer:x }; },
  ];
  const t1 = [
    ...t0,
    () => { const a=randInt(2,coef), x=randInt(2,k), c=a*x;          return { expression:`${xStr(a)} = ${c}`,             answer:x }; },
    () => { const a=randInt(2,coef), x=randInt(2,k), c=a*x;          return { expression:`${c} = ${xStr(a)}`,             answer:x }; },
  ];
  const t2 = [
    ...t1,
    () => { const a=randInt(2,coef), b=randInt(1,k), x=randInt(2,k), c=a*x+b;   return { expression:`${xStr(a)} + ${b} = ${c}`,       answer:x }; },
    () => { const a=randInt(2,coef), b=randInt(1,k), x=randInt(2,k), c=a*x-b;   return { expression:`${xStr(a)} - ${b} = ${c}`,       answer:x }; },
    () => { const a=randInt(2,coef), b=randInt(1,k), x=randInt(2,k), c=a*x+b;   return { expression:`${b} + ${xStr(a)} = ${c}`,       answer:x }; },
    () => { const a=randInt(2,coef), b=randInt(1,k), x=randInt(2,k), c=a*(x+b); return { expression:`${a}(x + ${b}) = ${c}`,          answer:x }; },
    () => { const a=randInt(2,coef), b=randInt(1,k), x=randInt(b+1,k+b), c=a*(x-b); return { expression:`${a}(x - ${b}) = ${c}`,     answer:x }; },
    () => { const a=randInt(2,coef-1), b=randInt(1,coef-a), x=randInt(2,k), c=(a+b)*x; return { expression:`${xStr(a)} + ${xStr(b)} = ${c}`, answer:x }; },
  ];
  const t3 = [
    ...t2,
    () => { const a=randInt(3,coef), b=randInt(1,a-1), c=randInt(1,k), x=randInt(2,k), rhs=(a-b)*x+c;       return { expression:`${xStr(a)} + ${c} - ${xStr(b)} = ${rhs}`,   answer:x }; },
    () => { const a=randInt(3,coef), b=randInt(1,a-1), x=randInt(2,k), d=randInt(1,k), e=d+(a-b)*x;         return { expression:`${xStr(a)} + ${d} = ${xStr(b)} + ${e}`,      answer:x }; },
    () => { const a=randInt(3,coef), b=randInt(1,a-1), c=randInt(1,k), x=randInt(2,k), rhs=(a-b)*x+c;       return { expression:`${xStr(a)} - ${xStr(b)} + ${c} = ${rhs}`,   answer:x }; },
    () => { const a=randInt(3,coef), b=randInt(1,a-1), x=randInt(2,k), e=randInt(1,k), d=e+(a-b)*x;         return { expression:`${xStr(a)} - ${d} = ${xStr(b)} - ${e}`,      answer:x }; },
  ];
  return { t0, t1, t2, t3 };
}

export function generateAlgebra(settings = {}) {
  const score = settings.score ?? 0;
  const [coef, k] = [scaledLimits(score, 2, 12)[0], scaledLimits(score, 5)[0]];
  const { t0, t1, t2, t3 } = algTiers(coef, k);

  let pool;
  if      (score >= 25000) pool = [...t2, ...t3, ...t3];
  else if (score >= 10000) pool = t2;
  else if (score >= 5000)  pool = t1;
  else                     pool = t0;

  let res, tries = 0;
  do {
    res = pick(pool)();
    tries++;
  } while ((!Number.isInteger(res.answer) || res.answer < 1 || res.answer > 99) && tries < 40);

  return {
    type: "algebra",
    expression: res.expression,
    answer: res.answer,
    answerType: "integer",
    displayQuestion: res.expression,
    displayAnswer: `x = ${res.answer}`,
    booster: maybeBooster(),
  };
}

// ─────────────────────────────────────────────
// EXPONENTS  (powers · roots · rules · sci notation)
// ─────────────────────────────────────────────

const PERFECT_SQUARES = [1,4,9,16,25,36,49,64,81,100,121,144,169,196,225];
const PERFECT_CUBES   = [8,27,64,125,216,343];

// Basic power: 8^2 = ?
function genPower() {
  const base=randInt(2,12), exp=randInt(2,3), answer=Math.pow(base,exp);
  return {
    type:"exponent_power", base, exp,
    answer, answerType:"integer",
    displayQuestion:`${base}^${exp}`, displayAnswer:String(answer),
    booster:maybeBooster(),
  };
}

// Square root of perfect square
function genSqrt() {
  const sq=pick(PERFECT_SQUARES), answer=Math.round(Math.sqrt(sq));
  return {
    type:"exponent_sqrt", value:sq, rootDegree:2,
    answer, answerType:"integer",
    displayQuestion:`√${sq}`, displayAnswer:String(answer),
    booster:maybeBooster(),
  };
}

// Cube root of perfect cube
function genCbrt() {
  const cu=pick(PERFECT_CUBES), answer=Math.round(Math.cbrt(cu));
  return {
    type:"exponent_sqrt", value:cu, rootDegree:3,
    answer, answerType:"integer",
    displayQuestion:`³√${cu}`, displayAnswer:String(answer),
    booster:maybeBooster(),
  };
}

// Exponent product rule: a^m × a^n = a^?  →  answer = m+n
function genRuleProduct() {
  const base=randInt(2,9), m=randInt(2,5), n=randInt(2,5);
  const answer=m+n;
  return {
    type:"exponent_rule", subtype:"product",
    base, exp1:m, exp2:n, op:"×",
    answer, answerType:"integer",
    displayQuestion:`${base}^${m} × ${base}^${n} = ${base}^?`,
    displayAnswer:String(answer),
    booster:maybeBooster(),
  };
}

// Exponent quotient rule: a^m ÷ a^n = a^?  →  answer = m-n
function genRuleQuotient() {
  const base=randInt(2,9), n=randInt(2,4), m=n+randInt(1,4);
  const answer=m-n;
  return {
    type:"exponent_rule", subtype:"quotient",
    base, exp1:m, exp2:n, op:"÷",
    answer, answerType:"integer",
    displayQuestion:`${base}^${m} ÷ ${base}^${n} = ${base}^?`,
    displayAnswer:String(answer),
    booster:maybeBooster(),
  };
}

// Scientific notation arithmetic: a×10^m ± b×10^n = ?
function genSciArith() {
  const op = Math.random() < 0.5 ? "+" : "-";
  // Use same or adjacent powers to keep answer clean
  const useSamePower = Math.random() < 0.5;

  let coeff1, power1, coeff2, power2, answer;

  if (useSamePower) {
    power1 = randInt(1, 3);
    power2 = power1;
    coeff1 = randInt(2, 9);
    coeff2 = randInt(1, op==="-" ? coeff1-1 : 9);
    const base = Math.pow(10, power1);
    answer = op === "+" ? (coeff1+coeff2)*base : (coeff1-coeff2)*base;
  } else {
    // Adjacent: power1 = power2 + 1  →  answer may not be round 10^ but still integer
    power2 = randInt(1, 2);
    power1 = power2 + 1;
    coeff1 = randInt(1, 9);
    coeff2 = randInt(1, 9);
    const v1=coeff1*Math.pow(10,power1), v2=coeff2*Math.pow(10,power2);
    answer = op === "+" ? v1+v2 : (v1>v2 ? v1-v2 : v2-v1);
    if (op === "-" && v2 > v1) { [coeff1,power1,coeff2,power2]=[coeff2,power2,coeff1,power1]; }
  }

  if (answer <= 0) return genSciArith(); // retry

  return {
    type:"sci_notation", subtype:"arith",
    coeff1, power1, op, coeff2, power2,
    answer, answerType:"integer",
    displayQuestion:`${coeff1}×10^${power1} ${op} ${coeff2}×10^${power2}`,
    displayAnswer:String(answer),
    booster:maybeBooster(),
  };
}

// Scientific notation multiply: (a×10^m) × (b×10^n) = ?
function genSciMultiply() {
  let coeff1, coeff2, power1, power2, answer;
  let tries = 0;
  do {
    coeff1 = randInt(2, 9);
    coeff2 = randInt(2, 9);
    power1 = randInt(1, 2);
    power2 = randInt(1, 2);
    answer = coeff1 * coeff2 * Math.pow(10, power1+power2);
    tries++;
  } while (answer > 99999 && tries < 20);

  return {
    type:"sci_notation", subtype:"multiply",
    coeff1, power1, op:"×", coeff2, power2,
    answer, answerType:"integer",
    displayQuestion:`(${coeff1}×10^${power1}) × (${coeff2}×10^${power2})`,
    displayAnswer:String(answer),
    booster:maybeBooster(),
  };
}

// Scientific notation divide: (a×10^m) ÷ (b×10^n) = ?  (clean integer result)
function genSciDivide() {
  const power2  = randInt(1, 2);
  const power1  = power2 + randInt(1, 2);        // power1 > power2
  const coeff2  = randInt(2, 5);
  const quotient = randInt(2, 9);
  const coeff1  = coeff2 * quotient;             // ensures clean division
  const answer  = quotient * Math.pow(10, power1-power2);

  return {
    type:"sci_notation", subtype:"divide",
    coeff1, power1, op:"÷", coeff2, power2,
    answer, answerType:"integer",
    displayQuestion:`(${coeff1}×10^${power1}) ÷ (${coeff2}×10^${power2})`,
    displayAnswer:String(answer),
    booster:maybeBooster(),
  };
}

const EXPONENT_GENERATORS = [
  genPower, genPower,          // weighted higher — most common
  genSqrt, genCbrt,
  genRuleProduct, genRuleQuotient,
  genSciArith, genSciArith,    // weighted higher
  genSciMultiply, genSciDivide,
];

export function generateExponent() {
  return pick(EXPONENT_GENERATORS)();
}
