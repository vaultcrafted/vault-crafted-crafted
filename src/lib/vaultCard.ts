// Motore di disegno del Formato Vault.
// Stessa grafica dei file di stampa: 73 × 98 mm a 300 dpi (862 × 1158 px),
// 5 mm di abbondanza, taglio a (59,59)–(803,1099).

export const CARD_W = 862;
export const CARD_H = 1158;
export const TRIM = { x: 59, y: 59, w: 744, h: 1040 };
export const MAX_EDITION = 420;
export const INK = "#141A3A";
export const RED = "#D7262E";

export type CatKey = "core" | "rare" | "fullart" | "prism" | "legend";
export type ElKey =
  | "fuoco"
  | "acqua"
  | "fulmine"
  | "terra"
  | "vento"
  | "luce"
  | "ombra"
  | "metallo"
  | "vault";
export type MoveMode = "two" | "one" | "ab";

export const CATS: { k: CatKey; n: string; full: boolean; price: number; hint: string }[] = [
  {
    k: "core",
    n: "Base",
    full: false,
    price: 20,
    hint: "Cornice argento, foto nella finestra.",
  },
  {
    k: "rare",
    n: "Rara",
    full: false,
    price: 23,
    hint: "Cornice notte con raggi del colore dell'elemento.",
  },
  {
    k: "fullart",
    n: "Full Art",
    full: true,
    price: 26,
    hint: "Foto a tutta carta, bordo argento.",
  },
  {
    k: "prism",
    n: "Prisma",
    full: true,
    price: 30,
    hint: "Foto a tutta carta, bordo prismatico.",
  },
  {
    k: "legend",
    n: "Legend",
    full: true,
    price: 34,
    hint: "Foto a tutta carta, bordo oro.",
  },
];

// [chiave, nome, colore, inchiostro sul colore]
export const ELEMENTS: [ElKey, string, string, string][] = [
  ["fuoco", "Fuoco", "#E8462A", "#FFFFFF"],
  ["acqua", "Acqua", "#1F86D6", "#FFFFFF"],
  ["fulmine", "Fulmine", "#F5C518", "#2A1F00"],
  ["terra", "Terra", "#9A6430", "#FFFFFF"],
  ["vento", "Vento", "#3FB58A", "#FFFFFF"],
  ["luce", "Luce", "#FFE48A", "#5A4300"],
  ["ombra", "Ombra", "#4A3A6E", "#FFFFFF"],
  ["metallo", "Metallo", "#8A94A3", "#FFFFFF"],
  ["vault", "Vault", "#E2A917", "#2A1F00"],
];
export const elementOf = (k: string) => ELEMENTS.find((e) => e[0] === k) ?? ELEMENTS[0];
export const catOf = (k: string) => CATS.find((c) => c.k === k) ?? CATS[0];

export interface CardData {
  cat: CatKey;
  el: ElKey;
  mode: MoveMode;
  name: string;
  hp: string;
  abName: string;
  abText: string;
  m1: string;
  d1: string;
  t1: string;
  m2: string;
  d2: string;
  t2: string;
  weak: ElKey | "";
  weakV: string;
  res: ElKey | "";
  resV: string;
  ret: ElKey;
  retN: number;
  motto: string;
  /** pellicola olografica (+€ HOLO_PRICE) */
  holo?: boolean;
  serial: number | null;
  edition: number | null;
}

export interface ArtState {
  img: HTMLImageElement | null;
  zoom: number;
  px: number;
  py: number;
}

/* ---------------- cornice vettoriale ---------------- */

