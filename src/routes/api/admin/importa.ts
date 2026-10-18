import { createFileRoute } from "@tanstack/react-router";
import { bad, env, json, nowIso, requireAdmin } from "@/server/vault";

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
        const pick = (r: Record<string, string>, ...names: string[]) => {
          const keys = Object.keys(r);
          const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
          for (const n of names) {
            const k = keys.find((x) => norm(x) === n);
            if (k && r[k]) return String(r[k]).trim();
          }
          for (const n of names) {
            const k = keys.find((x) =>
              x
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .includes(n),
            );
            if (k && r[k]) return String(r[k]).trim();
          }
          return "";
        };
        const toIso = (v: string) => {
          const m = v.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
          if (m)
            return new Date(
              Date.UTC(+m[3], +m[2] - 1, +m[1], +(m[4] ?? 12), +(m[5] ?? 0), +(m[6] ?? 0)),
            ).toISOString();
          const d = new Date(v);
          return Number.isNaN(d.getTime()) ? nowIso() : d.toISOString();
        };
        const stmts = rows.map((r) => {
          const created = toIso(pick(r, "timestamp", "data", "date"));
          const totalRaw = pick(r, "totale", "total", "prezzo")
            .replace(",", ".")
            .replace(/[^\d.]/g, "");
          return env.DB.prepare(
            `INSERT INTO orders (id, created_at, updated_at, status, paid, email, customer_name, phone, address, category, card_name, total, source, legacy_json)
             VALUES (?, ?, ?, 'storico', 1, ?, ?, ?, ?, ?, ?, ?, 'foglio', ?)`,
          ).bind(
            crypto.randomUUID(),
            created,
            nowIso(),
            pick(r, "emailcontatto", "email").toLowerCase(),
            pick(r, "nomecognome", "cliente"),
            pick(r, "cellulare", "telefono"),
            pick(r, "spedizione", "indirizzo"),
            pick(r, "tipologia", "tipo"),
            pick(r, "nome"),
            Number(totalRaw) || 0,
            JSON.stringify(r).slice(0, 60000),
          );
        });
        for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
        return json({ ok: true, imported: rows.length });
      },
    },
  },
});
