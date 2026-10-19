import { createFileRoute } from "@tanstack/react-router";
import { env, json, nowIso } from "@/server/vault";
import { ensureSchema, needCustomer, sendVerifyMail, useToken } from "@/server/account";

// GET ?t= conferma l'email dal link; POST rimanda il link al cliente collegato.
export const Route = createFileRoute("/api/account/verifica")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await ensureSchema();
        const t = new URL(request.url).searchParams.get("t") ?? "";
        const id = await useToken(t, "verify");
        if (id)
          await env.DB.prepare("UPDATE customers SET email_verified = 1, updated_at = ? WHERE id = ?")
            .bind(nowIso(), id)
            .run();
        return new Response(null, {
          status: 302,
          headers: { location: `/account?verifica=${id ? "ok" : "scaduta"}` },
        });
      },
      POST: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        if (c.email_verified) return json({ ok: true, already: true });
        const r = await sendVerifyMail(c);
        return json({ ok: r.ok });
      },
    },
  },
});
