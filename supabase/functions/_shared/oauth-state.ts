// HMAC-signed OAuth state to prevent state forgery / account-linking attacks.
// The state encodes { user_id, ts } and is signed with WEBHOOK_SECRET so the
// callbacks can verify it was issued by oauth-start and was not tampered with.

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function getSecret(): string {
  const s = Deno.env.get("WEBHOOK_SECRET") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!s) throw new Error("OAuth state signing secret not configured");
  return s;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export interface OAuthStatePayload {
  user_id: string;
  ts: number;
}

// Sign and encode an OAuth state value as `<payloadB64Url>.<sigB64Url>`.
export async function signState(payload: OAuthStatePayload): Promise<string> {
  const json = JSON.stringify(payload);
  const payloadB64 = b64urlEncode(enc.encode(json));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  return `${payloadB64}.${b64urlEncode(new Uint8Array(sig))}`;
}

// Verify an OAuth state value and return the embedded payload.
// Throws if the signature is invalid, malformed, or older than `maxAgeMs`.
export async function verifyState(
  state: string,
  maxAgeMs = 15 * 60 * 1000, // 15 minutes
): Promise<OAuthStatePayload> {
  if (!state || typeof state !== "string") throw new Error("invalid_state");
  const parts = state.split(".");
  if (parts.length !== 2) throw new Error("invalid_state");
  const [payloadB64, sigB64] = parts;
  const sigBytes = b64urlDecode(sigB64);
  const key = await hmacKey();
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength) as ArrayBuffer,
    enc.encode(payloadB64),
  );
  if (!ok) throw new Error("invalid_state_signature");

  let payload: OAuthStatePayload;
  try {
    payload = JSON.parse(dec.decode(b64urlDecode(payloadB64)));
  } catch {
    throw new Error("invalid_state_payload");
  }
  if (!payload.user_id || typeof payload.user_id !== "string") {
    throw new Error("invalid_state_payload");
  }
  if (typeof payload.ts !== "number" || Date.now() - payload.ts > maxAgeMs) {
    throw new Error("state_expired");
  }
  return payload;
}