function rays(cx = 431, cy = 408, op = 0.5, col = "#FFFFFF") {
  let ls = "";
  for (let i = 0; i < 180; i++) {
    const a = (i * 2 * Math.PI) / 180;
    ls += `<line x1="${cx}" y1="${cy}" x2="${Math.round(cx + 1400 * Math.cos(a))}" y2="${Math.round(cy + 1400 * Math.sin(a))}"/>`;
  }
  return `<g stroke="${col}" stroke-opacity="${op}" stroke-width="1.6">${ls}</g>`;
}
function ticks(col = INK, op = 0.55) {
  let t = "";
  for (let y = 200; y < 960; y += 18) {
    const l = (y - 200) % 90 === 0 ? 14 : 7;
    t += `<line x1="${80 - l}" y1="${y}" x2="80" y2="${y}"/><line x1="782" y1="${y}" x2="${782 + l}" y2="${y}"/>`;
  }
  return `<g stroke="${col}" stroke-opacity="${op}" stroke-width="2">${t}</g>`;
}
const DEFS = `<defs>
 <linearGradient id="silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E7EAF0"/><stop offset="0.22" stop-color="#C9CFDB"/><stop offset="0.4" stop-color="#F4F5F8"/><stop offset="0.55" stop-color="#E4DFF0"/><stop offset="0.66" stop-color="#C3CAD7"/><stop offset="0.82" stop-color="#EEF1F5"/><stop offset="1" stop-color="#C9D0DC"/></linearGradient>
 <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A6410"/><stop offset="0.25" stop-color="#F6D36B"/><stop offset="0.5" stop-color="#B8860B"/><stop offset="0.75" stop-color="#FFE9A3"/><stop offset="1" stop-color="#8A6410"/></linearGradient>
 <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="${INK}" stop-opacity="0"/><stop offset="1" stop-color="${INK}" stop-opacity="0.22"/></linearGradient>
 <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0.4" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.6"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="topplate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity="0.9"/><stop offset="0.75" stop-color="${INK}" stop-opacity="0.55"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>
 <linearGradient id="prism" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF7AB6"/><stop offset="0.25" stop-color="#FFD84D"/><stop offset="0.5" stop-color="#5EF2C1"/><stop offset="0.75" stop-color="#59B8FF"/><stop offset="1" stop-color="#B47BFF"/></linearGradient>
 <linearGradient id="night" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#232A4D"/><stop offset="0.5" stop-color="#11152B"/><stop offset="1" stop-color="#070914"/></linearGradient>
 <pattern id="carbon" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0M-2 2L2 -2M6 10L10 6" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="2"/></pattern>
 <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.7" fill="${INK}" fill-opacity="0.22"/></pattern>
 <mask id="win"><rect width="862" height="1158" fill="#fff"/><rect x="106" y="176" width="650" height="465" fill="#000"/></mask>
</defs>`;
const CORNERS =
  "M0 0H269L188 81H81V188L0 269Z M862 0H593L674 81H781V188L862 269Z M0 1158H269L188 1077H81V970L0 889Z M862 1158H593L674 1077H781V970L862 889Z";
const SMALLC = "M81 81H130L118 93H93V118L81 130Z M781 1077H732L744 1065H769V1040L781 1028Z";
const STRIPES =
  "M862 120L862 190L700 352L700 282Z M862 214L862 236L700 398L700 376Z M0 880L0 950L120 830L120 760Z";

export const layoutOf = (full: boolean, one: boolean) =>
  full && one ? { band: 744, top: 790, h: 120 } : { band: 656, top: 702, h: 208 };

function band(acc: string, bink: string, y: number) {
  const c = y + 8;
  return (
    `<rect x="96" y="${y}" width="670" height="32" rx="16" fill="${acc}"/>` +
    `<path d="M112 ${c}L124 ${c + 8}L112 ${c + 16}M124 ${c}L136 ${c + 8}L124 ${c + 16}" fill="none" stroke="${bink}" stroke-opacity="0.85" stroke-width="3"/>` +
    `<path d="M750 ${c}L738 ${c + 8}L750 ${c + 16}M738 ${c}L726 ${c + 8}L738 ${c + 16}" fill="none" stroke="${bink}" stroke-opacity="0.85" stroke-width="3"/>`
  );
}
function lower(
  lay: { top: number; h: number },
  one: boolean,
  op: number,
  line: string,
  div: string,
  strips: boolean,
  ab: boolean,
) {
  let t = lay.top,
    h = lay.h,
    s = "";
  if (strips) {
    s += `<rect x="96" y="920" width="670" height="74" rx="10" fill="#fff" fill-opacity="${op}"/><rect x="96" y="1002" width="670" height="58" rx="10" fill="#fff" fill-opacity="${op}"/>`;
  }
  if (ab) {
    s +=
      `<rect x="96" y="${t}" width="670" height="98" rx="12" fill="#fff" fill-opacity="${Math.max(op, 0.85)}"/>` +
      `<rect x="97.5" y="${t + 1.5}" width="667" height="95" rx="11" fill="${RED}" fill-opacity="0.07" stroke="${RED}" stroke-width="3"/>`;
    h -= 106;
    t += 106;
    one = true;
  }
  s += `<rect x="96" y="${t}" width="670" height="${h}" rx="14" fill="#fff" fill-opacity="${op}"/>`;
  s += `<path d="M96 ${t + 14}A14 14 0 0 1 110 ${t}H160" fill="none" stroke="${line}" stroke-width="3"/>`;
  s += `<path d="M766 ${t + h - 14}A14 14 0 0 1 752 ${t + h}H702" fill="none" stroke="${line}" stroke-width="3"/>`;
  if (!one)
    s += `<line x1="122" y1="${t + 104}" x2="740" y2="${t + 104}" stroke="${INK}" stroke-opacity="0.2" stroke-width="2"/>`;
  if (!strips)
    s += `<line x1="96" y1="924" x2="766" y2="924" stroke="${line}" stroke-width="3"/><line x1="96" y1="990" x2="766" y2="990" stroke="${line}" stroke-width="3"/>`;
  s += `<line x1="318" y1="938" x2="318" y2="976" stroke="${div}" stroke-width="2"/><line x1="544" y1="938" x2="544" y2="976" stroke="${div}" stroke-width="2"/>`;
  return s;
}
const tab = (fill: string, notch: string) =>
  `<path d="M628 96H756A10 10 0 0 1 766 106V148A10 10 0 0 1 756 158H600Z" fill="${fill}"/><path d="M600 158L628 96H640L612 158Z" fill="${notch}"/>`;
