import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";
import { Particles } from "./Particles";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-y border-border/40 bg-surface-2 py-32 md:py-44 vault-grain">
      <Particles count={30} />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <h2 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Hai un'idea?
            <br />
            <em className="shimmer-text">Rendila reale.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-md text-base text-muted-foreground">
            Niente attese, niente compromessi. Solo la tua visione, stampata in oro.
          </p>
        </Reveal>
        <Reveal delay={0.35}>
          <Link
            to="/ordina"
            className="btn-gold group mt-12 inline-flex items-center gap-3 rounded-full px-10 py-5 text-sm font-semibold uppercase tracking-[0.25em]"
          >
            Crea ora la tua carta
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
