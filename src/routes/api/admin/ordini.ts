import { createFileRoute } from "@tanstack/react-router";
import { STATUS_KEYS, bad, env, json, nowIso, requireAdmin } from "@/server/vault";
import { ensureSchema } from "@/server/account";

const ORDER: Record<string, string> = {
  recenti: "created_at DESC",
  vecchi: "created_at ASC",
  numero: "serial IS NULL, serial DESC, created_at DESC",
  totale: "total DESC, created_at DESC",
  cliente: "lower(customer_name) ASC, created_at DESC",
};

// Elenco ordini per il pannello.
export const Route = createFileRoute("/api/admin/ordini")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        await ensureSchema();
        const url = new URL(request.url);
        const status = url.searchParams.get("status") ?? "";
        const q = (url.searchParams.get("q") ?? "").trim();
        const where: string[] = [];
        const args: unknown[] = [];
        if (status === "attivi") where.push("status NOT IN ('consegnato','annullato','storico')");
        else if (status) {
          where.push("status = ?");
          args.push(status);
        }
        const pay = url.searchParams.get("pay") ?? "";
        if (pay === "pagato") where.push("paid = 1");
        else if (pay === "da_pagare") where.push("paid = 0 AND gift = 0 AND status != 'annullato'");
        else if (pay === "omaggio") where.push("gift = 1");
        const src = url.searchParams.get("src") ?? "";
        if (src === "sito") where.push("source != 'foglio'");
        else if (src === "foglio") where.push("source = 'foglio'");
        const year = url.searchParams.get("anno") ?? "";
        if (/^\d{4}$/.test(year)) {
          where.push("substr(created_at, 1, 4) = ?");
          args.push(year);
        }
        if (q) {
          where.push(
            "(card_name LIKE ? OR customer_name LIKE ? OR email LIKE ? OR CAST(serial AS TEXT) LIKE ?)",
          );
          const like = `%${q}%`;
          args.push(like, like, like, q.replace(/^0+/, "") + "%");
        }
        const sql = `SELECT id, serial, edition, created_at, status, paid, gift, email, customer_name, category, card_name, total, source, art_key != '' AS has_art
          FROM orders ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY ${ORDER[url.searchParams.get("ordina") ?? ""] ?? ORDER.recenti} LIMIT 500`;
        const list = await env.DB.prepare(sql)
          .bind(...args)
          .all();
        const counts = await env.DB.prepare(
          "SELECT status, COUNT(*) AS n FROM orders GROUP BY status",
        ).all<{ status: string; n: number }>();
        const money = await env.DB.prepare(
          "SELECT COALESCE(SUM(CASE WHEN paid = 1 THEN total END), 0) AS incassato, COALESCE(SUM(CASE WHEN paid = 0 AND gift = 0 AND status NOT IN ('annullato','storico') THEN total END), 0) AS da_incassare FROM orders",
        ).first();
        const years = await env.DB.prepare(
          "SELECT DISTINCT substr(created_at, 1, 4) AS y FROM orders ORDER BY y DESC",
        ).all<{ y: string }>();
        return json({ orders: list.results, counts: counts.results, money, years: years.results.map((r) => r.y) });
      },
      // modifica in blocco: stato e/o pagato su più ordini insieme
      PATCH: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const b = (await request.json().catch(() => ({}))) as {
          ids?: string[];
          status?: string;
          paid?: boolean;
          pay?: "pagato" | "da_pagare" | "omaggio";
        };
        await ensureSchema();
        if (b.pay === "pagato") b.paid = true;
        else if (b.pay === "da_pagare") b.paid = false;
        const ids = Array.isArray(b.ids) ? b.ids.filter((x) => typeof x === "string").slice(0, 500) : [];
        if (!ids.length) return bad("Nessun ordine selezionato");
        const set: string[] = ["updated_at = ?"];
        const args: unknown[] = [nowIso()];
        if (typeof b.status === "string") {
          if (!STATUS_KEYS.includes(b.status)) return bad("Stato non valido");
          set.push("status = ?");
          args.push(b.status);
        }
        if (b.pay === "omaggio") set.push("paid = 0", "gift = 1");
        else if (typeof b.paid === "boolean") {
          set.push("paid = ?", "gift = 0");
          args.push(b.paid ? 1 : 0);
        }
        if (set.length === 1) return bad("Niente da cambiare");
        const stmts = [];
        for (let i = 0; i < ids.length; i += 50) {
          const chunk = ids.slice(i, i + 50);
          stmts.push(
            env.DB.prepare(`UPDATE orders SET ${set.join(", ")} WHERE id IN (${chunk.map(() => "?").join(",")})`).bind(
              ...args,
              ...chunk,
            ),
          );
        }
        await env.DB.batch(stmts);
        return json({ ok: true, updated: ids.length });
      },
    },
  },
});
