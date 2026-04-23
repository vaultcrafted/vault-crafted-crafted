import { useState, type FormEvent } from "react";
import { Reveal } from "./Reveal";
import { Check } from "lucide-react";

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="relative bg-surface-1 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-md border border-gold/40 bg-surface-2 p-10 backdrop-blur-sm md:p-16">
            {/* Corner accents */}
            <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-gold" />
            <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-gold" />
            <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-gold" />
            <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-gold" />

            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">
                  Inner circle
                </p>
                <h2 className="font-display text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
                  Entra nella <em className="text-gold italic">cerchia ristretta</em>.
                </h2>
                <p className="mt-4 text-sm text-muted-foreground">
                  Drop esclusivi, anteprime, accesso prioritario. Solo per chi è dentro.
                </p>
              </div>

              {submitted ? (
                <div className="flex items-center gap-4 rounded-sm border border-gold/40 bg-gold/10 p-6">
                  <Check className="h-6 w-6 text-gold" />
                  <div>
                    <p className="font-display text-lg text-gold">Sei dentro.</p>
                    <p className="text-sm text-muted-foreground">Ci sentiamo presto.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="sr-only" htmlFor="name">
                      Nome e Cognome
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Nome e Cognome"
                      className="w-full border-b border-border bg-transparent px-1 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="Email"
                      className="w-full border-b border-border bg-transparent px-1 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-gold mt-4 w-full rounded-md px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em]"
                  >
                    Iscriviti
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
