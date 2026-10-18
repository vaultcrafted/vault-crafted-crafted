// Foglio di stampa: più carte impaginate su SRA3 o A4, con abbondanza e segni di taglio,
// esportate in un PDF a 300 dpi (una pagina per foglio). Solo browser.
import { CARD_H, CARD_W, TRIM } from "./vaultCard";

const PX_MM = 300 / 25.4; // 11,811 px per mm a 300 dpi

export interface SheetFormat {
  id: string;
  label: string;
  wMm: number;
  hMm: number;
  cols: number;
  rows: number;
  bleedMm: number; // abbondanza tenuta per ogni carta
}
export const SHEETS: SheetFormat[] = [
  { id: "sra3", label: "SRA3 · 16 carte (32×45 cm)", wMm: 320, hMm: 450, cols: 4, rows: 4, bleedMm: 5 },
  { id: "a3", label: "A3 · 12 carte (29,7×42 cm)", wMm: 297, hMm: 420, cols: 4, rows: 3, bleedMm: 3 },
  { id: "a4", label: "A4 · 9 carte (21×29,7 cm)", wMm: 210, hMm: 297, cols: 3, rows: 3, bleedMm: 1.5 },
];

export interface SheetCard {
  canvas: HTMLCanvasElement; // carta completa CARD_W × CARD_H (abbondanza 5 mm)
  label: string; // es. "N°012 ✨"
}

/** Disegna un foglio e restituisce il canvas a 300 dpi. */
export function drawSheet(f: SheetFormat, cards: SheetCard[], title: string) {
  const W = Math.round(f.wMm * PX_MM);
  const H = Math.round(f.hMm * PX_MM);
  const bleed = Math.round(f.bleedMm * PX_MM);
  const cw = TRIM.w + bleed * 2;
  const ch = TRIM.h + bleed * 2;
  const gw = cw * f.cols;
  const gh = ch * f.rows;
  const x0 = Math.round((W - gw) / 2);
  const y0 = Math.round((H - gh) / 2);

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, W, H);

  cards.forEach((c, i) => {
    const col = i % f.cols;
    const row = Math.floor(i / f.cols);
    const x = x0 + col * cw;
    const y = y0 + row * ch;
    // ritaglio della carta con l'abbondanza scelta (la carta ne ha 5 mm)
    g.drawImage(c.canvas, TRIM.x - bleed, TRIM.y - bleed, cw, ch, x, y, cw, ch);
  });

  // segni di taglio sui bordi esterni, in corrispondenza di ogni linea di rifilo
  const gap = Math.round(1.5 * PX_MM);
  const len = Math.round(Math.min(5, (Math.min(x0, y0) / PX_MM) - 2.5) * PX_MM);
  g.strokeStyle = "#000";
  g.lineWidth = 2;
  const usedCols = Math.min(cards.length, f.cols);
  const usedRows = Math.ceil(cards.length / f.cols);
  if (len > 6) {
    for (let col = 0; col < usedCols; col++) {
      for (const tx of [x0 + col * cw + bleed, x0 + col * cw + bleed + TRIM.w]) {
        g.beginPath();
        g.moveTo(tx + 0.5, y0 - gap);
        g.lineTo(tx + 0.5, y0 - gap - len);
        g.moveTo(tx + 0.5, y0 + gh + gap);
        g.lineTo(tx + 0.5, y0 + gh + gap + len);
        g.stroke();
      }
    }
    for (let row = 0; row < usedRows; row++) {
      for (const ty of [y0 + row * ch + bleed, y0 + row * ch + bleed + TRIM.h]) {
        g.beginPath();
        g.moveTo(x0 - gap, ty + 0.5);
        g.lineTo(x0 - gap - len, ty + 0.5);
        g.moveTo(x0 + gw + gap, ty + 0.5);
        g.lineTo(x0 + gw + gap + len, ty + 0.5);
        g.stroke();
      }
    }
  }

  // didascalia nel margine basso: titolo + carte in ordine di posizione
  const fs = Math.round(2.2 * PX_MM);
  g.fillStyle = "#333";
  g.font = `600 ${fs}px Arial, sans-serif`;
  g.textBaseline = "alphabetic";
  const caption = `${title} — ${cards.map((c, i) => `${i + 1}: ${c.label}`).join("  ·  ")}`;
  const maxW = W - 2 * Math.round(6 * PX_MM);
  let text = caption;
  while (g.measureText(text).width > maxW && text.length > 10) text = text.slice(0, -2);
  if (text !== caption) text = text.slice(0, -1) + "…";
  const capY = Math.min(H - Math.round(3 * PX_MM), y0 + gh + gap + len + fs + Math.round(2 * PX_MM));
  g.fillText(text, Math.round(6 * PX_MM), capY);

  return cv;
}

/* ---------------- PDF minimo con immagini JPEG ---------------- */

const enc = new TextEncoder();

/** Crea un PDF: una pagina per canvas, alla misura indicata in mm. */
export async function sheetsToPdf(pages: { canvas: HTMLCanvasElement; wMm: number; hMm: number }[]) {
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let size = 0;
  const push = (b: Uint8Array | string) => {
    const u = typeof b === "string" ? enc.encode(b) : b;
    parts.push(u);
    size += u.length;
  };
  const obj = (n: number, body: () => void) => {
    offsets[n] = size;
    push(`${n} 0 obj\n`);
    body();
    push("\nendobj\n");
  };

  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const n = pages.length;
  // 1 catalogo, 2 pagine, poi per ogni pagina: page, contenuto, immagine
  const pageIds = pages.map((_, i) => 3 + i * 3);
  obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2, () =>
    push(`<< /Type /Pages /Count ${n} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`),
  );
  for (let i = 0; i < n; i++) {
    const { canvas, wMm, hMm } = pages[i];
    const wPt = (wMm * 72) / 25.4;
    const hPt = (hMm * 72) / 25.4;
    const pid = pageIds[i];
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.95));
    if (!blob) throw new Error("Impossibile creare l'immagine del foglio");
    const jpg = new Uint8Array(await blob.arrayBuffer());
    const content = `q ${wPt.toFixed(2)} 0 0 ${hPt.toFixed(2)} 0 0 cm /Im${i} Do Q`;
    obj(pid, () =>
      push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt.toFixed(2)} ${hPt.toFixed(2)}] /Resources << /XObject << /Im${i} ${pid + 2} 0 R >> >> /Contents ${pid + 1} 0 R >>`,
      ),
    );
    obj(pid + 1, () => {
      push(`<< /Length ${content.length} >>\nstream\n`);
      push(content);
      push("\nendstream");
    });
    obj(pid + 2, () => {
      push(
        `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`,
      );
      push(jpg);
      push("\nendstream");
    });
  }
  const total = 3 + n * 3;
  const xref = size;
  let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) x += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  push(x);
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}

export { CARD_W, CARD_H };
