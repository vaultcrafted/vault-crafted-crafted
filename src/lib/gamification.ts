// Livelli e traguardi del collezionista, calcolati dagli ordini del cliente.
import { CATS } from "@/lib/vaultCard";

export interface GOrder {
  status: string;
  paid: number;
  category: string;
  card_json: string;
  case_id: string;
  customer_name: string;
}

export const LEVELS = [
  { min: 0, name: "Recluta", color: "#8A94A3" },
  { min: 1, name: "Collezionista Bronzo", color: "#B87333" },
  { min: 3, name: "Collezionista Argento", color: "#9AA4B2" },
  { min: 5, name: "Collezionista Oro", color: "#D4A017" },
  { min: 10, name: "Leggenda del Vault", color: "#7C4DFF" },
];

const DONE = ["approvato", "in_stampa", "spedito", "consegnato", "storico"];
export const isCollected = (o: GOrder) => !!o.paid || DONE.includes(o.status);

const parse = (s: string) => {
  try {
    return JSON.parse(s) as { holo?: boolean; el?: string };
  } catch {
    return {};
  }
};

export function progress(orders: GOrder[], me: { name: string; verified: boolean }) {
  const mine = orders.filter(isCollected);
  const n = mine.length;
  let li = 0;
  LEVELS.forEach((l, i) => n >= l.min && (li = i));
  const level = LEVELS[li];
  const next = LEVELS[li + 1] ?? null;
  const pct = next ? Math.max(4, Math.round((n / next.min) * 100)) : 100;
  const els = new Set(mine.map((o) => parse(o.card_json).el).filter(Boolean));
  const full = new Set(CATS.filter((c) => c.full).map((c) => c.k as string));
  const myName = me.name.trim().toLowerCase();
  const badges = [
    { id: "benvenuto", name: "Benvenuto nel Vault", hint: "Crea il tuo account", ok: true },
    { id: "email", name: "Verificato", hint: "Conferma la tua email", ok: me.verified },
    { id: "prima", name: "Prima carta", hint: "La tua prima carta stampata", ok: n >= 1 },
    { id: "tris", name: "Tris", hint: "3 carte nella collezione", ok: n >= 3 },
    { id: "holo", name: "Olografica", hint: "Una carta con pellicola olografica", ok: mine.some((o) => parse(o.card_json).holo) },
    { id: "full", name: "A tutta carta", hint: "Una Full Art, Prisma o Legend", ok: mine.some((o) => full.has(o.category)) },
    { id: "legend", name: "Leggendaria", hint: "Una carta Legend", ok: mine.some((o) => o.category === "legend") },
    { id: "custode", name: "Custode", hint: "Una carta con la custodia", ok: mine.some((o) => o.case_id && o.case_id !== "nessuna") },
    { id: "elementi", name: "Elementalista", hint: "3 elementi diversi", ok: els.size >= 3 },
    {
      id: "regalo",
      name: "Regalo fatto",
      hint: "Una carta spedita a un'altra persona",
      ok: mine.some((o) => myName && o.customer_name.trim().toLowerCase() !== myName),
    },
  ];
  return { n, level, next, pct, badges, unlocked: badges.filter((b) => b.ok).length };
}
