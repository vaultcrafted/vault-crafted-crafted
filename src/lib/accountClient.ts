// Chiamate dell'area clienti dal browser.
import { useEffect, useState } from "react";

export interface Me {
  id: string;
  email: string;
  name: string;
  phone: string;
  verified: boolean;
  since: string;
}

export async function acc<T = Record<string, unknown>>(
  path: string,
  opts: { method?: string; json?: unknown } = {},
): Promise<T> {
  const r = await fetch(`/api/account/${path}`, {
    method: opts.method ?? (opts.json ? "POST" : "GET"),
    headers: opts.json ? { "content-type": "application/json" } : undefined,
    body: opts.json ? JSON.stringify(opts.json) : undefined,
    credentials: "same-origin",
  });
  const data = (await r.json().catch(() => ({}))) as T & { error?: string };
  if (!r.ok) throw Object.assign(new Error(data.error ?? "Qualcosa è andato storto, riprova"), { status: r.status });
  return data;
}

/** Cliente collegato: undefined mentre carica, null se non ha fatto l'accesso. */
export function useMe() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const reload = () =>
    acc<{ customer: Me | null }>("sessione")
      .then((r) => setMe(r.customer))
      .catch(() => setMe(null));
  useEffect(() => {
    void reload();
  }, []);
  return { me, setMe, reload };
}

export const photoUrl = (key: string) => `/api/account/foto?key=${encodeURIComponent(key)}`;

/** Scarica un'immagine come dataURL (per riusarla nel configuratore). */
export async function urlToDataUrl(url: string) {
  const r = await fetch(url, { credentials: "same-origin" });
  if (!r.ok) throw new Error("Foto non disponibile");
  const blob = await r.blob();
  return new Promise<{ dataUrl: string; type: string }>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res({ dataUrl: String(fr.result), type: blob.type || "image/jpeg" });
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(blob);
  });
}
