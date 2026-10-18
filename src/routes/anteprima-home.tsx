import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CardStage, STAGE_CSS } from "@/components/vault/CardStage";
import { EDITOR_CSS, FONTS_HREF, withSamples } from "@/components/vault/CardEditor";
import {
  CATS,
  ELEMENTS,
  loadFonts,
  type ArtState,
  type CardData,
  type CatKey,
  type ElKey,
} from "@/lib/vaultCard";
import { CUSTODIE, HOLO_PRICE, SPEDIZIONE } from "@/lib/vaultShop";

// Proposta della nuova home nello stile del configuratore. Non è collegata dal sito.
export const Route = createFileRoute("/anteprima-home")({
  component: HomePreview,
  head: () => ({
    meta: [
      { title: "Vault Crafted — Anteprima nuova home" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: FONTS_HREF },
    ],
  }),
});

const imageModules = import.meta.glob("@/assets/*.png", { eager: true }) as Record<
  string,
  { default: string }
>;
const REAL = Object.entries(imageModules)
  .map(([p, m]) => ({
    src: m.default,
    name: (p.split("/").pop() ?? "").replace(".png", "").replace(/_/g, " "),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
const pick = (n: string) => REAL.find((r) => r.name === n) ?? REAL[0];
const HERO = [pick("ETR"), pick("JAZ E BOBO"), pick("GRIME SPITTERZ")];

const euro = (n: number) => `€${n.toFixed(2).replace(".", ",").replace(",00", "")}`;

const STEPS = [
  {
    t: "Componi la carta",
    d: "Sul configuratore scegli categoria, elemento, attacchi e frase. Carichi la foto e la vedi prendere forma dal vivo.",
  },
  {
    t: "Ricevi la bozza",
    d: "Entro 24–48 ore ti mandiamo l'illustrazione disegnata a mano. Modifiche gratis finché non è perfetta.",
  },
  {
    t: "Arriva a casa tua",
    d: "Approvi, paghi, la stampiamo, numerata e sigillata. Spedizione tracciata in tutta Italia.",
  },
];

const FAQ = [
  [
    "Quanto tempo serve?",
    "Bozza entro 24–48 ore dall'ordine. Dopo l'approvazione e il pagamento la carta viene stampata e spedita in 3–4 giorni lavorativi; il corriere impiega circa 5–7 giorni.",
  ],
  [
    "Quando pago?",
    "Dopo aver approvato la bozza. Ti mandiamo il totale e le istruzioni via email: la stampa parte solo a pagamento ricevuto.",
  ],
  [
    "Posso chiedere modifiche?",
    "Sì, tutte quelle che vuoi prima di approvare la bozza, senza costi in più.",
  ],
  [
    "Che foto devo caricare?",
    "Una foto nitida e ben illuminata (almeno 1000×1000 px). Se non va bene te lo diciamo in fase di bozza.",
  ],
  [
    "Posso regalarla?",
    "Certo: metti l'indirizzo di chi la riceve e scrivici nelle note se vuoi una dedica o un pacchetto regalo.",
  ],
];

/** illustrazione segnaposto per le carte dimostrative */
function useDemoArt() {
  const art = useRef<ArtState>({ img: null, zoom: 1, px: 0, py: 0 });
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 900;
    c.height = 1200;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 900, 1200);
    gr.addColorStop(0, "#2B3570");
    gr.addColorStop(0.55, "#6C4DB3");
    gr.addColorStop(1, "#E8462A");
    g.fillStyle = gr;
    g.fillRect(0, 0, 900, 1200);
    for (let i = 0; i < 70; i++) {
      g.globalAlpha = Math.random() * 0.5;
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(Math.random() * 900, Math.random() * 1200, Math.random() * 4 + 1, 0, 6.3);
      g.fill();
    }
    g.globalAlpha = 0.9;
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.font = "800 64px 'Saira Condensed', sans-serif";
    g.fillText("LA TUA", 450, 560);
    g.fillText("ILLUSTRAZIONE", 450, 630);
    const im = new Image();
    im.onload = () => {
      art.current = { img: im, zoom: 1, px: 0, py: 0 };
      setV((x) => x + 1);
    };
    im.src = c.toDataURL("image/jpeg", 0.9);
  }, []);
  return [art, v] as const;
}

