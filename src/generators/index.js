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
// COUNTING
// ─────────────────────────────────────────────
const COUNTING_ITEMS = [
  "⚽","⭐","🍎","🎈","🌸","🦋","🍕","🎯","💎","🐸","🔥","🌈","🍦","🦄","🐶",
];

export function generateCounting() {
  const count = randInt(1, 12);
  const item  = pick(COUNTING_ITEMS);
  return {
    type: "counting", count, item,
    answer: count, answerType: "integer",
    displayQuestion: `How many ${item}?`, displayAnswer: String(count),
    booster: maybeBooster(),
  };
}

// ─────────────────────────────────────────────
// ARITHMETIC
// ─────────────────────────────────────────────
export function generateArithmetic(settings = {}) {
  const ops       = settings.selectedOps?.length ? settings.selectedOps : ["+","-","×","÷"];
  const allowNeg  = settings.allowNegatives ?? false;
  const allowDec  = settings.allowDecimals  ?? false;
  const op        = pick(ops);
  let a, b, answer, answerType = "integer";

  switch (op) {
    case "+":
      a = randInt(2, 30);
      b = randInt(2, 30);
      if (allowNeg && Math.random() < 0.4) b *= -1;
      answer = a + b;
      break;

    case "-":
      a = randInt(5, 40);
      b = randInt(1, a);
      if (allowNeg && Math.random() < 0.4) { b = randInt(1, 30); }
      answer = a - b;
      break;

    case "×":
      a = randInt(2, 12);
      b = randInt(2, 12);
      if (allowNeg && Math.random() < 0.4) b *= -1;
      answer = a * b;
      break;

    case "÷":
      if (allowDec) {
        // Allow .5 answers: pick even divisor and numerator
        b      = pick([2, 4, 5, 8, 10]);
        answer = randInt(1, 20) + (Math.random() < 0.5 ? 0.5 : 0);
        a      = b * answer;
        answerType = Number.isInteger(answer) ? "integer" : "decimal";
      } else {
        b      = randInt(2, 12);
        answer = randInt(2, 12);
        a      = b * answer;
      }
      break;

    default:
      a = 1; b = 1; answer = 2;
  }

  return {
    type: "arithmetic", a, b, op,
    answer, answerType,
    displayQuestion: `${a} ${op} ${b}`, displayAnswer: String(answer),
    booster: maybeBooster(),
  };
}

// ─────────────────────────────────────────────
// PEMDAS
// ─────────────────────────────────────────────
const PEMDAS_TEMPLATES = [
  () => { const [b,c,a]=[randInt(2,9),randInt(2,9),randInt(1,20)]; return { expr:`${a} + ${b} × ${c}`, ans:a+b*c }; },
  () => { const [a,b,c]=[randInt(2,8),randInt(2,8),randInt(2,7)];  return { expr:`(${a} + ${b}) × ${c}`, ans:(a+b)*c }; },
  () => { const [a,b,c]=[randInt(2,9),randInt(2,9),randInt(1,15)]; return { expr:`${a} × ${b} + ${c}`, ans:a*b+c }; },
  () => { const [a,b,c]=[randInt(2,8),randInt(2,7),randInt(2,7)];  return { expr:`${a} × (${b} + ${c})`, ans:a*(b+c) }; },
  () => { const b=randInt(2,5),c=randInt(2,5),bc=b*c,a=randInt(bc+1,bc+20); return { expr:`${a} - ${b} × ${c}`, ans:a-bc }; },
  () => { const [a,b,c,d]=[randInt(2,5),randInt(2,5),randInt(2,4),randInt(2,4)]; return { expr:`(${a}+${b})×(${c}+${d})`, ans:(a+b)*(c+d) }; },
  () => { const [a,b]=[randInt(3,9),randInt(3,9)], c=randInt(1,a*b-1); return { expr:`${a} × ${b} - ${c}`, ans:a*b-c }; },
];

