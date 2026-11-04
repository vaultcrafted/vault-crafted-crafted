// Contatti PR: stati, mondi e forma della riga. Condiviso tra pannello e API.
export const CONTACT_STATUSES = [
  ["da_fare", "Da fare"],
  ["contattato", "Contattato"],
  ["inviata", "Carta inviata"],
  ["risposto", "Ha risposto"],
  ["pubblicato", "Ha pubblicato"],
  ["niente", "Niente da fare"],
  ["riserva", "Riserva"],
] as const;
export const CONTACT_STATUS_KEYS = CONTACT_STATUSES.map((s) => s[0]) as string[];

export const CONTACT_WORLDS = [
  "Carte e collezionismo",
  "Coppie e lifestyle",
  "Comici",
  "Musica",
  "Locali ed eventi",
  "Fiere",
  "Altro",
] as const;

export interface ContactRow {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  world: string;
  tier: string;
  handle: string;
  link: string;
  followers: string;
  why: string;
  contact: string;
  contact_hint: string;
  delivery: string;
  card_name: string;
  element: string;
  attacks: string;
  promo_code: string;
  status: string;
  priority: number;
  round: string;
  contacted_at: string;
  sent_at: string;
  post_url: string;
  orders: number;
  note: string;
}
