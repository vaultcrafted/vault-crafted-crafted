import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, api } from "@/components/vault/AdminShell";
import { FONTS_HREF, Field } from "@/components/vault/CardEditor";
import { parseCSV } from "@/lib/csv";

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

function Settings() {
  const [start, setStart] = useState("");
  const [maxSerial, setMaxSerial] = useState(0);
  const [mail, setMail] = useState<boolean | null>(null);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [replace, setReplace] = useState(true);

  useEffect(() => {
    api<{ settings: Record<string, string>; maxSerial: number; mail: boolean }>(
      "/api/admin/impostazioni",
    )
      .then((r) => {
        setStart(r.settings.serial_start ?? "1");
        setPayInfo(r.settings.payment_info ?? "");
        setMaxSerial(r.maxSerial);
        setMail(r.mail);
      })
      .catch((e) => setMsg(e.message));
  }, []);

  const [testing, setTesting] = useState(false);
  const [payInfo, setPayInfo] = useState("");
  const savePay = async () => {
    try {
      await api("/api/admin/impostazioni", { method: "PUT", json: { payment_info: payInfo } });
      setMsg("Istruzioni di pagamento salvate");
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  const testMail = async () => {
    setTesting(true);
    try {
      const r = await api<{ ok: boolean; error?: string; to: string }>("/api/admin/impostazioni", {
        method: "POST",
      });
      setMsg(r.ok ? `Email di prova inviata a ${r.to}` : `Brevo ha risposto: ${r.error}`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setTesting(false);
    }
  };

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
      const r = await api<{ imported: number; removed: number }>("/api/admin/importa", {
        method: "POST",
        json: { rows: preview, replace },
      });
      setMsg(
        `Importati ${r.imported} ordini nello storico` +
          (r.removed ? ` (tolti ${r.removed} doppioni)` : ""),
      );
      setPreview(null);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const [fixing, setFixing] = useState(false);
  const fixImported = async () => {
    setFixing(true);
    try {
      const r = await api<{ fixed: number; removed: number }>("/api/admin/importa", { method: "PUT" });
      setMsg(
        `Sistemati ${r.fixed} ordini importati: stato, pagato, totale e data ricalcolati dal foglio.` +
          (r.removed ? ` Tolti ${r.removed} doppioni.` : " Nessun doppione."),
      );
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setFixing(false);
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
        <h2>Pagamento</h2>
        <p className="vc-hint">
          Queste istruzioni vengono aggiunte all'email "riepilogo e pagamento" che mandi dal
          dettaglio ordine.
        </p>
        <Field label="Come pagare">
          <textarea
            rows={4}
            value={payInfo}
            placeholder={"Bonifico a: IBAN IT00 X000 0000 0000 0000 0000 000\nIntestato a: …\nCausale: N° carta"}
            onChange={(e) => setPayInfo(e.target.value)}
          />
        </Field>
        <div className="ad-actions" style={{ marginTop: 10 }}>
          <button type="button" className="vc-btn" onClick={savePay}>
            Salva
          </button>
        </div>
      </section>

      <section className="ad-box">
        <h2>Email</h2>
        <p className="vc-hint">
          {mail === null
            ? "…"
            : mail
              ? "Brevo è collegato: conferme d'ordine, riepiloghi di pagamento e avvisi di spedizione partono in automatico."
              : "Brevo non è ancora collegato: gli ordini arrivano nel pannello ma le email non partono."}
        </p>
        <div className="ad-actions">
          <button type="button" className="vc-btn" onClick={testMail} disabled={testing}>
            {testing ? "Invio…" : "Manda un'email di prova"}
          </button>
        </div>
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
        <p className="vc-hint" style={{ marginTop: 14 }}>
          Hai importato più volte o vedi pagati, totali o date sbagliati? Questo pulsante ricalcola
          gli ordini del foglio e toglie i doppioni, senza ricaricare il CSV.
        </p>
        <button type="button" className="vc-btn ghost" onClick={fixImported} disabled={fixing}>
          {fixing ? "Ricalcolo…" : "Sistema e togli i doppioni"}
        </button>
        {preview && preview.length > 0 && (
          <>
            <p className="vc-hint">
              Trovate <b>{preview.length}</b> righe. Colonne: {Object.keys(preview[0]).join(", ")}
            </p>
            <label style={{ display: "flex", gap: 10, alignItems: "center", margin: "10px 0 0", fontSize: 14 }}>
              <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
              Sostituisci gli ordini già importati dal foglio (consigliato: evita i doppioni)
            </label>
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
