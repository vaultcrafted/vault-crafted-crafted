import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CardEditor,
  EDITOR_CSS,
  FONTS_HREF,
  Field,
  Step,
  useCompact,
  withSamples,
} from "@/components/vault/CardEditor";
import { CardStage, STAGE_CSS } from "@/components/vault/CardStage";
import {
  CARD_H,
  CARD_W,
  MAX_EDITION,
  TRIM,
  catOf,
  loadFonts,
  renderCard,
  type ArtState,
  type CardData,
} from "@/lib/vaultCard";
import {
  CUSTODIE,
  MAX_PHOTO,
  SPEDIZIONE,
  HOLO_PRICE,
  cardErrors,
  contactErrors,
  custodiaOf,
  type Contacts,
} from "@/lib/vaultShop";
import { acc, photoUrl, urlToDataUrl, useMe } from "@/lib/accountClient";
import { AUTH_CSS, AuthForm } from "@/components/vault/account/AuthForm";

export const Route = createFileRoute("/crea")({
  component: CreaPage,
  head: () => ({
    meta: [
      { title: "Crea la tua carta — Vault Crafted" },
      {
        name: "description",
        content:
          "Componi la tua carta Vault dal vivo: scegli categoria, elemento, attacchi e abilità, carica la foto e guarda la carta prendere forma. Stampata e numerata, da €20.",
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
      { rel: "stylesheet", href: FONTS_HREF },
    ],
  }),
});

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

function CreaPage() {
  const [d, setD] = useState<CardData>(INITIAL);
  const set = useCallback((p: Partial<CardData>) => setD((x) => ({ ...x, ...p })), []);
  const art = useRef<ArtState>({ img: null, zoom: 1, px: 0, py: 0 });
  const [artVersion, setArtVersion] = useState(0);
  const [fontsVersion, setFontsVersion] = useState(0);
  const [photo, setPhoto] = useState<{ dataUrl: string; name: string; type: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [custodia, setCustodia] = useState("nessuna");
  const [zoomCase, setZoomCase] = useState<string | null>(null);
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
  const [done, setDone] = useState<null | { serial: number; edition: number }>(null);
  const compact = useCompact();
  const { me, reload: reloadMe } = useMe();
  const [draftId, setDraftId] = useState<string | null>(null);
  const [photoDirty, setPhotoDirty] = useState(false);
  const [draftMsg, setDraftMsg] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  const [authOpen, setAuthOpen] = useState<null | "save" | "data">(null);
  const [addresses, setAddresses] = useState<
    { id: string; label: string; recipient: string; phone: string; address: string; is_default: number }[]
  >([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("");

  // dati del cliente collegato e bozza da riprendere (?bozza=)
  useEffect(() => {
    if (!me) return;
    setContacts((c) => ({
      ...c,
      nome_cognome: c.nome_cognome || me.name,
      email: c.email || me.email,
      cellulare: c.cellulare || me.phone,
    }));
    acc<{ addresses: typeof addresses }>("indirizzi")
      .then((r) => {
        setAddresses(r.addresses);
        const def = r.addresses.find((a) => a.is_default);
        if (def)
          setContacts((c) => (c.indirizzo ? c : { ...c, indirizzo: def.address, nome_cognome: def.recipient || c.nome_cognome }));
      })
      .catch(() => null);
  }, [me]);
  useEffect(() => {
    if (me === undefined) return;
    const id = new URLSearchParams(location.search).get("bozza");
    if (!id || draftId === id) return;
    if (!me) {
      setAuthOpen("data");
      return;
    }
    acc<{ draft: { id: string; card_json: string; art_pos: string; custodia: string; photo_key: string; photo_name: string } }>(
      `bozze?id=${encodeURIComponent(id)}`,
    )
      .then(async ({ draft }) => {
        setDraftId(draft.id);
        setD({ ...INITIAL, ...(JSON.parse(draft.card_json) as CardData), serial: null, edition: null });
        setCustodia(draft.custodia || "nessuna");
        const pos = { zoom: 1, px: 0, py: 0, ...(JSON.parse(draft.art_pos) as object) };
        if (draft.photo_key) {
          const { dataUrl, type } = await urlToDataUrl(photoUrl(draft.photo_key));
          const im = new Image();
          im.onload = () => {
            art.current = { img: im, ...pos };
            setZoom(pos.zoom);
            setPhoto({ dataUrl, name: draft.photo_name || "foto.jpg", type });
            setPhotoDirty(false);
            setArtVersion((v) => v + 1);
          };
          im.src = dataUrl;
        }
        setDraftMsg("Bozza caricata: riprendi da dove avevi lasciato.");
      })
      .catch(() => setDraftMsg("Non trovo questa bozza."));
  }, [me]);

  const saveDraft = async () => {
    if (!me) {
      setAuthOpen("save");
      return;
    }
    setSavingDraft(true);
    setDraftMsg("");
    try {
      const r = await acc<{ id: string }>("bozze", {
        json: {
          id: draftId ?? undefined,
          card: d,
          artPos: { zoom: art.current.zoom, px: art.current.px, py: art.current.py },
          custodia,
          photo:
            photo && photoDirty
              ? { name: photo.name, type: photo.type, base64: photo.dataUrl.split(",")[1] ?? "" }
              : null,
        },
      });
      setDraftId(r.id);
      setPhotoDirty(false);
      history.replaceState(null, "", `/crea?bozza=${r.id}`);
      setDraftMsg("Bozza salvata nel tuo account.");
    } catch (e) {
      setDraftMsg((e as Error).message);
    } finally {
      setSavingDraft(false);
    }
  };

  useEffect(() => {
    void loadFonts().then(() => setFontsVersion((v) => v + 1));
  }, []);

  const cat = catOf(d.cat);
  const cust = custodiaOf(custodia);
  const holoPrice = d.holo ? HOLO_PRICE : 0;
  const total = cat.price + cust.price + holoPrice + SPEDIZIONE;
  const shown = withSamples(done ? { ...d, serial: done.serial, edition: done.edition } : d);

  // miniatura della carta del cliente, messa dentro le foto delle custodie
  const [cardThumb, setCardThumb] = useState("");
  const shownKey = JSON.stringify(shown);
  useEffect(() => {
    const t = setTimeout(() => {
      const full = document.createElement("canvas");
      full.width = CARD_W;
      full.height = CARD_H;
      void renderCard(full.getContext("2d")!, JSON.parse(shownKey) as CardData, art.current).then(
        () => {
          const out = document.createElement("canvas");
          out.width = TRIM.w;
          out.height = TRIM.h;
          const g = out.getContext("2d")!;
          g.drawImage(full, TRIM.x, TRIM.y, TRIM.w, TRIM.h, 0, 0, TRIM.w, TRIM.h);
          setCardThumb(out.toDataURL("image/jpeg", 0.85));
        },
      );
    }, 350);
    return () => clearTimeout(t);
  }, [shownKey, artVersion, fontsVersion]);

  const onFile = (f: File | undefined) => {
    setFileError("");
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setFileError("Carica un'immagine (JPG o PNG).");
      return;
    }
    if (f.size > MAX_PHOTO) {
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
        setPhotoDirty(true);
        setArtVersion((v) => v + 1);
      };
      im.src = url;
    };
    r.readAsDataURL(f);
  };

  const submit = async () => {
    const e = [
      ...cardErrors(d),
      ...(photo ? [] : ["La foto per la carta"]),
      ...contactErrors(contacts),
    ];
    setErrors(e);
    if (e.length) {
      document.getElementById("riepilogo")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSending(true);
    try {
      const r = await fetch("/api/ordini", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          card: d,
          artPos: { zoom: art.current.zoom, px: art.current.px, py: art.current.py },
          custodia,
          contacts,
          draftId: draftId ?? undefined,
          saveAddress: !!me && saveAddress,
          addressLabel,
          photo: photo && {
            name: photo.name,
            type: photo.type,
            base64: photo.dataUrl.split(",")[1] ?? "",
          },
        }),
      });
      const res = (await r.json().catch(() => ({}))) as {
        serial?: number;
        edition?: number;
        error?: string;
        missing?: string[];
      };
      if (!r.ok || !res.serial) {
        setErrors(
          res.missing ?? [
            res.error ?? "Invio non riuscito. Riprova tra poco o scrivici su WhatsApp.",
          ],
        );
        return;
      }
      setDone({ serial: res.serial, edition: res.edition ?? 1 });
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
        <style>{EDITOR_CSS + PAGE_CSS + STAGE_CSS}</style>
        <TopBar me={me} />
        <section className="vc-done">
          <div className="vc-done-card">
            <CardStage data={shown} art={art} artVersion={artVersion} fontsVersion={fontsVersion} />
          </div>
          <div>
            <p className="vc-kicker">ORDINE RICEVUTO</p>
            <h1>La tua carta è nel Vault.</h1>
            <p className="vc-num">
              N° {String(done.serial).padStart(3, "0")} · {done.edition}/{MAX_EDITION}
            </p>
            <p>
              Ti abbiamo mandato una email di conferma. Controlliamo la carta e ti scriviamo con il
              riepilogo e le istruzioni per il pagamento, poi la stampiamo e te la spediamo.
            </p>
            {me ? (
              <a href="/account" className="vc-btn">
                Segui l'ordine nel tuo Vault
              </a>
            ) : (
              <>
                <p>
                  <b>Vuoi seguire l'ordine?</b> Crea un account con la stessa email: vedrai stato,
                  pagamento e spedizione, e la carta entrerà nella tua collezione.
                </p>
                <a href="/account/accedi?nuovo=1&next=/account" className="vc-btn">
                  Crea il tuo account
                </a>
              </>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="vc-page">
      <style>{EDITOR_CSS + PAGE_CSS + STAGE_CSS + AUTH_CSS}</style>
      <TopBar me={me} />
      <header className="vc-head">
        <p className="vc-kicker">FORMATO VAULT</p>
        <h1>Crea la tua carta</h1>
        <p>
          Scegli, scrivi, guarda la carta prendere forma. Poi la stampiamo per te, numerata.
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
        </aside>

        <form
          className="vc-form"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {!compact && (
            <div className="vc-price">
              <span>
                {cat.n}
                {cust.price ? ` + ${cust.label}` : ""}
                {d.holo ? " + olografica" : ""} + spedizione
              </span>
              <b>€{total.toFixed(2)}</b>
            </div>
          )}
          <div className="vc-draftbar">
            <button type="button" className="vc-draftbtn" onClick={() => void saveDraft()} disabled={savingDraft}>
              <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6" />
              </svg>
              {savingDraft ? "Salvo…" : draftId ? "Salva modifiche alla bozza" : "Salva bozza"}
            </button>
            {draftMsg && <span role="status">{draftMsg}</span>}
          </div>
          <CardEditor
            d={d}
            set={set}
            photoStep={
              <>
                <p className="vc-hint">
                  Carica la foto da mettere sulla carta: è quella che stampiamo, quindi meglio
                  nitida e con buona luce. Trascinala sull'anteprima per sistemare l'inquadratura e
                  usa lo zoom se serve.
                </p>
                <label className="vc-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
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
              </>
            }
          />

          <Step n={8} title="Custodia e pellicola">
            <p className="vc-hint" style={{ margin: "0 0 12px" }}>
              Per proteggerla e metterla in mostra. La carta arriva comunque nella sua scatola.
            </p>
            <div className="vc-cases">
              {CUSTODIE.map((c) => (
                <div className="vc-case-wrap" key={c.id}>
                  <button
                    type="button"
                    aria-pressed={custodia === c.id}
                    onClick={() => setCustodia(c.id)}
                  >
                    {c.img ? (
                      <CaseImg c={c} card={cardThumb} />
                    ) : (
                      <span className="vc-case-none">Solo la carta</span>
                    )}
                    <span className="vc-case-name">{c.label}</span>
                    <b>{c.price ? `+€${c.price}` : "—"}</b>
                  </button>
                  {c.img && (
                    <button
                      type="button"
                      className="vc-zoom"
                      aria-label={`Ingrandisci ${c.label}`}
                      onClick={() => setZoomCase(c.id)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <circle cx="10.5" cy="10.5" r="6.5" />
                        <path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="vc-hint" style={{ margin: "18px 0 8px" }}>
              <b>Pellicola olografica</b>: effetto brillante e cangiante come le carte rare. +€
              {HOLO_PRICE.toFixed(2).replace(".", ",")}
            </p>
            <div className="vc-seg">
              <button type="button" aria-pressed={!!d.holo} onClick={() => set({ holo: true })}>
                Sì, olografica
              </button>
              <button type="button" aria-pressed={!d.holo} onClick={() => set({ holo: false })}>
                No grazie
              </button>
            </div>
          </Step>

          <Step n={9} title="Spedizione e contatti">
            {me === null && (
              <p className="vc-acchint">
                Hai un account?{" "}
                <button type="button" onClick={() => setAuthOpen("data")}>
                  Accedi
                </button>{" "}
                per usare i tuoi dati e seguire l'ordine.
              </p>
            )}
            {me && addresses.length > 0 && (
              <div className="vc-addrpick">
                <span>Spedisci a:</span>
                {addresses.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    aria-pressed={contacts.indirizzo === a.address}
                    onClick={() =>
                      setContacts({
                        ...contacts,
                        indirizzo: a.address,
                        nome_cognome: a.recipient || contacts.nome_cognome,
                        cellulare: a.phone || contacts.cellulare,
                      })
                    }
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
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
            {me && contacts.indirizzo.trim() && !addresses.some((a) => a.address === contacts.indirizzo) && (
              <div className="vc-saveaddr">
                <label>
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                  Salva questo indirizzo nel mio account
                </label>
                {saveAddress && (
                  <input
                    placeholder="Nome dell'indirizzo (es. Casa, Mamma)"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                  />
                )}
              </div>
            )}
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
              {d.holo && (
                <div>
                  <span>Pellicola olografica</span>
                  <b>€{HOLO_PRICE.toFixed(2)}</b>
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
              Dopo l'ordine ti scriviamo con il riepilogo e le istruzioni per pagare. La stampa parte
              appena arriva il pagamento.
            </p>
          </section>
        </form>
      </div>

      {zoomCase && (
        <CaseLightbox
          c={custodiaOf(zoomCase)}
          card={cardThumb}
          chosen={custodia === zoomCase}
          onClose={() => setZoomCase(null)}
          onChoose={() => {
            setCustodia(zoomCase);
            setZoomCase(null);
          }}
        />
      )}

      {authOpen && (
        <div className="vc-authmodal" role="dialog" aria-modal="true" aria-label="Accedi" onClick={() => setAuthOpen(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <button type="button" className="vc-authclose" aria-label="Chiudi" onClick={() => setAuthOpen(null)}>
              ✕
            </button>
            <p className="vc-authwhy">
              {authOpen === "save"
                ? "Accedi o crea un account per salvare la bozza e riprenderla quando vuoi. La carta che hai fatto resta qui."
                : "Accedi per usare i tuoi dati e i tuoi indirizzi."}
            </p>
            <AuthForm
              onDone={() => {
                const wasSave = authOpen === "save";
                setAuthOpen(null);
                void reloadMe().then(() => {
                  if (wasSave) setTimeout(() => document.querySelector<HTMLButtonElement>(".vc-draftbtn")?.click(), 300);
                });
              }}
            />
          </div>
        </div>
      )}

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

type Custodia = (typeof CUSTODIE)[number];

function CaseImg({ c, card, big = false }: { c: Custodia; card: string; big?: boolean }) {
  return (
    <span className={`vc-case-img${big ? " big" : ""}`}>
      <img src={c.img} alt="" loading={big ? "eager" : "lazy"} width={600} height={600} />
      {c.win && card && (
        <span
          className="vc-case-card"
          style={{
            left: `${c.win[0]}%`,
            top: `${c.win[1]}%`,
            width: `${c.win[2]}%`,
            height: `${c.win[3]}%`,
          }}
        >
          <img src={card} alt="" />
        </span>
      )}
    </span>
  );
}

function CaseLightbox({
  c,
  card,
  chosen,
  onClose,
  onChoose,
}: {
  c: Custodia;
  card: string;
  chosen: boolean;
  onClose: () => void;
  onChoose: () => void;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div
      className="vc-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={c.label}
      onClick={onClose}
    >
      <div className="vc-lightbox-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="vc-lightbox-x" aria-label="Chiudi" onClick={onClose}>
          ×
        </button>
        <CaseImg c={c} card={card} big />
        <div className="vc-lightbox-foot">
          <div>
            <b>{c.label}</b>
            <span>{c.price ? `+€${c.price}` : "Nessun costo"}</span>
          </div>
          <button type="button" className="vc-btn" onClick={onChoose} disabled={chosen}>
            {chosen ? "Già scelta" : "Scegli questa"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TopBar({ me }: { me?: { name: string } | null }) {
  return (
    <nav className="vc-top">
      <Link to="/" className="vc-logo" aria-label="Vault Crafted, home">
        <img src="/LOGO.png" alt="Vault Crafted" />
      </Link>
      <span className="vc-topr">
        <a href={me ? "/account" : "/account/accedi?next=/crea"} className="vc-back">
          {me ? `Il mio Vault (${me.name.split(" ")[0]})` : "Accedi"}
        </a>
        <Link to="/" className="vc-back">
          ← Torna al sito
        </Link>
      </span>
    </nav>
  );
}

const PAGE_CSS = `
.vc-topr{display:flex;gap:18px;align-items:center}
.vc-draftbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px}
.vc-draftbtn{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:9px 14px;font:inherit;font-weight:700;font-size:14px;color:var(--ink);cursor:pointer}
.vc-draftbtn:hover{border-color:var(--ink)}
.vc-draftbtn svg{width:18px;height:18px}
.vc-draftbar span{font-size:13.5px;color:var(--muted)}
.vc-acchint{margin:0 0 12px;font-size:14px;color:var(--muted)}
.vc-acchint button{border:0;background:none;padding:0;font:inherit;font-weight:700;color:var(--ink);text-decoration:underline;cursor:pointer}
.vc-addrpick{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 12px;font-size:14px;color:var(--muted)}
.vc-addrpick button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 12px;font:inherit;font-weight:600;color:var(--ink);cursor:pointer}
.vc-addrpick button[aria-pressed=true]{background:var(--ink);color:#fff;border-color:var(--ink)}
.vc-saveaddr{display:grid;gap:8px;margin:-4px 0 12px;font-size:14px}
.vc-saveaddr label{display:flex;gap:8px;align-items:center}
.vc-saveaddr input:not([type]){border:1px solid var(--line);border-radius:10px;padding:10px 12px;font:inherit}
.vc-authmodal{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:rgba(20,26,58,.6);backdrop-filter:blur(4px);padding:16px}
.vc-authmodal>div{position:relative;background:#fff;border-radius:20px;padding:26px;width:min(100%,460px);max-height:90vh;overflow:auto;box-sizing:border-box}
.vc-authclose{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;border:0;background:#F1F2F6;cursor:pointer;font-size:15px}
.vc-authwhy{margin:0 0 16px;color:var(--muted);font-size:14.5px;padding-right:30px}
.vc-authmodal .hm-btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;border-radius:12px;background:#141A3A;color:#fff;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:21px}
.vc-head{padding:22px 24px 14px;max-width:1640px;margin:0 auto}
.vc-head h1,.vc-done h1{margin:4px 0 6px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(38px,6vw,64px);line-height:.95}
.vc-head p:last-child{margin:0;color:var(--muted);max-width:560px}
.vc-layout{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(380px,1fr);gap:28px;max-width:1640px;margin:0 auto;padding:0 24px;align-items:start}
.vc-preview{position:sticky;top:16px;display:flex;flex-direction:column;gap:12px}
.vc-preview .vc-stage{height:calc(100vh - 32px);min-height:600px;padding:16px}
.vc-preview .vc-card{width:min(100%,calc((100vh - 64px) * 744 / 1040),820px)}
.vc-price{position:sticky;top:12px;z-index:6;box-shadow:0 8px 24px -14px rgba(20,26,58,.35);display:flex;justify-content:space-between;align-items:baseline;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px 18px;color:var(--muted);font-size:14px}
.vc-price b{font-family:'Saira Condensed',sans-serif;font-size:28px;color:var(--ink)}
.vc-form{display:flex;flex-direction:column;gap:14px;min-width:0}
.vc-summary{background:#141A3A;color:#fff;border-radius:16px;padding:20px}
.vc-sumrows>div{display:flex;justify-content:space-between;padding:5px 0;color:#C9CEE3}
.vc-sumrows b{color:#fff}
.vc-sumrows .tot{border-top:1px solid rgba(255,255,255,.18);margin-top:6px;padding-top:10px}
.vc-sumrows .tot span{color:#fff;font-weight:700}
.vc-sumrows .tot b{font-family:'Saira Condensed',sans-serif;font-size:32px;color:var(--gold)}
.vc-summary .vc-hint{color:#AEB4CC}
.vc-errbox{background:#FFF1F0;color:#7A1A12;border-radius:10px;padding:10px 14px;margin:12px 0 0;font-size:14px}
.vc-errbox ul{margin:4px 0 0;padding-left:18px}
.vc-bottombar{position:fixed;left:0;right:0;bottom:0;z-index:20;display:flex;justify-content:space-between;align-items:center;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:#141A3A;color:#fff}
.vc-bottombar b{color:var(--gold);font-family:'Saira Condensed',sans-serif;font-size:22px}
.vc-done{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:32px;max-width:1100px;margin:30px auto;padding:0 24px;align-items:center}
.vc-done p{color:var(--muted);line-height:1.5}
.vc-done .vc-num{font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--ink);font-size:18px}
.vc-done .vc-stage{min-height:620px}
@media (max-width:900px){
  .vc-head{padding:20px 16px 12px}
  .vc-layout{grid-template-columns:1fr;padding:0;gap:0}
  .vc-preview{top:0;z-index:10}
  .vc-preview .vc-stage{min-height:0;height:auto;padding:14px}
  .vc-preview .vc-compact .vc-card{width:auto;height:min(36vh,330px)}
  .vc-form{padding:14px 16px 80px}
  .vc-done{grid-template-columns:1fr;padding:0 16px}
  .vc-done .vc-stage{min-height:480px}
}
`;
