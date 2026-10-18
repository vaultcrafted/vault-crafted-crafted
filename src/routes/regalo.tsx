import { createFileRoute, Link } from "@tanstack/react-router";
import { FONTS_HREF } from "@/components/vault/CardEditor";
import { SiteShell } from "@/components/vault/home/Site";

const SCHEMA_PRODUCT_REGALO = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Carta da Collezione Personalizzata — Regalo Originale",
  "description": "Una carta da collezione personalizzata con la foto di chi la riceve, come regalo originale. Per compleanni, lauree, anniversari, Natale, matrimoni. Stampata e numerata, spedizione in tutta Italia.",
  "brand": { "@type": "Brand", "name": "Vault Crafted" },
  "image": "https://vaultcrafted.com/og-image.jpg",
  "url": "https://vaultcrafted.com/regalo",
  "category": "Regalo personalizzato",
  "keywords": "regalo originale, regalo personalizzato, carta pokemon regalo, regalo compleanno unico, regalo laurea, regalo anniversario",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "EUR",
    "lowPrice": "20",
    "highPrice": "34",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "Vault Crafted" },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": { "@type": "MonetaryAmount", "value": "4.99", "currency": "EUR" },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 5, "unitCode": "DAY" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 5, "unitCode": "DAY" }
      },
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "IT" }
    }
  },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Personalizzazione", "value": "Nome, attacchi, elemento, foto, frase" },
    { "@type": "PropertyValue", "name": "Tiratura", "value": "Numerata" },
        { "@type": "PropertyValue", "name": "Consegna", "value": "7-10 giorni lavorativi in tutta Italia" }
  ]
};

const SCHEMA_GIFT_OCCASIONS = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Occasioni regalo — Carta personalizzata Vault Crafted",
  "description": "La carta personalizzata Vault Crafted è il regalo perfetto per ogni occasione speciale.",
  "url": "https://vaultcrafted.com/regalo",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Regalo Compleanno Originale" },
    { "@type": "ListItem", "position": 2, "name": "Regalo Anniversario Personalizzato" },
    { "@type": "ListItem", "position": 3, "name": "Regalo Laurea Unico" },
    { "@type": "ListItem", "position": 4, "name": "Regalo di Natale Originale" },
    { "@type": "ListItem", "position": 5, "name": "Regalo Matrimonio Personalizzato" },
    { "@type": "ListItem", "position": 6, "name": "Regalo per il Migliore Amico" },
    { "@type": "ListItem", "position": 7, "name": "Regalo per la Famiglia" },
    { "@type": "ListItem", "position": 8, "name": "Regalo per il proprio Animale Domestico" }
  ]
};

const SCHEMA_BREADCRUMB_REGALO = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vaultcrafted.com" },
    { "@type": "ListItem", "position": 2, "name": "Il regalo perfetto", "item": "https://vaultcrafted.com/regalo" }
  ]
};

export const Route = createFileRoute("/regalo")({
  component: RegaloPage,
  head: () => ({
    meta: [
      { title: "Il regalo perfetto e originale — Vault Crafted | Carta personalizzata" },
      { name: "description", content: "Cerca un regalo originale e unico? Una carta da collezione personalizzata Vault Crafted è il regalo perfetto per compleanni, lauree, anniversari, Natale e molto altro. Stampata e numerata, da €20." },
      { name: "keywords", content: "regalo originale, regalo personalizzato, regalo compleanno unico, carta pokemon regalo, regalo laurea originale, regalo anniversario, regalo natale originale, regalo migliore amico" },
      { name: "robots", content: "index, follow" },
      { property: "og:url", content: "https://vaultcrafted.com/regalo" },
      { property: "og:title", content: "Il regalo perfetto — Vault Crafted | Carta personalizzata unica" },
      { property: "og:description", content: "Smetti di regalare cose che finiscono nel cassetto. Una carta Vault ha sopra la sua foto e il suo numero. Il regalo originale che nessuno dimentica." },
      { property: "og:image", content: "https://vaultcrafted.com/og-image.jpg" },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Il regalo perfetto — Vault Crafted" },
      { name: "twitter:description", content: "Smetti di regalare cose che finiscono nel cassetto. Una carta Vault ha sopra la sua foto e il suo numero." },
      { name: "twitter:image", content: "https://vaultcrafted.com/og-image.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: FONTS_HREF },
      { rel: "canonical", href: "https://vaultcrafted.com/regalo" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_PRODUCT_REGALO) },
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_GIFT_OCCASIONS) },
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_BREADCRUMB_REGALO) },
    ],
  }),
});

