/**
 * Check whether a user's string input matches the correct answer for a problem.
 * Returns true if correct, false otherwise.
 */
export function checkAnswer(problem, userInput) {
  const trimmed = String(userInput ?? "").trim();
  if (!trimmed) return false;

  switch (problem.answerType) {
    case "integer": {
      const num = parseInt(trimmed, 10);
      if (isNaN(num)) return false;
      // Reject if the trimmed string has non-numeric chars (beyond a leading minus)
      if (!/^-?\d+$/.test(trimmed)) return false;
      return num === problem.answer;
    }

    case "decimal": {
      const num = parseFloat(trimmed);
      if (isNaN(num)) return false;
      return Math.abs(num - problem.answer) < 0.001;
    }

    case "ratio": {
      // Accept "a:b" — compare as simplified ratio
      const parts = trimmed.split(":");
      if (parts.length !== 2) return false;
      const [ua, ub] = parts.map(s => parseInt(s.trim(), 10));
      if (isNaN(ua) || isNaN(ub) || ub === 0) return false;
      const [ca, cb] = problem.answer; // stored as [numerator, denominator]
      // Cross multiply to compare without floating point issues
      return ua * cb === ub * ca;
    }

    default: {
      const num = parseFloat(trimmed);
      if (isNaN(num)) return false;
      return Math.abs(num - problem.answer) < 0.001;
    }
  }
}

/**
 * Return the correct answer formatted as a display string.
 */
export function formatCorrectAnswer(problem) {
  if (problem.answerType === "ratio") {
    const [a, b] = problem.answer;
    return `${a}:${b}`;
  }
  return problem.displayAnswer ?? String(problem.answer);
}
