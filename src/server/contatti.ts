// Contatti PR: creator e locali a cui regaliamo (o vendiamo) una carta.
// Tabella creata al primo uso, come per l'area clienti: nessuna migrazione da lanciare a mano.
import { env } from "@/server/vault";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    world TEXT NOT NULL DEFAULT '',
    tier TEXT NOT NULL DEFAULT '',
    handle TEXT NOT NULL DEFAULT '',
    link TEXT NOT NULL DEFAULT '',
    followers TEXT NOT NULL DEFAULT '',
    why TEXT NOT NULL DEFAULT '',
    contact TEXT NOT NULL DEFAULT '',
    contact_hint TEXT NOT NULL DEFAULT '',
    delivery TEXT NOT NULL DEFAULT '',
    card_name TEXT NOT NULL DEFAULT '',
    element TEXT NOT NULL DEFAULT '',
    attacks TEXT NOT NULL DEFAULT '',
    promo_code TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'da_fare',
    priority INTEGER NOT NULL DEFAULT 0,
    round TEXT NOT NULL DEFAULT '',
    contacted_at TEXT NOT NULL DEFAULT '',
    sent_at TEXT NOT NULL DEFAULT '',
    post_url TEXT NOT NULL DEFAULT '',
    orders INTEGER NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE INDEX IF NOT EXISTS contacts_status ON contacts(status)`,
  `CREATE INDEX IF NOT EXISTS contacts_priority ON contacts(priority)`,
];

let ready: Promise<void> | null = null;
export function ensureContacts() {
  ready ??= (async () => {
    await env.DB.batch(SCHEMA.map((q) => env.DB.prepare(q)));
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

export const newId = () => `ct_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
