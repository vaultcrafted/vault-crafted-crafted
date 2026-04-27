import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

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
      { property: "og:title", content: "Vault Crafted | Carte da collezione personalizzate" },
      { property: "og:description", content: "Crea la tua carta da collezione unica e personalizzata. Vault Crafted realizza carte esclusive partendo da zero, senza template anonimi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@VaultCrafted" },
      { name: "twitter:title", content: "Vault Crafted | Carte da collezione personalizzate" },
      { name: "twitter:description", content: "Crea la tua carta da collezione unica e personalizzata. Vault Crafted realizza carte esclusive partendo da zero, senza template anonimi." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
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
