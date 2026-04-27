import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Particles } from "@/components/vault/Particles";

export const Route = createFileRoute("/carte")({
  component: CartePage,
  head: () => ({
   meta: [
  { title: "Tutte le carte — Vault Crafted | La collezione" },
  { name: "description", content: "Sfoglia la collezione di carte da collezione personalizzate create da Vault Crafted. Ogni pezzo è unico, numerato e irripetibile." },
  { name: "robots", content: "index, follow" },
  { property: "og:url", content: "https://vaultcrafted.com/carte" },
  { property: "og:title", content: "Tutte le carte — Vault Crafted" },
  { property: "og:description", content: "Ogni carta è un pezzo unico. Sfoglia la nostra collezione e ordina la tua." },
],
  }),
});

const imageModules = import.meta.glob("@/assets/*.png", { eager: true }) as Record<string, { default: string }>;
const CARTE = Object.entries(imageModules).map(([path, mod], i) => ({
  id: i + 1,
  src: mod.default,
  label: path.split("/").pop()?.replace(".png", "") ?? `Carta ${i + 1}`,
}));

function CartePage() {
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
          <Link
            to="/"
            className="font-display text-lg tracking-[0.3em] text-gold transition-colors hover:text-gold/70"
          >
            VAULT
          </Link>
          <div className="w-16" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-1 px-6 py-24 text-center md:py-32">
        <Particles count={25} />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-surface-2/60 px-5 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Collezione</span>
          </div>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
            Pezzi unici.
            <br />
            <em className="shimmer-text">Mai template.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            Ogni carta è un mondo a sé. Nessuna uguale all'altra.
          </p>
        </motion.div>
      </section>

      {/* Grid */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
            {CARTE.map((carta, i) => (
              <motion.div
                key={carta.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl border border-gold/20 bg-surface-2/40 
                  ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}
                  ${i === 3 ? "md:col-span-2" : ""}
                `}
                style={{ aspectRatio: i === 0 ? "auto" : "3/4" }}
              >
                <motion.img
                  src={carta.src}
                  alt={carta.label}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  style={{ minHeight: i === 0 ? "400px" : "auto" }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-4 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.3em] text-gold">{carta.label}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/60">Pezzo unico</span>
                  </div>
                </div>
                {/* Gold glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(201,168,76,0.4)" }}
                />
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
            Vuoi la tua <em className="shimmer-text">carta unica?</em>
          </h2>
          <p className="mt-6 text-muted-foreground">
            Pochi minuti. Un'idea. Una carta che nessun altro avrà mai.
          </p>
          <Link
            to="/ordina"
            className="btn-gold group mt-10 inline-flex items-center gap-3 rounded-full px-9 py-5 text-sm font-semibold uppercase tracking-[0.25em]"
          >
            Ordina ora
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

    </main>
  );
}
