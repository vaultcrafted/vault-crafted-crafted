import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CardStage, STAGE_CSS } from "@/components/vault/CardStage";
import { EDITOR_CSS, FONTS_HREF, withSamples } from "@/components/vault/CardEditor";
import { HOLO_CSS, HoloCard } from "@/components/vault/home/HoloCard";
import { Nebula, Sparks } from "@/components/vault/home/Nebula";
import {
  CATS,
  ELEMENTS,
  elementOf,
  loadFonts,
  type ArtState,
  type CardData,
  type CatKey,
  type ElKey,
} from "@/lib/vaultCard";
import { CUSTODIE, HOLO_PRICE, SPEDIZIONE } from "@/lib/vaultShop";

// Proposta della nuova home: cinematografica, scura, con effetti. Non è collegata dal sito.
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

const FILES =
  "azzurra colle-der-fomento danno diego-vallino dj-craim epcoraw etr fabri-fibra gemitaiz gino grime-spitterz haxo ikb jaz-e-bobo kurolily laura-massei lazza lincio mattak matteo-iuliani mirko-gardoni omega-riot pipino-il-breve poppi prodest ric-de-large riccardo-salomoni warcard".split(
    " ",
  );
const CARDS = FILES.map((f) => ({
  src: `/carte/${f}.webp`,
  name: f.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));
const byName = (f: string) => CARDS[FILES.indexOf(f)] ?? CARDS[0];
const HERO = ["jaz-e-bobo", "etr", "kurolily", "grime-spitterz", "ikb", "diego-vallino"].map(byName);
const HERO_GLOW = ["#E8462A", "#F5C518", "#E2A917", "#3FB58A", "#D7262E", "#1F86D6"];

const euro = (n: number) => `€${n.toFixed(2).replace(".", ",").replace(",00", "")}`;

const STEPS = [
  ["Componi", "Sul configuratore scegli categoria, elemento, attacchi e frase. Carichi la foto e la carta prende forma dal vivo."],
  ["Bozza", "Entro 24–48 ore ricevi l'illustrazione disegnata a mano. Modifiche gratis finché non è perfetta."],
  ["Nel Vault", "Approvi e paghi: la stampiamo, numerata e sigillata, e parte con corriere tracciato."],
];
const FAQ = [
  ["Quanto tempo serve?", "Bozza entro 24–48 ore. Dopo approvazione e pagamento la carta viene stampata e spedita in 3–4 giorni lavorativi; il corriere impiega circa 5–7 giorni."],
  ["Quando pago?", "Dopo aver approvato la bozza: ti mandiamo il totale e le istruzioni via email. La stampa parte solo a pagamento ricevuto."],
  ["Posso chiedere modifiche?", "Tutte quelle che vuoi prima di approvare, senza costi in più."],
  ["Che foto serve?", "Una foto nitida e ben illuminata, almeno 1000×1000 px. Se non va bene te lo diciamo in fase di bozza."],
  ["Posso regalarla?", "Certo: metti l'indirizzo di chi la riceve e scrivici nelle note se vuoi una dedica."],
];

/** aggiunge .in agli elementi .rv quando entrano nello schermo */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".rv");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.18 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

/** avanzamento 0→1 di una sezione mentre la si scorre */
function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = r.height - innerHeight;
        setP(Math.max(0, Math.min(1, -r.top / Math.max(1, total))));
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
    };
  }, [ref]);
  return p;
}

function useDemoArt() {
  const art = useRef<ArtState>({ img: null, zoom: 1, px: 0, py: 0 });
  const [v, setV] = useState(0);
  useEffect(() => {
    // ritaglia solo l'illustrazione dalla carta di esempio
    const src = new Image();
    src.onload = () => {
      const c = document.createElement("canvas");
      c.width = 600;
      c.height = 460;
      c.getContext("2d")!.drawImage(src, 60, 95, 600, 460, 0, 0, 600, 460);
      const im = new Image();
      im.onload = () => {
        art.current = { img: im, zoom: 1, px: 0, py: 0 };
        setV((x) => x + 1);
      };
      im.src = c.toDataURL("image/jpeg", 0.92);
    };
    src.src = "/carte/jaz-e-bobo.webp";
  }, []);
  return [art, v] as const;
}

