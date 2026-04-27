import { Reveal } from "./Reveal";

const imageModules = import.meta.glob("@/assets/*.png", { eager: true }) as Record<string, { default: string }>;
const allCards = Object.entries(imageModules).map(([path, mod]) => ({
  src: mod.default,
  alt: path.split("/").pop()?.replace(".png", "") ?? "Carta",
}));

const cards = [...allCards, ...allCards];

export function Gallery() {
  return (
    <section className="relative bg-surface-1 py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-16 max-w-3xl">
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">La collezione</p>
          <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Non sono semplici carte.
            <br />
            <em className="text-gold italic">Sono pezzi unici.</em>
          </h2>
        </Reveal>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-surface-1 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-surface-1 to-transparent" />

        <div
          className="flex gap-4 w-max"
          style={{ animation: "scroll-cards 60s linear infinite" }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className="group relative shrink-0 w-[200px] overflow-hidden rounded-lg border border-gold/20 bg-surface-2"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={card.src}
                alt={card.alt}
                loading="lazy"
                className="h-full w-full object-cover scale-125 transition-transform duration-500 group-hover:scale-[1.28]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="text-[9px] uppercase tracking-[0.3em] text-gold">{card.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll-cards {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
