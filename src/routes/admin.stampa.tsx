import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell, StatusPill, api } from "@/components/vault/AdminShell";
import { FONTS_HREF } from "@/components/vault/CardEditor";
import {
  CARD_H,
  CARD_W,
  catOf,
  loadFonts,
  renderCard,
  type ArtState,
  type CardData,
} from "@/lib/vaultCard";
import type { OrderRow } from "@/lib/vaultShop";
import { SHEETS, drawSheet, sheetsToPdf, type SheetCard } from "@/lib/printSheet";

export const Route = createFileRoute("/admin/stampa")({
  component: () => (
    <AdminShell title="Foglio di stampa">
      <PrintSheet />
    </AdminShell>
  ),
  head: () => ({
    meta: [
      { title: "Stampa — Pannello Vault" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "stylesheet", href: FONTS_HREF }],
  }),
});

interface Row {
  id: string;
  serial: number | null;
  status: string;
  customer_name: string;
  category: string;
  card_name: string;
  source: string;
  has_art: number;
}

const pad = (n: number | null) => (n == null ? "—" : String(n).padStart(3, "0"));
const fileUrl = (key: string) => `/api/admin/file?key=${encodeURIComponent(key)}`;
const loadImg = (src: string) =>
  new Promise<HTMLImageElement | null>((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });

