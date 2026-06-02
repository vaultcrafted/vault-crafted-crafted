import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

const SCHEMA_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Vault Crafted",
  "url": "https://vaultcrafted.com",
  "logo": "https://vaultcrafted.com/LOGO.png",
  "description": "Vault Crafted crea carte da collezione personalizzate stile Pokémon, realizzate da zero senza template. Ogni carta è un pezzo unico, numerato e irripetibile.",
  "foundingDate": "2024-11",
  "foundingLocation": {
    "@type": "Place",
    "addressLocality": "Livorno Ferraris",
    "addressRegion": "Piemonte",
    "addressCountry": "IT"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+39-333-2876277",
    "contactType": "customer service",
    "availableLanguage": "Italian",
    "contactOption": "TollFree"
  },
  "sameAs": [
    "https://www.instagram.com/vault_crafted",
    "https://www.facebook.com/profile.php?id=61570154034763",
    "https://www.tiktok.com/@vault_crftd"
  ],
  "email": "vaultcrafted@gmail.com"
};

const SCHEMA_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Vault Crafted",
  "url": "https://vaultcrafted.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://vaultcrafted.com/ordina"
    },
    "query-input": "required name=search_term_string"
  }
};

const SCHEMA_LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Vault Crafted",
  "image": "https://vaultcrafted.com/LOGO.png",
  "url": "https://vaultcrafted.com",
  "telephone": "+39-333-2876277",
  "email": "vaultcrafted@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Livorno Ferraris",
    "addressRegion": "VC",
    "addressCountry": "IT"
  },
  "priceRange": "€€",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "description": "Carte da collezione personalizzate stile Pokémon. Design unico, zero template, packaging premium. Ordina online con consegna in tutta Italia.",
  "hasMap": "https://maps.google.com/?q=Livorno+Ferraris,+VC,+Italy",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Bank Transfer",
  "areaServed": {
    "@type": "Country",
    "name": "Italy"
  }
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Pagina non trovata</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La pagina che cerchi non esiste o è stata spostata.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vault Crafted | Carte da collezione personalizzate" },
      { name: "description", content: "Crea la tua carta da collezione unica e personalizzata. Vault Crafted realizza carte esclusive partendo da zero, senza template anonimi." },
      { name: "author", content: "Vault Crafted" },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#0A3040" },
      { property: "og:site_name", content: "Vault Crafted" },
      { property: "og:title", content: "Vault Crafted | Carte da collezione personalizzate" },
      { property: "og:description", content: "Crea la tua carta da collezione unica e personalizzata. Vault Crafted realizza carte esclusive partendo da zero, senza template anonimi." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://vaultcrafted.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "it_IT" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@VaultCrafted" },
      { name: "twitter:title", content: "Vault Crafted | Carte da collezione personalizzate" },
      { name: "twitter:description", content: "Crea la tua carta da collezione unica e personalizzata. Vault Crafted realizza carte esclusive partendo da zero, senza template anonimi." },
      { name: "twitter:image", content: "https://vaultcrafted.com/og-image.jpg" },
      { name: "google-site-verification", content: "cBR2V56c8GK0VvVyq4tum_EXfRUmpAaUOSKg9w1NRAY" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "canonical", href: "https://vaultcrafted.com" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(SCHEMA_ORGANIZATION),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(SCHEMA_WEBSITE),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(SCHEMA_LOCAL_BUSINESS),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