function HomePreview() {
  useReveal();
  const [heroI, setHeroI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [fonts, setFonts] = useState(0);
  const [art, artV] = useDemoArt();
  const [demo, setDemo] = useState<{ cat: CatKey; el: ElKey }>({ cat: "fullart", el: "fuoco" });
  const [auto, setAuto] = useState(true);
  const [open, setOpen] = useState<number | null>(0);
  const [lb, setLb] = useState<number | null>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const stepsP = useScrollProgress(stepsRef);

  useEffect(() => {
    void loadFonts().then(() => setFonts((x) => x + 1));
    const imgs = CARDS.map((c) => {
      const i = new Image();
      i.src = c.src;
      return i;
    });
    return () => void imgs;
  }, []);
  // la carta dell'apertura si gira e cambia ogni pochi secondi
  useEffect(() => {
    const id = setInterval(() => {
      setFlip(true);
      setTimeout(() => {
        setHeroI((i) => (i + 1) % HERO.length);
        setFlip(false);
      }, 420);
    }, 4200);
    return () => clearInterval(id);
  }, []);
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
        hp: "200",
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
  const heroAcc = HERO_GLOW[heroI];
  const cases = CUSTODIE.filter((c) => c.img);


  return (
    <main className="hx">
      <style>{EDITOR_CSS + STAGE_CSS + HOLO_CSS + HX_CSS}</style>

      <nav className="hx-nav">
        <Link to="/" aria-label="Vault Crafted">
          <img src="/LOGO.png" alt="Vault Crafted" />
        </Link>
        <div className="hx-links">
          <Link to="/carte">Le carte</Link>
          <Link to="/regalo">Regalo</Link>
          <Link to="/chi-siamo">Chi siamo</Link>
          <Link to="/crea" className="hx-btn sm">
            Crea la tua carta
          </Link>
        </div>
      </nav>

      {/* ========== APERTURA ========== */}
      <section className="hx-hero">
        <Nebula accent={heroAcc} rays={0.5} />
        <Sparks accent={heroAcc} count={90} />
        <div className="hx-hero-in">
          <div className="hx-hero-txt">
            <p className="hx-kick">
              <span /> Carte da collezione · disegnate a mano
            </p>
            <h1>
              <span className="w" style={{ animationDelay: ".1s" }}>Ogni</span>{" "}
              <span className="w" style={{ animationDelay: ".2s" }}>storia</span>
              <br />
              <span className="w" style={{ animationDelay: ".3s" }}>merita una</span>
              <br />
              <span className="w hx-shine" style={{ animationDelay: ".45s" }}>
                carta rara.
              </span>
            </h1>
            <p className="hx-lead w" style={{ animationDelay: ".65s" }}>
              Ci mandi una foto, la disegniamo a mano e la stampiamo come una vera carta da
              collezione. Numerata, unica, solo tua.
            </p>
            <div className="hx-cta w" style={{ animationDelay: ".8s" }}>
              <Link to="/crea" className="hx-btn">
                Crea la tua carta <b>→</b>
              </Link>
              <span>
                da <b>{euro(minPrice)}</b> · paghi dopo la bozza
              </span>
            </div>
          </div>
          <div className="hx-hero-card" style={{ ["--glow" as string]: heroAcc }}>
            <div className={`hx-flip${flip ? " out" : ""}`}>
              <HoloCard src={HERO[heroI].src} alt={`Carta ${HERO[heroI].name}`} foil={0.7} />
            </div>
            <div className="hx-shadow" aria-hidden />
          </div>
        </div>
        <div className="hx-scroll" aria-hidden>
          <span />
        </div>
      </section>

      {/* ========== COME FUNZIONA ========== */}
      <section className="hx-steps" ref={stepsRef}>
        <div className="hx-wrap">
          <p className="hx-kick rv">
            <span /> Come funziona
          </p>
          <h2 className="rv">
            Tre passi. <em>Una carta tua.</em>
          </h2>
          <div className="hx-steps-row">
            <div className="hx-line" aria-hidden>
              <i style={{ transform: `scaleX(${Math.min(1, stepsP * 1.6)})` }} />
            </div>
            {STEPS.map(([t, d], i) => (
              <div className="hx-step rv" key={t} style={{ transitionDelay: `${i * 0.15}s` }}>
                <span className={stepsP * 1.6 > i / 2.2 ? "lit" : ""}>0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FORMATO VAULT ========== */}
      <section className="hx-format">
        <div className="hx-wrap hx-format-in">
          <div className="hx-format-stage rv" onPointerDown={() => setAuto(false)}>
            <CardStage data={card} art={art} artVersion={artV} fontsVersion={fonts} />
          </div>
          <div className="rv">
            <p className="hx-kick">
              <span /> Il formato Vault
            </p>
            <h2>
              Cinque categorie. <em>Nove elementi.</em>
            </h2>
            <p className="hx-lead">
              Cornice, colori ed effetti cambiano con quello che scegli. Provale qui: è la stessa
              carta che componi nel configuratore.
            </p>
            <div className="hx-cats">
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
            <div className="hx-els">
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
              <span>{elementOf(demo.el)[1]}</span>
            </div>
            <Link to="/crea" className="hx-btn" style={{ marginTop: 22 }}>
              Componi la tua <b>→</b>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== OLOGRAFICA + CUSTODIE ========== */}
      <section className="hx-holo-sec">
        <div className="hx-wrap hx-holo-in2">
          <div className="rv">
            <p className="hx-kick">
              <span /> Extra
            </p>
            <h2>
              Pellicola <em className="hx-rainbow">olografica.</em>
            </h2>
            <p className="hx-lead">
              Riflessi arcobaleno che cambiano a ogni movimento, come le carte più rare. Passaci
              sopra col mouse. <b>+{euro(HOLO_PRICE)}</b>
            </p>
            <div className="hx-cases">
              {cases.map((c) => (
                <figure key={c.id}>
                  <img src={c.img} alt={c.label} loading="lazy" />
                  <figcaption>
                    {c.label}
                    <b>+{euro(c.price)}</b>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="hx-note">Spedizione tracciata in tutta Italia {euro(SPEDIZIONE)}.</p>
          </div>
          <div className="hx-holo-big rv" style={{ ["--glow" as string]: "#b25cff" }}>
            <HoloCard src={byName("omega-riot").src} alt="Carta con pellicola olografica" foil={1} />
          </div>
        </div>
      </section>

      {/* ========== MARQUEE ========== */}
      <section className="hx-marq" aria-label="Galleria delle carte">
        {[0, 1].map((row) => (
          <div key={row} className={`hx-marq-row${row ? " rev" : ""}`}>
            <div>
              {[...CARDS.slice(row * 14, row * 14 + 14), ...CARDS.slice(row * 14, row * 14 + 14)].map((c, i) => (
                <button key={i} type="button" onClick={() => setLb(CARDS.indexOf(c))} aria-label={`Ingrandisci ${c.name}`}>
                  <img src={c.src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ========== FAQ ========== */}
      <section className="hx-faq">
        <div className="hx-wrap" style={{ maxWidth: 900 }}>
          <p className="hx-kick rv">
            <span /> Domande
          </p>
          <h2 className="rv">Prima di entrare.</h2>
          {FAQ.map(([q, a], i) => (
            <div className={`hx-q${open === i ? " open" : ""}`} key={q}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {q}
                <span aria-hidden>+</span>
              </button>
              <div className="hx-a">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== FINALE ========== */}
      <section className="hx-final">
        <Nebula accent="#6C4DB3" rays={0.8} />
        <Sparks accent="#C9CEE3" count={90} />
        <div className="hx-final-in rv">
          <h2>
            Entra nel <em className="hx-shine">Vault.</em>
          </h2>
          <p>Cinque minuti per comporla. Due giorni per la bozza. Per sempre tua.</p>
          <Link to="/crea" className="hx-btn big">
            Crea la tua carta <b>→</b>
          </Link>
        </div>
      </section>

      <footer className="hx-foot">
        <img src="/LOGO.png" alt="Vault Crafted" />
        <span>Carte da collezione disegnate a mano · Livorno Ferraris (VC)</span>
        <span>
          <Link to="/termini">Termini</Link> · <a href="https://wa.me/393332876277">WhatsApp</a> ·{" "}
          <a href="https://www.instagram.com/vault_crafted">Instagram</a>
        </span>
      </footer>

      {lb != null && (
        <div className="hx-lb" role="dialog" aria-modal="true" onClick={() => setLb(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(80vw, 56vh)" }}>
            <HoloCard src={CARDS[lb].src} alt={`Carta ${CARDS[lb].name}`} foil={0.8} />
          </div>
          <button type="button" aria-label="Chiudi" onClick={() => setLb(null)}>
            ✕
          </button>
        </div>
      )}
    </main>
  );
}

const HX_CSS = `
.hx{--ink:#F4F1E8;--muted:#A7AEC9;--gold:#E2A917;--acc:#C9CEE3;--bg:#070A1F;background:var(--bg);color:var(--ink);font-family:Archivo,system-ui,sans-serif;overflow-x:clip}
.hx h2{margin:6px 0 18px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(40px,6vw,84px);line-height:.92;letter-spacing:-.01em}
.hx h2 em,.hx h1 em{font-style:normal;color:var(--muted)}
.hx-wrap{max-width:1360px;margin:0 auto;padding:0 28px}
.hx-kick{display:flex;align-items:center;gap:10px;margin:0;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}
.hx-kick span{width:26px;height:1px;background:currentColor}
.hx-lead{font-size:clamp(16px,1.4vw,19px);line-height:1.55;color:var(--muted);max-width:560px;margin:0 0 24px}
.hx-lead b{color:var(--ink)}
.hx-btn{display:inline-flex;align-items:center;gap:12px;background:#F4F1E8;color:#0B0F2A;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:21px;letter-spacing:.03em;text-transform:uppercase;text-decoration:none;padding:15px 28px;border-radius:999px;box-shadow:0 10px 30px -12px rgba(0,0,0,.6);transition:transform .2s,background .2s}
.hx-btn:hover{transform:translateY(-2px);background:#fff}
.hx-btn b{transition:transform .2s}.hx-btn:hover b{transform:translateX(4px)}
.hx-btn.sm{font-size:16px;padding:10px 18px}
.hx-btn.big{font-size:clamp(22px,2.4vw,30px);padding:20px 40px}
.hx-nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:linear-gradient(180deg,rgba(7,10,31,.85),rgba(7,10,31,0));backdrop-filter:blur(2px)}
.hx-nav img{height:36px;display:block}
.hx-links{display:flex;align-items:center;gap:24px}
.hx-links a:not(.hx-btn){color:#D4D8EA;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:.04em}
.hx-links a:not(.hx-btn):hover{color:#fff}
.hx-nebula{position:absolute;inset:0;width:100%;height:100%;display:block}
.hx-nebula.dim{opacity:.55}
.hx-sparks{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
/* apertura */
.hx-hero{position:relative;min-height:100svh;display:flex;align-items:center;overflow:hidden}
.hx-hero-in{position:relative;z-index:3;width:100%;max-width:1400px;margin:0 auto;padding:110px 28px 80px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:30px;align-items:center}
.hx-hero h1{margin:16px 0 22px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(58px,8.6vw,138px);line-height:.86;letter-spacing:-.015em;text-transform:uppercase;text-shadow:0 10px 50px rgba(0,0,0,.5)}
.hx .w{display:inline-block;opacity:0;transform:translateY(40px) rotate(2deg);filter:blur(10px);animation:hxin .9s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes hxin{to{opacity:1;transform:none;filter:none}}
.hx-shine{background:linear-gradient(100deg,#9AA3C7 0%,#F4F1E8 30%,#fff 40%,#C9CEE3 55%,#9AA3C7 80%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent !important;animation:hxin .9s cubic-bezier(.2,.8,.2,1) forwards,hxshine 4s linear 1.2s infinite}
@keyframes hxshine{to{background-position:-250% 0}}
.hx-cta{display:flex;flex-wrap:wrap;align-items:center;gap:20px}
.hx-cta span{color:var(--muted)}
.hx-cta span b{color:var(--ink);font-family:'Saira Condensed',sans-serif;font-size:24px}
.hx-hero-card{position:relative;justify-self:center;width:min(100%,430px);animation:hxfloat 6s ease-in-out infinite}
.hx-hero-card .hx-holo-in{box-shadow:0 50px 100px -30px rgba(0,0,0,.9)}
.hx-flip{transition:transform .42s cubic-bezier(.5,0,.5,1),opacity .42s,filter .42s}
.hx-flip.out{transform:rotateY(90deg) scale(.92);opacity:.2;filter:brightness(2)}
.hx-shadow{position:absolute;left:12%;right:12%;bottom:-46px;height:30px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.6),transparent);filter:blur(6px)}
@keyframes hxfloat{50%{transform:translateY(-16px)}}
.hx-scroll{position:absolute;z-index:3;left:50%;bottom:24px;width:26px;height:42px;border:2px solid rgba(255,255,255,.4);border-radius:14px;transform:translateX(-50%)}
.hx-scroll span{position:absolute;left:50%;top:8px;width:4px;height:8px;margin-left:-2px;border-radius:2px;background:#fff;animation:hxdot 1.6s ease-in-out infinite}
@keyframes hxdot{60%{transform:translateY(14px);opacity:0}}
@keyframes hxmarq{to{transform:translateX(-50%)}}
/* passi */
.hx-steps{position:relative;padding:120px 0 80px;background:radial-gradient(80% 60% at 50% 0%,rgba(108,77,179,.25),transparent 70%)}
.hx-steps-row{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin-top:40px}
.hx-line{position:absolute;left:40px;right:40px;top:44px;height:2px;background:rgba(255,255,255,.1)}
.hx-line i{position:absolute;inset:0;transform-origin:left;background:linear-gradient(90deg,#F4F1E8,#9AA3C7)}
.hx-step{position:relative;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:24px 26px 28px;backdrop-filter:blur(6px)}
.hx-step span{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:50%;background:#0D1233;border:2px solid rgba(255,255,255,.2);font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--muted);transition:all .4s}
.hx-step span.lit{border-color:#F4F1E8;color:#0B0F2A;background:#F4F1E8}
.hx-step h3{margin:18px 0 8px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:38px;text-transform:uppercase}
.hx-step p{margin:0;color:var(--muted);line-height:1.55}
/* formato */
.hx-format{padding:60px 0 100px}
.hx-format-in{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:56px;align-items:center}
.hx-format-stage .vc-stage{height:min(84vh,780px);min-height:520px;border-radius:28px;box-shadow:0 0 0 1px rgba(255,255,255,.1),0 40px 120px -40px rgba(108,77,179,.8)}
.hx-format-stage .vc-card{width:min(100%,calc(min(84vh,780px) * .66),500px)}
.hx-cats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:6px 0 16px}
.hx-cats button{font:inherit;cursor:pointer;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.14);border-radius:14px;padding:12px 4px;display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--ink);transition:all .2s}
.hx-cats button:hover{border-color:rgba(255,255,255,.4)}
.hx-cats b{font-family:'Saira Condensed',sans-serif;font-size:21px}
.hx-cats span{font-size:13px;color:var(--muted)}
.hx-cats button[aria-pressed=true]{background:#F4F1E8;border-color:#F4F1E8;color:#0B0F2A}
.hx-cats button[aria-pressed=true] span{color:#5A5D6B}
.hx-els{display:flex;flex-wrap:wrap;align-items:center;gap:9px}
.hx-els button{width:34px;height:34px;border-radius:50%;cursor:pointer;background:var(--c);border:3px solid #0D1233;box-shadow:0 0 0 1.5px rgba(255,255,255,.2);transition:transform .2s,box-shadow .2s}
.hx-els button:hover{transform:scale(1.15)}
.hx-els button[aria-pressed=true]{box-shadow:0 0 0 2.5px #fff,0 0 22px var(--c);transform:scale(1.12)}
.hx-els span{margin-left:6px;font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:20px}
/* olografica */
.hx-holo-sec{padding:80px 0;background:radial-gradient(60% 70% at 80% 50%,rgba(178,92,255,.22),transparent 70%)}
.hx-holo-in2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.8fr);gap:56px;align-items:center}
.hx-rainbow{background:linear-gradient(90deg,#ff2d6f,#ffd23f,#3dffb5,#3dc8ff,#b25cff,#ff2d6f);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent !important;animation:hxshine 5s linear infinite}
.hx-holo-big{width:min(100%,420px);justify-self:center}
.hx-cases{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}
.hx-cases figure{margin:0;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}
.hx-cases img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.hx-cases figcaption{display:flex;justify-content:space-between;gap:6px;padding:8px 10px;font-size:13px;font-weight:600}
.hx-cases figcaption b{color:var(--ink)}
.hx-note{color:var(--muted);font-size:14px;margin:14px 0 0}
/* marquee */
.hx-marq{padding:40px 0 90px;display:flex;flex-direction:column;gap:18px}
.hx-marq-row{overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.hx-marq-row>div{display:flex;gap:18px;width:max-content;animation:hxmarq 70s linear infinite}
.hx-marq-row.rev>div{animation-direction:reverse;animation-duration:80s}
.hx-marq-row:hover>div{animation-play-state:paused}
.hx-marq button{padding:0;border:0;background:none;cursor:zoom-in;border-radius:12px;overflow:hidden;transition:transform .3s,box-shadow .3s}
.hx-marq button:hover{transform:translateY(-8px) scale(1.04);box-shadow:0 24px 50px -20px rgba(0,0,0,.8)}
.hx-marq img{display:block;height:clamp(200px,22vw,300px);width:auto}
/* faq */
.hx-faq{padding:40px 0 100px}
.hx-q{border-bottom:1px solid rgba(255,255,255,.12)}
.hx-q button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:12px;font:inherit;font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:26px;background:none;border:0;color:var(--ink);padding:20px 0;cursor:pointer;text-align:left}
.hx-q button span{font-size:30px;color:var(--muted);transition:transform .3s}
.hx-q.open button span{transform:rotate(45deg)}
.hx-a{display:grid;grid-template-rows:0fr;transition:grid-template-rows .35s}
.hx-q.open .hx-a{grid-template-rows:1fr}
.hx-a p{overflow:hidden;margin:0;color:var(--muted);line-height:1.6;font-size:17px}
.hx-q.open .hx-a p{padding-bottom:20px}
/* finale */
.hx-final{position:relative;min-height:80vh;display:grid;place-items:center;overflow:hidden;text-align:center}
.hx-final-in{position:relative;z-index:3;padding:80px 24px}
.hx-final h2{font-size:clamp(64px,11vw,180px);text-transform:uppercase;margin:0 0 12px}
.hx-final p{color:#D4D8EA;font-size:clamp(17px,1.6vw,21px);margin:0 0 34px}
.hx-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;max-width:1360px;margin:0 auto;padding:30px 28px 40px;color:var(--muted);font-size:13px;border-top:1px solid rgba(255,255,255,.08)}
.hx-foot img{height:30px}
.hx-foot a{color:var(--ink)}
/* lightbox */
.hx-lb{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:rgba(4,6,20,.88);backdrop-filter:blur(8px);animation:hxfade .25s}
.hx-lb>button{position:absolute;top:18px;right:22px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;font-size:18px;cursor:pointer}
@keyframes hxfade{from{opacity:0}}
/* comparsa allo scorrimento */
.rv{opacity:0;transform:translateY(50px);transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1)}
.rv.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.rv{opacity:1;transform:none}.hx .w{animation:none;opacity:1;transform:none;filter:none}}
@media (max-width:900px){
  .hx-links a:not(.hx-btn){display:none}
  .hx-nav{padding:12px 16px}
  .hx-wrap{padding:0 18px}
  .hx-hero-in{grid-template-columns:1fr;padding:96px 18px 70px;text-align:left}
  .hx-hero-card{width:min(58vw,250px);grid-row:1;margin-top:6px}
  .hx-hero h1{font-size:clamp(50px,14vw,70px)}
  .hx-steps-row,.hx-format-in,.hx-holo-in2{grid-template-columns:1fr}
  .hx-line{display:none}
  .hx-format-stage .vc-stage{height:560px;min-height:0}
  .hx-cats{grid-template-columns:repeat(3,minmax(0,1fr))}
  .hx-cases{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hx-q button{font-size:21px}
}
`;
