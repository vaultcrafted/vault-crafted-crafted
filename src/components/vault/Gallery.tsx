import { Reveal } from "./Reveal";
import card1 from "@/assets/card-1.jpg";
import card2 from "@/assets/card-2.jpg";
import card3 from "@/assets/card-3.jpg";
import card4 from "@/assets/card-4.jpg";
import card5 from "@/assets/card-5.jpg";
import card6 from "@/assets/card-6.jpg";

const images = [
  { src: card1, alt: "Carta personalizzata con ritratto in oro", span: "row-span-2" },
  { src: card3, alt: "Carta nera con leone in oro", span: "" },
  { src: card4, alt: "Carta da collezione con lupo illustrato", span: "" },
  { src: card2, alt: "Carta con motivi geometrici dorati", span: "row-span-2" },
  { src: card5, alt: "Packaging premium Vault con carte", span: "col-span-2" },
  { src: card6, alt: "Stack di carte premium nere e oro", span: "" },
];

export function Gallery() {
  return (
    <section className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-16 max-w-3xl">
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">La collezione</p>
          <h2 className="font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
            Non sono semplici carte.
            <br />
            <em className="text-gradient-gold">Sono pezzi unici.</em>
          </h2>
        </Reveal>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:auto-rows-[260px] md:grid-cols-4 md:gap-6">
          {images.map((img, i) => (
            <Reveal
              key={i}
              delay={i * 0.08}
              className={`group relative overflow-hidden rounded-sm border border-border/60 bg-card ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-all duration-700 will-change-transform group-hover:scale-105"
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
