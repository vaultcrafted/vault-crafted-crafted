import { createFileRoute } from "@tanstack/react-router";
import { bad, env, json, nowIso, requireAdmin } from "@/server/vault";
import { legacyFields } from "@/server/legacy";

// Elimina i doppioni dell'import: stessa data, stesso cliente, stessa carta. Tiene il più recente.
async function dedupe() {
  const r = await env.DB.prepare(
    `DELETE FROM orders WHERE source = 'foglio' AND id NOT IN (
       SELECT id FROM (
         SELECT id, ROW_NUMBER() OVER (
           PARTITION BY substr(created_at, 1, 16), lower(trim(customer_name)), lower(trim(card_name))
           ORDER BY updated_at DESC, rowid DESC
         ) AS rn FROM orders WHERE source = 'foglio'
       ) WHERE rn = 1
     )`,
  ).run();
  return r.meta?.changes ?? 0;
}

// Importa lo storico ordini (righe del vecchio foglio Google già lette dal CSV).
export const Route = createFileRoute("/api/admin/importa")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const { rows, replace } = (await request.json().catch(() => ({}))) as {
          rows?: Record<string, string>[];
          replace?: boolean;
        };
        if (!Array.isArray(rows) || !rows.length) return bad("Nessuna riga da importare");
        if (rows.length > 2000) return bad("Troppe righe in una volta (max 2000)");
        // sostituisce l'import precedente (solo gli ordini venuti dal foglio)
        if (replace) await env.DB.prepare("DELETE FROM orders WHERE source = 'foglio'").run();
        const stmts = rows.map((r) => {
          const f = legacyFields(r);
          return env.DB.prepare(
            `INSERT INTO orders (id, created_at, updated_at, status, paid, email, customer_name, phone, address, category, card_name, case_label, total, admin_note, source, legacy_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'foglio', ?)`,
          ).bind(
            crypto.randomUUID(),
            f.created_at,
            nowIso(),
            f.status,
            f.paid,
            f.email,
            f.customer_name,
            f.phone,
            f.address,
            f.category,
            f.card_name,
            f.case_label,
            f.total,
            f.admin_note,
            JSON.stringify(r).slice(0, 60000),
          );
        });
        for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
        const removed = await dedupe();
        return json({ ok: true, imported: rows.length - removed, removed });
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
              `UPDATE orders SET created_at = ?, status = ?, paid = ?, email = CASE WHEN ? != '' THEN ? ELSE email END, customer_name = ?, phone = ?, address = ?, category = ?, card_name = ?, case_label = ?, total = ?, admin_note = ? WHERE id = ?`,
            ).bind(f.created_at, f.status, f.paid, f.email, f.email, f.customer_name, f.phone, f.address, f.category, f.card_name, f.case_label, f.total, f.admin_note, o.id),
          );
          fixed++;
        }
        for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
        const removed = await dedupe();
        return json({ ok: true, fixed: fixed - removed, removed, headers });
      },
    },
  },
});
