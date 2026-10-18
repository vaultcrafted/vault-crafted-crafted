import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { CardStage, STAGE_CSS } from "@/components/vault/CardStage";
import {
  CATS,
  ELEMENTS,
  MAX_EDITION,
  badgeURL,
  catOf,
  elementOf,
  loadFonts,
  type ArtState,
  type CardData,
  type CatKey,
  type ElKey,
  type MoveMode,
} from "@/lib/vaultCard";

export const Route = createFileRoute("/crea")({
  component: CreaPage,
  head: () => ({
    meta: [
      { title: "Crea la tua carta — Vault Crafted" },
      {
        name: "description",
        content:
          "Componi la tua carta Vault dal vivo: scegli categoria, elemento, attacchi e abilità, carica la foto e guarda la carta prendere forma. Disegnata a mano, numerata, da €22.",
      },
      { property: "og:url", content: "https://vaultcrafted.com/crea" },
      { property: "og:title", content: "Crea la tua carta — Vault Crafted" },
      {
        property: "og:description",
        content: "Componi la tua carta Vault dal vivo e ordinala in pochi minuti.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://vaultcrafted.com/crea" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;700;800&family=Archivo:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@500;700&display=swap",
      },
    ],
  }),
});

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx8QLjmeBLw62VDxf3hakKu4HpIHHXw7THzMCrkMGvnG0TziDPYWQ-aySJrpyf5ZSdsjg/exec";
const SPEDIZIONE = 4.99;
const CUSTODIE = [
  { id: "nessuna", label: "Nessuna custodia", price: 0 },
  { id: "one-touch-35pt", label: "One Touch 35pt", price: 1 },
  { id: "one-touch-bordo-nero", label: "One Touch 35pt bordo nero", price: 2 },
  { id: "recessed-snap", label: "Recessed Snap", price: 2 },
  { id: "mini-snap", label: "Mini Snap", price: 2 },
  { id: "screwdown-recessed", label: "Screwdown Recessed", price: 3 },
  { id: "screwdown-bordo-nero", label: "Screwdown bordo nero", price: 5 },
];
const MAX_FILE = 10 * 1024 * 1024;

const INITIAL: CardData = {
  cat: "core",
  el: "fuoco",
  mode: "two",
  name: "",
  hp: "120",
  abName: "",
  abText: "",
  m1: "",
  d1: "60",
  t1: "",
  m2: "",
  d2: "120",
  t2: "",
  weak: "acqua",
  weakV: "×2",
  res: "",
  resV: "−30",
  ret: "vault",
  retN: 1,
  motto: "",
  serial: null,
  edition: null,
};
// testi d'esempio mostrati sulla carta finché il campo è vuoto
const SAMPLE = {
  name: "Il tuo nome",
  abName: "Nome abilità",
  abText: "Descrivi cosa fa la sua abilità speciale.",
  m1: "Primo attacco",
  t1: "Racconta la mossa: un'abitudine, una battuta, un ricordo che vi lega.",
  m2: "Secondo attacco",
  t2: "La mossa finale, quella che lo rende unico.",
  motto: "Il motto della carta.",
};

interface Contacts {
  nome_cognome: string;
  email: string;
  cellulare: string;
  indirizzo: string;
  note: string;
}

