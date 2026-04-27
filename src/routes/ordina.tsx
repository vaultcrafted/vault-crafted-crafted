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
  { id: "normale", label: "CARTA NORMALE", price: "€20", img: "/tipologie/CARTA-NORMALE.png" },
  { id: "normale-ex", label: "CARTA NORMALE EX", price: "€20", img: "/tipologie/CARTA-NORMALE-EX.png" },
  { id: "full-art-ex", label: "CARTA FULL-ART EX", price: "€22", img: "/tipologie/CARTA-FULL-ART-EX.png" },
  { id: "v", label: "CARTA V", price: "€23", img: "/tipologie/CARTA-V.png" },
  { id: "v-max", label: "CARTA V-MAX", price: "€25", img: "/tipologie/CARTA-V-MAX.png" },
];

const CUSTODIE = [
  { id: "one-touch-35pt", label: "SEMPLICE — ONE TOUCH 35PT", price: "+ 1€" },
  { id: "one-touch-bordo-nero", label: "SEMPLICE — ONE TOUCH 35PT BORDO NERO", price: "+ 2€" },
  { id: "screwdown-bordo-nero", label: "CARD SCREWDOWN — BORDO NERO", price: "+ 5€" },
  { id: "screwdown-recessed", label: "SCREWDOWN RECESSED — TRASPARENTE", price: "+ 3€" },
  { id: "recessed-snap", label: "RECESSED SNAP", price: "+ 2€" },
  { id: "mini-snap", label: "MINI SNAP", price: "+ 2€" },
];

function OrdinaPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

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
            <h1 className="mt-8 font-display text-4xl leading-tight md:text-6xl">
              Ordine ricevuto!
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Ti contatteremo presto.
            </p>
            <Link
              to="/"
              className="btn-gold mt-12 inline-flex items-center gap-3 rounded-full px-9 py-4 text-sm font-semibold uppercase tracking-[0.25em]"
            >
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
      <header className="border-b border-border/40 bg-surface-2/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Indietro
          </Link>
          <Link to="/" aria-label="Vault Crafted home">
            <img src="/LOGO.png" alt="Vault Crafted" className="h-10 w-auto" />
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border/40 bg-surface-1 px-6 py-20 text-center md:py-28">
        <div
          aria-hidden
          className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-surface-2/60 px-5 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-gold">
              Modulo d'ordine
            </span>
          </div>
          <h1 className="font-display text-4xl leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
            VAULT <em className="shimmer-text">CRAFTED</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            Pochi minuti. Un'idea. <strong className="text-foreground">Una carta che nessun altro avrà mai.</strong>
          </p>
        </motion.div>
      </section>

      <section className="px-6 py-16 md:py-24">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto grid max-w-4xl gap-8"
        >
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-5 rounded-lg border border-border/50 bg-surface-2/50 p-6 md:grid-cols-2 md:p-8">
            <label className="grid gap-2 text-sm font-medium">
              Nome e cognome
              <input name="nome" required autoComplete="name" className="rounded-md border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-gold" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Email
              <input name="email" type="email" required autoComplete="email" className="rounded-md border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-gold" />
            </label>
            <label className="grid gap-2 text-sm font-medium md:col-span-2">
              Nome sulla carta
              <input name="nomeCarta" required className="rounded-md border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-gold" />
            </label>
          </div>

          <fieldset className="rounded-lg border border-border/50 bg-surface-2/50 p-6 md:p-8">
            <legend className="px-2 font-display text-2xl">Energia</legend>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {ENERGIE.map((energia) => (
                <label key={energia.id} className="relative flex cursor-pointer flex-col items-center gap-2 rounded-md border border-border bg-background px-3 py-4 text-sm transition-colors hover:border-gold has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_1px_var(--gold)]">
                  <input name="energia" type="radio" value={energia.label} required className="sr-only" />
                  <img src={energia.img} alt={energia.label} className="h-12 w-12 object-contain" />
                  <span className="text-xs font-semibold uppercase tracking-[0.15em]">{energia.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-border/50 bg-surface-2/50 p-6 md:p-8">
            <legend className="px-2 font-display text-2xl">Tipologia</legend>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {TIPOLOGIE.map((tipo) => (
                <label key={tipo.id} className="flex cursor-pointer flex-col overflow-hidden rounded-md border border-border bg-background text-sm transition-colors hover:border-gold has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_1px_var(--gold)]">
                  <input name="tipologia" type="radio" value={`${tipo.label} ${tipo.price}`} required className="sr-only" />
                  <div className="h-48 w-full overflow-hidden bg-surface-1">
                    <img src={tipo.img} alt={tipo.label} className="h-full w-full object-contain scale-125" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-semibold uppercase tracking-[0.14em] text-xs">{tipo.label}</span>
                    <span className="text-gold font-semibold">{tipo.price}</span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-border/50 bg-surface-2/50 p-6 md:p-8">
            <legend className="px-2 font-display text-2xl">Custodia</legend>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {CUSTODIE.map((custodia) => (
                <label key={custodia.id} className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-border bg-background px-4 py-4 text-sm transition-colors hover:border-gold has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_1px_var(--gold)]">
                  <input name="custodia" type="radio" value={`${custodia.label} ${custodia.price}`} required className="sr-only" />
                  <span className="font-semibold uppercase tracking-[0.14em]">{custodia.label}</span>
                  <span className="text-gold whitespace-nowrap">{custodia.price}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 rounded-lg border border-border/50 bg-surface-2/50 p-6 md:p-8">
            <label className="grid gap-2 text-sm font-medium">
              Idea, attacchi e dettagli grafici
              <textarea name="dettagli" required rows={6} className="resize-none rounded-md border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-gold" />
            </label>
            <label className="grid cursor-pointer gap-3 rounded-md border border-dashed border-border bg-background px-5 py-6 text-center transition-colors hover:border-gold">
              <Upload className="mx-auto h-7 w-7 text-gold" />
              <span className="text-sm font-medium">{fileName || "Carica una foto o reference"}</span>
              <input name="grafica" type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name ?? "")} />
            </label>
          </div>

          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input name="privacy" type="checkbox" required className="mt-1" />
            Accetto di essere contattato per ricevere la bozza grafica, il totale e le istruzioni di pagamento.
          </label>

          <button type="submit" disabled={submitting} className="btn-gold inline-flex items-center justify-center gap-3 rounded-full px-9 py-5 text-sm font-semibold uppercase tracking-[0.25em] disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Invia ordine
          </button>
        </motion.form>
      </section>
    </main>
  );
}
