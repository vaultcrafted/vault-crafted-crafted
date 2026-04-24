import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Gift } from "lucide-react";
import { Particles } from "@/components/vault/Particles";

export const Route = createFileRoute("/regalo")({
  component: RegaloPage,
  head: () => ({
    meta: [
  { title: "Il regalo perfetto — Vault Crafted | Carte personalizzate" },
  { name: "description", content: "Cerca un regalo originale e unico? Una carta da collezione personalizzata Vault Crafted è il regalo perfetto per compleanni, lauree, anniversari, Natale e molto altro." },
  { name: "keywords", content: "regalo originale, regalo personalizzato, regalo compleanno unico, carta pokemon regalo, regalo laurea originale" },
  { name: "robots", content: "index, follow" },
  { property: "og:url", content: "https://vaultcrafted.com/regalo" },
  { property: "og:title", content: "Il regalo perfetto — Vault Crafted" },
  { property: "og:description", content: "Smetti di regalare cose che finiscono nel cassetto. Una carta Vault è unica, personalizzata e irripetibile." },
],
  }),
});

const OCCASIONI = [
  { emoji: "🎂", title: "Compleanno", desc: "Un regalo che non finisce nel cassetto. Una carta con il suo nome, i suoi superpoteri, la sua storia. Ogni anno diversa, ogni anno unica." },
  { emoji: "💍", title: "Anniversario", desc: "Trasforma un ricordo in un oggetto da collezione. La data, il luogo, le parole che contano — tutto su una carta che durerà per sempre." },
  { emoji: "🎓", title: "Laurea", desc: "Ha sudato anni per quel traguardo. Dagli qualcosa che ricordi per sempre quel momento — una carta con il suo titolo, i suoi voti, la sua dedica." },
  { emoji: "🎄", title: "Natale", desc: "Stanco dei soliti regali? Una carta personalizzata è il dono che nessuno si aspetta ma che tutti vorrebbero. Originale, esclusivo, irripetibile." },
  { emoji: "💒", title: "Matrimonio", desc: "Un regalo agli sposi che va oltre le liste nozze. Una carta che racconta la loro storia, il loro giorno, il loro amore — in un pezzo unico da esporre." },
  { emoji: "🐾", title: "Animale domestico", desc: "Il tuo cane, il tuo gatto, la tua tartaruga — tutti meritano una carta da collezione. Perché anche loro fanno parte della famiglia." },
  { emoji: "👯", title: "Migliore amico", desc: "Quella persona che conosci da sempre e che merita qualcosa di speciale. Una carta con i suoi soprannomi, le sue mosse speciali, la vostra storia." },
  { emoji: "👨‍👩‍👧", title: "Famiglia", desc: "Un regalo per papà, mamma, un fratello o una sorella. Qualcosa di personalissimo che solo tu potevi pensare per loro." },
  { emoji: "🌟", title: "Per te stesso", desc: "Perché no? Ti sei guadagnato un pezzo unico. Creati la tua carta — con il tuo nome, i tuoi attacchi, la tua storia. Sei il protagonista." },
];

function RegaloPage() {
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-1 px-6 py-28 text-center md:py-40">
        <Particles count={30} />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-surface-2/60 px-5 py-2">
            <Gift className="h-3.5 w-3.5 text-gold" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Il regalo perfetto</span>
          </div>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Un regalo che
            <br />
            <em className="shimmer-text">nessuno dimentica.</em>
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-base text-muted-foreground md:text-lg">
            Smettila di regalare cose che finiscono nel cassetto. Una carta Vault è un pezzo unico, personalizzato, irripetibile — qualcosa che la persona che ami terrà per sempre.
          </p>
          <Link
            to="/ordina"
            className="btn-gold group mt-10 inline-flex items-center gap-3 rounded-full px-9 py-5 text-sm font-semibold uppercase tracking-[0.25em]"
          >
            Crea il regalo ora
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

      {/* Perché è il regalo perfetto */}
      <section className="border-y border-border/40 bg-surface-2 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center font-display text-3xl tracking-tight md:text-5xl"
          >
            Perché è <em className="shimmer-text">diverso</em> da tutto il resto
          </motion.h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { num: "01", title: "È unico al mondo", desc: "Non esiste un secondo esemplare. Nessuno avrà mai la stessa carta — è progettata esclusivamente per chi la riceve." },
              { num: "02", title: "Racconta una storia", desc: "Non è un oggetto qualsiasi. È un oggetto che parla di quella persona specifica — il suo nome, la sua personalità, i suoi momenti." },
              { num: "03", title: "Dura per sempre", desc: "Stampata su materiali premium, protetta dalla custodia Vault. Non è un regalo usa e getta — è un pezzo da collezione." },
            ].map((item) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-xl border border-border/50 bg-surface-1/60 p-8"
              >
                <div className="mb-4 font-display text-4xl text-gold/40">{item.num}</div>
                <h3 className="mb-3 font-display text-xl">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Occasioni */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center font-display text-3xl tracking-tight md:text-5xl"
          >
            Per ogni <em className="shimmer-text">occasione</em>
          </motion.h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OCCASIONI.map((occ, i) => (
              <motion.div
                key={occ.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group rounded-xl border border-border/50 bg-surface-1/60 p-6 transition-all hover:border-gold/40 hover:bg-surface-2/60"
              >
                <div className="mb-4 text-4xl">{occ.emoji}</div>
                <h3 className="mb-2 font-display text-lg text-foreground">{occ.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{occ.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section className="border-y border-border/40 bg-surface-2 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 font-display text-3xl tracking-tight md:text-5xl"
          >
            Come funziona <em className="shimmer-text">in 3 passi</em>
          </motion.h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { num: "1", title: "Compila il form", desc: "Raccontaci chi è la persona e cosa vuoi sulla carta. Ci vorranno 5 minuti." },
              { num: "2", title: "Approva la bozza", desc: "Ti mandiamo il design da approvare. Puoi chiedere modifiche finché non è perfetto." },
              { num: "3", title: "Ricevi il regalo", desc: "La carta arriva a casa tua in packaging premium, pronta da regalare." },
            ].map((step) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 font-display text-2xl text-gold">
                  {step.num}
                </div>
                <h3 className="mb-2 font-display text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-xl"
        >
          <h2 className="font-display text-3xl md:text-5xl">
            Pronto a fare il <em className="shimmer-text">regalo perfetto?</em>
          </h2>
          <p className="mt-6 text-muted-foreground">
            Pochi minuti. Un'idea. Un regalo che nessuno dimenticherà mai.
          </p>
          <Link
            to="/ordina"
            className="btn-gold group mt-10 inline-flex items-center gap-3 rounded-full px-9 py-5 text-sm font-semibold uppercase tracking-[0.25em]"
          >
            Crea il regalo ora
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

    </main>
  );
}
