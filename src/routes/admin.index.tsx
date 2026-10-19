import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AdminShell,
  STATUS_COLORS,
  STATUS_LABELS,
  api,
  euro,
  fmtDate,
} from "@/components/vault/AdminShell";
import { FONTS_HREF } from "@/components/vault/CardEditor";
import { MAX_EDITION, catOf } from "@/lib/vaultCard";

export const Route = createFileRoute("/admin/")({
  component: AdminOrders,
  head: () => ({
    meta: [{ title: "Ordini — Pannello Vault" }, { name: "robots", content: "noindex, nofollow" }],
    links: [{ rel: "stylesheet", href: FONTS_HREF }],
  }),
});

interface Row {
  id: string;
  serial: number | null;
  edition: number | null;
  created_at: string;
  status: string;
  paid: number;
  gift: number;
  email: string;
  customer_name: string;
  category: string;
  card_name: string;
  total: number;
  source: string;
  has_art: number;
}

type Pay = "pagato" | "da_pagare" | "omaggio";
const payOf = (o: Row): Pay => (o.gift ? "omaggio" : o.paid ? "pagato" : "da_pagare");
const PAY_LABELS: Record<Pay, string> = { da_pagare: "Da pagare", pagato: "Pagato", omaggio: "Omaggio" };

interface Filters {
  pay: string;
  src: string;
  anno: string;
  ordina: string;
}
const NO_FILTERS: Filters = { pay: "", src: "", anno: "", ordina: "recenti" };
const FKEY = "vault_admin_filtri";
const loadFilters = (): Filters => {
  try {
    return { ...NO_FILTERS, ...JSON.parse(localStorage.getItem(FKEY) ?? "{}") };
  } catch {
    return NO_FILTERS;
  }
};

const TABS: [string, string][] = [
  ["attivi", "Da fare"],
  ["", "Tutti"],
  ...Object.entries(STATUS_LABELS),
];

function AdminOrders() {
  return (
    <AdminShell title="Ordini">
      <OrdersList />
    </AdminShell>
  );
}

