// AES-256-GCM field encryption for student PII stored in Turso.
// The key lives in client JS — this provides DB-at-rest obscuration,
// not cryptographic secrecy against an attacker who has the source code.

const SECRET = "ZenithMathTurbo-2024-FieldKey!";
const SALT   = new Uint8Array([90,105,110,100,77,84,50,48,50,52,75,101,121,83,108,116]);
// Fixed 12-byte IV used only for username so the same email always produces
// the same ciphertext, enabling SQL equality lookup (WHERE username = ?).
const DET_IV = new Uint8Array([90,101,110,82,97,110,100,73,86,48,48,49]);

let _key = null;

async function getKey() {
  if (_key) return _key;
  const raw = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(SECRET), "PBKDF2", false, ["deriveKey"]
  );
  _key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: SALT, iterations: 50_000, hash: "SHA-256" },
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return _key;
}

function toB64(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function fromB64(s) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }

export function isEncrypted(v) {
  return typeof v === "string" && (v.startsWith("enc:") || v.startsWith("det:"));
}

// Random-IV AES-GCM for display_name — different ciphertext each call.
export async function encryptField(plaintext) {
  if (!plaintext) return plaintext;
  const k  = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(plaintext));
  return `enc:${toB64(iv)}:${toB64(ct)}`;
}

// Fixed-IV AES-GCM for username — same input always produces same output.
export async function encryptUsername(plaintext) {
  if (!plaintext) return plaintext;
  const k  = await getKey();
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: DET_IV }, k,
    new TextEncoder().encode(plaintext.trim().toLowerCase())
  );
  return `det:${toB64(ct)}`;
}

export async function decryptField(value) {
  if (!isEncrypted(value)) return value ?? "";
  const k = await getKey();
  try {
    if (value.startsWith("det:")) {
      const ct  = fromB64(value.slice(4));
      const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv: DET_IV }, k, ct);
      return new TextDecoder().decode(dec);
    }
    // format: enc:<ivB64>:<ctB64>
    const rest = value.slice(4);
    const sep  = rest.indexOf(":");
    const iv   = fromB64(rest.slice(0, sep));
    const ct   = fromB64(rest.slice(sep + 1));
    const dec  = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, k, ct);
    return new TextDecoder().decode(dec);
  } catch {
    return value; // plaintext fallback — never crash on bad data
  }
}
