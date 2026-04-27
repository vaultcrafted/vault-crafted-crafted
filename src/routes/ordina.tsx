import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/ordina")({
  component: OrdinaPage,
  head: () => ({
   meta: [
  { title: "Ordina la tua carta — Vault Crafted" },
  { name: "description", content: "Compila il modulo e crea la tua carta da collezione personalizzata. Scegli energia, tipologia, attacchi e design. Pezzo unico, consegna in 7-10 giorni." },
  { name: "robots", content: "index, follow" },
  { property: "og:url", content: "https://vaultcrafted.com/ordina" },
  { property: "og:title", content: "Ordina la tua carta — Vault Crafted" },
  { property: "og:description", content: "Crea la tua carta personalizzata in pochi minuti. Zero template, design unico, packaging premium." },
],
  }),
});

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx8QLjmeBLw62VDxf3hakKu4HpIHHXw7THzMCrkMGvnG0TziDPYWQ-aySJrpyf5ZSdsjg/exec";

const ENERGIE = [
  { id: "normale", label: "NORMALE", img: "/energie/NORMALE.png" },
  { id: "lotta", label: "LOTTA", img: "/energie/LOTTA.png" },
  { id: "drago", label: "DRAGO", img: "/energie/DRAGO.png" },
  { id: "acqua", label: "ACQUA", img: "/energie/ACQUA.png" },
  { id: "psico", label: "PSICO", img: "/energie/PSICO.png" },
  { id: "fuoco", label: "FUOCO", img: "/energie/FUOCO.png" },
  { id: "erba", label: "ERBA", img: "/energie/ERBA.png" },
  { id: "elettro", label: "LAMPO", img: "/energie/ELETTRO.png" },
  { id: "folletto", label: "FOLLETTO", img: "/energie/FOLLETTO.png" },
  { id: "acciaio", label: "METALLO", img: "/energie/ACCIAIO.png" },
  { id: "spettro", label: "OSCURITÀ", img: "/energie/SPETTRO.png" },
];

const TIPOLOGIE = [
  { id: "normale", label: "CARTA NORMALE", price: 20, img: "/tipologie/CARTA-NORMALE.png" },
  { id: "normale-ex", label: "CARTA NORMALE EX", price: 20, img: "/tipologie/CARTA-NORMALE-EX.png" },
  { id: "full-art-ex", label: "CARTA FULL-ART EX", price: 22, img: "/tipologie/CARTA-FULL-ART-EX.png" },
  { id: "v", label: "CARTA V", price: 23, img: "/tipologie/CARTA-V.png" },
  { id: "v-max", label: "CARTA V-MAX", price: 25, img: "/tipologie/CARTA-V-MAX.png" },
];

const CUSTODIE = [
  { id: "one-touch-35pt", label: "SEMPLICE — ONE TOUCH 35PT", price: 1 },
  { id: "one-touch-bordo-nero", label: "SEMPLICE — ONE TOUCH 35PT BORDO NERO", price: 2 },
  { id: "screwdown-bordo-nero", label: "CARD SCREWDOWN — BORDO NERO", price: 5 },
  { id: "screwdown-recessed", label: "SCREWDOWN RECESSED — TRASPARENTE", price: 3 },
  { id: "recessed-snap", label: "RECESSED SNAP", price: 2 },
  { id: "mini-snap", label: "MINI SNAP", price: 2 },
];

const SPEDIZIONE = 4.99;

function OrdinaPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selectedTipologia, setSelectedTipologia] = useState<typeof TIPOLOGIE[0] | null>(null);
  const [selectedCustodia, setSelectedCustodia] = useState<typeof CUSTODIE[0] | null>(null);

  const totale = (selectedTipologia?.price ?? 0) + (selectedCustodia?.price ?? 0) + SPEDIZIONE;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const file = formData.get("grafica") as File | null;
      const payload: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        if (key === "grafica") return;
        payload[key] = value;
      });

      if (file && file.size > 0) {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        payload.fileName = file.name;
        payload.fileType = file.type;
        payload.fileBase64 = btoa(binary);
      }

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("Si è verificato un errore. Riprova o contattaci direttamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-background text-foreground vault-grain">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle2 className="mx-auto h-20 w-20 text-gold" />
            <h1 className="mt-8 font-display text-4xl leading-tight md:text-6xl">Ordine ricevuto!</h1>
            <p className="mt-6 text-lg text-muted-foreground">Ti contatteremo presto.</p>
            <Link to="/" className="btn-gold mt-12 inline-flex items-center gap-3 rounded-full px-9 py-4 text-sm font-semibold uppercase tracking-[0.25em]">
              <ArrowLeft className="h-4 w-4" />
              Torna alla home
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground vault-grain">
      {/* Header */}
      <header className="border-b border-border/40 bg-surface-2/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold">
            <ArrowLeft className="h-3.5 w-3.5" />
            Indietro
          </Link>
          <Link to="/" aria-label="Vault Crafted home">
            <img src="/LOGO.png" alt="Vault Crafted" className="h-10 w-auto" />
          </Link>
          <div className="w-16" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40 bg-surface-1 px-6 py-20 text-center md:py-28">
        <div aria-hidden className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-surface-2/60 px-5 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Modulo d'ordine</span>
          </div>
          <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
            VAULT <em className="shimmer-text">CRAFTED</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            Pochi minuti. Un'idea. <strong className="text-foreground">Una carta che nessun altro avrà mai.</strong>
          </p>
        </motion.div>
      </section>

      {/* Layout con form + riquadro prezzo */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex gap-8 items-start">

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-6">

            <FormSection title="Possiamo finalmente iniziare">
              <p className="text-sm text-muted-foreground">
                Prenditi il tempo che serve e raccontaci la tua idea. Trasformeremo le tue indicazioni in <strong className="text-foreground">una carta unica, creata su misura per te</strong>.
              </p>
            </FormSection>

            <FormSection title="Energia" required>
              <p className="mb-4 text-sm text-muted-foreground">
                Scegli l'energia che rappresenta la tua carta: è l'elemento che ne definisce <strong className="text-foreground">stile, carattere e identità</strong>.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {ENERGIE.map((e) => (
                  <label key={e.id} className="relative flex cursor-pointer flex-col items-center gap-2 rounded-md border border-border bg-background px-3 py-4 transition-colors hover:border-gold has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_1px_var(--gold)]">
                    <input type="radio" name="energia" value={e.label} required className="sr-only" />
                    <img src={e.img} alt={e.label} className="h-12 w-12 object-contain" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{e.label}</span>
                  </label>
                ))}
              </div>
            </FormSection>

            <FormSection title="Tipologia di carta" required>
              <p className="mb-3 text-sm text-muted-foreground">
                Seleziona il <strong className="text-foreground">design che preferisci</strong>. Il prezzo include progettazione, stampa, taglio e scatola protettiva con gadget.
              </p>
              <p className="mb-4 text-sm text-muted-foreground">👉 Nessun costo nascosto. Quello che vedi è quello che ottieni.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {TIPOLOGIE.map((t) => (
                  <label key={t.id} className="flex cursor-pointer flex-col overflow-hidden rounded-md border border-border bg-background transition-colors hover:border-gold has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_1px_var(--gold)]">
                    <input type="radio" name="tipologia" value={`${t.label} - €${t.price}`} required className="sr-only"
                      onChange={() => setSelectedTipologia(t)} />
                    <div className="h-48 w-full overflow-hidden bg-surface-1">
                      <img src={t.img} alt={t.label} className="h-full w-full object-contain scale-125" />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs font-semibold uppercase tracking-wide">{t.label}</span>
                      <span className="text-sm font-semibold text-gold">€{t.price}</span>
                    </div>
                  </label>
                ))}
              </div>
            </FormSection>

            <FormSection title="Nome" required>
              <p className="mb-3 text-sm text-muted-foreground">Scegli il nome da mettere sulla tua carta</p>
              <input type="text" name="nome" required maxLength={100} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="HP" required>
              <p className="mb-3 text-sm text-muted-foreground">Scegli quanti HP avrà la tua carta (max 3 cifre)</p>
              <input type="text" name="hp" required maxLength={3} pattern="[0-9]{1,3}" placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Attacco 1" required>
              <p className="mb-3 text-sm text-muted-foreground">Scegli che attacco vorresti. Non deve per forza essere un'azione, può essere anche qualcosa di divertente o di ignorante, l'unico limite è la fantasia!</p>
              <input type="text" name="attacco1" required maxLength={120} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Attacco 1 (Descrizione)">
              <p className="mb-3 text-sm text-muted-foreground">Puoi scegliere se inserire una breve descrizione sull'effetto della carta</p>
              <input type="text" name="attacco1_descrizione" maxLength={300} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Attacco 1 (Energie)" required>
              <p className="mb-3 text-sm text-muted-foreground">Scegli quante e quali energie dovrebbe avere il tuo attacco (Max 4 energie)</p>
              <input type="text" name="attacco1_energie" required maxLength={120} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Attacco 1 (Danni)" required>
              <p className="mb-3 text-sm text-muted-foreground">Scegli quanti danni dovrebbe fare il tuo attacco</p>
              <input type="text" name="attacco1_danni" required maxLength={10} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Attacco 2 (non obbligatorio)">
              <p className="mb-3 text-sm text-muted-foreground">Scegli un secondo attacco che vorresti avere nella tua carta, ma non sei obbligato</p>
              <input type="text" name="attacco2" maxLength={120} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Attacco 2 (Descrizione)">
              <p className="mb-3 text-sm text-muted-foreground">Puoi scegliere se inserire una breve descrizione sull'effetto della carta</p>
              <input type="text" name="attacco2_descrizione" maxLength={300} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Attacco 2 (Energie)">
              <p className="mb-3 text-sm text-muted-foreground">Scegli quante e quali energie dovrebbe avere il tuo attacco (Max 4 energie)</p>
              <input type="text" name="attacco2_energie" maxLength={120} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Attacco 2 (Danni)">
              <p className="mb-3 text-sm text-muted-foreground">Scegli quanti danni dovrebbe fare il tuo attacco</p>
              <input type="text" name="attacco2_danni" maxLength={10} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Resistenza" required>
              <p className="mb-3 text-sm text-muted-foreground">Indicare a quale energia si ha la resistenza</p>
              <input type="text" name="resistenza" required maxLength={60} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Debolezza" required>
              <p className="mb-3 text-sm text-muted-foreground">Indicare a quale energia si ha la debolezza</p>
              <input type="text" name="debolezza" required maxLength={60} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Costo di ritirata" required>
              <p className="mb-3 text-sm text-muted-foreground">Indicare quale tipo di energia e quante energie servono per il costo di ritirata</p>
              <input type="text" name="costo_ritirata" required maxLength={120} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Frase personalizzata">
              <p className="mb-3 text-sm text-muted-foreground">Inserisci un qualcosa che vorresti scrivere in fondo a destra della carta</p>
              <input type="text" name="frase" maxLength={200} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Carica la tua grafica definitiva" required>
              <p className="mb-3 text-sm text-muted-foreground">Carica la foto finale che verrà applicata alla carta. Non effettuiamo il servizio di grafica.</p>
              <p className="mb-3 text-xs text-muted-foreground">Carica 1 file supportato: PDF, document, drawing o image. Massimo 10 MB.</p>
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-md border-2 border-dashed border-gold/40 bg-surface-2/40 px-6 py-8 transition-colors hover:border-gold hover:bg-surface-2/70">
                <Upload className="h-5 w-5 text-gold" />
                <span className="text-sm font-semibold uppercase tracking-wider text-gold">{fileName || "Aggiungi file"}</span>
                <input type="file" name="grafica" required accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size > 10 * 1024 * 1024) { setError("Il file supera i 10 MB"); e.target.value = ""; setFileName(""); return; }
                    setFileName(f?.name ?? ""); setError(null);
                  }} className="hidden" />
              </label>
            </FormSection>

            <FormSection title="Custodia / Holder" required>
              <p className="mb-3 text-sm text-muted-foreground">Scegli il <strong className="text-foreground">tipo di custodia protettiva</strong>. Le custodie prevedono un costo aggiuntivo.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CUSTODIE.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-border bg-background px-4 py-4 transition-colors hover:border-gold has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_1px_var(--gold)]">
                    <input type="radio" name="custodia" value={`${c.label} +${c.price}€`} required className="sr-only"
                      onChange={() => setSelectedCustodia(c)} />
                    <span className="text-sm font-semibold uppercase tracking-wide">{c.label}</span>
                    <span className="whitespace-nowrap text-sm text-gold">+ {c.price}€</span>
                  </label>
                ))}
              </div>
            </FormSection>

            <FormSection title="Nome e Cognome" required>
              <p className="mb-3 text-sm text-muted-foreground">Prima di concludere, inserisci il tuo nome e cognome</p>
              <input type="text" name="nome_cognome" required maxLength={100} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Cellulare" required>
              <p className="mb-3 text-sm text-muted-foreground">Inserisci il tuo cellulare</p>
              <input type="tel" name="cellulare" required maxLength={20} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="E-Mail" required>
              <p className="mb-3 text-sm text-muted-foreground">Inserisci la tua e-mail (tranquillo, servirà solo per la spedizione, non ti mandiamo spam)</p>
              <input type="email" name="email_contatto" required maxLength={255} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <FormSection title="Spedizione" required>
              <p className="mb-3 text-sm text-muted-foreground">Inserisci l'indirizzo di spedizione completo (città, provincia, CAP, via e numero civico). Spedizione al costo di 4,99€</p>
              <input type="text" name="spedizione" required maxLength={300} placeholder="La tua risposta" className="vault-input" />
            </FormSection>

            <div className="flex flex-col items-center gap-4 pt-6">
              {error && <p className="text-center text-sm text-destructive" role="alert">{error}</p>}
              <button type="submit" disabled={submitting} className="btn-gold inline-flex items-center gap-3 rounded-full px-12 py-5 text-sm font-semibold uppercase tracking-[0.25em] disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Invio in corso…</>) : "Invia ordine"}
              </button>
              <p className="max-w-md text-center text-xs text-muted-foreground">
                Inviando il modulo accetti di essere contattato per definire i dettagli dell'ordine.
              </p>
            </div>
          </form>

          {/* Riquadro prezzo fisso */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-8 rounded-xl border border-gold/30 bg-surface-2/60 p-6 backdrop-blur-sm shadow-[0_0_40px_-10px_var(--gold)]">
              <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">Riepilogo ordine</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Carta</span>
                  <span className="font-semibold">
                    {selectedTipologia ? `€${selectedTipologia.price}` : <span className="text-muted-foreground/50">—</span>}
                  </span>
                </div>
                {selectedTipologia && (
                  <p className="text-xs text-muted-foreground">{selectedTipologia.label}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Custodia</span>
                  <span className="font-semibold">
                    {selectedCustodia ? `+ €${selectedCustodia.price}` : <span className="text-muted-foreground/50">—</span>}
                  </span>
                </div>
                {selectedCustodia && (
                  <p className="text-xs text-muted-foreground">{selectedCustodia.label}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Spedizione</span>
                  <span className="font-semibold">€{SPEDIZIONE.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-5 border-t border-gold/20 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg">Totale</span>
                  <span className="font-display text-2xl text-gold">
                    {selectedTipologia && selectedCustodia
                      ? `€${totale.toFixed(2)}`
                      : <span className="text-base text-muted-foreground">Seleziona le opzioni</span>
                    }
                  </span>
                </div>
              </div>
              {(!selectedTipologia || !selectedCustodia) && (
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  {!selectedTipologia && !selectedCustodia
                    ? "Seleziona tipologia e custodia"
                    : !selectedTipologia
                    ? "Seleziona la tipologia"
                    : "Seleziona la custodia"}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .vault-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid color-mix(in oklab, var(--gold) 30%, transparent);
          padding: 0.625rem 0.25rem;
          color: var(--foreground);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .vault-input::placeholder { color: color-mix(in oklab, var(--foreground) 35%, transparent); }
        .vault-input:focus { border-bottom-color: var(--gold); }
      `}</style>
    </main>
  );
}

function FormSection({
  title,
  required,
  children,
}: {
  title: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border/50 bg-surface-1/60 p-6 backdrop-blur-sm md:p-8"
    >
      <h2 className="mb-2 font-display text-xl italic md:text-2xl">
        {title}
        {required && <span className="ml-1 text-destructive">*</span>}
      </h2>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}
