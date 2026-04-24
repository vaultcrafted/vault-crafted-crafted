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
    a: "Il processo completo si divide in due fasi. Dalla ricezione dell'ordine, entro 24-48 ore ti inviamo la bozza grafica da approvare. Una volta approvata e confermato il pagamento, la carta viene prodotta e spedita in 3-4 giorni lavorativi. I tempi di consegna tramite corriere sono di circa 5-7 giorni lavorativi. In totale, dalla compilazione del form alla carta in mano, puoi aspettarti circa 7-10 giorni lavorativi.",
  },
  {
    q: "Posso modificare il design dopo l'approvazione della bozza?",
    a: "Sì, puoi richiedere tutte le modifiche che vuoi prima di approvare la bozza finale — senza costi aggiuntivi. Il nostro obiettivo è che tu sia al 100% soddisfatto prima di procedere. Una volta dato il via libera definitivo e confermato il pagamento, la carta entra in produzione e non è più modificabile. È quel momento preciso in cui smette di essere un progetto e diventa il tuo pezzo unico.",
  },
  {
    q: "Come funziona la spedizione?",
    a: "Spedizioni in tutta Italia tramite corriere espresso tracciato al costo fisso di 4,99€. I tempi di consegna sono di circa 5-7 giorni lavorativi dalla spedizione. Ogni ordine viene imballato con cura nel packaging premium Vault: custodia rigida, sigillo e presentazione curata nei dettagli. Riceverai un'email con il codice di tracciamento non appena il pacco verrà affidato al corriere.",
  },
  {
    q: "Perché scegliere Vault?",
    a: "Perché Vault Crafted non vende stampe: crea oggetti da collezione. Ogni carta è progettata da zero partendo dalla tua idea, numerata 1/1 e prodotta in un unico esemplare. Non esistono template, non esistono duplicati. Quello che ricevi è un pezzo che esiste solo per te — con il tuo nome, la tua storia, i tuoi dettagli. È la differenza tra possedere qualcosa e possedere qualcosa di tuo.",
  },
  {
    q: "Posso ordinare una carta come regalo?",
    a: "Assolutamente sì — anzi, è uno dei regali più originali che puoi fare. Puoi compilare il form con i dettagli della persona a cui è destinata e inserire l'indirizzo di spedizione direttamente. Se vuoi una confezione regalo particolare o una dedica speciale, scrivicelo nella sezione 'Frase personalizzata' del form o contattaci via WhatsApp prima di completare l'ordine.",
  },
  {
    q: "Che formato deve avere la foto che carico?",
    a: "Per ottenere il miglior risultato di stampa, la foto dovrebbe essere in alta risoluzione (minimo 1000x1000 pixel) e in formato JPG, PNG o PDF. Evita foto sfocate, scattate in condizioni di scarsa luce o con risoluzione bassa — potrebbero compromettere la qualità finale della carta. Se hai dubbi sulla tua immagine, caricala comunque e ti faremo sapere in fase di bozza se è necessario sostituirla.",
  },
  {
    q: "Come avviene il pagamento?",
    a: "Il pagamento avviene dopo l'approvazione della bozza grafica. Una volta che hai dato il via libera al design, ti invieremo via email il totale da pagare (carta + custodia scelta + spedizione) e le istruzioni per effettuare il pagamento. La produzione parte esclusivamente dopo la conferma del pagamento. Ti chiediamo di inviare la ricevuta rispondendo all'email di conferma.",
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
