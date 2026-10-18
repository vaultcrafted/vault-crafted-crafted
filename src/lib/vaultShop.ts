// Listino e regole d'ordine condivise tra sito, pannello e server.
import { CATS, ELEMENTS, MAX_EDITION, type CardData } from "./vaultCard";

export const SPEDIZIONE = 4.99;
export const MAX_PHOTO = 10 * 1024 * 1024;
export const HOLO_PRICE = 7.99;

// win = finestra della custodia nella foto (x, y, larghezza, altezza in %), dove si disegna la carta del cliente
export const CUSTODIE: {
  id: string;
  label: string;
  price: number;
  img?: string;
  win?: [number, number, number, number];
}[] = [
  { id: "nessuna", label: "Nessuna custodia", price: 0 },
  {
    id: "one-touch-35pt",
    label: "One Touch 35pt",
    price: 1,
    img: "/custodie/one-touch-35pt.webp",
    win: [31.82, 30.33, 36.37, 50.83],
  },
  {
    id: "one-touch-bordo-nero",
    label: "One Touch 35pt bordo nero",
    price: 2,
    img: "/custodie/one-touch-bordo-nero.webp",
    win: [31.49, 25.5, 37.2, 52.0],
  },
  {
    id: "recessed-snap",
    label: "Recessed Snap",
    price: 2,
    img: "/custodie/recessed-snap.webp",
    win: [30.34, 20.5, 40.18, 56.17],
  },
  {
    id: "mini-snap",
    label: "Mini Snap",
    price: 2,
    img: "/custodie/mini-snap.webp",
    win: [24.92, 12.33, 50.55, 70.67],
  },
  {
    id: "screwdown-recessed",
    label: "Screwdown Recessed",
    price: 3,
    img: "/custodie/screwdown-recessed.webp",
    win: [31.05, 23.83, 37.56, 52.5],
  },
  {
    id: "screwdown-bordo-nero",
    label: "Screwdown bordo nero",
    price: 5,
    img: "/custodie/screwdown-bordo-nero.webp",
    win: [38.35, 37.33, 23.13, 32.33],
  },
];
export const custodiaOf = (id: string) => CUSTODIE.find((c) => c.id === id) ?? CUSTODIE[0];

export function priceOf(cat: string, custodia: string, holo = false) {
  const c = CATS.find((x) => x.k === cat) ?? CATS[0];
  const cu = custodiaOf(custodia);
  const holoPrice = holo ? HOLO_PRICE : 0;
  return {
    price: c.price,
    casePrice: cu.price,
    holoPrice,
    shipping: SPEDIZIONE,
    total: Math.round((c.price + cu.price + holoPrice + SPEDIZIONE) * 100) / 100,
  };
}

export interface Contacts {
  nome_cognome: string;
  email: string;
  cellulare: string;
  indirizzo: string;
  note: string;
}

export interface NewOrder {
  card: CardData;
  artPos: { zoom: number; px: number; py: number };
  custodia: string;
  contacts: Contacts;
  photo: { name: string; type: string; base64: string } | null;
}

export interface OrderRow {
  id: string;
  serial: number | null;
  edition: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  paid: number;
  email: string;
  customer_name: string;
  phone: string;
  address: string;
  customer_note: string;
  category: string;
  card_name: string;
  card_json: string;
  art_pos: string;
  case_id: string;
  case_label: string;
  case_price: number;
  price: number;
  shipping: number;
  total: number;
  photo_key: string;
  photo_name: string;
  art_key: string;
  admin_note: string;
  tracking: string;
  source: string;
  legacy_json: string;
}

export function cardErrors(d: CardData) {
  const e: string[] = [];
  if (!d.name.trim()) e.push("Il nome della carta");
  if (!d.hp.trim()) e.push("Gli HP");
  if (d.mode === "ab" && !d.abName.trim()) e.push("Il nome dell'abilità");
  if (!d.m1.trim()) e.push(d.mode === "ab" ? "Il nome dell'attacco" : "Il nome del primo attacco");
  if (d.mode === "two" && !d.m2.trim()) e.push("Il nome del secondo attacco");
  return e;
}
export function contactErrors(c: Contacts) {
  const e: string[] = [];
  if (!c.nome_cognome.trim()) e.push("Nome e cognome");
  if (!/^\S+@\S+\.\S+$/.test(c.email.trim())) e.push("Un'email valida");
  if (!c.cellulare.trim()) e.push("Il cellulare");
  if (!c.indirizzo.trim()) e.push("L'indirizzo di spedizione");
  return e;
}
export { MAX_EDITION };

export function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
export function num(v: unknown, min: number, max: number, def: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : def;
}
export function sanitizeCard(c: Partial<CardData> | undefined): CardData | null {
  if (!c) return null;
  const elKeys = ELEMENTS.map((e) => e[0]) as string[];
  const el = (v: unknown, allowEmpty: boolean) =>
    typeof v === "string" && (elKeys.includes(v) || (allowEmpty && v === ""))
      ? v
      : allowEmpty
        ? ""
        : "vault";
  if (!CATS.some((x) => x.k === c.cat)) return null;
  return {
    cat: c.cat!,
    el: el(c.el, false) as CardData["el"],
    mode: c.mode === "one" || c.mode === "ab" ? c.mode : "two",
    name: str(c.name, 28),
    hp: str(c.hp, 3).replace(/\D/g, ""),
    abName: str(c.abName, 40),
    abText: str(c.abText, 300),
    m1: str(c.m1, 40),
    d1: str(c.d1, 4),
    t1: str(c.t1, 300),
    m2: str(c.m2, 40),
    d2: str(c.d2, 4),
    t2: str(c.t2, 300),
    weak: el(c.weak, true) as CardData["weak"],
    weakV: str(c.weakV, 6),
    res: el(c.res, true) as CardData["res"],
    resV: str(c.resV, 6),
    ret: el(c.ret, false) as CardData["ret"],
    retN: Math.max(0, Math.min(3, Number(c.retN) || 0)),
    motto: str(c.motto, 60),
    holo: c.holo === true,
    serial: null,
    edition: null,
  };
}
