// Lettura delle righe del vecchio foglio Google (modulo /ordina prima del configuratore).
import { nowIso } from "@/server/vault";

const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");

export function pick(r: Record<string, string>, ...names: string[]) {
  const keys = Object.keys(r);
  for (const n of names) {
    const k = keys.find((x) => norm(x) === n);
    if (k && String(r[k]).trim()) return String(r[k]).trim();
  }
  for (const n of names) {
    const k = keys.find((x) => norm(x).includes(n));
    if (k && String(r[k]).trim()) return String(r[k]).trim();
  }
  return "";
}

const euro = (s: string) => {
  const m = s.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*€|€\s*(\d+(?:\.\d+)?)/);
  return m ? Number(m[1] ?? m[2]) : 0;
};

function parseDate(v: string): string | null {
  if (!v) return null;
  const m = v.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})(?:[,\sT]+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?)?/);
  if (m) {
    const y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    const d = new Date(Date.UTC(y, +m[2] - 1, +m[1], +(m[4] ?? 12) - 1, +(m[5] ?? 0), +(m[6] ?? 0)));
    if (!Number.isNaN(d.getTime()) && y > 2020 && y < 2100) return d.toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

/** Ricava i campi dell'ordine da una riga del foglio. */
export function legacyFields(r: Record<string, string>) {
  // data: prima le colonne con un nome da data, poi qualunque valore che sembri una data
  let created = parseDate(pick(r, "timestamp", "informazionicronologiche", "dataora", "data", "date"));
  if (!created)
    for (const v of Object.values(r)) {
      created = parseDate(String(v));
      if (created) break;
    }

  const tipologia = pick(r, "tipologia", "tipo");
  const custodia = pick(r, "custodia");
  const holo = pick(r, "olografica", "pellicola");
  const totalCol = euro(pick(r, "totale", "total", "importo")) || Number(pick(r, "totale", "total").replace(",", ".").replace(/[^\d.]/g, "")) || 0;
  const holoPrice = /^s[iì]/i.test(holo) ? euro(holo) || 9.99 : 0;
  const computed = euro(tipologia) + euro(custodia) + holoPrice;
  const total = totalCol || (computed ? Math.round((computed + 4.99) * 100) / 100 : 0);

  return {
    created_at: created ?? nowIso(),
    email: pick(r, "emailcontatto", "email", "mailcliente", "mail").toLowerCase(),
    customer_name: ((v) => (v.includes("@") || /^\+?[\d\s]{7,}$/.test(v) ? "" : v))(
      pick(r, "nomecognome", "nomeecognome", "nomecliente", "cognomenome", "cliente"),
    ),
    phone: pick(r, "cellulare", "cellcliente", "telefono", "cell"),
    address: pick(r, "spedizione", "indirizzo"),
    category: tipologia,
    card_name: pick(r, "nomecarta", "nome"),
    case_label: custodia,
    total,
  };
}
