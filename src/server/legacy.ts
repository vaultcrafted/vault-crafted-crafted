// Lettura delle righe del vecchio foglio Google "CLIENTI VAULT" (modulo /ordina prima del configuratore).
const nowIso = () => new Date().toISOString();

const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
const all = (r: Record<string, string>, name: string) =>
  Object.keys(r)
    .filter((k) => norm(k).startsWith(name))
    .map((k) => String(r[k]).trim())
    .filter(Boolean);

/** "€ 35,00" · "CARTA V-MAX - €25" · "RECESSED SNAP + 2€" · "+ €5" → numero */
const money = (s: string) => {
  const t = s.replace(/\s/g, "");
  const m = t.match(/€(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)€/);
  return m ? Number((m[1] ?? m[2]).replace(",", ".")) : 0;
};

function parseDate(v: string): string | null {
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?)?/);
  if (m) {
    // ora italiana → UTC (approssimata: -1h in inverno, -2h in estate)
    const month = +m[2];
    const off = month >= 4 && month <= 10 ? 2 : 1;
    const d = new Date(Date.UTC(+m[3], month - 1, +m[1], +(m[4] ?? 12) - off, +(m[5] ?? 0), +(m[6] ?? 0)));
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

/** Ricava i campi dell'ordine da una riga del foglio. */
export function legacyFields(r: Record<string, string>) {
  const created = parseDate(pick(r, "informazionicronologiche", "timestamp", "data")) ?? nowIso();

  // email: colonne email, poi qualunque cella che sia un indirizzo email (nelle prime righe stava in SPEDIZIONE)
  const email =
    [pick(r, "email", "indirizzoemail", "mail"), ...Object.values(r)].map((v) => String(v).trim()).find((v) => EMAIL.test(v)) ?? "";
  // indirizzo: la cella SPEDIZIONE che non è un'email né un importo
  const address = all(r, "spedizione").find((v) => !EMAIL.test(v) && !/^€?\s*[\d.,]+\s*€?$/.test(v)) ?? "";

  const stato = pick(r, "stato").toUpperCase();
  const pagato = pick(r, "pagato").toUpperCase();
  const metodo = pick(r, "metodopagamento");
  const status = mapStato(stato);
  // pagato solo se nel foglio c'è SI; gli omaggi restano non pagati (a €0)
  const paid = pagato === "SI" || pagato === "SÌ" ? 1 : 0;

  const tipologia = pick(r, "tipologiadicarta", "tipologia");
  const custodia = pick(r, "custodiaholder", "custodia");
  const holoCol = pick(r, "holo", "olografica");
  const tot = pick(r, "tot", "totale");
  let total = tot ? money(tot) || Number(tot.replace(",", ".").replace(/[^\d.]/g, "")) || 0 : NaN;
  if (Number.isNaN(total)) {
    // nessun totale nel foglio: tipologia + custodia + olografica (+€10) + spedizione €4,99
    const holo = /10€|sì|si\b/i.test(holoCol) ? 10 : 0;
    total = Math.round((money(tipologia) + money(custodia) + holo + 4.99) * 100) / 100;
  }
  if (pagato === "OMAGGIO" || (status === "annullato" && !tot)) total = 0;

  const name = pick(r, "nomeecognome", "nomecognome", "nomecliente");
  const notes = [
    pagato === "OMAGGIO" ? "Omaggio" : metodo ? (paid ? `Pagato con ${metodo}` : `Metodo previsto: ${metodo} (non pagato)`) : "",
    stato && !["CONSEGNATO", "ANNULLATO"].includes(stato) ? `Stato nel foglio: ${stato}` : "",
    holoCol && holoCol !== "NO" ? `Olografica: ${holoCol}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    created_at: created,
    status,
    paid,
    email: email.toLowerCase(),
    customer_name: EMAIL.test(name) ? "" : name,
    phone: pick(r, "cellulare", "telefono", "cell").replace(/^\.$/, ""),
    address,
    category: tipologia,
    card_name: pick(r, "nome", "nomecarta"),
    case_label: custodia,
    total,
    admin_note: notes,
  };
}

/** Stato scritto nel foglio → stato del pannello. */
function mapStato(s: string) {
  const t = s.replace(/\s+/g, " ").trim();
  if (/ANNULL|RIFIUT|CANCELL/.test(t)) return "annullato";
  if (/CONSEGN|RITIRAT/.test(t)) return "consegnato";
  if (/SPEDIT|INVIAT/.test(t)) return "spedito";
  if (/STAMPA|STAMPAT|PRODUZ/.test(t)) return t.includes("PRONT") ? "approvato" : "in_stampa";
  if (/APPROV|CONFERM|PRONT/.test(t)) return "approvato";
  if (/ATTESA|DA PAGARE|BOZZA/.test(t)) return "bozza_inviata";
  if (/LAVORAZ|NUOV|DA FARE/.test(t)) return "in_lavorazione";
  return "storico";
}
