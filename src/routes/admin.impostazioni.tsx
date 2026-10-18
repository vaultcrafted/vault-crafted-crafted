import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, api } from "@/components/vault/AdminShell";
import { FONTS_HREF, Field } from "@/components/vault/CardEditor";

export const Route = createFileRoute("/admin/impostazioni")({
  component: () => (
    <AdminShell title="Impostazioni">
      <Settings />
    </AdminShell>
  ),
  head: () => ({
    meta: [
      { title: "Impostazioni — Pannello Vault" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "stylesheet", href: FONTS_HREF }],
  }),
});

/** Legge un CSV (anche esportato da Google Fogli) in righe oggetto. */
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    q = false;
  const sep =
    (text.split("\n")[0].match(/;/g)?.length ?? 0) > (text.split("\n")[0].match(/,/g)?.length ?? 0)
      ? ";"
      : ",";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  const [head, ...body] = rows;
  if (!head) return [];
  return body.map((r) =>
    Object.fromEntries(head.map((h, i) => [h.trim() || `colonna_${i + 1}`, (r[i] ?? "").trim()])),
  );
}

function Settings() {
  const [start, setStart] = useState("");
  const [maxSerial, setMaxSerial] = useState(0);
  const [mail, setMail] = useState<boolean | null>(null);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    api<{ settings: Record<string, string>; maxSerial: number; mail: boolean }>(
      "/api/admin/impostazioni",
    )
      .then((r) => {
        setStart(r.settings.serial_start ?? "1");
        setMaxSerial(r.maxSerial);
        setMail(r.mail);
      })
      .catch((e) => setMsg(e.message));
  }, []);

  const saveStart = async () => {
    try {
      await api("/api/admin/impostazioni", {
        method: "PUT",
        json: { serial_start: Number(start) },
      });
      setMsg("Numero di partenza salvato");
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const doImport = async () => {
    if (!preview?.length) return;
    setImporting(true);
    try {
      const r = await api<{ imported: number }>("/api/admin/importa", {
        method: "POST",
        json: { rows: preview },
      });
      setMsg(`Importati ${r.imported} ordini nello storico`);
      setPreview(null);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const next = Math.max(maxSerial + 1, Number(start) || 1);

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 760 }}>
      {msg && (
        <div className="ad-box" role="status">
          {msg}
        </div>
      )}

      <section className="ad-box">
        <h2>Numerazione</h2>
        <p className="vc-hint">
          Ogni ordine dal sito prende il numero successivo. Il prossimo sarà{" "}
          <b>N° {String(next).padStart(3, "0")}</b>. Se vuoi continuare dalle carte che hai già
          fatto, imposta qui il numero da cui partire.
        </p>
        <div className="vc-row" style={{ gridTemplateColumns: "160px auto", alignItems: "end" }}>
          <Field label="Parti da">
            <input
              value={start}
              inputMode="numeric"
              onChange={(e) => setStart(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <div>
            <button type="button" className="vc-btn" onClick={saveStart}>
              Salva
            </button>
          </div>
        </div>
        <p className="vc-hint">
          La tiratura conta le carte dello stesso cliente (stessa email), fino a 420.
        </p>
      </section>

      <section className="ad-box">
        <h2>Email</h2>
        <p className="vc-hint">
          {mail === null
            ? "…"
            : mail
              ? "Brevo è collegato: conferme, bozze e avvisi di spedizione partono in automatico."
              : "Brevo non è ancora collegato: gli ordini arrivano nel pannello ma le email non partono."}
        </p>
      </section>

      <section className="ad-box">
        <h2>Importa i vecchi ordini</h2>
        <p className="vc-hint">
          Su Google Fogli: File → Scarica → Valori separati da virgola (.csv). Carica qui il file:
          gli ordini finiscono nello stato "Storico", senza toccare la numerazione dei nuovi.
        </p>
        <label className="vc-upload">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const rows = parseCSV(await f.text());
              setPreview(rows);
              setMsg(rows.length ? "" : "Il file non contiene righe");
            }}
          />
          <span>Scegli il CSV</span>
        </label>
        {preview && preview.length > 0 && (
          <>
            <p className="vc-hint">
              Trovate <b>{preview.length}</b> righe. Colonne: {Object.keys(preview[0]).join(", ")}
            </p>
            <button
              type="button"
              className="vc-btn dark"
              onClick={doImport}
              disabled={importing}
              style={{ marginTop: 10 }}
            >
              {importing ? "Importo…" : `Importa ${preview.length} ordini`}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