function CreaPage() {
  const [d, setD] = useState<CardData>(INITIAL);
  const set = useCallback((p: Partial<CardData>) => setD((x) => ({ ...x, ...p })), []);
  const art = useRef<ArtState>({ img: null, zoom: 1, px: 0, py: 0 });
  const [artVersion, setArtVersion] = useState(0);
  const [fontsVersion, setFontsVersion] = useState(0);
  const [photo, setPhoto] = useState<{ dataUrl: string; name: string; type: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [custodia, setCustodia] = useState("nessuna");
  const [contacts, setContacts] = useState<Contacts>({
    nome_cognome: "",
    email: "",
    cellulare: "",
    indirizzo: "",
    note: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const compact = useCompact();

  useEffect(() => {
    void loadFonts().then(() => setFontsVersion((v) => v + 1));
  }, []);

  const cat = catOf(d.cat);
  const cust = CUSTODIE.find((c) => c.id === custodia) ?? CUSTODIE[0];
  const total = cat.price + cust.price + SPEDIZIONE;

  // dati mostrati sulla carta (campi vuoti → testo d'esempio)
  const shown: CardData = {
    ...d,
    name: d.name || SAMPLE.name,
    abName: d.abName || SAMPLE.abName,
    abText: d.abText || SAMPLE.abText,
    m1: d.m1 || SAMPLE.m1,
    t1: d.t1 || SAMPLE.t1,
    m2: d.m2 || SAMPLE.m2,
    t2: d.t2 || SAMPLE.t2,
    motto: d.motto || SAMPLE.motto,
  };

  const onFile = (f: File | undefined) => {
    setFileError("");
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setFileError("Carica un'immagine (JPG, PNG, HEIC convertita…).");
      return;
    }
    if (f.size > MAX_FILE) {
      setFileError("La foto supera i 10 MB: prova con una versione più leggera.");
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      const im = new Image();
      im.onload = () => {
        art.current = { img: im, zoom: 1, px: 0, py: 0 };
        setZoom(1);
        setPhoto({ dataUrl: url, name: f.name, type: f.type });
        setArtVersion((v) => v + 1);
      };
      im.src = url;
    };
    r.readAsDataURL(f);
  };

  const validate = () => {
    const e: string[] = [];
    if (!d.name.trim()) e.push("Il nome della carta");
    if (!d.hp.trim()) e.push("Gli HP");
    if (d.mode === "ab" && !d.abName.trim()) e.push("Il nome dell'abilità");
    if (!d.m1.trim())
      e.push(d.mode === "ab" ? "Il nome dell'attacco" : "Il nome del primo attacco");
    if (d.mode === "two" && !d.m2.trim()) e.push("Il nome del secondo attacco");
    if (!photo) e.push("La foto da cui disegnare la carta");
    if (!contacts.nome_cognome.trim()) e.push("Nome e cognome");
    if (!/^\S+@\S+\.\S+$/.test(contacts.email.trim())) e.push("Un'email valida");
    if (!contacts.cellulare.trim()) e.push("Il cellulare");
    if (!contacts.indirizzo.trim()) e.push("L'indirizzo di spedizione");
    return e;
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (e.length) {
      document.getElementById("riepilogo")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSending(true);
    const elName = (k: ElKey | "") => (k ? elementOf(k)[1] : "Nessuna");
    const ab = d.mode === "ab";
    const payload: Record<string, unknown> = {
      formato: "Formato Vault",
      tipologia: `${cat.n} - €${cat.price}`,
      categoria: cat.n,
      energia: elementOf(d.el)[1],
      nome: d.name.trim(),
      hp: d.hp.trim(),
      modalita_mosse: ab ? "Abilità + 1 attacco" : d.mode === "one" ? "1 attacco" : "2 attacchi",
      abilita: ab ? d.abName.trim() : "",
      abilita_descrizione: ab ? d.abText.trim() : "",
      // compatibile con il foglio attuale: l'abilità finisce nella colonna del primo attacco
      attacco1: ab ? `[ABILITÀ] ${d.abName.trim()}` : d.m1.trim(),
      attacco1_descrizione: ab ? d.abText.trim() : d.t1.trim(),
      attacco1_energie: "",
      attacco1_danni: ab ? "" : d.d1.trim(),
      attacco2: ab ? d.m1.trim() : d.mode === "two" ? d.m2.trim() : "",
      attacco2_descrizione: ab ? d.t1.trim() : d.mode === "two" ? d.t2.trim() : "",
      attacco2_energie: "",
      attacco2_danni: ab ? d.d1.trim() : d.mode === "two" ? d.d2.trim() : "",
      debolezza: d.weak ? `${elName(d.weak)} ${d.weakV.trim()}` : "Nessuna",
      resistenza: d.res ? `${elName(d.res)} ${d.resV.trim()}` : "Nessuna",
      costo_ritirata: d.retN ? `${d.retN} × ${elName(d.ret)}` : "0",
      frase: d.motto.trim(),
      custodia: `${cust.label} +${cust.price}€`,
      olografica: d.cat === "prism" || d.cat === "legend" ? "Inclusa nella categoria" : "No",
      totale: `€${total.toFixed(2)}`,
      nome_cognome: contacts.nome_cognome.trim(),
      email_contatto: contacts.email.trim(),
      cellulare: contacts.cellulare.trim(),
      spedizione: contacts.indirizzo.trim(),
      note: contacts.note.trim(),
      inquadratura: `zoom ${art.current.zoom.toFixed(2)}, x ${Math.round(art.current.px)}, y ${Math.round(art.current.py)}`,
    };
    if (photo) {
      payload.fileName = photo.name;
      payload.fileType = photo.type;
      payload.fileBase64 = photo.dataUrl.split(",")[1] ?? "";
    }
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors(["Invio non riuscito. Riprova tra poco o scrivici su WhatsApp."]);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <main className="vc-page">
        <style>{PAGE_CSS + STAGE_CSS}</style>
        <TopBar />
        <section className="vc-done">
          <div className="vc-done-card">
            <CardStage data={shown} art={art} artVersion={artVersion} fontsVersion={fontsVersion} />
          </div>
          <div>
            <p className="vc-kicker">ORDINE RICEVUTO</p>
            <h1>La tua carta è nel Vault.</h1>
            <p>
              Disegniamo l'illustrazione a mano partendo dalla tua foto e ti mandiamo la bozza via
              email entro 24–48 ore. Le modifiche sono gratuite.
            </p>
            <p>Il numero di serie e la tiratura vengono assegnati quando la carta va in stampa.</p>
            <Link to="/" className="vc-btn">
              Torna alla home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="vc-page">
      <style>{PAGE_CSS + STAGE_CSS}</style>
      <TopBar />
      <header className="vc-head">
        <p className="vc-kicker">FORMATO VAULT</p>
        <h1>Crea la tua carta</h1>
        <p>
          Scegli, scrivi, guarda la carta prendere forma. Poi la disegniamo a mano e la stampiamo
          per te.
        </p>
      </header>

      <div className="vc-layout">
        <aside className="vc-preview">
          <CardStage
            data={shown}
            art={art}
            artVersion={artVersion}
            fontsVersion={fontsVersion}
            compact={compact}
          />
          {!compact && (
            <div className="vc-price">
              <span>
                {cat.n}
                {cust.price ? ` + ${cust.label}` : ""} + spedizione
              </span>
              <b>€{total.toFixed(2)}</b>
            </div>
          )}
        </aside>

        <form
          className="vc-form"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Step n={1} title="Categoria">
            <div className="vc-cats">
              {CATS.map((c) => (
                <button
                  key={c.k}
                  type="button"
                  aria-pressed={d.cat === c.k}
                  onClick={() => set({ cat: c.k as CatKey })}
                >
                  <span className="n">{c.n}</span>
                  <span className="p">€{c.price}</span>
                </button>
              ))}
            </div>
            <p className="vc-hint">{cat.hint}</p>
          </Step>

          <Step n={2} title="Elemento">
            <div className="vc-els">
              {ELEMENTS.map(([k, n]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={d.el === k}
                  title={n}
                  onClick={() => set({ el: k })}
                >
                  <img src={badgeURL(k)} alt="" />
                  <span>{n}</span>
                </button>
              ))}
            </div>
          </Step>

          <Step n={3} title="La tua foto">
            <p className="vc-hint">
              Carica la foto della persona (o delle persone) da mettere sulla carta. L'illustrazione
              la disegniamo noi a mano: qui ti serve per vedere l'inquadratura. Trascinala
              sull'anteprima per spostarla.
            </p>
            <label className="vc-upload">
              <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
              <span>{photo ? "Cambia foto" : "Scegli la foto"}</span>
              {photo && <em>{photo.name}</em>}
            </label>
            {fileError && <p className="vc-err">{fileError}</p>}
            {photo && (
              <label className="vc-field">
                <span>Zoom</span>
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
                  }}
                />
              </label>
            )}
          </Step>

          <Step n={4} title="Nome e HP">
            <div className="vc-row vc-r-nh">
              <Field label="Nome sulla carta">
                <input
                  value={d.name}
                  maxLength={28}
                  placeholder="Es. Gino"
                  onChange={(e) => set({ name: e.target.value })}
                />
              </Field>
              <Field label="HP">
                <input
                  value={d.hp}
                  inputMode="numeric"
                  maxLength={3}
                  onChange={(e) => set({ hp: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                />
              </Field>
            </div>
          </Step>

          <Step n={5} title="Attacchi e abilità">
            <div className="vc-seg">
              {(
                [
                  ["two", "2 attacchi"],
                  ["one", "1 attacco"],
                  ["ab", "Abilità + 1 attacco"],
                ] as [MoveMode, string][]
              ).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={d.mode === k}
                  onClick={() => set({ mode: k })}
                >
                  {l}
                </button>
              ))}
            </div>
            {d.mode === "ab" && (
              <div className="vc-move vc-ab">
                <h3>Abilità</h3>
                <Field label="Nome abilità">
                  <input
                    value={d.abName}
                    placeholder="Es. Re della Piazza"
                    onChange={(e) => set({ abName: e.target.value })}
                  />
                </Field>
                <Field label="Cosa fa">
                  <textarea value={d.abText} onChange={(e) => set({ abText: e.target.value })} />
                </Field>
              </div>
            )}
            <div className="vc-move">
              <h3>{d.mode === "ab" ? "Attacco" : "Primo attacco"}</h3>
              <div className="vc-row vc-r-nh">
                <Field label="Nome">
                  <input
                    value={d.m1}
                    placeholder="Es. It Gets Like That"
                    onChange={(e) => set({ m1: e.target.value })}
                  />
                </Field>
                <Field label="Danno">
                  <input value={d.d1} maxLength={4} onChange={(e) => set({ d1: e.target.value })} />
                </Field>
              </div>
              <Field label="Descrizione">
                <textarea value={d.t1} onChange={(e) => set({ t1: e.target.value })} />
              </Field>
            </div>
            {d.mode === "two" && (
              <div className="vc-move">
                <h3>Secondo attacco</h3>
                <div className="vc-row vc-r-nh">
                  <Field label="Nome">
                    <input value={d.m2} onChange={(e) => set({ m2: e.target.value })} />
                  </Field>
                  <Field label="Danno">
                    <input
                      value={d.d2}
                      maxLength={4}
                      onChange={(e) => set({ d2: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Descrizione">
                  <textarea value={d.t2} onChange={(e) => set({ t2: e.target.value })} />
                </Field>
              </div>
            )}
          </Step>

          <Step n={6} title="Debolezza, resistenza, ritirata">
            <Trait label="Debolezza" value={d.weak} onPick={(k) => set({ weak: k })}>
              <input
                className="vc-small"
                value={d.weakV}
                aria-label="Effetto debolezza"
                onChange={(e) => set({ weakV: e.target.value })}
              />
            </Trait>
            <Trait label="Resistenza" value={d.res} onPick={(k) => set({ res: k })}>
              <input
                className="vc-small"
                value={d.resV}
                aria-label="Effetto resistenza"
                onChange={(e) => set({ resV: e.target.value })}
              />
            </Trait>
            <Trait
              label="Ritirata"
              value={d.ret}
              noNone
              onPick={(k) => set({ ret: (k || "vault") as ElKey })}
            >
              <div className="vc-seg vc-seg-s">
                {[0, 1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={d.retN === n}
                    onClick={() => set({ retN: n })}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Trait>
          </Step>

          <Step n={7} title="Motto">
            <Field label="Una frase che lo descrive">
              <input
                value={d.motto}
                maxLength={60}
                placeholder="Es. Ogni piazza è il suo palco."
                onChange={(e) => set({ motto: e.target.value })}
              />
            </Field>
            <p className="vc-hint">
              Sotto il motto la carta porta il numero di serie e la tiratura (es. 1/{MAX_EDITION}):
              li assegniamo noi in stampa.
            </p>
          </Step>

          <Step n={8} title="Custodia">
            <div className="vc-list">
              {CUSTODIE.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={custodia === c.id}
                  onClick={() => setCustodia(c.id)}
                >
                  <span>{c.label}</span>
                  <b>{c.price ? `+€${c.price}` : "—"}</b>
                </button>
              ))}
            </div>
          </Step>

          <Step n={9} title="Spedizione e contatti">
            <div className="vc-row vc-r2">
              <Field label="Nome e cognome">
                <input
                  value={contacts.nome_cognome}
                  autoComplete="name"
                  onChange={(e) => setContacts({ ...contacts, nome_cognome: e.target.value })}
                />
              </Field>
              <Field label="Cellulare">
                <input
                  value={contacts.cellulare}
                  type="tel"
                  autoComplete="tel"
                  onChange={(e) => setContacts({ ...contacts, cellulare: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Email">
              <input
                value={contacts.email}
                type="email"
                autoComplete="email"
                onChange={(e) => setContacts({ ...contacts, email: e.target.value })}
              />
            </Field>
            <Field label="Indirizzo di spedizione">
              <textarea
                value={contacts.indirizzo}
                autoComplete="street-address"
                placeholder="Via, numero, CAP, città, provincia"
                onChange={(e) => setContacts({ ...contacts, indirizzo: e.target.value })}
              />
            </Field>
            <Field label="Note per noi (facoltativo)">
              <textarea
                value={contacts.note}
                placeholder="Dettagli sulla foto, sfondo che vorresti, a chi è il regalo…"
                onChange={(e) => setContacts({ ...contacts, note: e.target.value })}
              />
            </Field>
          </Step>

          <section className="vc-summary" id="riepilogo">
            <div className="vc-sumrows">
              <div>
                <span>Carta {cat.n}</span>
                <b>€{cat.price.toFixed(2)}</b>
              </div>
              {cust.price > 0 && (
                <div>
                  <span>{cust.label}</span>
                  <b>€{cust.price.toFixed(2)}</b>
                </div>
              )}
              <div>
                <span>Spedizione</span>
                <b>€{SPEDIZIONE.toFixed(2)}</b>
              </div>
              <div className="tot">
                <span>Totale</span>
                <b>€{total.toFixed(2)}</b>
              </div>
            </div>
            {errors.length > 0 && (
              <div className="vc-errbox" role="alert">
                <b>Manca ancora:</b>
                <ul>
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <button type="submit" className="vc-btn vc-btn-big" disabled={sending}>
              {sending ? "Invio in corso…" : "Invia l'ordine"}
            </button>
            <p className="vc-hint">
              Ti mandiamo la bozza disegnata a mano via email entro 24–48 ore. Le modifiche sono
              gratuite.
            </p>
          </section>
        </form>
      </div>

      {compact && (
        <div className="vc-bottombar">
          <span>
            {cat.n} · <b>€{total.toFixed(2)}</b>
          </span>
          <a href="#riepilogo" className="vc-btn">
            Riepilogo
          </a>
        </div>
      )}
    </main>
  );
}

function useCompact() {
  const [c, setC] = useState(false);
  useEffect(() => {
    const m = matchMedia("(max-width: 900px)");
    const f = () => setC(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return c;
}

function TopBar() {
  return (
    <nav className="vc-top">
      <Link to="/" className="vc-logo" aria-label="Vault Crafted, home">
        <img src="/LOGO.png" alt="Vault Crafted" />
      </Link>
      <Link to="/" className="vc-back">
        ← Torna al sito
      </Link>
    </nav>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="vc-step">
      <h2>
        <span>{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="vc-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Trait({
  label,
  value,
  onPick,
  noNone,
  children,
}: {
  label: string;
  value: string;
  onPick: (k: ElKey | "") => void;
  noNone?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="vc-trait">
      <span className="vc-tl">{label}</span>
      <div className="vc-picks">
        {!noNone && (
          <button
            type="button"
            className="none"
            aria-pressed={value === ""}
            onClick={() => onPick("")}
          >
            Nessuna
          </button>
        )}
        {ELEMENTS.map(([k, n]) => (
          <button
            key={k}
            type="button"
            title={n}
            aria-label={n}
            aria-pressed={value === k}
            onClick={() => onPick(k)}
          >
            <img src={badgeURL(k)} alt="" />
          </button>
        ))}
      </div>
      {children && <div className="vc-tv">{children}</div>}
    </div>
  );
}

const PAGE_CSS = `
.vc-page{--bg:#E9EAEF;--panel:#FFFFFF;--ink:#141A3A;--muted:#5A5D6B;--line:#D3D6DF;--field:#F4F5F8;--gold:#E2A917;--gold-ink:#2A1F00;--focus:#1F86D6;
  min-height:100vh;background:var(--bg);color:var(--ink);font-family:Archivo,system-ui,sans-serif;font-size:15px;padding-bottom:40px}
.vc-page *{box-sizing:border-box}
.vc-top{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;background:#141A3A}
.vc-logo img{height:34px;display:block}
.vc-back{color:#C9CEE3;font-size:13px;text-decoration:none}
.vc-back:hover{color:#fff}
.vc-head{padding:30px 24px 18px;max-width:1280px;margin:0 auto}
.vc-kicker{margin:0;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--muted)}
.vc-head h1,.vc-done h1{margin:4px 0 6px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(38px,6vw,64px);line-height:.95}
.vc-head p:last-child{margin:0;color:var(--muted);max-width:560px}
.vc-layout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:28px;max-width:1280px;margin:0 auto;padding:0 24px;align-items:start}
.vc-preview{position:sticky;top:16px;display:flex;flex-direction:column;gap:12px}
.vc-preview .vc-stage{min-height:min(84vh,760px)}
.vc-price{display:flex;justify-content:space-between;align-items:baseline;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px 18px;color:var(--muted);font-size:14px}
.vc-price b{font-family:'Saira Condensed',sans-serif;font-size:28px;color:var(--ink)}
.vc-form{display:flex;flex-direction:column;gap:14px;min-width:0}
.vc-step{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 18px 16px}
.vc-step h2{margin:0 0 12px;display:flex;align-items:center;gap:10px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:24px}
.vc-step h2 span{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;background:var(--ink);color:#fff;border-radius:6px;padding:3px 7px}
.vc-hint{margin:8px 0 0;font-size:13px;line-height:1.45;color:var(--muted)}
.vc-err{color:#B42318;font-size:13px;margin:6px 0 0}
.vc-cats{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.vc-cats button,.vc-seg button,.vc-list button,.vc-els button,.vc-picks button{font:inherit;color:var(--ink);cursor:pointer;background:var(--field);border:1.5px solid var(--line);transition:transform .15s,border-color .15s,background .15s}
.vc-cats button{border-radius:12px;padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:2px}
.vc-cats .n{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:19px;line-height:1}
.vc-cats .p{font-size:13px;color:var(--muted)}
.vc-cats button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:#fff}
.vc-cats button[aria-pressed=true] .p{color:#C9CEE3}
.vc-els{display:grid;grid-template-columns:repeat(9,1fr);gap:6px}
.vc-els button{border-radius:12px;padding:8px 2px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;font-weight:600}
.vc-els img{width:34px;height:34px}
.vc-els button[aria-pressed=true],.vc-list button[aria-pressed=true]{border-color:var(--ink);background:#fff;box-shadow:0 0 0 1.5px var(--ink)}
.vc-upload{display:flex;align-items:center;gap:12px;margin-top:12px;cursor:pointer;flex-wrap:wrap}
.vc-upload input{position:absolute;opacity:0;width:1px;height:1px}
.vc-upload span{background:var(--ink);color:#fff;border-radius:10px;padding:10px 16px;font-weight:700}
.vc-upload em{font-size:13px;color:var(--muted);font-style:normal;overflow:hidden;text-overflow:ellipsis;max-width:240px;white-space:nowrap}
.vc-upload:focus-within span{outline:2px solid var(--focus);outline-offset:2px}
.vc-field{display:flex;flex-direction:column;gap:5px;margin-top:10px;min-width:0}
.vc-field>span{font-size:12px;font-weight:600}
.vc-field input:not([type=range]),.vc-field textarea,.vc-small{width:100%;font:inherit;color:var(--ink);background:var(--field);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.vc-field textarea{min-height:64px;resize:vertical;line-height:1.4}
.vc-field input[type=range]{accent-color:var(--ink)}
.vc-page input:focus,.vc-page textarea:focus,.vc-page button:focus-visible{outline:2px solid var(--focus);outline-offset:1px}
.vc-row{display:grid;gap:10px}
.vc-r-nh{grid-template-columns:1fr 96px}
.vc-r2{grid-template-columns:1fr 1fr}
.vc-seg{display:flex;flex-wrap:wrap;gap:6px}
.vc-seg button{border-radius:9px;padding:8px 14px;font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:17px}
.vc-seg button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:#fff}
.vc-seg-s button{padding:6px 14px}
.vc-move{border:1px solid var(--line);border-radius:12px;padding:12px;margin-top:12px}
.vc-move h3{margin:0;font-family:'Saira Condensed',sans-serif;font-size:18px}
.vc-ab{border-color:#D7262E;background:#FDF1F1}
.vc-ab h3{color:#D7262E}
.vc-trait{display:grid;grid-template-columns:100px 1fr auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}
.vc-trait:first-of-type{border-top:0}
.vc-tl{font-weight:700;font-size:14px}
.vc-picks{display:flex;flex-wrap:wrap;gap:5px}
.vc-picks button{width:36px;height:36px;padding:0;border-radius:50%;display:grid;place-items:center;background:none;border-color:transparent}
.vc-picks button img{width:30px;height:30px}
.vc-picks button.none{width:auto;padding:0 10px;border-radius:18px;background:var(--field);border-color:var(--line);font-size:12px;font-weight:700;color:var(--muted)}
.vc-picks button[aria-pressed=true]{border-color:var(--ink)}
.vc-small{width:76px!important;text-align:center}
.vc-list{display:flex;flex-direction:column;gap:6px}
.vc-list button{display:flex;justify-content:space-between;border-radius:10px;padding:10px 14px;text-align:left}
.vc-summary{background:#141A3A;color:#fff;border-radius:16px;padding:20px}
.vc-sumrows>div{display:flex;justify-content:space-between;padding:5px 0;color:#C9CEE3}
.vc-sumrows b{color:#fff}
.vc-sumrows .tot{border-top:1px solid rgba(255,255,255,.18);margin-top:6px;padding-top:10px}
.vc-sumrows .tot span{color:#fff;font-weight:700}
.vc-sumrows .tot b{font-family:'Saira Condensed',sans-serif;font-size:32px;color:var(--gold)}
.vc-summary .vc-hint{color:#AEB4CC}
.vc-errbox{background:#FFF1F0;color:#7A1A12;border-radius:10px;padding:10px 14px;margin:12px 0 0;font-size:14px}
.vc-errbox ul{margin:4px 0 0;padding-left:18px}
.vc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--gold);color:var(--gold-ink);border:0;border-radius:12px;padding:10px 18px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:18px;letter-spacing:.04em;text-decoration:none;cursor:pointer}
.vc-btn-big{width:100%;margin-top:14px;padding:16px;font-size:24px}
.vc-btn:disabled{opacity:.6;cursor:default}
.vc-bottombar{position:fixed;left:0;right:0;bottom:0;z-index:20;display:flex;justify-content:space-between;align-items:center;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:#141A3A;color:#fff}
.vc-bottombar b{color:var(--gold);font-family:'Saira Condensed',sans-serif;font-size:22px}
.vc-done{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:32px;max-width:1100px;margin:30px auto;padding:0 24px;align-items:center}
.vc-done p{color:var(--muted);line-height:1.5}
.vc-done .vc-stage{min-height:620px}
@media (max-width:900px){
  .vc-head{padding:20px 16px 12px}
  .vc-layout{grid-template-columns:1fr;padding:0;gap:0}
  .vc-preview{top:0;z-index:10}
  .vc-preview .vc-stage{min-height:0}
  .vc-form{padding:14px 16px 80px}
  .vc-cats{grid-template-columns:repeat(3,1fr)}
  .vc-els{grid-template-columns:repeat(5,1fr)}
  .vc-trait{grid-template-columns:1fr auto}
  .vc-picks{grid-column:1/-1;grid-row:2}
  .vc-r2{grid-template-columns:1fr}
  .vc-done{grid-template-columns:1fr;padding:0 16px}
  .vc-done .vc-stage{min-height:480px}
}
`;
