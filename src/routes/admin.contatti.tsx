import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { AdminShell, api } from "@/components/vault/AdminShell";
import { FONTS_HREF, Field } from "@/components/vault/CardEditor";
import { CONTACT_STATUSES, CONTACT_WORLDS, type ContactRow } from "@/lib/contatti";

export const Route = createFileRoute("/admin/contatti")({
  component: () => (
    <AdminShell title="Contatti">
      <Contatti />
    </AdminShell>
  ),
  head: () => ({
    meta: [
      { title: "Contatti — Pannello Vault" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "stylesheet", href: FONTS_HREF }],
  }),
});

const LABEL: Record<string, string> = Object.fromEntries(CONTACT_STATUSES.map(([k, v]) => [k, v]));
const COLOR: Record<string, string> = {
  da_fare: "#E8462A",
  contattato: "#1F86D6",
  inviata: "#E2A917",
  risposto: "#8B5CF6",
  pubblicato: "#3FB58A",
  niente: "#9CA3AF",
  riserva: "#A3A8BC",
};

const EMPTY: Partial<ContactRow> = { name: "", world: "", status: "da_fare" };

function Contatti() {
  const [rows, setRows] = useState<ContactRow[] | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("tutti");
  const [world, setWorld] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<ContactRow> | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api<{ contacts: ContactRow[] }>("/api/admin/contatti")
      .then((r) => setRows(r.contacts))
      .catch((e) => setErr(e.message));
  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows ?? []) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows ?? []).filter(
      (r) =>
        (tab === "tutti" || r.status === tab) &&
        (!world || r.world === world) &&
        (!needle ||
          `${r.name} ${r.handle} ${r.contact} ${r.card_name} ${r.promo_code} ${r.note}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [rows, tab, world, q]);

  const patch = async (id: string, data: Partial<ContactRow>) => {
    const before = rows ?? [];
    setRows(before.map((r) => (r.id === id ? { ...r, ...data } : r)));
    try {
      const r = await api<{ contact: ContactRow }>("/api/admin/contatti", {
        method: "PATCH",
        json: { id, ...data },
      });
      setRows((x) => (x ?? []).map((y) => (y.id === id ? r.contact : y)));
    } catch (e) {
      setRows(before);
      setMsg((e as Error).message);
    }
  };

  const save = async () => {
    if (!draft?.name?.trim()) return setMsg("Manca il nome");
    setBusy(true);
    try {
      if (draft.id) {
        const r = await api<{ contact: ContactRow }>("/api/admin/contatti", {
          method: "PATCH",
          json: draft,
        });
        setRows((x) => (x ?? []).map((y) => (y.id === r.contact.id ? r.contact : y)));
      } else {
        const r = await api<{ contact: ContactRow }>("/api/admin/contatti", {
          method: "POST",
          json: draft,
        });
        setRows((x) => [r.contact, ...(x ?? [])]);
      }
      setDraft(null);
      setMsg("Salvato");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const seed = async () => {
    if (!confirm("Carico i 36 nomi del primo giro? I nomi già presenti non vengono toccati."))
      return;
    setBusy(true);
    try {
      const r = await api<{ added: number }>("/api/admin/contatti", {
        method: "POST",
        json: { seed: true },
      });
      await load();
      setMsg(r.added ? `Aggiunti ${r.added} contatti` : "Erano già tutti in elenco");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (r: ContactRow) => {
    if (!confirm(`Elimino ${r.name} dall'elenco contatti?`)) return;
    try {
      await api(`/api/admin/contatti?id=${encodeURIComponent(r.id)}`, { method: "DELETE" });
      setRows((x) => (x ?? []).filter((y) => y.id !== r.id));
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const csv = () => {
    const cols: [string, keyof ContactRow][] = [
      ["Nome", "name"],
      ["Mondo", "world"],
      ["Fascia", "tier"],
      ["Profilo", "handle"],
      ["Seguito", "followers"],
      ["Contatto", "contact"],
      ["Dove cercarlo", "contact_hint"],
      ["Recapito", "delivery"],
      ["Carta", "card_name"],
      ["Elemento", "element"],
      ["Attacchi", "attacks"],
      ["Codice", "promo_code"],
      ["Stato", "status"],
      ["Data contatto", "contacted_at"],
      ["Data invio", "sent_at"],
      ["Contenuto", "post_url"],
      ["Ordini", "orders"],
      ["Note", "note"],
    ];
    const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = [cols.map(([h]) => cell(h)).join(";")]
      .concat(
        list.map((r) =>
          cols.map(([, k]) => cell(k === "status" ? LABEL[r.status] : r[k])).join(";"),
        ),
      )
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8" }));
    a.download = "contatti-vault.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (err) return <p className="vc-err">{err}</p>;
  if (!rows) return <p className="vc-hint">Caricamento…</p>;

  const inviate = (counts.inviata ?? 0) + (counts.risposto ?? 0) + (counts.pubblicato ?? 0);
  const ordini = rows.reduce((s, r) => s + (r.orders ?? 0), 0);

  return (
    <div>
      <style>{CSS}</style>

      <div className="ad-stats">
        <div className="ad-stat">
          <span>In elenco</span>
          <b>{rows.length}</b>
        </div>
        <div className="ad-stat">
          <span>Carte inviate</span>
          <b>{inviate}</b>
        </div>
        <div className="ad-stat">
          <span>Hanno pubblicato</span>
          <b>{counts.pubblicato ?? 0}</b>
        </div>
        <div className="ad-stat">
          <span>Ordini dai codici</span>
          <b>{ordini}</b>
        </div>
      </div>

      <div className="ad-tabs">
        <button type="button" aria-pressed={tab === "tutti"} onClick={() => setTab("tutti")}>
          Tutti <em>{rows.length}</em>
        </button>
        {CONTACT_STATUSES.map(([k, v]) => (
          <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>
            {v} <em>{counts[k] ?? 0}</em>
          </button>
        ))}
      </div>

      <div className="ad-filters">
        <label>
          <span>Mondo</span>
          <select value={world} onChange={(e) => setWorld(e.target.value)}>
            <option value="">Tutti</option>
            {CONTACT_WORLDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="vc-btn"
          style={{ padding: "8px 14px", fontSize: 15 }}
          onClick={() => setDraft({ ...EMPTY })}
        >
          + Nuovo contatto
        </button>
        <button
          type="button"
          className="vc-btn ghost"
          style={{ padding: "8px 14px", fontSize: 15 }}
          onClick={csv}
        >
          Scarica CSV
        </button>
        {rows.length === 0 && (
          <button
            type="button"
            className="vc-btn ghost"
            style={{ padding: "8px 14px", fontSize: 15 }}
            disabled={busy}
            onClick={seed}
          >
            Carica i nomi del primo giro
          </button>
        )}
        <i className="ad-filters-n">{list.length} in vista</i>
      </div>

      <input
        className="ad-search"
        placeholder="Cerca nome, profilo, contatto, codice"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {list.length === 0 ? (
        <div className="ad-empty">
          {rows.length === 0 ? (
            <>
              Ancora nessun contatto.
              <br />
              <button
                type="button"
                className="vc-btn"
                style={{ marginTop: 12 }}
                disabled={busy}
                onClick={seed}
              >
                Carica i 36 nomi del primo giro
              </button>
            </>
          ) : (
            "Nessun contatto con questi filtri."
          )}
        </div>
      ) : (
        <table className="ad-table ct-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th className="hide-m">Mondo</th>
              <th className="hide-m">Seguito</th>
              <th>Stato</th>
              <th className="hide-m">Codice</th>
              <th className="hide-m">Ordini</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <Fragment key={r.id}>
                <tr onClick={() => setOpen(open === r.id ? null : r.id)}>
                  <td>
                    <b>{r.name}</b>
                    <span className="ad-sub">
                      {r.handle || r.tier || "—"}
                      {r.card_name ? ` · ${r.card_name}` : ""}
                    </span>
                  </td>
                  <td className="hide-m">{r.world || "—"}</td>
                  <td className="hide-m" style={{ fontSize: 13, color: "var(--muted)" }}>
                    {r.followers || "—"}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className="ad-pillsel"
                      style={{ ["--c" as string]: COLOR[r.status] ?? "#5A5D6B" }}
                      value={r.status}
                      onChange={(e) => void patch(r.id, { status: e.target.value })}
                    >
                      {CONTACT_STATUSES.map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="hide-m ad-num">{r.promo_code || "—"}</td>
                  <td className="hide-m">{r.orders || 0}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <span className="ct-open">{open === r.id ? "Chiudi" : "Apri"}</span>
                  </td>
                </tr>
                {open === r.id && (
                  <tr className="ct-detail">
                    <td colSpan={7}>
                      <div className="ct-grid">
                        <div>
                          <h3>Chi è</h3>
                          <dl className="ad-kv">
                            <dt>Fascia</dt>
                            <dd>{r.tier || "—"}</dd>
                            <dt>Profilo</dt>
                            <dd>
                              {r.link ? (
                                <a href={r.link} target="_blank" rel="noreferrer">
                                  {r.handle || r.link}
                                </a>
                              ) : (
                                r.handle || "—"
                              )}
                            </dd>
                            <dt>Perché</dt>
                            <dd>{r.why || "—"}</dd>
                            <dt>Contatto</dt>
                            <dd>{r.contact || <i className="ct-miss">non trovato</i>}</dd>
                            {!r.contact && r.contact_hint && (
                              <>
                                <dt>Dove cercarlo</dt>
                                <dd>{r.contact_hint}</dd>
                              </>
                            )}
                            <dt>Recapito</dt>
                            <dd>{r.delivery || "—"}</dd>
                            <dt>Carta</dt>
                            <dd>
                              {r.card_name
                                ? `${r.card_name}${r.element ? ` · ${r.element}` : ""}`
                                : "—"}
                            </dd>
                            <dt>Attacchi</dt>
                            <dd>{r.attacks || "—"}</dd>
                          </dl>
                        </div>
                        <div>
                          <h3>Avanzamento</h3>
                          <div className="ct-form">
                            <Field label="Codice sconto">
                              <input
                                value={r.promo_code}
                                onChange={(e) =>
                                  void patch(r.id, { promo_code: e.target.value.toUpperCase() })
                                }
                              />
                            </Field>
                            <Field label="Data contatto">
                              <input
                                type="date"
                                value={r.contacted_at}
                                onChange={(e) => void patch(r.id, { contacted_at: e.target.value })}
                              />
                            </Field>
                            <Field label="Data invio carta">
                              <input
                                type="date"
                                value={r.sent_at}
                                onChange={(e) => void patch(r.id, { sent_at: e.target.value })}
                              />
                            </Field>
                            <Field label="Link al contenuto pubblicato">
                              <input
                                value={r.post_url}
                                onChange={(e) => void patch(r.id, { post_url: e.target.value })}
                              />
                            </Field>
                            <Field label="Ordini arrivati dal suo codice">
                              <input
                                type="number"
                                min={0}
                                value={r.orders}
                                onChange={(e) =>
                                  void patch(r.id, { orders: Number(e.target.value) })
                                }
                              />
                            </Field>
                            <Field label="Note">
                              <textarea
                                rows={3}
                                value={r.note}
                                onChange={(e) => void patch(r.id, { note: e.target.value })}
                              />
                            </Field>
                          </div>
                          <div className="ad-actions" style={{ marginTop: 12 }}>
                            <button
                              type="button"
                              className="vc-btn ghost"
                              onClick={() => setDraft({ ...r })}
                            >
                              Modifica la scheda
                            </button>
                            <button
                              type="button"
                              className="vc-btn ghost"
                              onClick={() => void remove(r)}
                            >
                              Elimina
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}

      {draft && (
        <div className="ct-modal" onClick={() => setDraft(null)}>
          <div className="ct-card" onClick={(e) => e.stopPropagation()}>
            <h2>{draft.id ? "Modifica contatto" : "Nuovo contatto"}</h2>
            <div className="ct-form two">
              <Field label="Nome">
                <input
                  value={draft.name ?? ""}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </Field>
              <Field label="Mondo">
                <select
                  value={draft.world ?? ""}
                  onChange={(e) => setDraft({ ...draft, world: e.target.value })}
                >
                  <option value="">—</option>
                  {CONTACT_WORLDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fascia">
                <input
                  value={draft.tier ?? ""}
                  onChange={(e) => setDraft({ ...draft, tier: e.target.value })}
                />
              </Field>
              <Field label="Profilo">
                <input
                  value={draft.handle ?? ""}
                  onChange={(e) => setDraft({ ...draft, handle: e.target.value })}
                />
              </Field>
              <Field label="Link">
                <input
                  value={draft.link ?? ""}
                  onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                />
              </Field>
              <Field label="Seguito">
                <input
                  value={draft.followers ?? ""}
                  onChange={(e) => setDraft({ ...draft, followers: e.target.value })}
                />
              </Field>
              <Field label="Contatto">
                <input
                  value={draft.contact ?? ""}
                  onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
                />
              </Field>
              <Field label="Dove cercarlo">
                <input
                  value={draft.contact_hint ?? ""}
                  onChange={(e) => setDraft({ ...draft, contact_hint: e.target.value })}
                />
              </Field>
              <Field label="Nome carta">
                <input
                  value={draft.card_name ?? ""}
                  onChange={(e) => setDraft({ ...draft, card_name: e.target.value })}
                />
              </Field>
              <Field label="Elemento">
                <input
                  value={draft.element ?? ""}
                  onChange={(e) => setDraft({ ...draft, element: e.target.value })}
                />
              </Field>
              <Field label="Attacchi">
                <input
                  value={draft.attacks ?? ""}
                  onChange={(e) => setDraft({ ...draft, attacks: e.target.value })}
                />
              </Field>
              <Field label="Codice sconto">
                <input
                  value={draft.promo_code ?? ""}
                  onChange={(e) => setDraft({ ...draft, promo_code: e.target.value.toUpperCase() })}
                />
              </Field>
            </div>
            <Field label="Perché è adatto">
              <textarea
                rows={2}
                value={draft.why ?? ""}
                onChange={(e) => setDraft({ ...draft, why: e.target.value })}
              />
            </Field>
            <Field label="Come recapitargli la carta">
              <textarea
                rows={2}
                value={draft.delivery ?? ""}
                onChange={(e) => setDraft({ ...draft, delivery: e.target.value })}
              />
            </Field>
            <div className="ad-actions" style={{ marginTop: 14 }}>
              <button type="button" className="vc-btn" disabled={busy} onClick={() => void save()}>
                {busy ? "Salvo…" : "Salva"}
              </button>
              <button type="button" className="vc-btn ghost" onClick={() => setDraft(null)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div className="ad-toast" onClick={() => setMsg("")}>
          {msg}
        </div>
      )}
    </div>
  );
}

const CSS = `
.ct-table tbody tr.ct-detail{cursor:default}
.ct-table tbody tr.ct-detail td{background:#F7F8FA;padding:16px 14px}
.ct-open{font-size:13px;font-weight:700;color:var(--muted)}
.ct-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,380px);gap:22px;align-items:start}
.ct-grid h3{margin:0 0 10px;font-family:'Saira Condensed',sans-serif;font-size:20px}
.ct-miss{color:#B45309;font-style:normal;font-weight:700}
.ct-form{display:grid;gap:8px}
.ct-form.two{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.ct-form input,.ct-form textarea,.ct-form select{font:inherit;width:100%;background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px 10px}
.ct-modal{position:fixed;inset:0;background:rgba(20,26,58,.45);display:flex;align-items:center;justify-content:center;padding:18px;z-index:60;overflow:auto}
.ct-card{background:#fff;border-radius:18px;padding:22px;max-width:760px;width:100%;max-height:90vh;overflow:auto}
.ct-card h2{margin:0 0 14px;font-family:'Saira Condensed',sans-serif;font-size:28px}
@media (max-width:900px){.ct-grid{grid-template-columns:1fr}.ct-form.two{grid-template-columns:1fr}}
`;
