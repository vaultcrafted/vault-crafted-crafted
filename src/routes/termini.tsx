import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/termini")({
  component: TerminiPage,
  head: () => ({
    meta: [
      { title: "Termini e Condizioni — Vault Crafted" },
      {
        name: "description",
        content: "Termini e condizioni d'uso e privacy policy di Vault Crafted.",
      },
    ],
  }),
});

function TerminiPage() {
  return (
    <main className="min-h-screen bg-background text-foreground vault-grain">

      {/* Header */}
      <header className="border-b border-border/40 bg-surface-2/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Indietro
          </Link>
          <Link
            to="/"
            className="font-display text-lg tracking-[0.3em] text-gold transition-colors hover:text-gold/70"
          >
            VAULT
          </Link>
          <div className="w-16" />
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-display text-4xl tracking-tight md:text-6xl mb-4">
            Termini e <em className="shimmer-text">Condizioni</em>
          </h1>
          <p className="text-sm text-muted-foreground mb-16">Ultimo aggiornamento: Aprile 2025</p>

          <div className="space-y-12 text-muted-foreground leading-relaxed">

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">1. Informazioni generali</h2>
              <p>Vault Crafted è un servizio di creazione di carte da collezione personalizzate gestito da un privato con sede a Livorno Ferraris (VC), Italia. Per qualsiasi informazione puoi contattarci all'indirizzo <a href="mailto:vaultcrafted@gmail.com" className="text-gold hover:underline">vaultcrafted@gmail.com</a>.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">2. Oggetto del servizio</h2>
              <p>Vault Crafted realizza carte da collezione personalizzate su richiesta del cliente. Ogni carta è un pezzo unico, creato su misura in base alle indicazioni fornite tramite il modulo d'ordine. Il servizio include progettazione grafica, stampa, taglio e confezionamento della carta con la custodia scelta.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">3. Processo d'ordine</h2>
              <p>Il processo di ordinazione avviene nelle seguenti fasi:</p>
              <ul className="mt-3 space-y-2 ml-4 list-disc">
                <li>Il cliente compila il modulo d'ordine sul sito fornendo tutti i dettagli richiesti</li>
                <li>Vault Crafted invia una bozza grafica pre-stampa via email per approvazione</li>
                <li>Il cliente approva la bozza o richiede modifiche</li>
                <li>Dopo l'approvazione viene comunicato il totale da pagare e le istruzioni per il pagamento</li>
                <li>La produzione inizia esclusivamente dopo la conferma del pagamento</li>
                <li>La carta viene spedita entro 3-4 giorni lavorativi dalla conferma del pagamento</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">4. Prezzi e pagamento</h2>
              <p>I prezzi indicati sul sito sono comprensivi di progettazione, stampa, taglio e scatola protettiva con gadget. La spedizione ha un costo aggiuntivo di 4,99€. Le custodie protettive hanno costi aggiuntivi indicati sul sito. Il pagamento avviene tramite le modalità comunicate via email dopo l'approvazione della bozza. La produzione non inizia fino al ricevimento del pagamento.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">5. Diritto di recesso e rimborsi</h2>
              <p>Trattandosi di prodotti personalizzati e realizzati su misura, ai sensi dell'art. 59 lett. c) del Codice del Consumo (D.Lgs. 206/2005), <strong className="text-foreground">il diritto di recesso non si applica</strong> una volta approvata la bozza grafica e confermato il pagamento. È possibile richiedere modifiche alla bozza prima dell'approvazione finale senza costi aggiuntivi. In caso di difetti di produzione imputabili a Vault Crafted, verrà offerta la riproduzione gratuita della carta.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">6. Materiali forniti dal cliente</h2>
              <p>Il cliente è responsabile dei materiali (foto, immagini, testi) caricati tramite il modulo d'ordine. Caricando materiali, il cliente dichiara di possedere i diritti necessari per il loro utilizzo. Vault Crafted non è responsabile per eventuali violazioni di diritti di terzi derivanti dai materiali forniti dal cliente.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">7. Spedizione</h2>
              <p>Le spedizioni vengono effettuate tramite corriere espresso. I tempi di consegna sono indicativi e possono variare in base alla destinazione e a eventuali ritardi del corriere. Vault Crafted non è responsabile per ritardi imputabili al servizio di spedizione. In caso di mancata consegna o smarrimento, verrà aperta una pratica con il corriere.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">8. Proprietà intellettuale</h2>
              <p>Le carte create da Vault Crafted sono di proprietà esclusiva del cliente che le ha ordinate. Vault Crafted si riserva il diritto di utilizzare immagini delle carte realizzate a fini promozionali, salvo esplicita richiesta contraria da parte del cliente al momento dell'ordine.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">9. Privacy e protezione dei dati (GDPR)</h2>
              <p>Vault Crafted raccoglie e tratta i dati personali dei clienti (nome, cognome, email, telefono, indirizzo di spedizione) esclusivamente per le seguenti finalità:</p>
              <ul className="mt-3 space-y-2 ml-4 list-disc">
                <li>Gestione e fulfillment degli ordini</li>
                <li>Comunicazioni relative all'ordine (bozze, conferme, aggiornamenti spedizione)</li>
                <li>Invio di comunicazioni promozionali (solo per gli iscritti alla newsletter, con consenso esplicito)</li>
              </ul>
              <p className="mt-4">I dati non vengono ceduti a terzi, ad eccezione del corriere per la spedizione. I dati vengono conservati per il tempo necessario all'evasione dell'ordine e per eventuali obblighi di legge. Il titolare del trattamento è Vault Crafted, contattabile all'indirizzo <a href="mailto:vaultcrafted@gmail.com" className="text-gold hover:underline">vaultcrafted@gmail.com</a>.</p>
              <p className="mt-4">In conformità al Regolamento UE 2016/679 (GDPR), l'utente ha diritto di accedere, rettificare, cancellare i propri dati, opporsi al trattamento e richiedere la portabilità degli stessi inviando una richiesta a <a href="mailto:vaultcrafted@gmail.com" className="text-gold hover:underline">vaultcrafted@gmail.com</a>.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">10. Cookie</h2>
              <p>Questo sito utilizza esclusivamente cookie tecnici necessari al funzionamento della pagina. Non vengono utilizzati cookie di profilazione o di terze parti a fini pubblicitari.</p>
            </div>

            <div>
              <h2 className="font-display text-xl text-foreground mb-4">11. Legge applicabile</h2>
              <p>I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Foro di Vercelli, salvo diversa disposizione di legge applicabile ai consumatori.</p>
            </div>

            <div className="border-t border-border/40 pt-8">
              <p className="text-sm">Per qualsiasi domanda o chiarimento contattaci a <a href="mailto:vaultcrafted@gmail.com" className="text-gold hover:underline">vaultcrafted@gmail.com</a>.</p>
            </div>

          </div>
        </motion.div>
      </section>

    </main>
  );
}
