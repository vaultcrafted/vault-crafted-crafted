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
    a: "Dopo l'ordine controlliamo la carta e ti scriviamo con il riepilogo e le istruzioni per il pagamento. Appena il pagamento arriva la stampiamo e la spediamo in 3-4 giorni lavorativi. Il corriere impiega circa 5-7 giorni lavorativi.",
  },
  {
    q: "Vedo la carta prima di ordinarla?",
    a: "Sì. Nel configuratore la carta si aggiorna mentre scegli e scrivi: ordini esattamente quello che vedi. Se qualcosa non va per la stampa, ti scriviamo prima di stampare.",
  },
  {
    q: "Come funziona la spedizione?",
    a: "Spedizioni in tutta Italia tramite corriere espresso tracciato al costo fisso di 4,99€. I tempi di consegna sono di circa 5-7 giorni lavorativi dalla spedizione. Riceverai un'email con il codice di tracciamento non appena il pacco verrà affidato al corriere.",
  },
  {
    q: "Perché scegliere Vault?",
    a: "Perché ogni carta la componi tu, con la tua foto e le tue frasi, e viene stampata numerata in un unico esemplare. Non esistono duplicati: è un pezzo che esiste solo per te.",
  },
  {
    q: "Posso ordinare una carta come regalo?",
    a: "Sì, è uno dei regali più originali che puoi fare. Componi la carta e inserisci direttamente l'indirizzo di chi la riceve. Se vuoi una dedica, scrivicelo nelle note dell'ordine o contattaci su WhatsApp.",
  },
  {
    q: "Che foto devo caricare?",
    a: "Una foto nitida e con buona luce, in alta risoluzione (minimo 1000x1000 pixel), in JPG o PNG. È la foto che stampiamo, quindi evita foto sfocate o scure. Se non va bene per la stampa ti scriviamo prima di procedere.",
  },
  {
    q: "Come avviene il pagamento?",
    a: "Dopo l'ordine ti mandiamo via email il totale (carta, custodia, extra e spedizione) e le istruzioni per pagare. La stampa parte quando il pagamento arriva.",
  },
];

export function Faq() {
  return (
    <section className="relative border-y border-border/40 bg-surface-2 py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="mb-16 text-center">
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">Domande frequenti</p>
          <h2 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Le risposte che <em className="text-gold italic">cerchi</em>.
          </h2>
        </Reveal>
        <Reveal>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="overflow-hidden rounded-md border border-gold/20 bg-cream px-6 text-ink shadow-sm"
              >
                <AccordionTrigger className="py-6 text-left font-display text-xl tracking-tight text-ink hover:no-underline md:text-2xl [&[data-state=open]]:text-ink">
                  <span className="flex items-baseline gap-6">
                    <span className="text-xs text-gold">0{i + 1}</span>
                    {f.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-12 pr-6 text-base leading-relaxed text-ink/80">
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
