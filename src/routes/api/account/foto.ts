import { createFileRoute } from "@tanstack/react-router";
import { bad, env } from "@/server/vault";
import { needCustomer, ordersWhere } from "@/server/account";

// Foto di una bozza o di un ordine del cliente collegato.
export const Route = createFileRoute("/api/account/foto")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        const key = new URL(request.url).searchParams.get("key") ?? "";
        let ok = key.startsWith(`bozze/${c.id}/`);
        if (!ok && key.startsWith("ordini/")) {
          const w = ordersWhere(c);
          ok = !!(await env.DB.prepare(
            `SELECT id FROM orders WHERE (photo_key = ?3 OR art_key = ?3) AND ${w.sql}`,
          )
            .bind(...w.args, key)
            .first());
        }
        if (!ok) return bad("File non disponibile", 404);
        const obj = await env.FILES.get(key);
        if (!obj) return bad("File non trovato", 404);
        return new Response(obj.body, {
          headers: {
            "content-type": obj.httpMetadata?.contentType ?? "application/octet-stream",
            "cache-control": "private, max-age=3600",
          },
        });
      },
    },
  },
});
