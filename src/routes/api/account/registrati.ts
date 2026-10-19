import { createFileRoute } from "@tanstack/react-router";
import { bad, env, json, nowIso } from "@/server/vault";
import { str } from "@/lib/vaultShop";
import {
  customerCookie,
  ensureSchema,
  hashPassword,
  passwordProblem,
  sendVerifyMail,
  validEmail,
} from "@/server/account";

// Nuovo account cliente.
export const Route = createFileRoute("/api/account/registrati")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await ensureSchema();
        const b = (await request.json().catch(() => ({}))) as {
          email?: string;
          password?: string;
          name?: string;
          phone?: string;
        };
        const email = str(b.email, 160).toLowerCase();
        const name = str(b.name, 120);
        const phone = str(b.phone, 40);
        const pw = typeof b.password === "string" ? b.password : "";
        if (!name) return bad("Scrivi il tuo nome");
        if (!validEmail(email)) return bad("Email non valida");
        const p = passwordProblem(pw);
        if (p) return bad(p);
        const exists = await env.DB.prepare("SELECT id FROM customers WHERE email = ?").bind(email).first();
        if (exists) return bad("Esiste già un account con questa email: accedi o recupera la password", 409);
        const id = crypto.randomUUID();
        const now = nowIso();
        await env.DB.prepare(
          "INSERT INTO customers (id, email, pass, name, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
          .bind(id, email, await hashPassword(pw), name, phone, now, now)
          .run();
        const mail = await sendVerifyMail({ id, email, name }).catch(() => ({ ok: false }));
        return json({ ok: true, mailSent: mail.ok }, 200, { "set-cookie": await customerCookie(id, 1) });
      },
    },
  },
});
