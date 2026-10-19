import { createFileRoute } from "@tanstack/react-router";
import { bad, env, json, nowIso } from "@/server/vault";
import { str } from "@/lib/vaultShop";
import { needCustomer, publicCustomer } from "@/server/account";

// Aggiorna nome e telefono del cliente.
export const Route = createFileRoute("/api/account/profilo")({
  server: {
    handlers: {
      PUT: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        const b = (await request.json().catch(() => ({}))) as { name?: string; phone?: string };
        const name = str(b.name, 120);
        if (!name) return bad("Il nome non può essere vuoto");
        const phone = str(b.phone, 40);
        await env.DB.prepare("UPDATE customers SET name = ?, phone = ?, updated_at = ? WHERE id = ?")
          .bind(name, phone, nowIso(), c.id)
          .run();
        return json({ customer: publicCustomer({ ...c, name, phone }) });
      },
    },
  },
});
