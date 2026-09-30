/**
 * Signed session cookies: `<payload>.<signature>`, both base64url, the signature an HMAC-SHA256
 * of the payload with SESSION_SECRET. Web Crypto only, so the middleware (edge) and the pages
 * (Node.js) share this file.
 */
export const SESSION_COOKIE = "dispatch_session";
export const SESSION_DAYS = 14;

export type Session = { editorId: number; version: number; expires: number };

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function key(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function signSession(session: Session, secret: string): Promise<string> {
  const payload = base64url(encoder.encode(JSON.stringify(session)));
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", await key(secret), encoder.encode(payload)),
  );
  return `${payload}.${base64url(signature)}`;
}

/** The session in a cookie value, or null when it is missing, forged or expired. */
export async function verifySession(
  value: string | undefined,
  secret: string,
  now = Date.now(),
): Promise<Session | null> {
  if (!value || !secret) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await key(secret),
      fromBase64url(signature),
      encoder.encode(payload),
    );
    if (!ok) return null;
    const session = JSON.parse(new TextDecoder().decode(fromBase64url(payload))) as Session;
    if (typeof session.editorId !== "number" || typeof session.expires !== "number") return null;
    return session.expires > now ? session : null;
  } catch {
    return null;
  }
}
