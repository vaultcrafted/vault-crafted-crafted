import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Particles } from "@/components/vault/Particles";

export const Route = createFileRoute("/chi-siamo")({
  component: ChiSiamoPage,
  head: () => ({
   meta: [
  { title: "Chi siamo — Vault Crafted | La nostra storia" },
  { name: "description", content: "Scopri la storia di Vault Crafted: nata dalla passione per le carte Pokémon, oggi crea carte da collezione uniche e personalizzate dal novembre 2024." },
  { name: "robots", content: "index, follow" },
  { property: "og:url", content: "https://vaultcrafted.com/chi-siamo" },
  { property: "og:title", content: "Chi siamo — Vault Crafted" },
  { property: "og:description", content: "Dalla passione per i Pokémon a un progetto unico. Ogni carta nasce da zero, su misura per te." },
],
  }),
});

function ChiSiamoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground vault-grain">

      {/* Header */}
      <header className="border-b border-border/40 bg-surface-2/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Indietro
          </Link>
          <Link to="/">
            <img src="/LOGO.png" alt="Vault Crafted" className="h-10 w-auto" />
          </Link>
          <div className="w-16" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-1 px-6 py-28 text-center md:py-40">
        <Particles count={30} />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-surface-2/60 px-5 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-gold">La nostra storia</span>
          </div>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Non vendiamo carte.
            <br />
            <em className="shimmer-text">Creiamo storie.</em>
          </h1>
        </motion.div>
      </section>

      {/* Storia */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 text-lg text-muted-foreground leading-relaxed"
        >
          <p>
            Tutto è nato da una passione viscerale per le <strong className="text-foreground">carte Pokémon</strong> — quella stessa passione che mi ha accompagnato sin da bambino, quando aprire un pacchetto era un momento magico, irripetibile.
          </p>
          <p>
            Con il tempo quella passione non è mai svanita. Anzi, si è trasformata in una domanda: <strong className="text-foreground">e se potessi creare una carta che parla solo di te?</strong>
          </p>
          <p>
            A novembre 2024 quella domanda è diventata realtà. È nato <strong className="text-foreground">Vault Crafted</strong> — un progetto personale, costruito da zero, con una missione precisa: offrire carte da collezione completamente personalizzate, dove ogni dettaglio racconta la tua storia.
          </p>
          <p>
            Non usiamo template. Non facciamo copie. <strong className="text-foreground">Ogni carta nasce da zero</strong>, su misura per chi la ordina. Un pezzo unico, numerato, che non esisterà mai in un secondo esemplare.
          </p>
        </motion.div>
      </section>

      {/* Distinzione */}
      <section className="border-y border-border/40 bg-surface-1 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 font-display text-3xl tracking-tight md:text-5xl text-center"
          >
            Cosa ci <em className="shimmer-text">distingue</em>
          </motion.h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { num: "01", title: "Zero template", desc: "Ogni carta nasce da un foglio bianco. Nessuna base preimpostata, nessun copia-incolla. Solo design originale pensato per te." },
              { num: "02", title: "Personalizzazione totale", desc: "Dal nome agli attacchi, dall'energia alla frase finale. Ogni elemento è scelto da te e realizzato su misura." },
              { num: "03", title: "Pezzo unico numerato", desc: "Una carta, un proprietario. Numerata e irripetibile. Non esisterà mai un duplicato della tua carta." },
            ].map((item) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-xl border border-border/50 bg-surface-2/60 p-8"
              >
                <div className="mb-4 font-display text-4xl text-gold/40">{item.num}</div>
                <h3 className="mb-3 font-display text-xl">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Numeri */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: "1", label: "Fondatore" },
              { value: "∞", label: "Idee possibili" },
              { value: "0", label: "Carte uguali" },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="font-display text-5xl text-gold md:text-7xl">{item.value}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-surface-1 px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-xl"
        >
          <h2 className="font-display text-3xl md:text-5xl">
            Pronto a creare la <em className="shimmer-text">tua carta?</em>
          </h2>
          <p className="mt-6 text-muted-foreground">
            Pochi minuti. Un'idea. Una carta che nessun altro avrà mai.
          </p>
          <Link
            to="/ordina"
            className="btn-gold group mt-10 inline-flex items-center gap-3 rounded-full px-9 py-5 text-sm font-semibold uppercase tracking-[0.25em]"
          >
            Crea ora la tua carta
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

    </main>
  );
}
