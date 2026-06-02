import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/vault/Hero";
import { ValueProps } from "@/components/vault/ValueProps";
import { HowItWorks } from "@/components/vault/HowItWorks";
import { VideoSection } from "@/components/vault/VideoSection";
import { Gallery } from "@/components/vault/Gallery";
import { CardsCarousel } from "@/components/vault/CardsCarousel";
import { Faq } from "@/components/vault/Faq";
import { Newsletter } from "@/components/vault/Newsletter";
import { FinalCta } from "@/components/vault/FinalCta";
import { Footer } from "@/components/vault/Footer";
import { WhatsappButton } from "@/components/vault/WhatsappButton";

const SCHEMA_PRODUCT_COLLECTION = {
  "@context": "https://schema.org",
  "@type": "ProductCollection",
  "name": "Carte da Collezione Personalizzate Vault Crafted",
  "description": "Carte da collezione personalizzate stile Pokémon, create da zero senza template. Ogni carta è un pezzo unico numerato 1/1, con packaging premium incluso.",
  "url": "https://vaultcrafted.com",
  "brand": {
    "@type": "Brand",
    "name": "Vault Crafted"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "EUR",
    "lowPrice": "25.99",
    "highPrice": "49.99",
    "offerCount": "5",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Vault Crafted"
    }
  }
};

const SCHEMA_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quanto tempo serve per ricevere la carta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Il processo completo richiede 7-10 giorni lavorativi. Entro 24-48 ore ricevi la bozza grafica da approvare. Una volta approvata, la carta viene prodotta e spedita in 3-4 giorni. La consegna tramite corriere richiede 5-7 giorni lavorativi."
      }
    },
    {
      "@type": "Question",
      "name": "Posso modificare il design dopo l'approvazione della bozza?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sì, puoi richiedere tutte le modifiche che vuoi prima di approvare la bozza finale, senza costi aggiuntivi. Una volta dato il via libera definitivo e confermato il pagamento, la carta entra in produzione e non è più modificabile."
      }
    },
    {
      "@type": "Question",
      "name": "Come funziona la spedizione?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Spedizioni in tutta Italia tramite corriere espresso tracciato al costo fisso di 4,99€. I tempi di consegna sono di circa 5-7 giorni lavorativi. Ogni ordine viene imballato con cura nel packaging premium Vault."
      }
    },
    {
      "@type": "Question",
      "name": "Come avviene il pagamento?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Il pagamento avviene dopo l'approvazione della bozza grafica. Una volta che hai dato il via libera al design, ti invieremo via email il totale da pagare e le istruzioni per il pagamento. La produzione parte esclusivamente dopo la conferma del pagamento."
      }
    },
    {
      "@type": "Question",
      "name": "Posso ordinare una carta come regalo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Assolutamente sì. Puoi compilare il form con i dettagli della persona a cui è destinata e inserire l'indirizzo di spedizione direttamente. È uno dei regali più originali che puoi fare."
      }
    },
    {
      "@type": "Question",
      "name": "Che formato deve avere la foto che carico?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Per il miglior risultato, la foto dovrebbe essere in alta risoluzione (minimo 1000x1000 pixel) e in formato JPG, PNG o PDF. Il file può avere dimensione massima di 10MB."
      }
    },
    {
      "@type": "Question",
      "name": "Perché scegliere Vault Crafted?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vault Crafted non vende stampe: crea oggetti da collezione. Ogni carta è progettata da zero partendo dalla tua idea, numerata 1/1 e prodotta in un unico esemplare. Non esistono template, non esistono duplicati."
      }
    }
  ]
};

const SCHEMA_BREADCRUMB = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://vaultcrafted.com"
    }
  ]
};

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Vault Crafted — Carte da Collezione Personalizzate | Pezzi Unici" },
      {
        name: "description",
        content: "Crea la tua carta da collezione personalizzata con Vault Crafted. Design unico, zero template, packaging premium. Ideale come regalo originale per compleanni, lauree e anniversari. Ordina ora.",
      },
      { name: "keywords", content: "carte personalizzate, carte da collezione personalizzate, carta pokemon personalizzata, regalo originale, pezzo unico, vault crafted, carte regalo, carte uniche" },
      { name: "author", content: "Vault Crafted" },
      { name: "robots", content: "index, follow" },
      { rel: "canonical", content: "https://vaultcrafted.com" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://vaultcrafted.com" },
      { property: "og:title", content: "Vault Crafted — Carte da Collezione Personalizzate | Pezzi Unici" },
      { property: "og:description", content: "Crea la tua carta da collezione personalizzata. Design unico, zero template, packaging premium. Il regalo originale che nessuno dimentica." },
      { property: "og:image", content: "https://vaultcrafted.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "it_IT" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Vault Crafted — Carte da Collezione Personalizzate" },
      { name: "twitter:description", content: "Crea la tua carta da collezione personalizzata. Design unico, zero template, packaging premium." },
      { name: "twitter:image", content: "https://vaultcrafted.com/og-image.jpg" },
      { name: "google-site-verification", content: "cBR2V56c8GK0VvVyq4tum_EXfRUmpAaUOSKg9w1NRAY" },
    ],
    links: [
      { rel: "canonical", href: "https://vaultcrafted.com" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(SCHEMA_PRODUCT_COLLECTION),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(SCHEMA_FAQ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(SCHEMA_BREADCRUMB),
      },
    ],
  }),
});

function Index() {
  return (
    <main className="bg-background text-foreground">
      <Hero />
      <CardsCarousel />
      <ValueProps />
      <HowItWorks />
      <VideoSection />
      <Gallery />
      <Faq />
      <Newsletter />
      <FinalCta />
      <Footer />
      <WhatsappButton />
    </main>
  );
}
