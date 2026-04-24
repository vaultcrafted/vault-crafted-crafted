import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Particles } from "./Particles";
import { useState } from "react";

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background vault-grain">
      <Particles count={50} />

      {/* Radial gold glow */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.76 0.13 82 / 0.4) 0%, transparent 60%)",
        }}
      />

      {/* Top brand */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-12"
      >
        <div className="font-display text-lg tracking-[0.3em] text-gold">VAULT</div>

        {/* Desktop menu */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/ordina" className="text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold">
            Ordina ora
          </Link>
          <a href="#chi-siamo" className="text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold">
            Chi siamo
          </a>
          <a href="#gallery" className="text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold">
            Tutte le carte
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="z-30 text-gold md:hidden"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </motion.div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 top-16 z-20 flex flex-col gap-4 border-b border-gold/20 bg-background/95 px-6 py-6 backdrop-blur-sm md:hidden"
          >
            <Link to="/ordina" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.3em] text-gold">
              Ordina ora
            </Link>
            <a href="#chi-siamo" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Chi siamo
            </a>
            <a href="#gallery" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Tutte le carte
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-surface-1/60 px-5 py-2 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold">
            Edizione limitata · Pezzo unico
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-[7.5rem]"
        >
          BENVENUTO NEL
          <br />
          <span className="shimmer-text italic">MONDO DI VAULT</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-8 max-w-xl text-base text-muted-foreground md:text-lg"
        >
          Carte personalizzate, uniche, create per distinguersi.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-12"
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              to="/ordina"
              className="btn-gold group inline-flex items-center gap-3 rounded-full px-9 py-5 text-sm font-semibold uppercase tracking-[0.25em]"
            >
              Ordina ora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Scorri
          <span className="h-12 w-px overflow-hidden bg-border">
            <span className="block h-full w-full origin-top animate-[scroll-line_2s_ease-in-out_infinite] bg-gold" />
          </span>
        </div>
      </motion.div>

      <style>{`
        @keyframes scroll-line {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
      `}</style>
    </section>
  );
}
