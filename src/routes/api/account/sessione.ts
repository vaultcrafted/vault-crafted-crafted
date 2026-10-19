import { createFileRoute } from "@tanstack/react-router";
import { bad, checkPassword, env, json, nowIso, sessionCookie } from "@/server/vault";
import { str } from "@/lib/vaultShop";
import {
  clearCustomerCookie,
  customerCookie,
  ensureSchema,
  getCustomer,
  publicCustomer,
  verifyPassword,
} from "@/server/account";

// Sessione cliente: GET = chi sono, POST = accedi, DELETE = esci.
export const Route = createFileRoute("/api/account/sessione")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const c = await getCustomer(request);
        return json({ customer: c ? publicCustomer(c) : null });
      },
      POST: async ({ request }) => {
        await ensureSchema();
        const b = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
        const email = str(b.email, 160).toLowerCase();
        const pw = typeof b.password === "string" ? b.password : "";
        await new Promise((r) => setTimeout(r, 300));
        // l'email di Vault con la password del pannello apre l'admin
        const adminEmail = (env.MAIL_ADMIN ?? "vaultcrafted@gmail.com").toLowerCase();
        if (email === adminEmail && pw && (await checkPassword(pw)))
          return json({ ok: true, admin: true }, 200, { "set-cookie": await sessionCookie() });
        const row = await env.DB.prepare(
          "SELECT id, pass, sess_ver, failed, locked_until FROM customers WHERE email = ?",
        )
          .bind(email)
          .first<{ id: string; pass: string; sess_ver: number; failed: number; locked_until: string }>();
        if (row?.locked_until && row.locked_until > nowIso())
          return bad("Troppi tentativi: riprova tra qualche minuto", 429);
        if (!row || !(await verifyPassword(pw, row.pass))) {
          if (row) {
            const failed = row.failed + 1;
            const lock = failed >= 8 ? new Date(Date.now() + 15 * 6e4).toISOString() : "";
            await env.DB.prepare("UPDATE customers SET failed = ?, locked_until = ? WHERE id = ?")
              .bind(lock ? 0 : failed, lock, row.id)
              .run();
          }
          return bad("Email o password non corretti", 401);
        }
        await env.DB.prepare("UPDATE customers SET failed = 0, locked_until = '' WHERE id = ?")
          .bind(row.id)
          .run();
        return json({ ok: true }, 200, { "set-cookie": await customerCookie(row.id, row.sess_ver) });
      },
      DELETE: async () => json({ ok: true }, 200, { "set-cookie": clearCustomerCookie() }),
    },
  },
});
