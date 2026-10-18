import { createFileRoute } from "@tanstack/react-router";
import { MAX_EDITION, catOf } from "@/lib/vaultCard";
import { custodiaOf, num, priceOf, sanitizeCard, str, type OrderRow } from "@/lib/vaultShop";
import {
  STATUS_KEYS,
  bad,
  env,
  esc,
  json,
  mailLayout,
  nowIso,
  pad3,
  requireAdmin,
  rows,
  sendMail,
} from "@/server/vault";

// Dettaglio, modifica ed eliminazione di un ordine.
export const Route = createFileRoute("/api/admin/ordini/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const o = await env.DB.prepare("SELECT * FROM orders WHERE id = ?")
          .bind(params.id)
          .first<OrderRow>();
        return o ? json({ order: o }) : bad("Ordine non trovato", 404);
      },
      PATCH: async ({ request, params }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const o = await env.DB.prepare("SELECT * FROM orders WHERE id = ?")
          .bind(params.id)
          .first<OrderRow>();
        if (!o) return bad("Ordine non trovato", 404);
        const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const set: Record<string, unknown> = {};

        if (typeof b.status === "string" && STATUS_KEYS.includes(b.status)) set.status = b.status;
        if (typeof b.paid === "boolean") set.paid = b.paid ? 1 : 0;
        for (const [k, max] of [
          ["admin_note", 5000],
          ["tracking", 200],
          ["customer_name", 120],
          ["phone", 40],
          ["address", 400],
          ["customer_note", 2000],
        ] as const)
          if (typeof b[k] === "string") set[k] = str(b[k], max);
        if (typeof b.email === "string") set.email = str(b.email, 160).toLowerCase();
        if (b.serial !== undefined)
          set.serial =
            b.serial === null || b.serial === ""
              ? null
              : Math.max(1, Math.floor(Number(b.serial)) || 1);
        if (b.edition !== undefined)
          set.edition =
            b.edition === null || b.edition === ""
              ? null
              : Math.max(1, Math.min(MAX_EDITION, Math.floor(Number(b.edition)) || 1));
        if (b.artPos && typeof b.artPos === "object") {
          const a = b.artPos as Record<string, unknown>;
          set.art_pos = JSON.stringify({
            zoom: num(a.zoom, 1, 3, 1),
            px: num(a.px, -3000, 3000, 0),
            py: num(a.py, -3000, 3000, 0),
          });
        }
        if (b.card) {
          const card = sanitizeCard(b.card as never);
          if (!card) return bad("Dati della carta non validi");
          set.card_json = JSON.stringify(card);
          set.card_name = card.name;
          set.category = card.cat;
        }
        if (typeof b.custodia === "string" || set.category) {
          const cu = custodiaOf(typeof b.custodia === "string" ? b.custodia : o.case_id);
          const p = priceOf(String(set.category ?? o.category), cu.id);
          Object.assign(set, {
            case_id: cu.id,
            case_label: cu.label,
            case_price: p.casePrice,
            price: p.price,
            shipping: p.shipping,
            total: p.total,
          });
        }
        if (typeof b.total === "number" && Number.isFinite(b.total))
          set.total = Math.round(b.total * 100) / 100; // sconto manuale
        if (!Object.keys(set).length) return json({ order: o });
        set.updated_at = nowIso();

        const keys = Object.keys(set);
        try {
          await env.DB.prepare(
            `UPDATE orders SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`,
          )
            .bind(...keys.map((k) => set[k]), o.id)
            .run();
        } catch (e) {
          if (String(e).includes("UNIQUE"))
            return bad(`Il numero ${set.serial} è già usato da un altro ordine`, 409);
          throw e;
        }
        const updated = (await env.DB.prepare("SELECT * FROM orders WHERE id = ?")
          .bind(o.id)
          .first<OrderRow>())!;

        // avviso di spedizione al cliente
        if (b.notify && set.status === "spedito" && o.status !== "spedito" && updated.email) {
          await sendMail({
            to: [{ email: updated.email, name: updated.customer_name }],
            subject: `La tua carta Vault N° ${pad3(updated.serial)} è in viaggio`,
            html: mailLayout(
              "La tua carta è partita!",
              `<p>Ciao ${esc(updated.customer_name.split(" ")[0] || "")}, la tua carta <b>${esc(updated.card_name)}</b> (${esc(catOf(updated.category).n)}) è stata spedita.</p>${rows(
                [
                  [
                    "Numero",
                    `N° ${pad3(updated.serial)} · ${updated.edition ?? "—"}/${MAX_EDITION}`,
                  ],
                  ["Tracking", updated.tracking],
                  ["Indirizzo", updated.address],
                ],
              )}<p>Grazie per aver scelto Vault Crafted!</p>`,
            ),
          });
        }
        return json({ order: updated });
      },
      DELETE: async ({ request, params }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const o = await env.DB.prepare("SELECT photo_key, art_key FROM orders WHERE id = ?")
          .bind(params.id)
          .first<{ photo_key: string; art_key: string }>();
        if (!o) return bad("Ordine non trovato", 404);
        const keys = [o.photo_key, o.art_key].filter(Boolean);
        if (keys.length) await env.FILES.delete(keys);
        await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(params.id).run();
        return json({ ok: true });
      },
    },
  },
});
