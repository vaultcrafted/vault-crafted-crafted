import { createFileRoute } from "@tanstack/react-router";
import { bad, env, json, nowIso } from "@/server/vault";
import { str } from "@/lib/vaultShop";
import { needCustomer } from "@/server/account";

export interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  address: string;
  is_default: number;
}

const list = (cid: string) =>
  env.DB.prepare(
    "SELECT id, label, recipient, phone, address, is_default FROM addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at",
  )
    .bind(cid)
    .all<Address>()
    .then((r) => r.results);

// Rubrica indirizzi: GET elenco, POST nuovo, PUT modifica (?id=), DELETE (?id=).
export const Route = createFileRoute("/api/account/indirizzi")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        return json({ addresses: await list(c.id) });
      },
      POST: async ({ request }) => save(request, null),
      PUT: async ({ request }) => save(request, new URL(request.url).searchParams.get("id")),
      DELETE: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        const id = new URL(request.url).searchParams.get("id") ?? "";
        await env.DB.prepare("DELETE FROM addresses WHERE id = ? AND customer_id = ?").bind(id, c.id).run();
        return json({ addresses: await list(c.id) });
      },
    },
  },
});

async function save(request: Request, id: string | null) {
  const { c, deny } = await needCustomer(request);
  if (deny) return deny;
  const b = (await request.json().catch(() => ({}))) as Partial<Address> & { is_default?: unknown };
  const a = {
    label: str(b.label, 40) || "Indirizzo",
    recipient: str(b.recipient, 120),
    phone: str(b.phone, 40),
    address: str(b.address, 400),
    is_default: b.is_default ? 1 : 0,
  };
  if (!a.recipient || !a.address) return bad("Servono destinatario e indirizzo");
  const current = await list(c.id);
  if (!id && current.length >= 20) return bad("Hai già 20 indirizzi salvati");
  if (!current.length) a.is_default = 1;
  if (a.is_default)
    await env.DB.prepare("UPDATE addresses SET is_default = 0 WHERE customer_id = ?").bind(c.id).run();
  if (id) {
    await env.DB.prepare(
      "UPDATE addresses SET label = ?, recipient = ?, phone = ?, address = ?, is_default = ? WHERE id = ? AND customer_id = ?",
    )
      .bind(a.label, a.recipient, a.phone, a.address, a.is_default, id, c.id)
      .run();
  } else {
    await env.DB.prepare(
      "INSERT INTO addresses (id, customer_id, label, recipient, phone, address, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(crypto.randomUUID(), c.id, a.label, a.recipient, a.phone, a.address, a.is_default, nowIso())
      .run();
  }
  return json({ addresses: await list(c.id) });
}
