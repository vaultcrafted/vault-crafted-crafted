import { createFileRoute } from "@tanstack/react-router";
import { num, str } from "@/lib/vaultShop";
import { bad, env, json, nowIso, requireAdmin } from "@/server/vault";
import { CONTACT_STATUS_KEYS, type ContactRow } from "@/lib/contatti";
import { ensureContacts, newId } from "@/server/contatti";
import { CONTACTS_SEED } from "@/server/contattiSeed";

// Campi testuali modificabili, con la lunghezza massima.
const TEXT: [keyof ContactRow, number][] = [
  ["name", 120],
  ["world", 60],
  ["tier", 60],
  ["handle", 120],
  ["link", 300],
  ["followers", 120],
  ["why", 1000],
  ["contact", 300],
  ["contact_hint", 500],
  ["delivery", 500],
  ["card_name", 120],
  ["element", 40],
  ["attacks", 300],
  ["promo_code", 40],
  ["round", 20],
  ["contacted_at", 10],
  ["sent_at", 10],
  ["post_url", 300],
  ["note", 2000],
];

function fields(b: Record<string, unknown>, cur?: ContactRow | null) {
  const set: Record<string, unknown> = {};
  for (const [k, max] of TEXT) if (typeof b[k] === "string") set[k] = str(b[k], max);
  if (typeof set.promo_code === "string") set.promo_code = (set.promo_code as string).toUpperCase();
  if (typeof b.status === "string") {
    if (!CONTACT_STATUS_KEYS.includes(b.status)) throw new Error("Stato non valido");
    set.status = b.status;
    // Le date si compilano da sole quando sposti lo stato, ma solo se sono ancora vuote.
    const today = nowIso().slice(0, 10);
    if (b.status === "contattato" && !b.contacted_at && !cur?.contacted_at)
      set.contacted_at = today;
    if (b.status === "inviata" && !b.sent_at && !cur?.sent_at) set.sent_at = today;
  }
  if (b.orders !== undefined) set.orders = num(b.orders, 0, 9999, 0);
  if (b.priority !== undefined) set.priority = num(b.priority, 0, 999, 0);
  return set;
}

// Elenco, creazione, modifica ed eliminazione dei contatti PR.
export const Route = createFileRoute("/api/admin/contatti")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        await ensureContacts();
        const list = await env.DB.prepare(
          `SELECT * FROM contacts ORDER BY priority = 0, priority ASC, lower(name) ASC`,
        ).all<ContactRow>();
        const counts = await env.DB.prepare(
          "SELECT status, COUNT(*) AS n FROM contacts GROUP BY status",
        ).all<{ status: string; n: number }>();
        const tot = await env.DB.prepare(
          "SELECT COUNT(*) AS n, COALESCE(SUM(orders), 0) AS ordini FROM contacts",
        ).first<{ n: number; ordini: number }>();
        return json({ contacts: list.results, counts: counts.results, tot });
      },

      // Nuovo contatto, oppure semina i nomi della ricerca iniziale con { seed: true }.
      POST: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        await ensureContacts();
        const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;

        if (b.seed === true) {
          const have = await env.DB.prepare("SELECT lower(name) AS n FROM contacts").all<{
            n: string;
          }>();
          const known = new Set(have.results.map((r) => r.n));
          const todo = CONTACTS_SEED.filter((c) => !known.has(c.name.toLowerCase()));
          if (!todo.length) return json({ ok: true, added: 0 });
          const now = nowIso();
          const cols = [
            "id",
            "created_at",
            "updated_at",
            "name",
            "world",
            "tier",
            "handle",
            "link",
            "followers",
            "why",
            "contact",
            "contact_hint",
            "delivery",
            "card_name",
            "element",
            "attacks",
            "status",
            "priority",
            "round",
            "note",
          ];
          const stmts = todo.map((c) =>
            env.DB.prepare(
              `INSERT INTO contacts (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
            ).bind(
              newId(),
              now,
              now,
              c.name,
              c.world,
              c.tier ?? "",
              c.handle ?? "",
              c.link ?? "",
              c.followers ?? "",
              c.why ?? "",
              c.contact ?? "",
              c.contact_hint ?? "",
              c.delivery ?? "",
              c.card_name ?? "",
              c.element ?? "",
              c.attacks ?? "",
              c.round === "riserva" ? "riserva" : "da_fare",
              c.priority ?? 0,
              c.round ?? "",
              c.note ?? "",
            ),
          );
          for (let i = 0; i < stmts.length; i += 25) await env.DB.batch(stmts.slice(i, i + 25));
          return json({ ok: true, added: todo.length });
        }

        const name = str(b.name, 120);
        if (!name) return bad("Manca il nome");
        let set: Record<string, unknown>;
        try {
          set = fields(b);
        } catch (e) {
          return bad((e as Error).message);
        }
        const now = nowIso();
        const row = { id: newId(), created_at: now, updated_at: now, ...set, name };
        const keys = Object.keys(row);
        await env.DB.prepare(
          `INSERT INTO contacts (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
        )
          .bind(...keys.map((k) => (row as Record<string, unknown>)[k]))
          .run();
        const saved = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?")
          .bind(row.id)
          .first<ContactRow>();
        return json({ contact: saved });
      },

      // Modifica un contatto, oppure cambia lo stato a più contatti con { ids, status }.
      PATCH: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        await ensureContacts();
        const b = (await request.json().catch(() => ({}))) as Record<string, unknown> & {
          id?: string;
          ids?: string[];
        };
        const single = b.id
          ? await env.DB.prepare("SELECT * FROM contacts WHERE id = ?")
              .bind(b.id)
              .first<ContactRow>()
          : null;
        if (b.id && !single) return bad("Contatto non trovato", 404);
        let set: Record<string, unknown>;
        try {
          set = fields(b, single);
        } catch (e) {
          return bad((e as Error).message);
        }
        if (!Object.keys(set).length) return bad("Niente da cambiare");

        const ids = Array.isArray(b.ids)
          ? b.ids.filter((x): x is string => typeof x === "string").slice(0, 200)
          : b.id
            ? [b.id]
            : [];
        if (!ids.length) return bad("Nessun contatto selezionato");
        set.updated_at = nowIso();
        const keys = Object.keys(set);
        await env.DB.prepare(
          `UPDATE contacts SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id IN (${ids
            .map(() => "?")
            .join(",")})`,
        )
          .bind(...keys.map((k) => set[k]), ...ids)
          .run();
        if (ids.length === 1) {
          const saved = await env.DB.prepare("SELECT * FROM contacts WHERE id = ?")
            .bind(ids[0])
            .first<ContactRow>();
          if (!saved) return bad("Contatto non trovato", 404);
          return json({ contact: saved });
        }
        return json({ ok: true, updated: ids.length });
      },

      DELETE: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        await ensureContacts();
        const id = new URL(request.url).searchParams.get("id") ?? "";
        if (!id) return bad("Manca l'id");
        await env.DB.prepare("DELETE FROM contacts WHERE id = ?").bind(id).run();
        return json({ ok: true });
      },
    },
  },
});
