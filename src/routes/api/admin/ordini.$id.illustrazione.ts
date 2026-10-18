import { createFileRoute } from "@tanstack/react-router";
import { b64ToBytes, bad, env, json, nowIso, requireAdmin, safeName } from "@/server/vault";

// Carica (POST) o rimuove (DELETE) l'illustrazione disegnata per un ordine.
export const Route = createFileRoute("/api/admin/ordini/$id/illustrazione")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const o = await env.DB.prepare("SELECT art_key FROM orders WHERE id = ?")
          .bind(params.id)
          .first<{ art_key: string }>();
        if (!o) return bad("Ordine non trovato", 404);
        const { name, type, base64 } = (await request.json().catch(() => ({}))) as {
          name?: string;
          type?: string;
          base64?: string;
        };
        if (!base64 || !type?.startsWith("image/")) return bad("Carica un'immagine");
        const bytes = b64ToBytes(base64);
        if (bytes.length > 40 * 1024 * 1024) return bad("Immagine oltre 40 MB");
        const key = `ordini/${params.id}/illustrazione-${Date.now()}-${safeName(name ?? "art.png")}`;
        await env.FILES.put(key, bytes, { httpMetadata: { contentType: type } });
        if (o.art_key) await env.FILES.delete(o.art_key);
        await env.DB.prepare(
          "UPDATE orders SET art_key = ?, art_pos = ?, updated_at = ? WHERE id = ?",
        )
          .bind(key, JSON.stringify({ zoom: 1, px: 0, py: 0 }), nowIso(), params.id)
          .run();
        return json({ ok: true, art_key: key });
      },
      DELETE: async ({ request, params }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const o = await env.DB.prepare("SELECT art_key FROM orders WHERE id = ?")
          .bind(params.id)
          .first<{ art_key: string }>();
        if (!o) return bad("Ordine non trovato", 404);
        if (o.art_key) await env.FILES.delete(o.art_key);
        await env.DB.prepare("UPDATE orders SET art_key = '', updated_at = ? WHERE id = ?")
          .bind(nowIso(), params.id)
          .run();
        return json({ ok: true });
      },
    },
  },
});
