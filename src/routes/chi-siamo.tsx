import { createFileRoute, Link } from "@tanstack/react-router";
import { FONTS_HREF } from "@/components/vault/CardEditor";
import { SiteShell } from "@/components/vault/home/Site";

const SCHEMA_ABOUT = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "Chi siamo — Vault Crafted",
  "description": "Vault Crafted nasce a novembre 2024 dalla passione per le carte Pokémon. Stampa carte da collezione personalizzate con la foto del cliente, numerate.",
  "url": "https://vaultcrafted.com/chi-siamo",
  "mainEntity": {
    "@type": "Organization",
    "name": "Vault Crafted",
    "foundingDate": "2024-11",
    "foundingLocation": {
      "@type": "Place",
      "addressLocality": "Livorno Ferraris",
      "addressRegion": "Piemonte",
      "addressCountry": "IT"
    },
    "description": "Vault Crafted è un progetto personale nato dalla passione per le carte Pokémon. Il cliente compone la carta con la sua foto nel configuratore; Vault Crafted la controlla, la stampa nella propria tipografia e la numera.",
    "numberOfEmployees": { "@type": "QuantitativeValue", "value": 1 },
    "slogan": "La tua storia, su una carta da collezione.",
    "url": "https://vaultcrafted.com",
    "logo": "https://vaultcrafted.com/LOGO.png",
    "sameAs": [
      "https://www.instagram.com/vault_crafted",
      "https://www.facebook.com/profile.php?id=61570154034763",
      "https://www.tiktok.com/@vault_crftd"
    ]
  }
};

const SCHEMA_BREADCRUMB_CHI_SIAMO = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vaultcrafted.com" },
    { "@type": "ListItem", "position": 2, "name": "Chi siamo", "item": "https://vaultcrafted.com/chi-siamo" }
  ]
};

export const Route = createFileRoute("/chi-siamo")({
  component: ChiSiamoPage,
  head: () => ({
    meta: [
      { title: "Chi siamo — Vault Crafted | La storia dietro le carte personalizzate" },
      { name: "description", content: "Scopri la storia di Vault Crafted: nata a novembre 2024 dalla passione per le carte Pokémon, oggi crea carte da collezione uniche e personalizzate. Componi la carta con la tua foto, noi la stampiamo numerata." },
      { name: "keywords", content: "vault crafted chi siamo, storia vault crafted, carte personalizzate italia, chi crea le carte personalizzate" },
      { name: "robots", content: "index, follow" },
      { property: "og:url", content: "https://vaultcrafted.com/chi-siamo" },
      { property: "og:title", content: "Chi siamo — Vault Crafted | La storia dietro le carte personalizzate" },
      { property: "og:description", content: "Dalla passione per i Pokémon a un progetto unico. Scopri la storia di Vault Crafted." },
      { property: "og:image", content: "https://vaultcrafted.com/og-image.jpg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Chi siamo — Vault Crafted" },
      { name: "twitter:description", content: "Dalla passione per i Pokémon a un progetto unico. Scopri la storia di Vault Crafted." },
    ],
    links: [
      { rel: "stylesheet", href: FONTS_HREF },
      { rel: "canonical", href: "https://vaultcrafted.com/chi-siamo" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_ABOUT) },
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_BREADCRUMB_CHI_SIAMO) },
    ],
  }),
});

function ChiSiamoPage() {
  return (
    <SiteShell>
      <header className="hm-page-head">
        <h1>Una tipografia, una passione per le carte.</h1>
        <p>Vault Crafted nasce a novembre 2024 a Livorno Ferraris, in provincia di Vercelli.</p>
      </header>

      <section className="hm-sec hm-prose" style={{ paddingTop: 30 }}>
        <p>
          Tutto parte dalle <b>carte Pokémon</b>: quelle che collezionavo da bambino, quando aprire
          una bustina era un piccolo evento. Quella passione non se n'è mai andata, e a un certo
          punto è diventata una domanda: <b>e se una carta parlasse di te?</b>
        </p>
        <p>
          Da lì è nato Vault Crafted. Con il configuratore la carta la componi tu: scegli categoria ed elemento,
          carichi la tua foto, scrivi nome, attacchi e frase e vedi subito la carta finita.
        </p>
        <p>
          Il resto lo facciamo noi. <b>Controlliamo ogni carta</b> prima di stamparla, la stampiamo
          in alta qualità nella nostra tipografia, le diamo il suo <b>numero di serie</b> e la
          spediamo protetta in tutta Italia.
        </p>
      </section>

      <section className="hm-sec">
        <h2>Come lavoriamo</h2>
        <div className="hm-cards3">
          <div>
            <h3>La tua foto, le tue frasi</h3>
            <p>La carta la componi tu, quindi ogni carta è diversa da tutte le altre.</p>
          </div>
          <div>
            <h3>Stampata da noi</h3>
            <p>Controllata e stampata nella nostra tipografia a Livorno Ferraris.</p>
          </div>
          <div>
            <h3>Numerata</h3>
            <p>Ogni carta ha il suo numero di serie stampato sopra.</p>
          </div>
        </div>
      </section>

      <section className="hm-final">
        <h2>Pronto a creare la tua carta?</h2>
        <Link to="/crea" className="hm-btn">
          Crea la tua carta
        </Link>
      </section>
    </SiteShell>
  );
}
