import { createFileRoute } from "@tanstack/react-router";
import { env, json, mailLayout, requireAdmin, sendMail } from "@/server/vault";

// Impostazioni del gestionale (per ora: numero di partenza della numerazione).
export const Route = createFileRoute("/api/admin/impostazioni")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const s = await env.DB.prepare("SELECT key, value FROM settings").all<{
          key: string;
          value: string;
        }>();
        const max = await env.DB.prepare("SELECT MAX(serial) AS m FROM orders").first<{
          m: number | null;
        }>();
        return json({
          settings: Object.fromEntries(s.results.map((r) => [r.key, r.value])),
          maxSerial: max?.m ?? 0,
          mail: !!env.BREVO_API_KEY,
        });
      },
      // Email di prova all'indirizzo admin, per verificare Brevo
      POST: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const to = env.MAIL_ADMIN ?? "vaultcrafted@gmail.com";
        const r = await sendMail({
          to: [{ email: to, name: "Vault Crafted" }],
          subject: "Email di prova dal pannello Vault",
          html: mailLayout("Funziona!", "<p>Se leggi questa email, Brevo è collegato correttamente.</p>"),
        });
        return json({ ...r, to });
      },
      PUT: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const b = (await request.json().catch(() => ({}))) as { serial_start?: number };
        const n = Math.max(1, Math.floor(Number(b.serial_start)) || 1);
        await env.DB.prepare(
          "INSERT INTO settings (key, value) VALUES ('serial_start', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        )
          .bind(String(n))
          .run();
        return json({ ok: true, serial_start: n });
      },
    },
  },
});
