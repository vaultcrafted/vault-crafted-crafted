import { createFileRoute, redirect } from "@tanstack/react-router";

// La proposta è diventata la home: il vecchio indirizzo porta lì.
export const Route = createFileRoute("/anteprima-home")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
