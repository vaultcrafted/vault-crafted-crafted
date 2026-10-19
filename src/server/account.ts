// Area clienti: tabelle, password, sessione e utilità condivise dalle API /api/account/*.
import { bad, env, esc, mailLayout, nowIso, sendMail } from "@/server/vault";

/* ---------------- schema (creato al primo uso, senza migrazioni manuali) ---------------- */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    pass TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email_verified INTEGER NOT NULL DEFAULT 0,
    sess_ver INTEGER NOT NULL DEFAULT 1,
    failed INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    recipient TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS addresses_customer ON addresses(customer_id)`,
  `CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    card_json TEXT NOT NULL DEFAULT '{}',
    art_pos TEXT NOT NULL DEFAULT '{"zoom":1,"px":0,"py":0}',
    custodia TEXT NOT NULL DEFAULT 'nessuna',
    photo_key TEXT NOT NULL DEFAULT '',
    photo_name TEXT NOT NULL DEFAULT '',
    photo_type TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS drafts_customer ON drafts(customer_id)`,
  `CREATE TABLE IF NOT EXISTS tokens (
    hash TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )`,
];

let ready: Promise<void> | null = null;
export function ensureSchema() {
  ready ??= (async () => {
    await env.DB.batch(SCHEMA.map((q) => env.DB.prepare(q)));
    const cols = await env.DB.prepare("PRAGMA table_info(orders)").all<{ name: string }>();
    const have = new Set(cols.results.map((c) => c.name));
    if (!have.has("customer_id")) {
      await env.DB.prepare("ALTER TABLE orders ADD COLUMN customer_id TEXT NOT NULL DEFAULT ''").run();
      await env.DB.prepare("CREATE INDEX IF NOT EXISTS orders_customer ON orders(customer_id)").run();
    }
    // omaggio: carta regalata (non pagata ma neanche da incassare)
    if (!have.has("gift")) await env.DB.prepare("ALTER TABLE orders ADD COLUMN gift INTEGER NOT NULL DEFAULT 0").run();
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

/* ---------------- password (PBKDF2 con sale casuale) ---------------- */

const enc = new TextEncoder();
const ITER = 50000;
const b64u = (b: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(b))).replace(
    /[+/=]/g,
    (c) => ({ "+": "-", "/": "_", "=": "" })[c]!,
  );
const fromB64u = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
async function derive(pw: string, salt: Uint8Array, iter: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: iter }, key, 256);
}
export async function hashPassword(pw: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITER}$${b64u(salt)}$${b64u(await derive(pw, salt, ITER))}`;
}
export async function verifyPassword(pw: string, stored: string) {
  const [alg, it, salt, hash] = stored.split("$");
  if (alg !== "pbkdf2" || !salt || !hash) return false;
  const got = b64u(await derive(pw, fromB64u(salt), +it || ITER));
  return safeEqual(got, hash);
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
export function passwordProblem(pw: string) {
  if (typeof pw !== "string" || pw.length < 8) return "La password deve avere almeno 8 caratteri";
  if (pw.length > 200) return "Password troppo lunga";
  return "";
}

/* ---------------- sessione cliente (cookie firmato) ---------------- */

const COOKIE = "vault_cliente";
const DAYS = 60;
async function sign(data: string) {
  const secret = env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Segreto mancante");
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode("vault-cliente:" + secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return b64u(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}
/** remember = false: il cookie sparisce alla chiusura del browser (e scade comunque in 1 giorno). */
export async function customerCookie(id: string, ver: number, remember = true) {
  const exp = Date.now() + (remember ? DAYS * 864e5 : 864e5);
  const payload = `${id}.${ver}.${exp}`;
  return `${COOKIE}=${payload}.${await sign(payload)}; Path=/; HttpOnly; Secure; SameSite=Lax${remember ? `; Max-Age=${DAYS * 86400}` : ""}`;
}
export const clearCustomerCookie = () =>
  `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  email_verified: number;
  sess_ver: number;
  created_at: string;
}

export async function getCustomer(req: Request): Promise<Customer | null> {
  const m = (req.headers.get("cookie") ?? "").match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!m) return null;
  const [id, ver, exp, sig] = m[1].split(".");
  if (!id || !ver || !exp || !sig || +exp < Date.now()) return null;
  if (!safeEqual(sig, await sign(`${id}.${ver}.${exp}`))) return null;
  await ensureSchema();
  const c = await env.DB.prepare(
    "SELECT id, email, name, phone, email_verified, sess_ver, created_at FROM customers WHERE id = ?",
  )
    .bind(id)
    .first<Customer>();
  if (!c || String(c.sess_ver) !== ver) return null;
  return c;
}

/** Restituisce il cliente o una risposta 401 pronta. */
export async function needCustomer(req: Request) {
  const c = await getCustomer(req);
  return c ? { c, deny: null } : { c: null, deny: bad("Accedi per continuare", 401) };
}

export const publicCustomer = (c: Customer) => ({
  id: c.id,
  email: c.email,
  name: c.name,
  phone: c.phone,
  verified: !!c.email_verified,
  since: c.created_at,
});

/* ---------------- token monouso (verifica email, reset password) ---------------- */

async function sha(s: string) {
  return b64u(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}
export async function newToken(customerId: string, kind: "verify" | "reset", hours: number) {
  const raw = b64u(crypto.getRandomValues(new Uint8Array(24)));
  await env.DB.prepare("DELETE FROM tokens WHERE customer_id = ? AND kind = ?").bind(customerId, kind).run();
  await env.DB.prepare("INSERT INTO tokens (hash, customer_id, kind, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sha(raw), customerId, kind, new Date(Date.now() + hours * 36e5).toISOString())
    .run();
  return raw;
}
export async function useToken(raw: string, kind: "verify" | "reset") {
  if (!raw || raw.length > 100) return null;
  const h = await sha(raw);
  const t = await env.DB.prepare("SELECT customer_id, expires_at FROM tokens WHERE hash = ? AND kind = ?")
    .bind(h, kind)
    .first<{ customer_id: string; expires_at: string }>();
  if (!t) return null;
  await env.DB.prepare("DELETE FROM tokens WHERE hash = ?").bind(h).run();
  return t.expires_at > nowIso() ? t.customer_id : null;
}

const site = () => env.SITE_URL ?? "https://vaultcrafted.com";
const button = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${href}" style="display:inline-block;background:#141A3A;color:#fff;padding:13px 20px;border-radius:10px;text-decoration:none;font-weight:bold">${label}</a></p>`;

export async function sendVerifyMail(c: { id: string; email: string; name: string }) {
  const t = await newToken(c.id, "verify", 72);
  return sendMail({
    to: [{ email: c.email, name: c.name }],
    subject: "Conferma la tua email — Vault Crafted",
    html: mailLayout(
      "Benvenuto nel Vault!",
      `<p>Ciao ${esc(c.name.split(" ")[0] || "")}, conferma la tua email per collegare al tuo account tutti gli ordini fatti con questo indirizzo.</p>${button(
        `${site()}/api/account/verifica?t=${encodeURIComponent(t)}`,
        "Conferma email",
      )}<p style="font-size:13px;color:#5A5D6B">Il link vale 3 giorni. Se non hai creato tu l'account, ignora questa email.</p>`,
    ),
  });
}

export async function sendResetMail(c: { id: string; email: string; name: string }) {
  const t = await newToken(c.id, "reset", 2);
  return sendMail({
    to: [{ email: c.email, name: c.name }],
    subject: "Reimposta la password — Vault Crafted",
    html: mailLayout(
      "Nuova password",
      `<p>Hai chiesto di reimpostare la password del tuo account Vault Crafted.</p>${button(
        `${site()}/account/password?t=${encodeURIComponent(t)}`,
        "Scegli una nuova password",
      )}<p style="font-size:13px;color:#5A5D6B">Il link vale 2 ore. Se non l'hai chiesto tu, ignora questa email: la password resta quella di prima.</p>`,
    ),
  });
}

export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 160;

/** Ordini che appartengono al cliente: fatti da loggato, o con la sua email se verificata. */
export function ordersWhere(c: Customer) {
  // usa sempre ?1 e ?2, così i parametri successivi partono da ?3
  return c.email_verified
    ? { sql: "(customer_id = ?1 OR lower(email) = ?2)", args: [c.id, c.email] }
    : { sql: "(customer_id = ?1 AND ?2 IS NOT NULL)", args: [c.id, c.email] };
}
