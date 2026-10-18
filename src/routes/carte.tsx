import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FONTS_HREF } from "@/components/vault/CardEditor";
import { CARD_SRCS, CardZoom, SiteShell } from "@/components/vault/home/Site";

const SCHEMA_COLLECTION_PAGE = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Collezione carte personalizzate — Vault Crafted",
  "description": "Sfoglia la collezione di carte da collezione personalizzate create da Vault Crafted. Ogni carta è composta dal cliente con la sua foto e stampata numerata.",
  "url": "https://vaultcrafted.com/carte",
  "provider": {
    "@type": "Organization",
    "name": "Vault Crafted",
    "url": "https://vaultcrafted.com"
  },
  "about": {
    "@type": "Thing",
    "name": "Carte da collezione personalizzate",
    "description": "Carte da collezione personalizzate con la foto del cliente, stampate e numerate da Vault Crafted."
  }
};

const SCHEMA_IMAGE_GALLERY = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Galleria carte personalizzate Vault Crafted",
  "description": "Galleria delle carte da collezione personalizzate realizzate da Vault Crafted. Ogni carta è numerata.",
  "url": "https://vaultcrafted.com/carte",
  "author": {
    "@type": "Organization",
    "name": "Vault Crafted",
    "url": "https://vaultcrafted.com"
  }
};

const SCHEMA_BREADCRUMB_CARTE = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vaultcrafted.com" },
    { "@type": "ListItem", "position": 2, "name": "Tutte le carte", "item": "https://vaultcrafted.com/carte" }
  ]
};


export const Route = createFileRoute("/carte")({
  component: CartePage,
  head: () => ({
    meta: [
      { title: "Tutte le carte — Vault Crafted | Collezione pezzi unici personalizzati" },
      { name: "description", content: "Sfoglia la collezione di carte da collezione personalizzate create da Vault Crafted. Ognuna composta dal cliente con la sua foto e stampata numerata a Livorno Ferraris." },
      { name: "keywords", content: "collezione carte personalizzate, carte pokemon personalizzate esempi, carte da collezione uniche, vault crafted collezione, pezzi unici carte" },
      { name: "robots", content: "index, follow" },
      { property: "og:url", content: "https://vaultcrafted.com/carte" },
      { property: "og:title", content: "Tutte le carte — Vault Crafted | Collezione pezzi unici" },
      { property: "og:description", content: "Ogni carta è un pezzo unico. Sfoglia la nostra collezione di carte personalizzate e ordina la tua." },
      { property: "og:image", content: "https://vaultcrafted.com/og-image.jpg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Tutte le carte — Vault Crafted" },
      { name: "twitter:description", content: "Ogni carta è un pezzo unico. Sfoglia la nostra collezione e ordina la tua." },
    ],
    links: [
      { rel: "stylesheet", href: FONTS_HREF },
      { rel: "canonical", href: "https://vaultcrafted.com/carte" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_COLLECTION_PAGE) },
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_IMAGE_GALLERY) },
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_BREADCRUMB_CARTE) },
    ],
  }),
});

function CartePage() {
  const [zoom, setZoom] = useState<string | null>(null);
  return (
    <SiteShell>
      <header className="hm-page-head">
        <h1>Le carte che abbiamo stampato.</h1>
        <p>
          Coppie, amici, artisti, cani di famiglia. Ognuna composta da chi l'ha ordinata, con la sua
          foto e le sue frasi, e stampata da noi con il suo numero di serie. Tocca una carta per
          vederla da vicino.
        </p>
      </header>
      <section className="hm-sec" style={{ paddingTop: 30 }}>
        <div className="hm-grid">
          {CARD_SRCS.map((src, i) => (
            <button type="button" key={src} onClick={() => setZoom(src)} aria-label="Ingrandisci la carta">
              <img src={src} alt="Carta personalizzata Vault Crafted" loading={i < 8 ? "eager" : "lazy"} />
            </button>
          ))}
        </div>
      </section>
      <section className="hm-final">
        <h2>La prossima può essere la tua.</h2>
        <Link to="/crea" className="hm-btn">
          Crea la tua carta
        </Link>
      </section>
      <CardZoom src={zoom} onClose={() => setZoom(null)} />
    </SiteShell>
  );
}
