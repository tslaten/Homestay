/**
 * Small signed tokens for cookies: `base64url(json).base64url(hmac)`.
 *
 * Used by proxy.ts and server code alike, so it only relies on Web Crypto and
 * Buffer (both available in the Node.js runtime) and has no `server-only`.
 *
 * The signing key comes from SESSION_SECRET if set, otherwise ADMIN_PASSWORD.
 * Changing whichever is in use signs everyone out and unpairs every device.
 */

export const COOKIE = {
  admin: "hs_admin",
  device: "hs_device",
  pair: "hs_pair",
} as const;

export type TokenPayload =
  | { typ: "admin"; exp: number }
  | { typ: "device"; d: string; exp: number }
  | { typ: "pair"; p: string; exp: number };

type PayloadOf<T extends TokenPayload["typ"]> = Extract<TokenPayload, { typ: T }>;

/** True once the host has set ADMIN_PASSWORD; without it nobody can sign in or pair. */
export function authConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

const encoder = new TextEncoder();
let cachedKey: { secret: string; key: Promise<CryptoKey> } | undefined;

function signingKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD is not set");
  if (cachedKey?.secret !== secret) {
    cachedKey = {
      secret,
      key: crypto.subtle.importKey(
        "raw",
        encoder.encode(`homestay:v1:${secret}`),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
      ),
    };
  }
  return cachedKey.key;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(body));
  return `${body}.${Buffer.from(sig).toString("base64url")}`;
}

/** Returns the payload if the token is authentic, unexpired and of the expected type. */
export async function verifyToken<T extends TokenPayload["typ"]>(
  token: string | undefined,
  typ: T,
): Promise<PayloadOf<T> | null> {
  if (!token || !authConfigured()) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await signingKey(),
      Buffer.from(sig, "base64url"),
      encoder.encode(body),
    );
    if (!ok) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as TokenPayload;
    if (payload.typ !== typ || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload as PayloadOf<T>;
  } catch {
    return null;
  }
}

export const DAY_MS = 24 * 60 * 60 * 1000;
