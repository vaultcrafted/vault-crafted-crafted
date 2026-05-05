import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border/40 bg-surface-2/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/">
            <img src="/LOGO.png" alt="Vault Crafted" className="h-10 w-auto" />
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="z-30 text-gold">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="fixed right-0 top-0 z-30 flex h-full w-64 flex-col gap-8 border-l border-gold/20 bg-background/95 px-8 py-24 backdrop-blur-sm"
            >
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold">
                Home
              </Link>
              <Link to="/ordina" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.3em] text-gold transition-colors hover:text-gold/70">
                Ordina ora
              </Link>
              <Link to="/carte" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold">
                Tutte le carte
              </Link>
              <Link to="/chi-siamo" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold">
                Chi siamo
              </Link>
              <Link to="/regalo" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold">
                Regalo perfetto
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
