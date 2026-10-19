import { createFileRoute } from "@tanstack/react-router";
import { bad, env, json, nowIso } from "@/server/vault";
import { str } from "@/lib/vaultShop";
import {
  customerCookie,
  ensureSchema,
  hashPassword,
  needCustomer,
  passwordProblem,
  sendResetMail,
  useToken,
  verifyPassword,
} from "@/server/account";

// POST = chiedi il link di reset, PUT = nuova password dal link, PATCH = cambia password (loggato).
export const Route = createFileRoute("/api/account/password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await ensureSchema();
        const b = (await request.json().catch(() => ({}))) as { email?: string };
        const email = str(b.email, 160).toLowerCase();
        const c = await env.DB.prepare("SELECT id, email, name FROM customers WHERE email = ?")
          .bind(email)
          .first<{ id: string; email: string; name: string }>();
        if (c) await sendResetMail(c).catch(() => null);
        // stessa risposta in ogni caso, per non rivelare quali email sono registrate
        return json({ ok: true });
      },
      PUT: async ({ request }) => {
        await ensureSchema();
        const b = (await request.json().catch(() => ({}))) as { token?: string; password?: string };
        const pw = typeof b.password === "string" ? b.password : "";
        const p = passwordProblem(pw);
        if (p) return bad(p);
        const id = await useToken(str(b.token, 100), "reset");
        if (!id) return bad("Il link è scaduto o è già stato usato: chiedine uno nuovo", 410);
        const row = await env.DB.prepare(
          "UPDATE customers SET pass = ?, sess_ver = sess_ver + 1, failed = 0, locked_until = '', email_verified = 1, updated_at = ? WHERE id = ? RETURNING sess_ver",
        )
          .bind(await hashPassword(pw), nowIso(), id)
          .first<{ sess_ver: number }>();
        return json({ ok: true }, 200, { "set-cookie": await customerCookie(id, row!.sess_ver) });
      },
      PATCH: async ({ request }) => {
        const { c, deny } = await needCustomer(request);
        if (deny) return deny;
        const b = (await request.json().catch(() => ({}))) as { current?: string; password?: string };
        const pw = typeof b.password === "string" ? b.password : "";
        const p = passwordProblem(pw);
        if (p) return bad(p);
        const row = await env.DB.prepare("SELECT pass FROM customers WHERE id = ?")
          .bind(c.id)
          .first<{ pass: string }>();
        if (!row || !(await verifyPassword(String(b.current ?? ""), row.pass)))
          return bad("La password attuale non è corretta", 401);
        const upd = await env.DB.prepare(
          "UPDATE customers SET pass = ?, sess_ver = sess_ver + 1, updated_at = ? WHERE id = ? RETURNING sess_ver",
        )
          .bind(await hashPassword(pw), nowIso(), c.id)
          .first<{ sess_ver: number }>();
        return json({ ok: true }, 200, { "set-cookie": await customerCookie(c.id, upd!.sess_ver) });
      },
    },
  },
});
