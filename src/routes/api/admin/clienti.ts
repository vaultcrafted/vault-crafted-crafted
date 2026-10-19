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
    },
  },
});
