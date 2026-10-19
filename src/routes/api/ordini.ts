import { createFileRoute } from "@tanstack/react-router";
import { MAX_EDITION, catOf, elementOf } from "@/lib/vaultCard";
import {
  MAX_PHOTO,
  cardErrors,
  contactErrors,
  custodiaOf,
  num,
  priceOf,
  sanitizeCard,
  str,
  type NewOrder,
} from "@/lib/vaultShop";
import {
  b64ToBytes,
  bad,
  env,
  json,
  mailLayout,
  nowIso,
  pad3,
  rows,
  safeName,
  sendMail,
  esc,
} from "@/server/vault";
import { ensureSchema, getCustomer } from "@/server/account";

// Nuovo ordine dal configuratore /crea.
export const Route = createFileRoute("/api/ordini")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: NewOrder;
        try {
          body = await request.json();
        } catch {
          return bad("Richiesta non valida");
        }
        const card = sanitizeCard(body.card);
        if (!card) return bad("Dati della carta non validi");
        const contacts = {
          nome_cognome: str(body.contacts?.nome_cognome, 120),
          email: str(body.contacts?.email, 160).toLowerCase(),
          cellulare: str(body.contacts?.cellulare, 40),
          indirizzo: str(body.contacts?.indirizzo, 400),
          note: str(body.contacts?.note, 2000),
        };
        await ensureSchema();
        const customer = await getCustomer(request);
        // foto della bozza salvata, se il cliente non ne ha caricata una nuova
        let draftPhoto: { key: string; name: string; type: string } | null = null;
        if (customer && body.draftId && !body.photo?.base64) {
          const d = await env.DB.prepare(
            "SELECT photo_key, photo_name, photo_type FROM drafts WHERE id = ? AND customer_id = ?",
          )
            .bind(String(body.draftId), customer.id)
            .first<{ photo_key: string; photo_name: string; photo_type: string }>();
          if (d?.photo_key) draftPhoto = { key: d.photo_key, name: d.photo_name, type: d.photo_type };
        }
        const missing = [...cardErrors(card), ...contactErrors(contacts)];
        if (!body.photo?.base64 && !draftPhoto) missing.push("La foto per la carta");
        if (missing.length) return json({ error: "Mancano dei dati", missing }, 400);

        let bytes: Uint8Array | ArrayBuffer;
        let photoType: string;
        let photoName: string;
        if (body.photo?.base64) {
          bytes = b64ToBytes(body.photo.base64);
          if (bytes.byteLength > MAX_PHOTO) return bad("La foto supera i 10 MB");
          photoType = /^image\/[\w.+-]+$/.test(body.photo.type) ? body.photo.type : "application/octet-stream";
          photoName = body.photo.name;
        } else {
          const obj = await env.FILES.get(draftPhoto!.key);
          if (!obj) return json({ error: "Mancano dei dati", missing: ["La foto per la carta"] }, 400);
          bytes = await new Response(obj.body).arrayBuffer();
          photoType = draftPhoto!.type || "image/jpeg";
          photoName = draftPhoto!.name || "foto.jpg";
        }

        const count = await env.DB.prepare(
          "SELECT COUNT(*) AS n FROM orders WHERE email = ? AND source = 'sito' AND status != 'annullato'",
        )
          .bind(contacts.email)
          .first<{ n: number }>();
        if ((count?.n ?? 0) >= MAX_EDITION)
          return bad(`Hai raggiunto il massimo di ${MAX_EDITION} carte.`);

        const id = crypto.randomUUID();
        const photoKey = `ordini/${id}/foto-${safeName(photoName)}`;
        await env.FILES.put(photoKey, bytes, { httpMetadata: { contentType: photoType } });

        const cu = custodiaOf(str(body.custodia, 40));
        const p = priceOf(card.cat, cu.id, card.holo);
        const art = body.artPos ?? { zoom: 1, px: 0, py: 0 };
        const artPos = JSON.stringify({
          zoom: num(art.zoom, 1, 3, 1),
          px: num(art.px, -3000, 3000, 0),
          py: num(art.py, -3000, 3000, 0),
        });
        const now = nowIso();

        const res = await env.DB.prepare(
          `INSERT INTO orders (id, serial, edition, created_at, updated_at, status, email, customer_name, phone, address, customer_note,
             category, card_name, card_json, art_pos, case_id, case_label, case_price, price, shipping, total, photo_key, photo_name, source, customer_id)
           VALUES (?1,
             (SELECT MAX(COALESCE((SELECT MAX(serial) FROM orders), 0) + 1, (SELECT CAST(value AS INTEGER) FROM settings WHERE key = 'serial_start'))),
             (SELECT COUNT(*) + 1 FROM orders WHERE email = ?2 AND source = 'sito' AND status != 'annullato'),
             ?3, ?3, 'nuovo', ?2, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, 'sito', ?20)
           RETURNING serial, edition`,
        )
          .bind(
            id,
            contacts.email,
            now,
            contacts.nome_cognome,
            contacts.cellulare,
            contacts.indirizzo,
            contacts.note,
            card.cat,
            card.name,
            JSON.stringify(card),
            artPos,
            cu.id,
            cu.label,
            p.casePrice,
            p.price,
            p.shipping,
            p.total,
            photoKey,
            photoName.slice(0, 160),
            customer?.id ?? "",
          )
          .first<{ serial: number; edition: number }>();
        if (!res) return bad("Non riesco a salvare l'ordine, riprova", 500);

        if (customer) {
          // la bozza diventata ordine non serve più
          if (body.draftId) {
            const d = await env.DB.prepare("SELECT photo_key FROM drafts WHERE id = ? AND customer_id = ?")
              .bind(String(body.draftId), customer.id)
              .first<{ photo_key: string }>();
            if (d) {
              if (d.photo_key) await env.FILES.delete(d.photo_key);
              await env.DB.prepare("DELETE FROM drafts WHERE id = ?").bind(String(body.draftId)).run();
            }
          }
          if (!customer.phone && contacts.cellulare)
            await env.DB.prepare("UPDATE customers SET phone = ? WHERE id = ?").bind(contacts.cellulare, customer.id).run();
          if (body.saveAddress) {
            const dup = await env.DB.prepare("SELECT id FROM addresses WHERE customer_id = ? AND address = ?")
              .bind(customer.id, contacts.indirizzo)
              .first();
            const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM addresses WHERE customer_id = ?")
              .bind(customer.id)
              .first<{ n: number }>();
            if (!dup && (n?.n ?? 0) < 20)
              await env.DB.prepare(
                "INSERT INTO addresses (id, customer_id, label, recipient, phone, address, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              )
                .bind(crypto.randomUUID(), customer.id, str(body.addressLabel, 40) || "Indirizzo", contacts.nome_cognome, contacts.cellulare, contacts.indirizzo, n?.n ? 0 : 1, now)
                .run();
          }
        }

        const summary = rows([
          ["Numero", `N° ${pad3(res.serial)} · ${res.edition}/${MAX_EDITION}`],
          ["Carta", `${card.name} · ${catOf(card.cat).n} · ${elementOf(card.el)[1]}`],
          ["Custodia", cu.price ? `${cu.label} (+€${cu.price})` : cu.label],
          ["Pellicola olografica", card.holo ? `Sì (+€${p.holoPrice.toFixed(2)})` : "No"],
          ["Totale", `€${p.total.toFixed(2)} spedizione inclusa`],
        ]);
        await Promise.all([
          sendMail({
            to: [{ email: contacts.email, name: contacts.nome_cognome }],
            subject: `La tua carta Vault N° ${pad3(res.serial)} è nel Vault`,
            html: mailLayout(
              "Ordine ricevuto!",
              `<p>Ciao ${esc(contacts.nome_cognome.split(" ")[0] || "")}, grazie per il tuo ordine.</p>
              <p>Controlliamo che la carta sia perfetta per la stampa e ti scriviamo con il riepilogo e le istruzioni per il pagamento. Appena il pagamento arriva la stampiamo e la spediamo in 3–4 giorni lavorativi.</p>${summary}
              <p style="font-size:13px;color:#5A5D6B">Per qualsiasi cosa rispondi a questa email o scrivici su WhatsApp al 333 287 6277.</p>`,
            ),
          }),
          sendMail({
            to: [{ email: env.MAIL_ADMIN ?? "vaultcrafted@gmail.com", name: "Vault Crafted" }],
            replyTo: { email: contacts.email, name: contacts.nome_cognome },
            subject: `Nuovo ordine N° ${pad3(res.serial)} — ${card.name} (${catOf(card.cat).n})`,
            html: mailLayout(
              `Nuovo ordine N° ${pad3(res.serial)}`,
              `${summary}${rows([
                ["Cliente", contacts.nome_cognome],
                ["Email", contacts.email],
                ["Cellulare", contacts.cellulare],
                ["Note", contacts.note],
              ])}<p><a href="${env.SITE_URL ?? ""}/admin/ordine/${id}" style="display:inline-block;background:#E2A917;color:#2A1F00;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold">Apri nel pannello</a></p>`,
            ),
          }),
        ]).catch((e) => console.error("email", e));

        return json({ ok: true, id, serial: res.serial, edition: res.edition });
      },
    },
  },
});