const OCCASIONI: [string, string][] = [
  ["Compleanno", "Il suo nome, la sua foto, una frase che solo voi capite."],
  ["Anniversario", "La vostra foto preferita, la data e le parole che contano."],
  ["Laurea", "Il titolo come nome della carta e la dedica come frase finale."],
  ["Natale", "Un regalo piccolo da incartare e che non finisce nel cassetto."],
  ["Matrimonio", "Gli sposi su una carta, da esporre accanto alle foto del giorno."],
  ["Animale di casa", "Il cane, il gatto, il coniglio: anche loro hanno le loro mosse."],
  ["Migliore amico", "Soprannomi, mosse speciali e quella foto che ha fatto ridere tutti."],
  ["Famiglia", "Per papà, mamma, nonni, fratelli: una carta per ognuno."],
  ["Per te", "Perché no. Una carta con te sopra, numerata, da tenere."],
];

function RegaloPage() {
  return (
    <SiteShell>
      <header className="hm-page-head">
        <h1>Un regalo con la sua storia sopra.</h1>
        <p>
          Una carta da collezione con la sua foto, il suo nome e le vostre frasi. La componi in pochi
          minuti, noi la stampiamo numerata e la spediamo dove vuoi. Da €20.
        </p>
        <div className="hm-cta">
          <Link to="/crea" className="hm-btn">
            Crea la carta regalo
          </Link>
          <Link to="/carte" className="hm-link">
            Guarda le carte
          </Link>
        </div>
      </header>

      <section className="hm-sec">
        <h2>Perché funziona come regalo</h2>
        <div className="hm-cards3">
          <div>
            <h3>Parla di lei, di lui</h3>
            <p>Non è un oggetto qualsiasi: sopra ci sono la sua foto e le cose che vi dite.</p>
          </div>
          <div>
            <h3>Si tiene</h3>
            <p>Stampata, numerata e, se vuoi, in custodia rigida. Fatta per stare su una mensola.</p>
          </div>
          <div>
            <h3>La vedi prima</h3>
            <p>Mentre la componi vedi la carta finita, quindi sai già cosa riceverà.</p>
          </div>
        </div>
      </section>

      <section className="hm-sec">
        <h2>Per quali occasioni</h2>
        <div className="hm-occ">
          {OCCASIONI.map(([t, d]) => (
            <div key={t}>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hm-sec">
        <h2>Come si fa</h2>
        <div className="hm-cards3">
          <div>
            <h3>1. Componi la carta</h3>
            <p>Nel configuratore scegli categoria, frasi e attacchi e carichi la sua foto.</p>
          </div>
          <div>
            <h3>2. La stampiamo noi</h3>
            <p>Controlliamo che sia perfetta, ti mandiamo il riepilogo per pagare e la stampiamo numerata.</p>
          </div>
          <div>
            <h3>3. Arriva a destinazione</h3>
            <p>Metti l'indirizzo di chi la riceve; se vuoi una dedica scrivicelo nelle note.</p>
          </div>
        </div>
      </section>

      <section className="hm-final">
        <h2>Hai già in mente a chi regalarla?</h2>
        <Link to="/crea" className="hm-btn">
          Crea la carta regalo
        </Link>
      </section>
    </SiteShell>
  );
}
