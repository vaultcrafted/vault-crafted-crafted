import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Reveal } from "./Reveal";
import AZZURRA from "@/assets/AZZURRA.png";
import COLLE_DER_FOMENTO from "@/assets/COLLE DER FOMENTO.png";
import DANNO from "@/assets/DANNO.png";
import DIEGO_VALLINO from "@/assets/DIEGO VALLINO.png";
import DJ_CRAIM from "@/assets/DJ CRAIM.png";
import EPCORAW from "@/assets/EPCORAW.png";
import ETR from "@/assets/ETR.png";
import FABRI_FIBRA from "@/assets/FABRI FIBRA.png";
import GEMITAIZ from "@/assets/GEMITAIZ.png";
import GINO from "@/assets/GINO.png";
import GRIME_SPITTERZ from "@/assets/GRIME SPITTERZ.png";
import HAXO from "@/assets/HAXO.png";
import IKB from "@/assets/IKB.png";
import JAZ_E_BOBO from "@/assets/JAZ E BOBO.png";
import KUROLILY from "@/assets/KUROLILY.png";
import LAURA_MASSEI from "@/assets/LAURA MASSEI.png";
import LAZZA from "@/assets/LAZZA.png";
import LINCIO from "@/assets/LINCIO.png";
import MATTAK from "@/assets/MATTAK.png";
import MATTEO_IULIANI from "@/assets/MATTEO IULIANI.png";
import MIRKO_GARDONI from "@/assets/MIRKO GARDONI.png";
import OMEGA_RIOT from "@/assets/OMEGA RIOT.png";
import PIPINO_IL_BREVE from "@/assets/PIPINO IL BREVE.png";
import POPPI from "@/assets/POPPI.png";
import PRODEST from "@/assets/PRODEST.png";
import RIC_DE_LARGE from "@/assets/RIC DE LARGE.png";
import RICCARDO_SALOMONI from "@/assets/RICCARDO SALOMONI.png";
import WARCARD from "@/assets/WARCARD.png";

const cards = [
  { src: AZZURRA, alt: "Carta personalizzata Azzurra" },
  { src: COLLE_DER_FOMENTO, alt: "Carta personalizzata Colle Der Fomento" },
  { src: DANNO, alt: "Carta personalizzata Danno" },
  { src: DIEGO_VALLINO, alt: "Carta personalizzata Diego Vallino" },
  { src: DJ_CRAIM, alt: "Carta personalizzata DJ Craim" },
  { src: EPCORAW, alt: "Carta personalizzata Epcoraw" },
  { src: ETR, alt: "Carta personalizzata ETR" },
  { src: FABRI_FIBRA, alt: "Carta personalizzata Fabri Fibra" },
  { src: GEMITAIZ, alt: "Carta personalizzata Gemitaiz" },
  { src: GINO, alt: "Carta personalizzata Gino" },
  { src: GRIME_SPITTERZ, alt: "Carta personalizzata Grime Spitterz" },
  { src: HAXO, alt: "Carta personalizzata Haxo" },
  { src: IKB, alt: "Carta personalizzata IKB" },
  { src: JAZ_E_BOBO, alt: "Carta personalizzata Jaz e Bobo" },
  { src: KUROLILY, alt: "Carta personalizzata Kurolily" },
  { src: LAURA_MASSEI, alt: "Carta personalizzata Laura Massei" },
  { src: LAZZA, alt: "Carta personalizzata Lazza" },
  { src: LINCIO, alt: "Carta personalizzata Lincio" },
  { src: MATTAK, alt: "Carta personalizzata Mattak" },
  { src: MATTEO_IULIANI, alt: "Carta personalizzata Matteo Iuliani" },
  { src: MIRKO_GARDONI, alt: "Carta personalizzata Mirko Gardoni" },
  { src: OMEGA_RIOT, alt: "Carta personalizzata Omega Riot" },
  { src: PIPINO_IL_BREVE, alt: "Carta personalizzata Pipino il Breve" },
  { src: POPPI, alt: "Carta personalizzata Poppi" },
  { src: PRODEST, alt: "Carta personalizzata Prodest" },
  { src: RIC_DE_LARGE, alt: "Carta personalizzata Ric de Large" },
  { src: RICCARDO_SALOMONI, alt: "Carta personalizzata Riccardo Salomoni" },
  { src: WARCARD, alt: "Carta personalizzata Warcard" },
];

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
                        className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
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
