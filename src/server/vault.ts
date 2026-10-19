// Lato server del gestionale: database, archivio file, accesso admin, email.
// Gira solo dentro il Worker Cloudflare (binding DB, FILES e segreti).
import { env as cfEnv } from "cloudflare:workers";

export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
  ADMIN_PASSWORD?: string;
  BREVO_API_KEY?: string;
  SITE_URL?: string;
  MAIL_FROM?: string;
  MAIL_FROM_NAME?: string;
  MAIL_ADMIN?: string;
}
export const env = cfEnv as unknown as Env;

export const STATUSES = [
  ["nuovo", "Nuovo"],
  ["in_lavorazione", "In lavorazione"],
  ["bozza_inviata", "Attesa pagamento"],
  ["approvato", "Pronto per la stampa"],
  ["in_stampa", "In stampa"],
  ["spedito", "Spedito"],
  ["consegnato", "Consegnato"],
  ["annullato", "Annullato"],
  ["storico", "Storico (importato)"],
] as const;
export const STATUS_KEYS = STATUSES.map((s) => s[0]) as string[];

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
export const bad = (msg: string, status = 400) => json({ error: msg }, status);
export const nowIso = () => new Date().toISOString();

/* ---------------- accesso admin ---------------- */

const COOKIE = "vault_admin";
const enc = new TextEncoder();
async function hmac(data: string) {
  const secret = env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD mancante");
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode("vault-admin:" + secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(
    /[+/=]/g,
    (c) => ({ "+": "-", "/": "_", "=": "" })[c]!,
  );
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
export async function checkPassword(pw: string) {
  const real = env.ADMIN_PASSWORD;
  if (!real) return false;
  return safeEqual(await hmac("pw:" + pw), await hmac("pw:" + real));
}
export async function sessionCookie(remember = true) {
  const exp = Date.now() + (remember ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 12); // 30 giorni o 12 ore
  const v = `${exp}.${await hmac("s:" + exp)}`;
  return `${COOKIE}=${v}; Path=/; HttpOnly; Secure; SameSite=Lax${remember ? `; Max-Age=${60 * 60 * 24 * 30}` : ""}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export async function isAdmin(req: Request) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = (req.headers.get("cookie") ?? "").match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = m[1].split(".");
  if (!exp || !sig || +exp < Date.now()) return false;
  return safeEqual(sig, await hmac("s:" + exp));
}
export async function requireAdmin(req: Request) {
  return (await isAdmin(req)) ? null : bad("Accesso non autorizzato", 401);
}

/* ---------------- file ---------------- */

export function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
export function bytesToB64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
export const safeName = (n: string) =>
  n
    .normalize("NFD")
    .replace(/[^\w.-]+/g, "_")
    .slice(-80) || "file";

/* ---------------- email (Brevo) ---------------- */

export async function sendMail(opts: {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
  replyTo?: { email: string; name?: string };
  attachment?: { name: string; content: string }[];
}) {
  if (!env.BREVO_API_KEY) return { ok: false, skipped: true, error: "BREVO_API_KEY mancante" };
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: env.MAIL_FROM ?? "ordini@vaultcrafted.com",
        name: env.MAIL_FROM_NAME ?? "Vault Crafted",
      },
      to: opts.to,
      subject: opts.subject,
      htmlContent: opts.html,
      replyTo: opts.replyTo ?? {
        email: env.MAIL_ADMIN ?? "vaultcrafted@gmail.com",
        name: "Vault Crafted",
      },
      attachment: opts.attachment,
    }),
  });
  if (!r.ok) {
    const error = `${r.status} ${(await r.text()).slice(0, 300)}`;
    console.error("Brevo", error);
    return { ok: false, skipped: false, error };
  }
  return { ok: true, skipped: false };
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
export const pad3 = (n: number | null) => (n == null ? "—" : String(n).padStart(3, "0"));

export function mailLayout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#E9EAEF;font-family:Arial,Helvetica,sans-serif;color:#141A3A">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden">
<tr><td style="background:#141A3A;padding:18px 24px"><img src="${env.SITE_URL ?? "https://vaultcrafted.com"}/LOGO.png" alt="Vault Crafted" height="34"></td></tr>
<tr><td style="padding:24px"><h1 style="margin:0 0 12px;font-size:24px">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:14px 24px;background:#F4F5F8;font-size:12px;color:#5A5D6B">Vault Crafted · carte da collezione personalizzate · vaultcrafted.com</td></tr>
</table></td></tr></table></body></html>`;
}
export function rows(pairs: [string, string][]) {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse">${pairs
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#5A5D6B;width:40%;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;font-weight:bold">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`;
}
export { esc };
