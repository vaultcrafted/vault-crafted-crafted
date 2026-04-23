import { Layers, Gem, Package } from "lucide-react";
import { Reveal } from "./Reveal";

const items = [
  {
    icon: Layers,
    title: "Zero template",
    desc: "Ogni carta nasce da zero. Nessuna base preimpostata, nessun copia-incolla. Solo design originale.",
  },
  {
    icon: Gem,
    title: "Pezzi unici reali",
    desc: "Una carta, un proprietario. Numerata, firmata, irripetibile. Non esisterà mai un duplicato.",
  },
  {
    icon: Package,
    title: "Packaging premium incluso",
    desc: "Custodia rigida, sigillo Vault, finiture in oro. L'esperienza inizia prima di aprirla.",
  },
];

export function ValueProps() {
  return (
    <section className="relative border-y border-border/40 bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-20 text-center">
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">Il nostro standard</p>
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">
            Costruito per chi rifiuta <em className="text-gradient-gold">l'ordinario</em>.
          </h2>
        </Reveal>

        <div className="grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.15}>
              <div className="group h-full bg-background p-10 transition-colors duration-500 hover:bg-card md:p-12">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-sm border border-gold/40 bg-gold/5 transition-all group-hover:border-gold group-hover:bg-gold/10 group-hover:shadow-[0_0_30px_-5px_var(--gold)]">
                  <item.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-display mb-4 text-2xl tracking-tight">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                <div className="mt-8 text-[10px] uppercase tracking-[0.4em] text-gold/60">
                  0{i + 1} / 03
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