function OrdersList() {
  const nav = useNavigate();
  const [tab, setTab] = useState("attivi");
  const [q, setQ] = useState("");
  const [data, setData] = useState<{
    orders: Row[];
    counts: { status: string; n: number }[];
    money: { incassato: number; da_incassare: number };
    years: string[];
  } | null>(null);
  const [f, setF] = useState<Filters>(NO_FILTERS);
  useEffect(() => setF(loadFilters()), []);
  const setFilter = (k: keyof Filters, v: string) =>
    setF((cur) => {
      const n = { ...cur, [k]: v };
      try {
        localStorage.setItem(FKEY, JSON.stringify(n));
      } catch {
        /* niente */
      }
      return n;
    });
  const filtersOn = f.pay || f.src || f.anno || f.ordina !== "recenti";
  const [err, setErr] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  // modifica di un solo ordine dalla riga: aggiorna subito la vista, poi salva
  const quick = async (o: Row, patch: { status?: string; pay?: Pay }) => {
    setData((d) =>
      d
        ? {
            ...d,
            orders: d.orders.map((x) =>
              x.id !== o.id
                ? x
                : {
                    ...x,
                    ...(patch.status ? { status: patch.status } : {}),
                    ...(patch.pay
                      ? { paid: patch.pay === "pagato" ? 1 : 0, gift: patch.pay === "omaggio" ? 1 : 0 }
                      : {}),
                  },
            ),
          }
        : d,
    );
    try {
      await api("/api/admin/ordini", { method: "PATCH", json: { ids: [o.id], ...patch } });
    } catch (e) {
      setErr((e as Error).message);
    }
    setReload((r) => r + 1);
  };
  const bulk = async (patch: { status?: string; pay?: Pay }) => {
    setBusy(true);
    try {
      await api("/api/admin/ordini", { method: "PATCH", json: { ids: [...sel], ...patch } });
      setSel(new Set());
      setReload((r) => r + 1);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      api<typeof data>(
        `/api/admin/ordini?${new URLSearchParams({ status: tab, q, ...f })}`,
      )
        .then((d) => {
          setData(d);
          setErr("");
        })
        .catch((e) => setErr(e.message));
    }, 200);
    return () => clearTimeout(t);
  }, [tab, q, reload, f]);
  useEffect(() => setSel(new Set()), [tab, q, f]);

  const count = (s: string) => data?.counts.find((c) => c.status === s)?.n ?? 0;
  const active = (data?.counts ?? [])
    .filter((c) => !["consegnato", "annullato", "storico"].includes(c.status))
    .reduce((a, c) => a + c.n, 0);
  const total = (data?.counts ?? []).reduce((a, c) => a + c.n, 0);

  return (
    <>
      <div className="ad-stats">
        <div className="ad-stat">
          <span>Da fare</span>
          <b>{active}</b>
        </div>
        <div className="ad-stat">
          <span>Nuovi</span>
          <b>{count("nuovo")}</b>
        </div>
        <div className="ad-stat">
          <span>Incassato</span>
          <b>{euro(data?.money.incassato ?? 0)}</b>
        </div>
        <div className="ad-stat">
          <span>Da incassare</span>
          <b>{euro(data?.money.da_incassare ?? 0)}</b>
        </div>
      </div>
      <div className="ad-tabs" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k || "all"} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>
            {l}
            <em>{k === "attivi" ? active : k === "" ? total : count(k)}</em>
          </button>
        ))}
      </div>
      <input
        className="ad-search"
        type="search"
        placeholder="Cerca per nome carta, cliente, email o numero…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="ad-filters">
        <label>
          <span>Pagamento</span>
          <select value={f.pay} onChange={(e) => setFilter("pay", e.target.value)}>
            <option value="">Tutti</option>
            <option value="da_pagare">Da pagare</option>
            <option value="pagato">Pagati</option>
            <option value="omaggio">Omaggi</option>
          </select>
        </label>
        <label>
          <span>Provenienza</span>
          <select value={f.src} onChange={(e) => setFilter("src", e.target.value)}>
            <option value="">Tutti</option>
            <option value="sito">Dal sito</option>
            <option value="foglio">Vecchio foglio</option>
          </select>
        </label>
        <label>
          <span>Anno</span>
          <select value={f.anno} onChange={(e) => setFilter("anno", e.target.value)}>
            <option value="">Tutti</option>
            {(data?.years ?? []).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Ordina per</span>
          <select value={f.ordina} onChange={(e) => setFilter("ordina", e.target.value)}>
            <option value="recenti">Più recenti</option>
            <option value="vecchi">Più vecchi</option>
            <option value="numero">Numero carta</option>
            <option value="totale">Totale più alto</option>
            <option value="cliente">Cliente A–Z</option>
          </select>
        </label>
        {filtersOn && (
          <button
            type="button"
            className="ad-filters-x"
            onClick={() => {
              setF(NO_FILTERS);
              try {
                localStorage.removeItem(FKEY);
              } catch {
                /* niente */
              }
            }}
          >
            Azzera filtri
          </button>
        )}
        {data && <em className="ad-filters-n">{data.orders.length} ordini</em>}
      </div>
      {err && <p className="vc-err">{err}</p>}
      {sel.size > 0 && (
        <div className="ad-bulk" role="toolbar">
          <b>{sel.size} selezionati</b>
          <select
            value=""
            disabled={busy}
            onChange={(e) => e.target.value && bulk({ status: e.target.value })}
            aria-label="Cambia stato"
          >
            <option value="">Cambia stato…</option>
            {Object.entries(STATUS_LABELS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          <select
            value=""
            disabled={busy}
            onChange={(e) => e.target.value && bulk({ pay: e.target.value as Pay })}
            aria-label="Cambia pagamento"
          >
            <option value="">Pagamento…</option>
            <option value="pagato">Pagato</option>
            <option value="da_pagare">Da pagare</option>
            <option value="omaggio">Omaggio</option>
          </select>
          <button type="button" className="ad-bulk-x" onClick={() => setSel(new Set())}>
            Annulla
          </button>
        </div>
      )}
      {data && data.orders.length === 0 && <div className="ad-empty">Nessun ordine qui.</div>}
      {data && data.orders.length > 0 && (
        <table className="ad-table">
          <thead>
            <tr>
              <th className="ad-chk">
                <input
                  type="checkbox"
                  aria-label="Seleziona tutti"
                  checked={sel.size > 0 && sel.size === data.orders.length}
                  onChange={(e) =>
                    setSel(e.target.checked ? new Set(data.orders.map((o) => o.id)) : new Set())
                  }
                />
              </th>
              <th>N°</th>
              <th>Carta</th>
              <th className="hide-m">Cliente</th>
              <th>Stato</th>
              <th className="hide-m">Data</th>
              <th>Totale</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((o) => (
              <tr
                key={o.id}
                className={sel.has(o.id) ? "is-sel" : undefined}
                onClick={() => nav({ to: "/admin/ordine/$id", params: { id: o.id } })}
              >
                <td className="ad-chk" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    aria-label="Seleziona"
                    checked={sel.has(o.id)}
                    onChange={() => toggle(o.id)}
                  />
                </td>
                <td>
                  <span className="ad-num">
                    {o.serial ? String(o.serial).padStart(3, "0") : "—"}
                  </span>
                  {o.edition ? (
                    <span className="ad-sub">
                      {o.edition}/{MAX_EDITION}
                    </span>
                  ) : null}
                </td>
                <td>
                  <b>{o.card_name || "—"}</b>
                  <span className="ad-sub">
                    {o.source === "foglio" ? o.category || "Vecchio ordine" : catOf(o.category).n}
                  </span>
                </td>
                <td className="hide-m">
                  {o.customer_name || "—"}
                  <span className="ad-sub">{o.email}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    className="ad-pillsel"
                    style={{ ["--c" as string]: STATUS_COLORS[o.status] ?? "#5A5D6B" }}
                    value={o.status}
                    aria-label="Stato"
                    onChange={(e) => quick(o, { status: e.target.value })}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="hide-m">{fmtDate(o.created_at)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  {euro(o.total)}
                  <select
                    className={`ad-paysel is-${o.status === "annullato" && !o.paid ? "off" : payOf(o)}`}
                    value={payOf(o)}
                    aria-label="Pagamento"
                    onChange={(e) => quick(o, { pay: e.target.value as Pay })}
                  >
                    {(Object.keys(PAY_LABELS) as Pay[]).map((k) => (
                      <option key={k} value={k}>
                        {PAY_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
