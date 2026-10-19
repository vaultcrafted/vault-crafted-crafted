import { useEffect, useState } from "react";
import { CARD_H, CARD_W, TRIM, loadFonts, renderCard, type CardData } from "@/lib/vaultCard";
import { photoUrl } from "@/lib/accountClient";

// una carta alla volta, per non bloccare il browser con tante anteprime
let queue: Promise<unknown> = Promise.resolve();
const cache = new Map<string, string>();

/** Anteprima della carta disegnata dai suoi dati e dalla foto salvata. */
export function CardThumb({
  cardJson,
  artPos,
  photoKey,
  serial,
  edition,
  className = "",
}: {
  cardJson: string;
  artPos: string;
  photoKey: string;
  serial?: number | null;
  edition?: number | null;
  className?: string;
}) {
  const id = `${cardJson}|${artPos}|${photoKey}|${serial}|${edition}`;
  const [src, setSrc] = useState(cache.get(id) ?? "");
  useEffect(() => {
    if (cache.has(id)) return void setSrc(cache.get(id)!);
    let card: CardData;
    try {
      card = JSON.parse(cardJson);
    } catch {
      return;
    }
    if (!card?.cat) return;
    let alive = true;
    queue = queue.then(async () => {
      if (!alive) return;
      await loadFonts();
      let pos = { zoom: 1, px: 0, py: 0 };
      try {
        pos = { ...pos, ...JSON.parse(artPos) };
      } catch {
        /* posizione predefinita */
      }
      const img = photoKey
        ? await new Promise<HTMLImageElement | null>((res) => {
            const im = new Image();
            im.onload = () => res(im);
            im.onerror = () => res(null);
            im.src = photoUrl(photoKey);
          })
        : null;
      const full = document.createElement("canvas");
      full.width = CARD_W;
      full.height = CARD_H;
      await renderCard(full.getContext("2d")!, { ...card, serial: serial ?? card.serial ?? null, edition: edition ?? card.edition ?? null }, { img, ...pos });
      const out = document.createElement("canvas");
      out.width = 372;
      out.height = 520;
      out.getContext("2d")!.drawImage(full, TRIM.x, TRIM.y, TRIM.w, TRIM.h, 0, 0, 372, 520);
      const url = out.toDataURL("image/jpeg", 0.85);
      cache.set(id, url);
      if (alive) setSrc(url);
    });
    return () => {
      alive = false;
    };
  }, [id]);
  return src ? (
    <img className={`ct ${className}`} src={src} alt="Anteprima della carta" />
  ) : (
    <span className={`ct ct-empty ${className}`} aria-hidden />
  );
}

export const THUMB_CSS = `
.ct{display:block;width:100%;aspect-ratio:744/1040;border-radius:4.5% / 3.2%;object-fit:cover;box-shadow:0 12px 22px -14px rgba(20,26,58,.6)}
.ct-empty{background:linear-gradient(110deg,#D9DCE4 30%,#ECEEF3 50%,#D9DCE4 70%) 0 0/300% 100%;animation:ctload 1.4s linear infinite}
@keyframes ctload{to{background-position:-300% 0}}
`;
