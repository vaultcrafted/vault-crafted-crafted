import { createFileRoute } from "@tanstack/react-router";
import { b64ToBytes, bad, env, json, nowIso, safeName } from "@/server/vault";
import { MAX_PHOTO, num, sanitizeCard, str } from "@/lib/vaultShop";
import { needCustomer } from "@/server/account";

export interface DraftRow {
  id: string;
  title: string;
  card_json: string;
  art_pos: string;
  custodia: string;
  photo_key: string;
  photo_name: string;
  photo_type: string;
  updated_at: string;
}
const COLS = "id, title, card_json, art_pos, custodia, photo_key, photo_name, photo_type, updated_at";
const MAX_DRAFTS = 30;

// Bozze del configuratore: GET elenco (o ?id= una sola), POST salva/aggiorna, DELETE ?id=.
export const Route = createFileRoute("/api/account/bozze")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        const id = new URL(request.url).searchParams.get("id");
        if (id) {
          const d = await env.DB.prepare(`SELECT ${COLS} FROM drafts WHERE id = ? AND customer_id = ?`)
            .bind(id, c.id)
            .first<DraftRow>();
          return d ? json({ draft: d }) : bad("Bozza non trovata", 404);
        }
        const r = await env.DB.prepare(
          `SELECT ${COLS} FROM drafts WHERE customer_id = ? ORDER BY updated_at DESC`,
        )
          .bind(c.id)
          .all<DraftRow>();
        return json({ drafts: r.results });
      },
      POST: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        const b = (await request.json().catch(() => ({}))) as {
          id?: string;
          card?: unknown;
          artPos?: { zoom?: number; px?: number; py?: number };
          custodia?: string;
          photo?: { name: string; type: string; base64: string } | null;
        };
        const card = sanitizeCard(b.card as never);
        if (!card) return bad("Dati della carta non validi");
        const art = b.artPos ?? {};
        const artPos = JSON.stringify({
          zoom: num(art.zoom, 1, 3, 1),
          px: num(art.px, -3000, 3000, 0),
          py: num(art.py, -3000, 3000, 0),
        });
        const now = nowIso();
        let existing: DraftRow | null = null;
        if (b.id) {
          existing = await env.DB.prepare(`SELECT ${COLS} FROM drafts WHERE id = ? AND customer_id = ?`)
            .bind(b.id, c.id)
            .first<DraftRow>();
        }
        if (!existing) {
          const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM drafts WHERE customer_id = ?")
            .bind(c.id)
            .first<{ n: number }>();
          if ((n?.n ?? 0) >= MAX_DRAFTS) return bad(`Puoi tenere al massimo ${MAX_DRAFTS} bozze`);
        }
        const id = existing?.id ?? crypto.randomUUID();
        let photo = {
          key: existing?.photo_key ?? "",
          name: existing?.photo_name ?? "",
          type: existing?.photo_type ?? "",
        };
        if (b.photo?.base64) {
          const bytes = b64ToBytes(b.photo.base64);
          if (bytes.length > MAX_PHOTO) return bad("La foto supera i 10 MB");
          const type = /^image\/[\w.+-]+$/.test(b.photo.type) ? b.photo.type : "application/octet-stream";
          const key = `bozze/${c.id}/${id}/${Date.now()}-${safeName(b.photo.name)}`;
          await env.FILES.put(key, bytes, { httpMetadata: { contentType: type } });
          if (photo.key) await env.FILES.delete(photo.key);
          photo = { key, name: str(b.photo.name, 160), type };
        }
        const title = card.name || "Carta senza nome";
        if (existing) {
          await env.DB.prepare(
            "UPDATE drafts SET title = ?, card_json = ?, art_pos = ?, custodia = ?, photo_key = ?, photo_name = ?, photo_type = ?, updated_at = ? WHERE id = ?",
          )
            .bind(title, JSON.stringify(card), artPos, str(b.custodia, 40) || "nessuna", photo.key, photo.name, photo.type, now, id)
            .run();
        } else {
          await env.DB.prepare(
            "INSERT INTO drafts (id, customer_id, title, card_json, art_pos, custodia, photo_key, photo_name, photo_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          )
            .bind(id, c.id, title, JSON.stringify(card), artPos, str(b.custodia, 40) || "nessuna", photo.key, photo.name, photo.type, now, now)
            .run();
        }
        return json({ ok: true, id });
      },
      DELETE: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        const id = new URL(request.url).searchParams.get("id") ?? "";
        const d = await env.DB.prepare("SELECT photo_key FROM drafts WHERE id = ? AND customer_id = ?")
          .bind(id, c.id)
          .first<{ photo_key: string }>();
        if (!d) return bad("Bozza non trovata", 404);
        if (d.photo_key) await env.FILES.delete(d.photo_key);
        await env.DB.prepare("DELETE FROM drafts WHERE id = ?").bind(id).run();
        return json({ ok: true });
      },
    },
  },
});
