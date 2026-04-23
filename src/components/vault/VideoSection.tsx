import { Reveal } from "./Reveal";

export function VideoSection() {
  return (
    <section className="relative bg-surface-2 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-12 text-center md:mb-16">
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">Guarda</p>
          <h2 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Vault <em className="text-gold italic">in azione.</em>
          </h2>
        </Reveal>

        <Reveal delay={0.15} className="mx-auto w-full max-w-[900px]">
          <div className="relative overflow-hidden rounded-xl border border-gold/40 shadow-[0_0_60px_-10px_var(--gold)]">
            <div className="relative aspect-video w-full bg-background">
              <iframe
                src="https://www.youtube.com/embed/V-EByGIH6Z0"
                title="Vault Crafted in azione"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
