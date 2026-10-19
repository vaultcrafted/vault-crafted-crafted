import { createFileRoute } from "@tanstack/react-router";
import { env, json, requireAdmin } from "@/server/vault";
import { ensureSchema } from "@/server/account";

// Clienti registrati, con i loro ordini (solo admin).
export const Route = createFileRoute("/api/admin/clienti")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        await ensureSchema();
        const r = await env.DB.prepare(
          `SELECT c.id, c.email, c.name, c.phone, c.email_verified, c.created_at,
             (SELECT COUNT(*) FROM orders o WHERE (o.customer_id = c.id OR (c.email_verified = 1 AND lower(o.email) = c.email)) AND o.status != 'annullato') AS orders,
             (SELECT COALESCE(SUM(total), 0) FROM orders o WHERE (o.customer_id = c.id OR (c.email_verified = 1 AND lower(o.email) = c.email)) AND o.paid = 1) AS spent,
             (SELECT COUNT(*) FROM drafts d WHERE d.customer_id = c.id) AS drafts
           FROM customers c ORDER BY c.created_at DESC`,
        ).all();
        return json({ customers: r.results });
      },
      // elimina un account cliente: dati, indirizzi, bozze e foto delle bozze. Gli ordini restano.
      DELETE: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        await ensureSchema();
        const id = new URL(request.url).searchParams.get("id") ?? "";
        const c = await env.DB.prepare("SELECT id FROM customers WHERE id = ?").bind(id).first();
        if (!c) return json({ error: "Cliente non trovato" }, 404);
        const d = await env.DB.prepare("SELECT photo_key FROM drafts WHERE customer_id = ? AND photo_key != ''")
          .bind(id)
          .all<{ photo_key: string }>();
        const keys = d.results.map((x) => x.photo_key);
        if (keys.length) await env.FILES.delete(keys);
        await env.DB.batch([
          env.DB.prepare("DELETE FROM drafts WHERE customer_id = ?").bind(id),
          env.DB.prepare("DELETE FROM addresses WHERE customer_id = ?").bind(id),
          env.DB.prepare("DELETE FROM tokens WHERE customer_id = ?").bind(id),
          env.DB.prepare("UPDATE orders SET customer_id = '' WHERE customer_id = ?").bind(id),
          env.DB.prepare("DELETE FROM customers WHERE id = ?").bind(id),
        ]);
        return json({ ok: true });
      },
    },
  },
});
