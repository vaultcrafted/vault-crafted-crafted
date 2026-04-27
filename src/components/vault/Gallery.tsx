import { Reveal } from "./Reveal";

const imageModules = import.meta.glob("@/assets/*.png", { eager: true }) as Record<string, { default: string }>;
const allCards = Object.entries(imageModules).map(([path, mod]) => ({
  src: mod.default,
  alt: path.split("/").pop()?.replace(".png", "") ?? "Carta",
}));

const spans = ["row-span-2", "", "", "row-span-2", "col-span-2", ""];
const images = allCards.slice(0, 6).map((c, i) => ({ ...c, span: spans[i] ?? "" }));

export function Gallery() {
  return (
    <section className="relative bg-surface-1 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-16 max-w-3xl">
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">La collezione</p>
          <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Non sono semplici carte.
            <br />
            <em className="text-gold italic">Sono pezzi unici.</em>
          </h2>
        </Reveal>
        <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:auto-rows-[260px] md:grid-cols-4 md:gap-6">
          {images.map((img, i) => (
            <Reveal
              key={i}
              delay={i * 0.08}
              className={`group relative overflow-hidden rounded-sm border border-border/60 bg-surface-2 ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-all duration-700 will-change-transform scale-125 group-hover:scale-[1.28]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-30" />
              <div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.3em] text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                Vault · 001/001
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