function HomePreview() {
  const [fonts, setFonts] = useState(0);
  const [art, artV] = useDemoArt();
  const [demo, setDemo] = useState<{ cat: CatKey; el: ElKey }>({ cat: "rare", el: "fuoco" });
  const [auto, setAuto] = useState(true);
  const [open, setOpen] = useState<number | null>(0);
  const [lb, setLb] = useState<number | null>(null);

  useEffect(() => {
    void loadFonts().then(() => setFonts((x) => x + 1));
  }, []);
  // la carta dimostrativa cambia da sola finché non la tocchi
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setDemo((d) => {
        const ci = CATS.findIndex((c) => c.k === d.cat);
        const ei = ELEMENTS.findIndex((e) => e[0] === d.el);
        return { cat: CATS[(ci + 1) % CATS.length].k, el: ELEMENTS[(ei + 1) % (ELEMENTS.length - 1)][0] };
      });
    }, 2600);
    return () => clearInterval(id);
  }, [auto]);

  const card: CardData = useMemo(
    () =>
      withSamples({
        cat: demo.cat,
        el: demo.el,
        mode: "two",
        name: "Il tuo nome",
        hp: "180",
        abName: "",
        abText: "",
        m1: "La tua mossa",
        d1: "60",
        t1: "Un'abitudine, una battuta, un ricordo che vi lega.",
        m2: "Colpo finale",
        d2: "120",
        t2: "Quella cosa che solo tu sai fare.",
        weak: "acqua",
        weakV: "×2",
        res: "",
        resV: "",
        ret: "vault",
        retN: 1,
        motto: "Un pezzo unico, come te.",
        serial: 1,
        edition: 1,
      }),
    [demo],
  );
  const minPrice = Math.min(...CATS.map((c) => c.price));
  const cases = CUSTODIE.filter((c) => c.img);

  return (
    <main className="vc-page hp">
      <style>{EDITOR_CSS + STAGE_CSS + HP_CSS}</style>

      <nav className="hp-nav">
        <Link to="/" className="vc-logo" aria-label="Vault Crafted">
          <img src="/LOGO.png" alt="Vault Crafted" />
        </Link>
        <div className="hp-links">
          <Link to="/carte">Le carte</Link>
          <Link to="/regalo">Regalo</Link>
          <Link to="/chi-siamo">Chi siamo</Link>
          <Link to="/crea" className="vc-btn">
            Crea la tua carta
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hp-hero">
        <div className="hp-hero-txt">
          <p className="vc-kicker">CARTE DA COLLEZIONE · DISEGNATE A MANO</p>
          <h1>
            La tua storia,
            <br />
            <em>in una carta.</em>
          </h1>
          <p className="hp-lead">
            Ci mandi una foto, la disegniamo a mano e la stampiamo come una vera carta da
            collezione: numerata, unica, solo tua.
          </p>
          <div className="hp-cta">
            <Link to="/crea" className="vc-btn vc-btn-big">
              Crea la tua carta →
            </Link>
            <span>
              da <b>{euro(minPrice)}</b> · bozza in 24–48 ore
            </span>
          </div>
          <ul className="hp-ticks">
            <li>Zero template</li>
            <li>Modifiche gratis</li>
            <li>Paghi dopo la bozza</li>
          </ul>
        </div>
        <div className="vc-stage hp-fan" aria-label="Alcune carte che abbiamo realizzato">
          <div className="vc-aura" aria-hidden>
            <i />
            <i />
            <i />
          </div>
          <div className="vc-rays" aria-hidden />
          <div className="vc-halo" aria-hidden />
          {HERO.map((c, i) => (
            <img key={c.name} src={c.src} alt={`Carta ${c.name}`} className={`hp-fc hp-fc${i}`} />
          ))}
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="hp-sec">
        <p className="vc-kicker">COME FUNZIONA</p>
        <h2>Tre passi, una carta tua.</h2>
        <div className="hp-steps">
          {STEPS.map((s, i) => (
            <div className="hp-step" key={s.t}>
              <span>0{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORMATO VAULT */}
      <section className="hp-sec hp-format">
        <div className="hp-format-stage" onPointerDown={() => setAuto(false)}>
          <CardStage data={card} art={art} artVersion={artV} fontsVersion={fonts} />
        </div>
        <div>
          <p className="vc-kicker">IL FORMATO VAULT</p>
          <h2>Cinque categorie, nove elementi.</h2>
          <p className="hp-lead">
            Ogni carta nasce nel nostro formato: cornice, colori ed effetti cambiano con la
            categoria e l'elemento che scegli. Provale qui, poi componi la tua.
          </p>
          <div className="hp-cats">
            {CATS.map((c) => (
              <button
                key={c.k}
                type="button"
                aria-pressed={demo.cat === c.k}
                onClick={() => {
                  setAuto(false);
                  setDemo({ ...demo, cat: c.k });
                }}
              >
                <b>{c.n}</b>
                <span>{euro(c.price)}</span>
              </button>
            ))}
          </div>
          <div className="hp-els">
            {ELEMENTS.map(([k, n, col]) => (
              <button
                key={k}
                type="button"
                title={n}
                aria-label={n}
                aria-pressed={demo.el === k}
                style={{ ["--c" as string]: col }}
                onClick={() => {
                  setAuto(false);
                  setDemo({ ...demo, el: k });
                }}
              />
            ))}
          </div>
          <p className="vc-hint">
            {CATS.find((c) => c.k === demo.cat)?.hint} Spedizione {euro(SPEDIZIONE)}, pellicola
            olografica +{euro(HOLO_PRICE)}.
          </p>
          <Link to="/crea" className="vc-btn vc-btn-big" style={{ marginTop: 18 }}>
            Apri il configuratore →
          </Link>
        </div>
      </section>

      {/* GALLERIA */}
      <section className="hp-sec">
        <p className="vc-kicker">DAL VAULT</p>
        <h2>Alcune carte che abbiamo fatto.</h2>
        <div className="hp-gallery">
          {REAL.map((c, i) => (
            <button key={c.name} type="button" onClick={() => setLb(i)} aria-label={`Ingrandisci ${c.name}`}>
              <img src={c.src} alt={`Carta ${c.name}`} loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      {/* CUSTODIE */}
      <section className="hp-sec">
        <p className="vc-kicker">PROTEGGILA, METTILA IN MOSTRA</p>
        <h2>Custodie e pellicola olografica.</h2>
        <div className="hp-cases">
          {cases.map((c) => (
            <figure key={c.id}>
              <img src={c.img} alt={c.label} loading="lazy" />
              <figcaption>
                {c.label} <b>+{euro(c.price)}</b>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="hp-sec hp-faq">
        <p className="vc-kicker">DOMANDE</p>
        <h2>Quello che ci chiedono di più.</h2>
        {FAQ.map(([q, a], i) => (
          <div className="hp-q" key={q}>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              {q}
              <span aria-hidden>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p>{a}</p>}
          </div>
        ))}
      </section>

      {/* CTA FINALE */}
      <section className="hp-final">
        <h2>Pronta per entrare nel Vault?</h2>
        <p>Ci vogliono cinque minuti. La bozza arriva entro due giorni.</p>
        <Link to="/crea" className="vc-btn vc-btn-big">
          Crea la tua carta →
        </Link>
      </section>

      <footer className="hp-foot">
        <span>© Vault Crafted · carte da collezione disegnate a mano</span>
        <span>
          <Link to="/termini">Termini</Link> · <a href="https://wa.me/393332876277">WhatsApp</a> ·{" "}
          <a href="https://instagram.com/vault_crafted">Instagram</a>
        </span>
      </footer>

      {lb != null && (
        <div className="vc-lightbox" role="dialog" aria-modal="true" onClick={() => setLb(null)}>
          <img src={REAL[lb].src} alt={`Carta ${REAL[lb].name}`} style={{ maxHeight: "86vh", borderRadius: 14 }} />
        </div>
      )}
    </main>
  );
}

const HP_CSS = `
.hp{padding-bottom:0}
.hp .vc-btn-big{width:auto;margin-top:0;padding:16px 30px}
.hp h2{margin:4px 0 18px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(32px,4.4vw,52px);line-height:1}
.hp-nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 24px;background:#141A3A}
.hp-links{display:flex;align-items:center;gap:20px}
.hp-links a:not(.vc-btn){color:#C9CEE3;text-decoration:none;font-weight:600;font-size:14px}
.hp-links a:not(.vc-btn):hover{color:#fff}
.hp-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:40px;align-items:center;max-width:1400px;margin:0 auto;padding:40px 24px 30px}
.hp-hero h1{margin:8px 0 16px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(52px,7vw,104px);line-height:.9;letter-spacing:-.01em}
.hp-hero h1 em{font-style:normal;background:linear-gradient(90deg,#E8462A,#E2A917 45%,#1F86D6);-webkit-background-clip:text;background-clip:text;color:transparent}
.hp-lead{font-size:18px;line-height:1.5;color:var(--muted);max-width:520px;margin:0 0 22px}
.hp-cta{display:flex;flex-wrap:wrap;align-items:center;gap:16px}
.hp-cta span{color:var(--muted)}
.hp-cta b{color:var(--ink);font-family:'Saira Condensed',sans-serif;font-size:22px}
.hp-ticks{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0;margin:22px 0 0}
.hp-ticks li{background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 12px;font-size:13px;font-weight:600}
.hp-ticks li::before{content:"✓ ";color:#127A4B}
.hp-fan{height:min(76vh,680px);min-height:460px}
.hp-fc{position:absolute;z-index:2;width:min(46%,300px);border-radius:14px;box-shadow:0 30px 60px -20px rgba(10,14,40,.55);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.hp-fc0{transform:translateX(-58%) rotate(-11deg) translateY(16px)}
.hp-fc2{transform:translateX(58%) rotate(11deg) translateY(16px)}
.hp-fc1{z-index:3;transform:translateY(-6px);animation:hpfloat 6s ease-in-out infinite}
.hp-fan:hover .hp-fc0{transform:translateX(-76%) rotate(-15deg) translateY(10px)}
.hp-fan:hover .hp-fc2{transform:translateX(76%) rotate(15deg) translateY(10px)}
@keyframes hpfloat{50%{transform:translateY(-18px)}}
.hp-sec{max-width:1400px;margin:0 auto;padding:56px 24px 10px}
.hp-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.hp-step{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px}
.hp-step span{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:12px;background:var(--ink);color:#fff;border-radius:6px;padding:3px 7px}
.hp-step h3{margin:14px 0 6px;font-family:'Saira Condensed',sans-serif;font-size:28px}
.hp-step p{margin:0;color:var(--muted);line-height:1.5}
.hp-format{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:40px;align-items:center}
.hp-format-stage .vc-stage{height:min(80vh,760px);min-height:520px}
.hp-format-stage .vc-card{width:min(100%,calc(min(80vh,760px) * 0.66),480px)}
.hp-cats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:8px 0 12px}
.hp-cats button{font:inherit;cursor:pointer;background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:10px 4px;display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--ink)}
.hp-cats b{font-family:'Saira Condensed',sans-serif;font-size:19px}
.hp-cats span{font-size:13px;color:var(--muted)}
.hp-cats button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:#fff}
.hp-cats button[aria-pressed=true] span{color:#C9CEE3}
.hp-els{display:flex;flex-wrap:wrap;gap:8px}
.hp-els button{width:34px;height:34px;border-radius:50%;cursor:pointer;background:var(--c);border:3px solid #fff;box-shadow:0 0 0 1.5px var(--line)}
.hp-els button[aria-pressed=true]{box-shadow:0 0 0 2.5px var(--ink)}
.hp-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
.hp-gallery button{padding:0;border:0;background:none;cursor:zoom-in;border-radius:12px;overflow:hidden;transition:transform .2s}
.hp-gallery button:hover{transform:translateY(-4px) rotate(-1deg)}
.hp-gallery img{width:100%;display:block;aspect-ratio:945/1240;object-fit:cover}
.hp-cases{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.hp-cases figure{margin:0;background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.hp-cases img{width:100%;display:block;aspect-ratio:4/3;object-fit:cover}
.hp-cases figcaption{padding:10px 14px;font-weight:600;font-size:14px;display:flex;justify-content:space-between}
.hp-faq{max-width:900px}
.hp-q{border-bottom:1px solid var(--line)}
.hp-q button{width:100%;display:flex;justify-content:space-between;gap:12px;font:inherit;font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:22px;background:none;border:0;color:var(--ink);padding:16px 0;cursor:pointer;text-align:left}
.hp-q p{margin:0 0 16px;color:var(--muted);line-height:1.55}
.hp-final{margin:60px 24px 0;border-radius:28px;background:radial-gradient(120% 120% at 50% 0%,#2B3570,#141A3A 70%);color:#fff;text-align:center;padding:60px 24px}
.hp-final h2{color:#fff}
.hp-final p{color:#C9CEE3;margin:0 0 22px}
.hp-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;max-width:1400px;margin:0 auto;padding:26px 24px 34px;color:var(--muted);font-size:13px}
.hp-foot a{color:var(--ink)}
@media (max-width:900px){
  .hp-links a:not(.vc-btn){display:none}
  .hp-hero,.hp-format{grid-template-columns:1fr;gap:22px}
  .hp-hero{padding:24px 16px}
  .hp-fan{height:420px;min-height:0}
  .hp-sec{padding:40px 16px 6px}
  .hp-steps{grid-template-columns:1fr}
  .hp-format-stage .vc-stage{height:520px;min-height:0}
  .hp-cats{grid-template-columns:repeat(3,minmax(0,1fr))}
  .hp-final{margin:40px 16px 0}
  .hp .vc-btn-big{width:100%}
}
`;
