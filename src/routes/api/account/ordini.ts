import { createFileRoute } from "@tanstack/react-router";
import { env, json } from "@/server/vault";
import { needCustomer, ordersWhere } from "@/server/account";

export interface MyOrder {
  id: string;
  serial: number | null;
  edition: number | null;
  created_at: string;
  status: string;
  paid: number;
  customer_name: string;
  address: string;
  category: string;
  card_name: string;
  card_json: string;
  art_pos: string;
  case_id: string;
  case_label: string;
  total: number;
  photo_key: string;
  art_key: string;
  tracking: string;
  source: string;
}

// Ordini del cliente collegato, con le istruzioni di pagamento se ne ha in attesa.
export const Route = createFileRoute("/api/account/ordini")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        const w = ordersWhere(c);
        const r = await env.DB.prepare(
          `SELECT id, serial, edition, created_at, status, paid, customer_name, address, category, card_name, card_json, art_pos,
             case_id, case_label, total, photo_key, art_key, tracking, source
           FROM orders WHERE ${w.sql} AND status != 'annullato' ORDER BY created_at DESC`,
        )
          .bind(...w.args)
          .all<MyOrder>();
        const waiting = r.results.some((o) => !o.paid && ["nuovo", "in_lavorazione", "bozza_inviata"].includes(o.status));
        const pay = waiting
          ? await env.DB.prepare("SELECT value FROM settings WHERE key = 'payment_info'").first<{ value: string }>()
          : null;
        return json({ orders: r.results, paymentInfo: pay?.value ?? "" });
      },
    },
  },
});
