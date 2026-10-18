import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  AdminShell,
  STATUS_LABELS,
  StatusPill,
  api,
  euro,
  fmtDate,
} from "@/components/vault/AdminShell";
import { CardEditor, FONTS_HREF, Field, withSamples } from "@/components/vault/CardEditor";
import { CardStage } from "@/components/vault/CardStage";
import {
  CARD_H,
  CARD_W,
  MAX_EDITION,
  TRIM,
  catOf,
  exportPNG,
  loadFonts,
  renderCard,
  type ArtState,
  type CardData,
} from "@/lib/vaultCard";
import { CUSTODIE, type OrderRow } from "@/lib/vaultShop";

export const Route = createFileRoute("/admin/ordine/$id")({
  component: AdminOrderPage,
  head: () => ({
    meta: [{ title: "Ordine — Pannello Vault" }, { name: "robots", content: "noindex, nofollow" }],
    links: [{ rel: "stylesheet", href: FONTS_HREF }],
  }),
});

function AdminOrderPage() {
  const { id } = Route.useParams();
  return (
    <AdminShell title="">
      <OrderDetail id={id} />
    </AdminShell>
  );
}

const fileUrl = (key: string, download = false) =>
  `/api/admin/file?key=${encodeURIComponent(key)}${download ? "&download=1" : ""}`;
const pad = (n: number | null) => (n == null ? "—" : String(n).padStart(3, "0"));
const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "carta";
const toB64 = (buf: ArrayBuffer) => {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
};
const loadImg = (src: string) =>
  new Promise<HTMLImageElement | null>((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });

