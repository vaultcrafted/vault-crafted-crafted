import { createFileRoute } from "@tanstack/react-router";
import { bad, env, json, nowIso } from "@/server/vault";
import { needCustomer, ordersWhere } from "@/server/account";

// Crea una bozza a partire da un ordine (stessa carta e foto) da modificare o riordinare.
export const Route = createFileRoute("/api/account/riordina")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        const b = (await request.json().catch(() => ({}))) as { orderId?: string };
        const w = ordersWhere(c);
        const o = await env.DB.prepare(
          `SELECT card_json, art_pos, case_id, card_name, photo_key, photo_name FROM orders WHERE id = ?3 AND ${w.sql}`,
        )
          .bind(...w.args, String(b.orderId ?? ""))
          .first<{ card_json: string; art_pos: string; case_id: string; card_name: string; photo_key: string; photo_name: string }>();
        if (!o) return bad("Ordine non trovato", 404);
        let card: Record<string, unknown> = {};
        try {
          card = JSON.parse(o.card_json);
        } catch {
          /* ordine importato senza dati carta */
        }
        if (!card.cat) return bad("Questa carta è stata fatta prima del configuratore: scrivici per riordinarla", 422);
        card.serial = null;
        card.edition = null;
        const id = crypto.randomUUID();
        let photo = { key: "", name: "", type: "" };
        if (o.photo_key) {
          const obj = await env.FILES.get(o.photo_key);
          if (obj) {
            const type = obj.httpMetadata?.contentType ?? "image/jpeg";
            const key = `bozze/${c.id}/${id}/${Date.now()}-${o.photo_key.split("/").pop()}`;
            await env.FILES.put(key, await new Response(obj.body).arrayBuffer(), { httpMetadata: { contentType: type } });
            photo = { key, name: o.photo_name, type };
          }
        }
        const now = nowIso();
        await env.DB.prepare(
          "INSERT INTO drafts (id, customer_id, title, card_json, art_pos, custodia, photo_key, photo_name, photo_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
          .bind(id, c.id, o.card_name || "Carta", JSON.stringify(card), o.art_pos, o.case_id || "nessuna", photo.key, photo.name, photo.type, now, now)
          .run();
        return json({ ok: true, id });
      },
    },
  },
});