const seal = (ring: string) =>
  `<circle cx="726" cy="1031" r="24" fill="${ring}"/><circle cx="726" cy="1031" r="20" fill="${INK}"/>`;

function svgCore(acc: string, bink: string, one: boolean, ab: boolean) {
  const lay = layoutOf(false, one);
  let g =
    '<rect width="862" height="1158" fill="url(#silver)"/><rect width="862" height="1158" fill="url(#fade)"/><rect width="862" height="1158" fill="url(#sheen)"/>';
  g +=
    '<path d="M0 0H330L0 330Z" fill="url(#dots)"/><path d="M862 1158H532L862 828Z" fill="url(#dots)"/>';
  let s = `<g mask="url(#win)">${g}</g>` + ticks();
  s += `<path d="${CORNERS}" fill="${INK}"/>`;
  s += `<rect x="96" y="166" width="670" height="485" rx="8" fill="none" stroke="#fff" stroke-width="3"/><rect x="102" y="172" width="658" height="473" rx="3" fill="none" stroke="${INK}" stroke-width="7"/>`;
  s += `<path d="M96 158H612" stroke="${INK}" stroke-width="3"/>` + tab(INK, acc);
  return s + band(acc, bink, lay.band) + lower(lay, one, 0.6, INK, INK, false, ab) + seal(acc);
}
function svgRare(acc: string, bink: string, one: boolean, ab: boolean) {
  const lay = layoutOf(false, one);
  let g =
    '<rect width="862" height="1158" fill="url(#night)"/><rect width="862" height="1158" fill="url(#carbon)"/>';
  g += rays(431, 408, 0.22, acc) + `<path d="${STRIPES}" fill="${acc}" opacity="0.95"/>`;
  g += '<rect width="862" height="1158" fill="url(#sheen)" opacity="0.35"/>';
  let s = `<g mask="url(#win)">${g}</g>` + ticks("#FFFFFF", 0.45);
  s += `<path d="${CORNERS}" fill="${acc}"/><path d="${SMALLC}" fill="#FFFFFF"/>`;
  s += `<rect x="96" y="166" width="670" height="485" rx="8" fill="none" stroke="#FFFFFF" stroke-width="2"/><rect x="102" y="172" width="658" height="473" rx="3" fill="none" stroke="${acc}" stroke-width="7"/>`;
  s +=
    `<path d="M96 158H612" stroke="#FFFFFF" stroke-width="3"/><path d="M96 162H420" stroke="${acc}" stroke-width="3"/>` +
    tab(acc, "#FFFFFF");
  return (
    s +
    band(acc, bink, lay.band) +
    lower(lay, one, 0.92, "#FFFFFF", "#FFFFFF", false, ab) +
    seal(acc)
  );
}
function svgFull(
  acc: string,
  bink: string,
  metal: "silver" | "prism" | "gold",
  one: boolean,
  ab: boolean,
) {
  const lay = layoutOf(true, one);
  const edge = { silver: "url(#silver)", prism: "url(#prism)", gold: "url(#gold)" }[metal];
  let s = '<rect width="862" height="190" fill="url(#topplate)"/>' + ticks("#FFFFFF", 0.7);
  s += `<path d="${CORNERS}" fill="${edge}"/><path d="${SMALLC}" fill="${metal === "silver" ? acc : "#FFFFFF"}"/>`;
  if (metal !== "silver") {
    s += `<rect x="88" y="88" width="686" height="982" rx="6" fill="none" stroke="${edge}" stroke-width="${metal === "prism" ? 5 : 4}"/>`;
    s += `<rect x="96" y="96" width="670" height="966" rx="4" fill="none" stroke="${edge}" stroke-width="1.5"/>`;
  }
  s += `<rect x="96" y="156.5" width="516" height="3" fill="${metal !== "silver" ? edge : "#FFFFFF"}"/><path d="M96 162H420" stroke="${acc}" stroke-width="3"/>`;
  s += tab(edge, acc);
  return (
    s +
    band(acc, bink, lay.band) +
    lower(lay, one, 0.8, metal === "silver" ? INK : edge, INK, true, ab) +
    seal(metal !== "silver" ? edge : acc)
  );
}
function chipShape(vk: CatKey, acc: string, bink: string) {
  const map: Record<CatKey, [string, string, string, string]> = {
    core: [INK, "#FFFFFF", "BASE", ""],
    rare: [acc, bink, "RARA", ""],
    fullart: ["url(#silver)", INK, "FULL ART", ""],
    prism: ["url(#prism)", INK, "PRISMA", ""],
    legend: [
      "url(#gold)",
      INK,
      "LEGEND",
      '<path d="M592 100L595 107L602 110L595 113L592 120L589 113L582 110L589 107Z" fill="#FFF3C4"/>',
    ],
  };
  const [fill, ink, label, extra] = map[vk];
  const edge = vk === "core" ? INK : "#FFFFFF";
  return {
    svg:
      `<path d="M474 106H596L584 150H462Z" fill="${fill}" stroke="${edge}" stroke-width="2"/>` +
      extra,
    ink,
    label,
  };
}

