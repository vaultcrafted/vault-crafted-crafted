import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Reveal } from "./Reveal";

const imageModules = import.meta.glob("@/assets/*.png", { eager: true }) as Record<string, { default: string }>;
const cards = Object.entries(imageModules).map(([path, mod]) => ({
  src: mod.default,
  alt: path.split("/").pop()?.replace(".png", "") ?? "Carta personalizzata",
}));

export function CardsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <section className="relative bg-surface-1 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-12 text-center md:mb-16">
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">Sfoglia</p>
          <h2 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Le nostre <em className="text-gold italic">carte.</em>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {cards.map((c, i) => (
                <div
                  key={i}
                  className="min-w-0 shrink-0 grow-0 basis-full px-2 md:basis-1/3 md:px-3"
                >
                  <button
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="group relative block w-full overflow-hidden rounded-lg border border-border/60 bg-surface-2 shadow-[0_0_30px_-12px_var(--gold)] transition-shadow hover:shadow-[0_0_50px_-10px_var(--gold)] focus:outline-none focus:ring-2 focus:ring-gold/60"
                    aria-label={`Apri ${c.alt} a schermo intero`}
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden">
                      <img
                        src={c.src}
                        alt={c.alt}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform scale-125 group-hover:scale-150"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-30" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Carta precedente"
            className="absolute left-0 top-1/2 z-10 -translate-x-2 -translate-y-1/2 rounded-full border border-gold/40 bg-background/80 p-3 text-gold shadow-[0_0_20px_-8px_var(--gold)] backdrop-blur transition-all hover:bg-gold hover:text-background md:-translate-x-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Carta successiva"
            className="absolute right-0 top-1/2 z-10 translate-x-2 -translate-y-1/2 rounded-full border border-gold/40 bg-background/80 p-3 text-gold shadow-[0_0_20px_-8px_var(--gold)] backdrop-blur transition-all hover:bg-gold hover:text-background md:translate-x-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-8 flex items-center justify-center gap-2">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Vai alla carta ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === selectedIndex
                    ? "w-8 bg-gold shadow-[0_0_12px_-2px_var(--gold)]"
                    : "w-2 bg-foreground/30 hover:bg-foreground/60"
                }`}
              />
            ))}
          </div>
        </Reveal>
      </div>

      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Anteprima carta"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Chiudi anteprima"
            className="absolute right-4 top-4 z-10 rounded-full border border-gold/40 bg-background/80 p-3 text-gold transition-all hover:bg-gold hover:text-background md:right-6 md:top-6"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={cards[lightbox].src}
            alt={cards[lightbox].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] rounded-lg border border-gold/30 object-contain shadow-[0_0_80px_-10px_var(--gold)]"
          />
        </div>
      )}
    </section>
  );
}