function PrintSheet() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [fmt, setFmt] = useState("sra3");
  const [splitHolo, setSplitHolo] = useState(true);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    api<{ orders: Row[] }>("/api/admin/ordini?status=attivi")
      .then((d) => {
        const list = d.orders.filter((o) => o.source === "sito");
        setRows(list);
        // preseleziona le carte approvate con l'illustrazione caricata
        setSel(
          Object.fromEntries(
            list.map((o) => [o.id, o.status === "approvato" && !!o.has_art]),
          ),
        );
      })
      .catch((e) => setMsg(e.message));
  }, []);

  const chosen = useMemo(() => (rows ?? []).filter((o) => sel[o.id]), [rows, sel]);
  const f = SHEETS.find((s) => s.id === fmt) ?? SHEETS[0];
  const perSheet = f.cols * f.rows;

  const generate = async () => {
    if (!chosen.length) return;
    setMsg("");
    setDone([]);
    try {
      await loadFonts();
      const normal: SheetCard[] = [];
      const holo: SheetCard[] = [];
      for (let i = 0; i < chosen.length; i++) {
        const r = chosen[i];
        setBusy(`Preparo la carta ${i + 1} di ${chosen.length}…`);
        const { order: o } = await api<{ order: OrderRow }>(`/api/admin/ordini/${r.id}`);
        const card = JSON.parse(o.card_json) as CardData;
        let pos = { zoom: 1, px: 0, py: 0 };
        try {
          pos = JSON.parse(o.art_pos);
        } catch {
          /* posizione predefinita */
        }
        const img = await loadImg(fileUrl(o.art_key || o.photo_key));
        const art: ArtState = { img, ...pos };
        const cv = document.createElement("canvas");
        cv.width = CARD_W;
        cv.height = CARD_H;
        await renderCard(cv.getContext("2d")!, { ...card, serial: o.serial, edition: o.edition }, art);
        const entry = {
          canvas: cv,
          label: `N°${pad(o.serial)} ${card.name || ""}${card.holo ? " ✦holo" : ""}${o.art_key ? "" : " (FOTO!)"}`,
        };
        (splitHolo && card.holo ? holo : normal).push(entry);
      }
      setBusy("Impagino i fogli…");
      const date = new Date().toLocaleDateString("it-IT");
      const pages: { canvas: HTMLCanvasElement; wMm: number; hMm: number }[] = [];
      const addSheets = (list: SheetCard[], kind: string) => {
        const nSheets = Math.ceil(list.length / perSheet);
        for (let s = 0; s < nSheets; s++) {
          const part = list.slice(s * perSheet, (s + 1) * perSheet);
          const title = `Vault ${date} · ${kind} · foglio ${s + 1}/${nSheets}`;
          pages.push({ canvas: drawSheet(f, part, title), wMm: f.wMm, hMm: f.hMm });
        }
      };
      addSheets(normal, splitHolo ? "carte normali" : "carte");
      addSheets(holo, "PELLICOLA OLOGRAFICA");
      setBusy("Creo il PDF…");
      const pdf = await sheetsToPdf(pages);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(pdf);
      a.download = `vault_stampa_${new Date().toISOString().slice(0, 10)}_${f.id}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 8000);
      setDone(chosen.map((c) => c.id));
      setMsg(
        `PDF pronto: ${pages.length} ${pages.length === 1 ? "foglio" : "fogli"}, ${chosen.length} carte.`,
      );
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const markPrinting = async () => {
    setBusy("Aggiorno gli ordini…");
    try {
      for (const id of done)
        await api(`/api/admin/ordini/${id}`, { method: "PATCH", json: { status: "in_stampa" } });
      setRows((rs) => (rs ?? []).map((r) => (done.includes(r.id) ? { ...r, status: "in_stampa" } : r)));
      setMsg(`${done.length} ordini segnati "In stampa".`);
      setDone([]);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="ad-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,360px)" }}>
      <div>
        {!rows && <p className="vc-hint">Caricamento…</p>}
        {rows && rows.length === 0 && (
          <div className="ad-empty">Nessun ordine in corso da stampare.</div>
        )}
        {rows && rows.length > 0 && (
          <table className="ad-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    aria-label="Seleziona tutti"
                    checked={chosen.length === rows.length}
                    onChange={(e) =>
                      setSel(Object.fromEntries(rows.map((r) => [r.id, e.target.checked])))
                    }
                  />
                </th>
                <th>N°</th>
                <th>Carta</th>
                <th className="hide-m">Cliente</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} onClick={() => setSel({ ...sel, [o.id]: !sel[o.id] })}>
                  <td>
                    <input type="checkbox" readOnly checked={!!sel[o.id]} aria-label="Seleziona" />
                  </td>
                  <td>
                    <span className="ad-num">{pad(o.serial)}</span>
                  </td>
                  <td>
                    <b>{o.card_name || "—"}</b>
                    <span className="ad-sub">
                      {catOf(o.category).n}
                      {o.has_art ? "" : " · manca l'illustrazione"}
                    </span>
                  </td>
                  <td className="hide-m">{o.customer_name}</td>
                  <td>
                    <StatusPill s={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="ad-side">
        <div className="ad-box">
          <h2>Foglio</h2>
          <div className="vc-seg" style={{ flexDirection: "column", alignItems: "stretch" }}>
            {SHEETS.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={fmt === s.id}
                onClick={() => setFmt(s.id)}
                style={{ textAlign: "left" }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="vc-hint">
            Carte a 63×88 mm con {String(f.bleedMm).replace(".", ",")} mm di abbondanza, segni di
            taglio ai bordi, PDF a 300 dpi. Sotto il foglio c'è l'elenco delle carte in ordine di
            posizione.
          </p>
          <label className="ad-check" style={{ margin: "10px 0" }}>
            <input
              type="checkbox"
              checked={splitHolo}
              onChange={(e) => setSplitHolo(e.target.checked)}
            />
            Olografiche su fogli separati
          </label>
          <p className="vc-hint" style={{ margin: "0 0 12px" }}>
            {chosen.length} carte selezionate · {perSheet} per foglio
          </p>
          <div className="ad-actions">
            <button
              type="button"
              className="vc-btn"
              disabled={!chosen.length || !!busy}
              onClick={generate}
            >
              {busy || "Scarica il PDF di stampa"}
            </button>
            {done.length > 0 && !busy && (
              <button type="button" className="vc-btn ghost" onClick={markPrinting}>
                Segna {done.length} ordini "In stampa"
              </button>
            )}
          </div>
          {msg && <p className="vc-hint" role="status">{msg}</p>}
        </div>
        <p className="vc-hint">
          Le carte senza illustrazione usano la foto del cliente e sono segnate "(FOTO!)" nella
          didascalia. Per sistemare inquadrature o testi apri l'ordine dalla{" "}
          <Link to="/admin">lista ordini</Link>.
        </p>
      </div>
    </div>
  );
}
