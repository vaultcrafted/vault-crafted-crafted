// Testi pronti per contattare un creator o un locale: mail dove c'è un indirizzo, DM dove non c'è.
// Il codice sconto non entra mai nel primo messaggio: si manda dopo, quando hanno risposto.
import type { ContactRow } from "@/lib/contatti";

export interface Messaggio {
  canale: "mail" | "dm";
  mail: string;
  oggetto: string;
  testo: string;
}

const FIRMA = "Stefano\nVault Crafted — vaultcrafted.com";

const trovaMail = (s: string) => s.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? "";

function attacchiDi(c: ContactRow) {
  const a = c.attacks
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean);
  if (!a.length) return "";
  return a.length === 1 ? `, con l'attacco "${a[0]}"` : `, con gli attacchi "${a[0]}" e "${a[1]}"`;
}

export function messaggioPer(c: ContactRow): Messaggio {
  const mail = trovaMail(c.contact);
  const canale: "mail" | "dm" = mail ? "mail" : "dm";
  const nome = c.name.split("(")[0].trim();
  const carta = c.card_name || "la tua carta";
  const commerciale = c.world === "Locali ed eventi" || c.world === "Fiere";

  if (commerciale) {
    return {
      canale,
      mail,
      oggetto: `Carte da collezione personalizzate per ${nome}`,
      testo: `Buongiorno,

sono Stefano Giunipiero, ho la Tipografia Nuova Stampa a Livorno Ferraris e un progetto che si chiama Vault Crafted: carte da collezione personalizzate, stampate e numerate una per una, in stile carte da gioco.

Vi scrivo perché con una realtà come la vostra le carte funzionano in tre modi:

— una carta per ogni persona dello staff, con il suo ruolo e i suoi attacchi;
— una carta da dare all'ospite della serata, con il suo nome sopra: è il regalo che si fotografa e finisce nelle storie;
— una serie numerata per abbonati o clienti fissi, come tessera da collezione.

Faccio tutto io, dalla grafica alla stampa: niente minimi d'ordine assurdi e tempi di pochi giorni.

Se mi dite tre nomi dello staff vi preparo tre carte campione e ve le porto di persona. Così le vedete in mano prima di decidere qualsiasi cosa.

Grazie dell'attenzione,

Stefano Giunipiero
Vault Crafted — vaultcrafted.com`,
    };
  }

  if (canale === "mail") {
    return {
      canale,
      mail,
      oggetto: "Ti ho fatto una carta da collezione (è già stampata)",
      testo: `Ciao ${nome},

sono Stefano, ho una tipografia in provincia di Vercelli e un progetto che si chiama Vault Crafted: facciamo carte da collezione personalizzate, stampate e numerate una per una.

Ti ho fatto la tua. Si chiama "${carta}"${attacchiDi(c)}. È già pronta, in custodia e nella sua scatola.

Volevo solo sapere dove mandartela, niente di più. Se ti va di farla vedere sono contento, se non ti va la tieni e basta: il regalo vale uguale.

Te la allego qui sotto in foto così vedi com'è venuta.

${FIRMA}`,
    };
  }

  return {
    canale,
    mail: "",
    oggetto: "",
    testo: `Ciao ${nome}, ti ho fatto una carta da collezione: "${carta}"${attacchiDi(c)}. È stampata, numerata e in custodia, ed è tua.

Dimmi solo dove mandartela, non devi fare niente in cambio.`,
  };
}

// Secondo messaggio, dopo che hanno risposto: qui entra il codice sconto.
export function seguito(c: ContactRow) {
  const codice = c.promo_code || "CODICE";
  return `Perfetto, parte domani. Ti ho messo anche un codice tuo per chi ti segue, ${codice}, se mai ti servisse: non devi usarlo per forza.`;
}