function OrderDetail({ id }: { id: string }) {
  const nav = useNavigate();
  const [o, setO] = useState<OrderRow | null>(null);
  const [err, setErr] = useState("");
  const [card, setCard] = useState<CardData | null>(null);
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
    customer_note: "",
    admin_note: "",
    tracking: "",
    custodia: "",
    serial: "",
    edition: "",
  });
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState("");
  const [useArt, setUseArt] = useState<"art" | "photo">("art");
  const [zoom, setZoom] = useState(1);
  const [draftMsg, setDraftMsg] = useState("");
  const art = useRef<ArtState>({ img: null, zoom: 1, px: 0, py: 0 });
  const [artVersion, setArtVersion] = useState(0);
  const [fontsVersion, setFontsVersion] = useState(0);
  const savePosTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  const apply = useCallback((row: OrderRow) => {
    setO(row);
    try {
      setCard(row.source === "sito" ? (JSON.parse(row.card_json) as CardData) : null);
    } catch {
      setCard(null);
    }
    setForm({
      customer_name: row.customer_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      customer_note: row.customer_note,
      admin_note: row.admin_note,
      tracking: row.tracking,
      custodia: row.case_id || "nessuna",
      serial: row.serial == null ? "" : String(row.serial),
      edition: row.edition == null ? "" : String(row.edition),
    });
    setDirty(false);
  }, []);

  useEffect(() => {
    void loadFonts().then(() => setFontsVersion((v) => v + 1));
    api<{ order: OrderRow }>(`/api/admin/ordini/${id}`)
      .then((r) => {
        apply(r.order);
        setUseArt(r.order.art_key ? "art" : "photo");
      })
      .catch((e) => setErr(e.message));
  }, [id, apply]);

  // immagine sulla carta: illustrazione se c'è, altrimenti foto del cliente
  const imgKey = o ? (useArt === "art" && o.art_key ? o.art_key : o.photo_key) : "";
  useEffect(() => {
    if (!o || !imgKey) {
      art.current = { img: null, zoom: 1, px: 0, py: 0 };
      setArtVersion((v) => v + 1);
      return;
    }
    let pos = { zoom: 1, px: 0, py: 0 };
    try {
      pos = JSON.parse(o.art_pos);
    } catch {
      /* posizione predefinita */
    }
    void loadImg(fileUrl(imgKey)).then((img) => {
      art.current = { img, ...pos };
      setZoom(pos.zoom);
      setArtVersion((v) => v + 1);
    });
  }, [imgKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = async (body: Record<string, unknown>, msg = "Salvato") => {
    try {
      const r = await api<{ order: OrderRow }>(`/api/admin/ordini/${id}`, {
        method: "PATCH",
        json: body,
      });
      apply(r.order);
      flash(msg);
      return true;
    } catch (e) {
      flash((e as Error).message);
      return false;
    }
  };

  const saveArtPos = () => {
    if (savePosTimer.current) clearTimeout(savePosTimer.current);
    savePosTimer.current = setTimeout(() => {
      const { zoom: z, px, py } = art.current;
      void api(`/api/admin/ordini/${id}`, {
        method: "PATCH",
        json: { artPos: { zoom: z, px, py } },
      }).catch(() => {});
    }, 800);
  };

  const saveAll = async () => {
    setBusy("save");
    await patch(
      {
        card: card ?? undefined,
        customer_name: form.customer_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        customer_note: form.customer_note,
        admin_note: form.admin_note,
        tracking: form.tracking,
        custodia: o?.source === "sito" ? form.custodia : undefined,
        serial: form.serial === "" ? null : Number(form.serial),
        edition: form.edition === "" ? null : Number(form.edition),
      },
      "Modifiche salvate",
    );
    setBusy("");
  };

  const uploadArt = async (f: File | undefined) => {
    if (!f) return;
    setBusy("art");
    try {
      const base64 = toB64(await f.arrayBuffer());
      await api(`/api/admin/ordini/${id}/illustrazione`, {
        method: "POST",
        json: { name: f.name, type: f.type, base64 },
      });
      const r = await api<{ order: OrderRow }>(`/api/admin/ordini/${id}`);
      apply(r.order);
      setUseArt("art");
      flash("Illustrazione caricata");
    } catch (e) {
      flash((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const cardForPrint = (): CardData | null =>
    card ? { ...card, serial: o?.serial ?? null, edition: o?.edition ?? null } : null;

  const downloadPrint = async () => {
    const c = cardForPrint();
    if (!c || !o) return;
    setBusy("print");
    try {
      const blob = await exportPNG(c, art.current);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `vault_N${pad(o.serial)}_${slug(c.name)}_${c.cat}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } finally {
      setBusy("");
    }
  };

  const sendDraft = async () => {
    const c = cardForPrint();
    if (!c || !o) return;
    if (
      !o.art_key &&
      !confirm(
        "Non hai ancora caricato l'illustrazione: la bozza userà la foto del cliente. Inviare lo stesso?",
      )
    )
      return;
    setBusy("draft");
    try {
      // anteprima ritagliata sul formato finito, angoli arrotondati
      const full = document.createElement("canvas");
      full.width = CARD_W;
      full.height = CARD_H;
      await renderCard(full.getContext("2d")!, c, art.current);
      const out = document.createElement("canvas");
      out.width = TRIM.w;
      out.height = TRIM.h;
      const g = out.getContext("2d")!;
      g.beginPath();
      g.roundRect(0, 0, TRIM.w, TRIM.h, 35);
      g.clip();
      g.drawImage(full, -TRIM.x, -TRIM.y);
      const blob = await new Promise<Blob | null>((r) => out.toBlob(r, "image/png"));
      if (!blob) throw new Error("Anteprima non riuscita");
      await api(`/api/admin/ordini/${id}/bozza`, {
        method: "POST",
        json: { png: toB64(await blob.arrayBuffer()), message: draftMsg },
      });
      const r = await api<{ order: OrderRow }>(`/api/admin/ordini/${id}`);
      apply(r.order);
      setDraftMsg("");
      flash("Bozza inviata al cliente");
    } catch (e) {
      flash((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const remove = async () => {
    if (!confirm("Eliminare definitivamente questo ordine, con foto e illustrazione?")) return;
    await api(`/api/admin/ordini/${id}`, { method: "DELETE" });
    void nav({ to: "/admin" });
  };

  if (err) return <p className="vc-err">{err}</p>;
  if (!o) return <p className="vc-hint">Caricamento…</p>;

  const legacy = o.source !== "sito";
  let legacyRows: [string, string][] = [];
  if (legacy) {
    try {
      legacyRows = Object.entries(
        JSON.parse(o.legacy_json || "{}") as Record<string, string>,
      ).filter(([, v]) => v);
    } catch {
      /* vuoto */
    }
  }
  const setF =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm({ ...form, [k]: e.target.value });
      setDirty(true);
    };

  return (
    <>
      <div className="ad-head">
        <Link to="/admin" className="vc-btn ghost">
          ← Ordini
        </Link>
        <h1>
          {o.serial ? `N° ${pad(o.serial)}` : "Ordine"} · {o.card_name || "—"}
        </h1>
        <StatusPill s={o.status} />
        <span className="grow" />
        <span className="vc-hint" style={{ margin: 0 }}>
          {fmtDate(o.created_at)}
          {o.edition ? ` · tiratura ${o.edition}/${MAX_EDITION}` : ""}
        </span>
      </div>

      <div className="ad-grid">
        <div className="ad-side">
          {card ? (
            <CardStage
              data={withSamples({ ...card, serial: o.serial, edition: o.edition })}
              art={art}
              artVersion={artVersion}
              fontsVersion={fontsVersion}
              onArtMoved={saveArtPos}
            />
          ) : (
            <div className="ad-box">
              <h2>Vecchio ordine</h2>
              <p className="vc-hint">Importato dal foglio Google: niente anteprima della carta.</p>
            </div>
          )}
          {card && (
            <div className="ad-box">
              <h2>Illustrazione e stampa</h2>
              <div className="vc-seg" style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  aria-pressed={useArt === "art"}
                  disabled={!o.art_key}
                  onClick={() => setUseArt("art")}
                >
                  Illustrazione
                </button>
                <button
                  type="button"
                  aria-pressed={useArt === "photo"}
                  disabled={!o.photo_key}
                  onClick={() => setUseArt("photo")}
                >
                  Foto cliente
                </button>
              </div>
              <label className="vc-field">
                <span>Zoom (trascina sulla carta per spostare)</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => {
                    const z = +e.target.value;
                    setZoom(z);
                    art.current.zoom = z;
                    setArtVersion((v) => v + 1);
                    saveArtPos();
                  }}
                  onPointerUp={saveArtPos}
                />
              </label>
              <div className="ad-actions" style={{ marginTop: 12 }}>
                <label className="vc-btn dark" style={{ cursor: "pointer" }}>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => uploadArt(e.target.files?.[0])}
                  />
                  {busy === "art"
                    ? "Carico…"
                    : o.art_key
                      ? "Sostituisci illustrazione"
                      : "Carica illustrazione"}
                </label>
                <button
                  type="button"
                  className="vc-btn"
                  onClick={downloadPrint}
                  disabled={busy === "print"}
                >
                  {busy === "print" ? "Preparo…" : "Scarica file di stampa"}
                </button>
              </div>
              <div className="ad-actions" style={{ marginTop: 8 }}>
                {o.photo_key && (
                  <a className="vc-btn ghost" href={fileUrl(o.photo_key, true)}>
                    Foto cliente
                  </a>
                )}
                {o.art_key && (
                  <a className="vc-btn ghost" href={fileUrl(o.art_key, true)}>
                    Illustrazione originale
                  </a>
                )}
              </div>
              <p className="vc-hint">
                Il file di stampa è 862 × 1158 px a 300 dpi, con 5 mm di abbondanza, numero e
                tiratura già inseriti.
              </p>
            </div>
          )}
        </div>

        <div className="vc-form" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="ad-box">
            <h2>Stato</h2>
            <div className="vc-row vc-r2">
              <label className="vc-field">
                <span>Stato dell'ordine</span>
                <select
                  value={o.status}
                  onChange={(e) =>
                    patch({ status: e.target.value }, `Stato: ${STATUS_LABELS[e.target.value]}`)
                  }
                >
                  {Object.entries(STATUS_LABELS).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <div className="vc-field">
                <span>Pagamento · {euro(o.total)}</span>
                <label className="ad-check" style={{ minHeight: 42 }}>
                  <input
                    type="checkbox"
                    checked={!!o.paid}
                    onChange={(e) =>
                      patch(
                        { paid: e.target.checked },
                        e.target.checked ? "Segnato come pagato" : "Segnato da pagare",
                      )
                    }
                  />
                  {o.paid ? "Pagato" : "Da pagare"}
                </label>
              </div>
            </div>
            {card && (
              <>
                <Field label="Messaggio con la bozza (facoltativo)">
                  <textarea
                    value={draftMsg}
                    placeholder="Es. Ecco la tua carta! Ho messo il Duomo sullo sfondo come mi avevi chiesto."
                    onChange={(e) => setDraftMsg(e.target.value)}
                  />
                </Field>
                <div className="ad-actions" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="vc-btn dark"
                    onClick={sendDraft}
                    disabled={busy === "draft"}
                  >
                    {busy === "draft" ? "Invio…" : "Invia bozza al cliente"}
                  </button>
                  <button
                    type="button"
                    className="vc-btn ghost"
                    onClick={async () => {
                      if (
                        !form.tracking.trim() &&
                        !confirm("Nessun codice di tracking: avvisare il cliente lo stesso?")
                      )
                        return;
                      await patch(
                        { tracking: form.tracking, status: "spedito", notify: true },
                        "Spedito, cliente avvisato",
                      );
                    }}
                  >
                    Segna spedito e avvisa
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="ad-box">
            <h2>Cliente</h2>
            <div className="vc-row vc-r2">
              <Field label="Nome e cognome">
                <input value={form.customer_name} onChange={setF("customer_name")} />
              </Field>
              <Field label="Cellulare">
                <input value={form.phone} onChange={setF("phone")} />
              </Field>
            </div>
            <Field label="Email">
              <input value={form.email} onChange={setF("email")} />
            </Field>
            <Field label="Indirizzo di spedizione">
              <textarea value={form.address} onChange={setF("address")} />
            </Field>
            <Field label="Note del cliente">
              <textarea value={form.customer_note} onChange={setF("customer_note")} />
            </Field>
            <div className="ad-actions" style={{ marginTop: 10 }}>
              {form.phone && (
                <a
                  className="vc-btn ghost"
                  href={`https://wa.me/${form.phone.replace(/\D/g, "").replace(/^(?!39)(3\d{8,9})$/, "39$1")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              )}
              {form.email && (
                <a className="vc-btn ghost" href={`mailto:${form.email}`}>
                  Email
                </a>
              )}
            </div>
          </div>

          <div className="ad-box">
            <h2>Gestione</h2>
            <div className="vc-row vc-r2">
              <Field label="Numero di serie">
                <input value={form.serial} inputMode="numeric" onChange={setF("serial")} />
              </Field>
              <Field label={`Tiratura (su ${MAX_EDITION})`}>
                <input value={form.edition} inputMode="numeric" onChange={setF("edition")} />
              </Field>
            </div>
            {!legacy && (
              <Field label="Custodia">
                <select value={form.custodia} onChange={setF("custodia")}>
                  {CUSTODIE.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} {c.price ? `(+€${c.price})` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Codice di tracking">
              <input value={form.tracking} onChange={setF("tracking")} />
            </Field>
            <Field label="Note interne (le vedi solo tu)">
              <textarea value={form.admin_note} onChange={setF("admin_note")} />
            </Field>
            {!legacy && (
              <p className="vc-hint">
                {catOf(o.category).n} {euro(o.price)} + {o.case_label || "nessuna custodia"}{" "}
                {euro(o.case_price)} + spedizione {euro(o.shipping)} = <b>{euro(o.total)}</b>
              </p>
            )}
          </div>

          {card && (
            <CardEditor
              d={card}
              set={(p) => {
                setCard({ ...card, ...p });
                setDirty(true);
              }}
            />
          )}

          {legacy && (
            <div className="ad-box">
              <h2>Dati dal foglio Google</h2>
              <dl className="ad-kv">
                {legacyRows.map(([k, v]) => (
                  <Fragment key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </Fragment>
                ))}
              </dl>
            </div>
          )}

          <div className="ad-actions">
            <button type="button" className="vc-btn danger" onClick={remove}>
              Elimina ordine
            </button>
          </div>

          {dirty && (
            <div className="ad-save">
              <span>Hai modifiche non salvate</span>
              <div className="ad-actions">
                <button
                  type="button"
                  className="vc-btn ghost"
                  onClick={() => {
                    apply(o);
                  }}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  className="vc-btn"
                  onClick={saveAll}
                  disabled={busy === "save"}
                >
                  {busy === "save" ? "Salvo…" : "Salva modifiche"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <div className="ad-toast">{toast}</div>}
    </>
  );
}