export function generatePEMDAS() {
  let result; let tries = 0;
  do {
    const t = pick(PEMDAS_TEMPLATES)();
    result = t; tries++;
  } while ((!Number.isInteger(result.ans) || result.ans <= 0 || result.ans > 200) && tries < 30);

  return {
    type: "pemdas", expression: result.expr,
    answer: result.ans, answerType: "integer",
    displayQuestion: result.expr, displayAnswer: String(result.ans),
    booster: maybeBooster(),
  };
}

// ─────────────────────────────────────────────
// ALGEBRA — 10 templates across 3 difficulties
// ─────────────────────────────────────────────

/** Build left-hand side string from a coefficient and optional constant */
function lhs(a, b) {
  const xPart = a === 1 ? "x" : `${a}x`;
  if (b === 0) return xPart;
  if (b > 0)   return `${xPart} + ${b}`;
  return `${xPart} - ${Math.abs(b)}`;
}

// ── Easy templates ───────────────────────────
const A_EASY = [
  // t1: ax + b = c  (x positive, a ≤ 3)
  (neg) => { const a=randInt(1,3), x=randInt(neg?-8:1,10), b=randInt(-8,8), c=a*x+b; return { expression:`${lhs(a,b)} = ${c}`, answer:x }; },
  // t2: ax - b = c
  (neg) => { const a=randInt(1,3), x=randInt(neg?-8:1,10), b=randInt(1,10), c=a*x-b; return { expression:`${lhs(a,-b)} = ${c}`, answer:x }; },
  // t3: ax = c
  (neg) => { const a=randInt(2,6), x=randInt(neg?-8:1,10), c=a*x; return { expression:`${a}x = ${c}`, answer:x }; },
  // t4: x + b = c  (a=1)
  (neg) => { const x=randInt(neg?-8:1,15), b=randInt(1,10), c=x+b; return { expression:`x + ${b} = ${c}`, answer:x }; },
];

// ── Medium templates ─────────────────────────
const A_MEDIUM = [
  ...A_EASY,
  // t5: ax + bx = c  (combine like terms, multiple x)
  (neg) => { const a=randInt(2,5), b=randInt(1,4), x=randInt(neg?-6:1,8), c=(a+b)*x; return { expression:`${a}x + ${b}x = ${c}`, answer:x }; },
  // t6: ax - bx = c  (a > b)
  (neg) => { const a=randInt(3,7), b=randInt(1,a-1), x=randInt(neg?-6:1,8), c=(a-b)*x; return { expression:`${a}x - ${b}x = ${c}`, answer:x }; },
  // t7: x / a = b
  () => { const a=randInt(2,6), b=randInt(2,10), x=a*b; return { expression:`x ÷ ${a} = ${b}`, answer:x }; },
];

// ── Hard templates ───────────────────────────
const A_HARD = [
  ...A_MEDIUM,
  // t8: ax + b = cx + d  (variables on both sides, a > c)
  (neg) => {
    const a=randInt(3,6), c=randInt(1,a-1), x=randInt(neg?-6:1,8);
    const b=randInt(-6,6), d=b+(a-c)*x;
    const right = c===1 ? (d>=0?`x + ${d}`:`x - ${Math.abs(d)}`) : (d>=0?`${c}x + ${d}`:`${c}x - ${Math.abs(d)}`);
    return { expression:`${lhs(a,b)} = ${right}`, answer:x };
  },
  // t9: a(x + b) = c  (distributive)
  (neg) => {
    const a=randInt(2,5), b=randInt(1,6), x=randInt(neg?-6:1,8), c=a*(x+b);
    return { expression:`${a}(x + ${b}) = ${c}`, answer:x };
  },
  // t10: x / a + b = c
  () => {
    const a=randInt(2,5), b=randInt(1,8), x=randInt(2,12)*a; // x divisible by a
    const c=x/a+b;
    return { expression:`x ÷ ${a} + ${b} = ${c}`, answer:x };
  },
];

export function generateAlgebra(settings = {}) {
  const { difficulty = "medium", allowNegatives = false } = settings;
  const pool = difficulty === "easy" ? A_EASY : difficulty === "hard" ? A_HARD : A_MEDIUM;
  const fn   = pick(pool);
  const res  = fn(allowNegatives);

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
