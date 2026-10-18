import { createFileRoute } from "@tanstack/react-router";
import { MAX_EDITION, catOf } from "@/lib/vaultCard";
import type { OrderRow } from "@/lib/vaultShop";
import {
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

// Invia al cliente la bozza (anteprima PNG) e segna l'ordine come "bozza inviata".
export const Route = createFileRoute("/api/admin/ordini/$id/bozza")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        if (!env.BREVO_API_KEY) return bad("Email non configurate: manca la chiave Brevo", 503);
        const o = await env.DB.prepare("SELECT * FROM orders WHERE id = ?")
          .bind(params.id)
          .first<OrderRow>();
        if (!o) return bad("Ordine non trovato", 404);
        if (!o.email) return bad("L'ordine non ha un'email");
        const { png, message } = (await request.json().catch(() => ({}))) as {
          png?: string;
          message?: string;
        };
        if (!png) return bad("Anteprima mancante");
        const first = esc(o.customer_name.split(" ")[0] || "");
        const r = await sendMail({
          to: [{ email: o.email, name: o.customer_name }],
          subject: `Ecco la bozza della tua carta Vault N° ${pad3(o.serial)}`,
          html: mailLayout(
            "La tua bozza è pronta",
            `<p>Ciao ${first}, in allegato trovi la bozza della tua carta <b>${esc(o.card_name)}</b>.</p>
            ${message ? `<p style="white-space:pre-line">${esc(message)}</p>` : ""}
            ${rows([
              ["Categoria", catOf(o.category).n],
              ["Numero", `N° ${pad3(o.serial)} · ${o.edition ?? "—"}/${MAX_EDITION}`],
              ["Totale", `€${o.total.toFixed(2)}`],
            ])}
            <p>Se va bene rispondi a questa email con <b>OK</b>, altrimenti scrivici cosa cambiare: le modifiche sono gratuite.</p>`,
          ),
          attachment: [{ name: `bozza-vault-${pad3(o.serial)}.png`, content: png }],
        });
        if (!r.ok) return bad("Invio non riuscito, controlla Brevo", 502);
        await env.DB.prepare(
          "UPDATE orders SET status = 'bozza_inviata', updated_at = ? WHERE id = ?",
        )
          .bind(nowIso(), o.id)
          .run();
        return json({ ok: true });
      },
    },
  },
});
