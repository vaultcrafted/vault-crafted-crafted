import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./Reveal";

const faqs = [
  {
    q: "Quanto tempo serve?",
    a: "Dalla bozza approvata alla consegna passano 3-4 giorni. Lavoriamo a mano, una carta per volta — la qualità non si improvvisa.",
  },
  {
    q: "Posso modificare il design dopo l'approvazione della bozza?",
    a: "Le modifiche sono incluse fino all'approvazione finale. Una volta dato il via libera, la carta entra in produzione e non è più modificabile — è il momento in cui diventa unica.",
  },
  {
    q: "Come funziona la spedizione?",
    a: "Spedizione tracciata in tutta Italia a 4,99€. Tempi di consegna 5/7 giorni lavorativi. Ogni pacco è sigillato con cura nel packaging Vault premium.",
  },
  {
    q: "Perché scegliere Vault?",
    a: "Perché non vendiamo template. Ogni carta è disegnata da zero, numerata, irripetibile. Non possiedi una stampa: possiedi un pezzo che esiste solo per te.",
  },
];

export function Faq() {
  return (
    <section className="relative border-y border-border/40 bg-background py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="mb-16 text-center">
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">Domande frequenti</p>
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">
            Le risposte che <em className="text-gradient-gold">cerchi</em>.
          </h2>
        </Reveal>

        <Reveal>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-border/60 px-2"
              >
                <AccordionTrigger className="py-7 text-left font-display text-xl tracking-tight hover:text-gold hover:no-underline md:text-2xl [&[data-state=open]]:text-gold">
                  <span className="flex items-baseline gap-6">
                    <span className="text-xs text-gold/60">0{i + 1}</span>
                    {f.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-8 pl-12 pr-6 text-base leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
