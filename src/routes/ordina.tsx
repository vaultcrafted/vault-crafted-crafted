import { createFileRoute, redirect } from "@tanstack/react-router";

// Il vecchio modulo d'ordine (Google Fogli) è stato sostituito dal configuratore /crea.
// L'indirizzo /ordina resta valido per link, QR e post già pubblicati.
export const Route = createFileRoute("/ordina")({
  beforeLoad: () => {
    throw redirect({ to: "/crea", statusCode: 301 });
  },
});
