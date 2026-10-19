import { createFileRoute } from "@tanstack/react-router";
import { bad, checkPassword, clearCookie, env, isAdmin, json, sessionCookie } from "@/server/vault";

// Accesso al pannello: GET = stato, POST = entra, DELETE = esci.
export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        json({ admin: await isAdmin(request), configured: !!env.ADMIN_PASSWORD }),
      POST: async ({ request }) => {
        if (!env.ADMIN_PASSWORD)
          return bad("Password del pannello non ancora impostata su Cloudflare", 503);
        const { password, remember } = (await request.json().catch(() => ({}))) as { password?: string; remember?: boolean };
        await new Promise((r) => setTimeout(r, 400)); // rallenta i tentativi
        if (!password || !(await checkPassword(password))) return bad("Password sbagliata", 401);
        return json({ ok: true }, 200, { "set-cookie": await sessionCookie(remember !== false) });
      },
      DELETE: async () => json({ ok: true }, 200, { "set-cookie": clearCookie() }),
    },
  },
});
