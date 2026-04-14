const TURSO_URL = import.meta.env.VITE_TURSO_URL;
const TURSO_TOKEN = import.meta.env.VITE_TURSO_TOKEN;

/**
 * Execute one or more SQL statements via Turso's /v2/pipeline endpoint.
 * Automatically appends the required { type: 'close' } terminator.
 * @param {Array} requests - Array of { type: 'execute', stmt: { sql, args? } }
 */
export async function tursoQuery(requests) {
  if (!TURSO_URL || !TURSO_TOKEN) {
    throw new Error("Turso env vars not set. Add VITE_TURSO_URL and VITE_TURSO_TOKEN.");
  }
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [...requests, { type: "close" }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Turso ${res.status}: ${text}`);
  }
  return res.json();
}

/** Helper to build a typed argument (Turso requires values as strings). */
export function arg(type, value) {
  return { type, value: String(value) };
}
