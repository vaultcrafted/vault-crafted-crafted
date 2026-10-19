import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AdminShell,
  STATUS_LABELS,
  StatusPill,
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
  email: string;
  customer_name: string;
  category: string;
  card_name: string;
  total: number;
  source: string;
  has_art: number;
}

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
  } | null>(null);
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
  const bulk = async (patch: { status?: string; paid?: boolean }) => {
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
        `/api/admin/ordini?status=${encodeURIComponent(tab)}&q=${encodeURIComponent(q)}`,
      )
        .then((d) => {
          setData(d);
          setErr("");
        })
        .catch((e) => setErr(e.message));
    }, 200);
    return () => clearTimeout(t);
  }, [tab, q, reload]);
  useEffect(() => setSel(new Set()), [tab, q]);

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
          <button type="button" disabled={busy} onClick={() => bulk({ paid: true })}>
            Segna pagati
          </button>
          <button type="button" disabled={busy} onClick={() => bulk({ paid: false })}>
            Segna non pagati
          </button>
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
                <td>
                  <StatusPill s={o.status} />
                </td>
                <td className="hide-m">{fmtDate(o.created_at)}</td>
                <td>
                  {euro(o.total)}
                  {o.status === "annullato" ? (
                    <span className="ad-sub">Annullato</span>
                  ) : !o.paid && !o.total ? (
                    <span className="ad-sub">Omaggio</span>
                  ) : (
                    <span className={o.paid ? "ad-paid" : "ad-unpaid"}>
                      {o.paid ? "Pagato" : "Da pagare"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
