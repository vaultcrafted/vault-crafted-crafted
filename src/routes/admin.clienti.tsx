import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, api } from "@/components/vault/AdminShell";
import { FONTS_HREF } from "@/components/vault/CardEditor";

export const Route = createFileRoute("/admin/clienti")({
  component: () => (
    <AdminShell title="Clienti registrati">
      <Clienti />
    </AdminShell>
  ),
  head: () => ({
    meta: [{ title: "Clienti — Pannello Vault" }, { name: "robots", content: "noindex, nofollow" }],
    links: [{ rel: "stylesheet", href: FONTS_HREF }],
  }),
});

interface Row {
  id: string;
  email: string;
  name: string;
  phone: string;
  email_verified: number;
  created_at: string;
  orders: number;
  spent: number;
  drafts: number;
}

function Clienti() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    api<{ customers: Row[] }>("/api/admin/clienti")
      .then((r) => setRows(r.customers))
      .catch((e) => setErr(e.message));
  }, []);
  if (err) return <p className="vc-err">{err}</p>;
  if (!rows) return <p className="vc-hint">Caricamento…</p>;
  const list = rows.filter((r) => !q || `${r.name} ${r.email} ${r.phone}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <b>{rows.length} {rows.length === 1 ? "cliente registrato" : "clienti registrati"}</b>
        <span className="vc-hint" style={{ margin: 0 }}>
          · {rows.filter((r) => r.email_verified).length} con email confermata
        </span>
        <input
          placeholder="Cerca nome, email, telefono"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginLeft: "auto", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--line)", minWidth: 240 }}
        />
      </div>
      {rows.length === 0 ? (
        <div className="ad-empty">Ancora nessun cliente registrato.</div>
      ) : (
        <table className="ad-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th className="hide-m">Telefono</th>
              <th>Ordini</th>
              <th className="hide-m">Pagato</th>
              <th className="hide-m">Bozze</th>
              <th className="hide-m">Iscritto il</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} style={{ cursor: "default" }}>
                <td>
                  <b>{r.name || "—"}</b>
                  <span className="ad-sub">
                    {r.email} {r.email_verified ? "✓" : "· da confermare"}
                  </span>
                </td>
                <td className="hide-m">{r.phone || "—"}</td>
                <td>{r.orders}</td>
                <td className="hide-m">€{Number(r.spent).toFixed(2).replace(".", ",")}</td>
                <td className="hide-m">{r.drafts}</td>
                <td className="hide-m">{new Date(r.created_at).toLocaleDateString("it-IT")}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className="vc-btn ghost"
                    style={{ padding: "6px 12px", fontSize: 13 }}
                    onClick={async () => {
                      if (!confirm(`Eliminare l'account di ${r.email}? Gli ordini restano nel pannello, si cancellano account, indirizzi e bozze.`)) return;
                      try {
                        await api(`/api/admin/clienti?id=${encodeURIComponent(r.id)}`, { method: "DELETE" });
                        setRows((x) => (x ?? []).filter((y) => y.id !== r.id));
                      } catch (e) {
                        alert((e as Error).message);
                      }
                    }}
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