export function frameSVG(vk: CatKey, el: ElKey, one: boolean, ab: boolean) {
  const [, , acc, bink] = elementOf(el);
  const body =
    vk === "core"
      ? svgCore(acc, bink, one, ab)
      : vk === "rare"
        ? svgRare(acc, bink, one, ab)
        : svgFull(
            acc,
            bink,
            ({ fullart: "silver", prism: "prism", legend: "gold" } as const)[vk],
            one,
            ab,
          );
  const chip = chipShape(vk, acc, bink);
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="862" height="1158" viewBox="0 0 862 1158">${DEFS}${body}${chip.svg}</svg>`,
    chip: { ink: chip.ink, label: chip.label },
  };
}

/* ---------------- simboli elementi ---------------- */

const GLYPH: Record<ElKey, string> = {
  fuoco: "M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z",
  acqua: "M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z",
  fulmine: "M13 2L5 14h6l-1 8 8-12h-6l1-8z",
  terra: "M2 20l7-12 4 6 3-4 6 10z",
  vento: "M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8",
  luce: "M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1",
  ombra: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z",
  metallo: "M12 2l8.5 5v10L12 22l-8.5-5V7zM12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z",
  vault: "M4 4h5l3 9 3-9h5l-6 16h-4z",
};
export function badgeURL(k: ElKey) {
  const e = elementOf(k);
  const fill = k === "vault" ? "url(#g)" : e[2];
  const ink = k === "vault" ? "#3A2600" : e[3];
  const s =
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 64 64"><defs><radialGradient id="g" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#fff0b8"/><stop offset="0.55" stop-color="#e2a917"/><stop offset="1" stop-color="#a87406"/></radialGradient></defs>` +
    `<circle cx="32" cy="32" r="31.5" fill="${INK}"/><circle cx="32" cy="32" r="29.5" fill="#fff"/><circle cx="32" cy="32" r="26.5" fill="${fill}"/>` +
    `<g transform="translate(14.5 14.5) scale(1.46)"><path d="${GLYPH[k]}" fill="none" stroke="${ink}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
}

const loadImg = (src: string) =>
  new Promise<HTMLImageElement | null>((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });

const BADGES: Partial<Record<ElKey, HTMLImageElement>> = {};
let badgesPromise: Promise<void> | null = null;
export function loadBadges() {
  if (!badgesPromise)
    badgesPromise = Promise.all(
      ELEMENTS.map(async ([k]) => {
        const im = await loadImg(badgeURL(k));
        if (im) BADGES[k] = im;
      }),
    ).then(() => {});
  return badgesPromise;
}

const FRAMES = new Map<
  string,
  Promise<{ img: HTMLImageElement | null; chip: { ink: string; label: string } }>
>();
export function loadFrame(vk: CatKey, el: ElKey, one: boolean, ab: boolean) {
  const key = `${vk}|${el}|${one}|${ab}`;
  let p = FRAMES.get(key);
  if (!p) {
    const { svg, chip } = frameSVG(vk, el, one, ab);
    p = loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)).then((img) => ({
      img,
      chip,
    }));
    FRAMES.set(key, p);
  }
  return p;
}

export const FONT_SPECS = [
  '800 50px "Saira Condensed"',
  '700 32px "Saira Condensed"',
  '700 14px "JetBrains Mono"',
  '500 13px "JetBrains Mono"',
  "400 16px Archivo",
  "italic 400 15px Archivo",
];
export function loadFonts() {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  return Promise.all(FONT_SPECS.map((f) => document.fonts.load(f).catch(() => {}))).then(() => {});
}

/* ---------------- disegno ---------------- */

type Ctx = CanvasRenderingContext2D;
const F = {
  name: (s: number) => `800 ${s}px "Saira Condensed"`,
  mono: (s: number, w = 700) => `${w} ${s}px "JetBrains Mono"`,
  body: (s: number, st = "") => `${st} 400 ${s}px Archivo`.trim(),
};
function fit(
  c: Ctx,
  text: string,
  font: (s: number) => string,
  size: number,
  maxW: number,
  min = 18,
) {
  let s = size;
  c.font = font(s);
  while (s > min && c.measureText(text).width > maxW) {
    s -= 1;
    c.font = font(s);
  }
  return s;
}
function wrap(c: Ctx, text: string, maxW: number) {
  const words = text.split(/\s+/).filter(Boolean),
    lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (c.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
function setSpacing(c: Ctx, px: number) {
  const anyC = c as unknown as { letterSpacing?: string };
  if ("letterSpacing" in (c as object)) anyC.letterSpacing = px + "px";
}
function spaced(c: Ctx, text: string, x: number, y: number, ls: number) {
  const hasLS = "letterSpacing" in (c as object);
  if (hasLS) {
    setSpacing(c, ls);
    c.textAlign = "center";
    c.fillText(text, x + ls / 2, y);
    setSpacing(c, 0);
    return;
  }
  const chars = [...text];
  const w = chars.reduce((a, ch) => a + c.measureText(ch).width, 0) + ls * (chars.length - 1);
  let cx = x - w / 2;
  c.textAlign = "left";
  for (const ch of chars) {
    c.fillText(ch, cx, y);
    cx += c.measureText(ch).width + ls;
  }
}

function drawArt(c: Ctx, art: ArtState, full: boolean) {
  if (!art.img) return;
  const b = full ? { x: 0, y: 0, w: CARD_W, h: CARD_H } : { x: 106, y: 176, w: 650, h: 465 };
  const sc = Math.max(b.w / art.img.width, b.h / art.img.height) * art.zoom;
  const w = art.img.width * sc,
    h = art.img.height * sc;
  const mx = (w - b.w) / 2,
    my = (h - b.h) / 2;
  art.px = Math.max(-mx, Math.min(mx, art.px));
  art.py = Math.max(-my, Math.min(my, art.py));
  c.save();
  c.beginPath();
  c.rect(b.x, b.y, b.w, b.h);
  c.clip();
  c.drawImage(art.img, b.x + (b.w - w) / 2 + art.px, b.y + (b.h - h) / 2 + art.py, w, h);
  c.restore();
}

function drawTexts(c: Ctx, d: CardData, chip: { ink: string; label: string }) {
  const cat = catOf(d.cat);
  const [, en, acc, bink] = elementOf(d.el);
  const full = cat.full,
    dark = d.cat === "rare";
  const one = d.mode === "one",
    ab = d.mode === "ab";
  const lay = layoutOf(full, one);
  const nameCol = full || dark ? "#FFFFFF" : INK;
  const hpCol = d.cat === "core" ? "#FFFFFF" : dark ? bink : INK;
  const lowCol = dark ? "#FFFFFF" : INK;
  c.textBaseline = "middle";

  // nome
  const name = d.name.trim();
  c.fillStyle = nameCol;
  c.textAlign = "left";
  fit(c, name, F.name, 50, 350, 24);
  c.fillText(name, 100, 128);
  // categoria
  c.fillStyle = chip.ink;
  c.font = F.name(23);
  spaced(c, chip.label, 529, 129, 2.5);
  // HP
  const hp = d.hp.trim();
  c.font = F.mono(13, 500);
  const w1 = c.measureText("HP").width;
  const ps = fit(c, hp, F.name, 40, 126 - w1 - 14, 20);
  const w2 = c.measureText(hp).width;
  const x0 = 693 - (w1 + 6 + w2) / 2;
  c.fillStyle = hpCol;
  c.textAlign = "left";
  c.font = F.mono(13, 500);
  c.fillText("HP", x0, 128);
  c.font = F.name(ps);
  c.fillText(hp, x0 + w1 + 6, 128);
  // banda
  c.fillStyle = bink;
  c.textAlign = "center";
  c.font = F.body(15, "italic");
  c.fillText(`Elemento ${en} · ${cat.n} · Creata con Vault Crafted`, 431, lay.band + 16.5);

  // mosse
  type M = [string, string, string, boolean];
  const M1: M = [d.m1, d.d1, d.t1, false],
    M2: M = [d.m2, d.d2, d.t2, false];
  const moves: M[] = ab ? [[d.abName, "", d.abText, true], M1] : one ? [M1] : [M1, M2];
  const SL = ab
    ? [
        { t: lay.top, h: 98 },
        { t: lay.top + 106, h: lay.h - 106 },
      ]
    : one
      ? [{ t: lay.top, h: lay.h }]
      : [
          { t: lay.top, h: 104 },
          { t: lay.top + 104, h: lay.h - 104 },
        ];
  let ds = 16;
  let blocks: { m: string; d: string; ab: boolean; lines: string[]; h: number; lh: number }[] = [];
  for (; ds >= 11; ds--) {
    c.font = F.body(ds);
    const lh = ds * 1.3;
    blocks = moves.map(([m, dd, t, a]) => {
      const lines = wrap(c, t.trim(), 618);
      return { m, d: dd, ab: a, lines, h: 38 + lines.length * lh, lh };
    });
    if (blocks.every((b, i) => b.h <= SL[i].h - 10)) break;
  }
  blocks.forEach((b, i) => {
    const top = SL[i].t + (SL[i].h - b.h) / 2;
    c.textAlign = "left";
    c.fillStyle = INK;
    c.font = F.name(32);
    const dW = c.measureText(b.d.trim()).width;
    let nx = 122;
    if (b.ab) {
      c.font = F.name(19);
      setSpacing(c, 1.5);
      const pw = c.measureText("ABILITÀ").width + 24;
      c.fillStyle = RED;
      c.beginPath();
      c.moveTo(130, top + 6);
      c.lineTo(122 + pw, top + 6);
      c.lineTo(122 + pw - 8, top + 32);
      c.lineTo(122, top + 32);
      c.closePath();
      c.fill();
      c.fillStyle = "#FFFFFF";
      c.textAlign = "center";
      c.fillText("ABILITÀ", 122 + pw / 2 + 2, top + 20);
      setSpacing(c, 0);
      c.textAlign = "left";
      c.fillStyle = RED;
      nx = 122 + pw + 12;
    }
    let ms = 32;
    c.font = `700 ${ms}px "Saira Condensed"`;
    while (ms > 20 && c.measureText(b.m.trim()).width > 740 - nx - dW - 20) {
      ms--;
      c.font = `700 ${ms}px "Saira Condensed"`;
    }
    c.fillText(b.m.trim(), nx, top + 19);
    c.fillStyle = INK;
    c.font = F.name(32);
    c.textAlign = "right";
    c.fillText(b.d.trim(), 740, top + 19);
    c.textAlign = "left";
    c.font = F.body(ds);
    b.lines.forEach((ln, j) => c.fillText(ln, 122, top + 38 + b.lh * j + b.lh / 2));
  });

  // caratteristiche
  const BS = 26,
    BY = 970;
  const cols: [string, ElKey[], string, number][] = [
    ["DEBOLEZZA", d.weak ? [d.weak] : [], d.weakV.trim(), 207],
    ["RESISTENZA", d.res ? [d.res] : [], d.resV.trim(), 431],
    ["RITIRATA", Array(d.retN).fill(d.ret), "", 655],
  ];
  for (const [label, icons, val, x] of cols) {
    c.fillStyle = lowCol;
    c.textAlign = "center";
    c.font = F.mono(12, 700);
    c.fillText(label, x, 947);
    if (!icons.length) {
      c.font = F.mono(14, 700);
      c.fillText("—", x, BY);
      continue;
    }
    c.font = F.name(24);
    const vw = val ? c.measureText(val).width + 7 : 0;
    const iw = icons.length * BS + (icons.length - 1) * 4;
    let cx = x - (iw + vw) / 2;
    for (const k of icons) {
      const im = BADGES[k];
      if (im) c.drawImage(im, cx, BY - BS / 2, BS, BS);
      cx += BS + 4;
    }
    if (val) {
      c.fillStyle = lowCol;
      c.textAlign = "left";
      c.fillText(val, cx + 3, BY + 1);
    }
  }

  // piede
  c.fillStyle = lowCol;
  const serial = d.serial == null ? "···" : String(d.serial).padStart(3, "0");
  const ed = d.edition == null ? "···" : String(d.edition);
  const ser = `N° ${serial} · ${ed}/${MAX_EDITION}`;
  c.textAlign = "left";
  c.font = F.mono(14, 700);
  c.fillText(ser, 110, 1031);
  const sw = c.measureText(ser).width;
  const motto = d.motto.trim();
  fit(c, motto, (s) => `italic 400 ${s}px Archivo`, 14, 690 - 110 - sw - 16, 10);
  c.fillText(motto, 110 + sw + 16, 1031);
  // sigillo: l'energia scelta (la V se l'icona non è ancora caricata)
  const seal = BADGES[d.el];
  if (seal) c.drawImage(seal, 726 - 21, 1031 - 21, 42, 42);
  else {
    c.fillStyle = "#FFC83D";
    c.textAlign = "center";
    c.font = F.name(26);
    c.fillText("V", 726, 1032);
  }
}

/** Disegna la carta completa (con abbondanza) sul contesto. */
export async function renderCard(c: Ctx, d: CardData, art: ArtState) {
  const [{ img, chip }] = await Promise.all([
    loadFrame(d.cat, d.el, d.mode === "one", d.mode === "ab"),
    loadBadges(),
  ]);
  c.clearRect(0, 0, CARD_W, CARD_H);
  drawArt(c, art, catOf(d.cat).full);
  if (img) c.drawImage(img, 0, 0, CARD_W, CARD_H);
  drawTexts(c, d, chip);
}

/* ---------------- esportazione PNG 300 dpi ---------------- */

const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc(b: Uint8Array) {
  let c = 0xffffffff;
  for (const x of b) c = CRC_T[(c ^ x) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
/** Aggiunge il chunk pHYs (300 dpi = 11811 px/m) a un PNG. */
export function with300dpi(buf: ArrayBuffer) {
  const src = new Uint8Array(buf),
    chunk = new Uint8Array(21),
    dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9);
  chunk.set([112, 72, 89, 115], 4);
  dv.setUint32(8, 11811);
  dv.setUint32(12, 11811);
  chunk[16] = 1;
  dv.setUint32(17, crc(chunk.subarray(4, 17)));
  const out = new Uint8Array(src.length + 21);
  out.set(src.subarray(0, 33));
  out.set(chunk, 33);
  out.set(src.subarray(33), 54);
  return out;
}
export async function exportPNG(d: CardData, art: ArtState) {
  const off = document.createElement("canvas");
  off.width = CARD_W;
  off.height = CARD_H;
  await renderCard(off.getContext("2d")!, d, art);
  const blob = await new Promise<Blob | null>((r) => off.toBlob(r, "image/png"));
  if (!blob) throw new Error("export");
  return new Blob([with300dpi(await blob.arrayBuffer())], { type: "image/png" });
}
