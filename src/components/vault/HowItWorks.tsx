import { Reveal } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Compila il form",
    desc: "Raccontaci la tua idea. Stile, soggetto, dettagli. Tu immagini, noi disegnamo.",
  },
  {
    n: "02",
    title: "Ricevi la bozza",
    desc: "Ti inviamo l'anteprima. Approvi. Modifichiamo. Fino al risultato perfetto.",
  },
  {
    n: "03",
    title: "Ricevi la tua carta",
    desc: "Stampata, sigillata, spedita. A casa tua in 3-4 giorni.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative bg-surface-2 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-20 text-center">
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">Il processo</p>
          <h2 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Tre passi. <em className="text-gold italic">Una carta tua.</em>
          </h2>
        </Reveal>

        <div className="relative">
          {/* Horizontal line for desktop */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[2.25rem] hidden h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent md:block"
          />

          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.2} className="relative">
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="relative z-10 mb-8 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-gold/40 bg-surface-2 font-display text-xl text-gold shadow-[0_0_30px_-8px_var(--gold)] transition-all hover:bg-gold hover:text-background">
                    {s.n}
                  </div>
                  <h3 className="font-display mb-3 text-2xl tracking-tight text-foreground">{s.title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
