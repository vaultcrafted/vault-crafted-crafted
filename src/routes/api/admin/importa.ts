import { createFileRoute } from "@tanstack/react-router";
import { bad, env, json, nowIso, requireAdmin } from "@/server/vault";
import { legacyFields } from "@/server/legacy";

// Importa lo storico ordini (righe del vecchio foglio Google già lette dal CSV).
export const Route = createFileRoute("/api/admin/importa")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const { rows } = (await request.json().catch(() => ({}))) as {
          rows?: Record<string, string>[];
        };
        if (!Array.isArray(rows) || !rows.length) return bad("Nessuna riga da importare");
        if (rows.length > 2000) return bad("Troppe righe in una volta (max 2000)");
        const stmts = rows.map((r) => {
          const f = legacyFields(r);
          return env.DB.prepare(
            `INSERT INTO orders (id, created_at, updated_at, status, paid, email, customer_name, phone, address, category, card_name, case_label, total, source, legacy_json)
             VALUES (?, ?, ?, 'storico', 1, ?, ?, ?, ?, ?, ?, ?, ?, 'foglio', ?)`,
          ).bind(
            crypto.randomUUID(),
            f.created_at,
            nowIso(),
            f.email,
            f.customer_name,
            f.phone,
            f.address,
            f.category,
            f.card_name,
            f.case_label,
            f.total,
            JSON.stringify(r).slice(0, 60000),
          );
        });
        for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
        return json({ ok: true, imported: rows.length });
      },
      // ricalcola totale, data e dati cliente degli ordini già importati dal foglio
      PUT: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const list = await env.DB.prepare(
          "SELECT id, legacy_json FROM orders WHERE source = 'foglio' AND legacy_json != ''",
        ).all<{ id: string; legacy_json: string }>();
        let fixed = 0;
        let headers: string[] = [];
        const stmts = [];
        for (const o of list.results) {
          let r: Record<string, string>;
          try {
            r = JSON.parse(o.legacy_json);
          } catch {
            continue;
          }
          if (!headers.length) headers = Object.keys(r);
          const f = legacyFields(r);
          stmts.push(
            env.DB.prepare(
              `UPDATE orders SET created_at = ?, email = ?, customer_name = ?, phone = ?, address = ?, category = ?, card_name = ?, case_label = ?, total = ? WHERE id = ?`,
            ).bind(f.created_at, f.email, f.customer_name, f.phone, f.address, f.category, f.card_name, f.case_label, f.total, o.id),
          );
          fixed++;
        }
        for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
        return json({ ok: true, fixed, headers });
      },
    },
  },
});
