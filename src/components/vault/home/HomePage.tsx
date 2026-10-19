import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { HoloCard } from "@/components/vault/home/HoloCard";
import { CATS, ELEMENTS } from "@/lib/vaultCard";
import { CUSTODIE, HOLO_PRICE, SPEDIZIONE } from "@/lib/vaultShop";
import { CARD_SRCS, SiteShell, CardZoom } from "@/components/vault/home/Site";

const CARDS = CARD_SRCS;
// quattro colonne per la parete di carte che scorre nell'apertura
const COLS = [0, 1, 2, 3].map((c) => CARDS.filter((_, i) => i % 4 === c));
const euro = (n: number) => `€${n.toFixed(2).replace(".", ",").replace(",00", "")}`;
const minPrice = Math.min(...CATS.map((c) => c.price));

const FAQ: [string, string][] = [
  [
    "Quanto ci vuole?",
    "Dopo l'ordine controlliamo la carta, la stampiamo e la spediamo in 3–4 giorni lavorativi. Il corriere ci mette altri 5–7 giorni.",
  ],
  [
    "Quando pago?",
    "Dopo l'ordine ti mandiamo per email il totale e le istruzioni per pagare. La stampa parte quando il pagamento arriva.",
  ],
  [
    "Vedo la carta prima di ordinarla?",
    "Sì: nel configuratore la carta si aggiorna mentre scegli e scrivi, quindi ordini esattamente quello che vedi.",
  ],
  [
    "Che foto devo mandare?",
    "Una foto nitida e con buona luce, almeno 1000×1000 pixel. Se non va bene per la stampa ti scriviamo prima di stampare.",
  ],
  ["Posso regalarla?", "Sì: metti l'indirizzo di chi la riceve e scrivici nelle note se vuoi una dedica."],
];

const N = CARDS.length;
const pageOf = (i: number) => Array.from({ length: 9 }, (_, j) => CARDS[(((i * 9 + j) % N) + N) % N]);

function Page({ i, side, onOpen }: { i: number; side: "l" | "r"; onOpen?: (src: string) => void }) {
  return (
    <div className={`bd-page ${side}`}>
      {pageOf(i).map((src, j) => (
        <div className="bd-pocket" key={j}>
          {onOpen ? (
            <button type="button" onClick={() => onOpen(src)} aria-label="Ingrandisci la carta">
              <img src={src} alt="Carta realizzata da Vault Crafted" loading="lazy" draggable={false} />
            </button>
          ) : (
            <img src={src} alt="" loading="lazy" draggable={false} />
          )}
        </div>
      ))}
    </div>
  );
}

/** Raccoglitore aperto a doppia pagina: la pagina gira in 3D e sfoglia da solo. */
function Binder({ onOpen }: { onOpen: (src: string) => void }) {
  const [s, setS] = useState(0); // doppia pagina corrente: pagine 2s e 2s+1
  const [flip, setFlip] = useState<0 | 1 | -1>(0);
  const box = useRef<HTMLDivElement>(null);
  const hold = useRef(false);
  const busy = useRef(false);
  const go = (d: 1 | -1) => {
    if (busy.current) return;
    busy.current = true;
    setFlip(d);
    setTimeout(() => {
      setS((x) => x + d);
      setFlip(0);
      busy.current = false;
    }, 900);
  };
  const goRef = useRef(go);
  goRef.current = go;
  useEffect(() => {
    const el = box.current;
    if (!el || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    let seen = false;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const t = setInterval(() => {
      if (seen && !hold.current && !document.hidden) goRef.current(1);
    }, 5000);
    return () => {
      io.disconnect();
      clearInterval(t);
    };
  }, []);

  const L = 2 * s;
  // durante il giro, sotto la pagina che si muove compare già quella successiva
  const left = flip === -1 ? L - 2 : L;
  const right = flip === 1 ? L + 3 : L + 1;
  return (
    <div
      className="bd"
      ref={box}
      onPointerEnter={() => (hold.current = true)}
      onPointerLeave={() => (hold.current = false)}
    >
      <div className="bd-book">
        <Page i={left} side="l" onOpen={flip ? undefined : onOpen} />
        <Page i={right} side="r" onOpen={flip ? undefined : onOpen} />
        <div className="bd-spine" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        {flip !== 0 && (
          <div className={`bd-leaf ${flip === 1 ? "next" : "prev"}`} aria-hidden>
            <div className="bd-face front">
              <Page i={flip === 1 ? L + 1 : L} side={flip === 1 ? "r" : "l"} />
            </div>
            <div className="bd-face back">
              <Page i={flip === 1 ? L + 2 : L - 1} side={flip === 1 ? "l" : "r"} />
            </div>
          </div>
        )}
      </div>
      <div className="bd-nav">
        <button type="button" onClick={() => go(-1)} aria-label="Pagina precedente">
          <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span>Sfoglia</span>
        <button type="button" onClick={() => go(1)} aria-label="Pagina successiva">
          <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

const PARTS: [string, string, number, number, number, number][] = [
  ["Il nome", "Il suo, un soprannome o una battuta: lo scrivi tu.", 7, 5, 30, 5],
  ["Elemento e punti vita", "Scegli l'elemento e quanti PS dargli.", 66, 5, 82, 5],
  ["La tua foto", "A tutta carta o nella finestra: la inquadri tu nel configuratore.", 62, 30, 55, 34],
  ["Gli attacchi", "Nomi, danni e descrizioni con le vostre frasi.", 85, 72, 50, 80],
  ["Il numero di serie", "Ogni carta stampata ha il suo numero.", 36, 93.5, 44, 93],
  ["La frase finale", "Una riga in basso, per chiudere in bellezza.", 93, 95, 72, 95.5],
];

/** Anatomia di una carta: punti numerati che si accendono uno alla volta. */
function Anatomy() {
  const [on, setOn] = useState(0);
  const [hover, setHover] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    let seen = false;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const t = setInterval(() => {
      if (seen && !hover && !document.hidden) setOn((x) => (x + 1) % PARTS.length);
    }, 2600);
    return () => {
      io.disconnect();
      clearInterval(t);
    };
  }, [hover]);
  const [, , , , x, y] = PARTS[on];
  return (
    <section className="hm-sec an" ref={box} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <div className="an-card rv" style={{ ["--ax" as string]: `${x}%`, ["--ay" as string]: `${y}%` }}>
        <img src="/carte/mattak.webp" alt="Una carta Vault Crafted con la foto del cliente" loading="lazy" />
        <i className="an-dim" aria-hidden />
        <i className="an-shine" aria-hidden />
        {PARTS.map(([t, , px, py], i) => (
          <button
            type="button"
            key={t}
            className="an-pin" data-on={i === on}
            style={{ left: `${px}%`, top: `${py}%` }}
            onClick={() => setOn(i)}
            aria-label={t}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="an-txt">
        <h2 className="rv">Com'è fatta una carta</h2>
        <p className="an-lead rv">Ogni parte la decidi tu. Noi pensiamo a stamparla bene.</p>
        <ol className="an-list">
          {PARTS.map(([t, d], i) => (
            <li key={t} className="rv" data-on={i === on} style={{ ["--d" as string]: `${0.06 * i}s` }}>
              <button type="button" onClick={() => setOn(i)} onPointerEnter={() => setOn(i)}>
                <b>{i + 1}</b>
                <span>
                  <strong>{t}</strong>
                  <em>{d}</em>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <Link to="/crea" className="hm-btn hm-btn-shine rv">
          Componi la tua
        </Link>
      </div>
    </section>
  );
}

/** Passo 1: la carta si compone da sola nel configuratore (animazione in loop). */
function StepCompose() {
  return (
    <div className="st st1" role="img" aria-label="Il configuratore: scegli categoria, elemento, nome e carichi la foto">
      <div className="st1-card">
        <img src="/carte/lincio.webp" alt="" loading="lazy" />
        <div className="st1-empty">
          <span className="st1-name">
            <i>Smiley</i>
          </span>
          <span className="st1-up">
            <svg viewBox="0 0 24 24"><path d="M12 16V5M7 10l5-5 5 5M5 19h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>
        <i className="st1-flash" />
      </div>
      <div className="st1-panel">
        <b>Categoria</b>
        <div className="st1-pills">
          <span>Base</span>
          <span className="on">Rara</span>
          <span>Full Art</span>
        </div>
        <b>Elemento</b>
        <div className="st1-dots">
          {ELEMENTS.slice(0, 5).map(([k, , c], i) => (
            <span key={k} className={i === 0 ? "on" : ""} style={{ background: c }} />
          ))}
        </div>
        <b>Nome</b>
        <div className="st1-input">
          <i>Smiley</i>
        </div>
        <div className="st1-btn">Carica la foto</div>
      </div>
      <svg className="st1-cursor" viewBox="0 0 24 24" aria-hidden>
        <path d="M4 3l15 7-6.5 2L10 19z" fill="#141A3A" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Passo 2: le carte escono dalla stampa, ognuna con il suo numero. */
function StepPrint() {
  return (
    <div className="st st2" role="img" aria-label="Tre carte stampate e numerate">
      <div className="st2-fan">
        <img src="/carte/ric-de-large.webp" alt="" loading="lazy" />
        <img src="/carte/jaz-e-bobo.webp" alt="" loading="lazy" />
        <img src="/carte/etr.webp" alt="" loading="lazy" />
        <i className="st2-scan" />
      </div>
      <span className="st2-serial">
        N° <i />
      </span>
    </div>
  );
}

/** Passo 3: la carta in custodia e la spedizione che avanza. */
function StepShip() {
  return (
    <div className="st st3" role="img" aria-label="La carta nella custodia, spedita con corriere tracciato">
      <img src="/home/passo-custodia.webp" alt="" loading="lazy" />
      <i className="st3-glare" />
      <div className="st3-track">
        <div>
          <span>Stampata</span>
          <span>Spedita</span>
          <span>Consegnata</span>
        </div>
        <p>
          <i />
        </p>
      </div>
    </div>
  );
}

/** Home del sito: chiara, con le carte vere come protagoniste. */
export function HomePage() {
  const cases = CUSTODIE.filter((c) => c.price > 0);
  const [zoom, setZoom] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // la parete di carte e la luce seguono il mouse, con un leggero ritardo
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    let tx = 0.5, ty = 0.5, x = 0.5, y = 0.5, raf = 0;
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--px", x.toFixed(4));
      el.style.setProperty("--py", y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <SiteShell>
      <div className="hm-hero-wrap" ref={heroRef}>
        <header className="hm-hero">
          <div className="hm-hero-txt">
            <h1>
              <span className="ln" style={{ ["--d" as string]: ".05s" }}>La tua storia,</span>{" "}
              <span className="ln" style={{ ["--d" as string]: ".15s" }}>su una carta</span>{" "}
              <span className="ln" style={{ ["--d" as string]: ".25s" }}>da collezione.</span>
            </h1>
            <p className="up" style={{ ["--d" as string]: ".45s" }}>
              Componi la tua carta con la tua foto, la vedi prendere forma mentre la scrivi e noi la
              stampiamo numerata, pronta da collezionare. Da {euro(minPrice)}.
            </p>
            <div className="hm-cta up" style={{ ["--d" as string]: ".6s" }}>
              <Link to="/crea" className="hm-btn hm-btn-shine">
                Crea la tua carta
              </Link>
              <a href="#carte" className="hm-link">
                Guarda le carte
              </a>
            </div>
            <ul className="hm-trust up" style={{ ["--d" as string]: ".75s" }}>
              <li>Anteprima dal vivo</li>
              <li>Numerata</li>
              <li>Spedizione tracciata {euro(SPEDIZIONE)}</li>
            </ul>
          </div>
          <div className="hm-wall" aria-label="Alcune carte che abbiamo stampato">
            <div className="hm-wall-in">
              {COLS.map((col, c) => (
                <div className={`hm-col c${c}`} key={c}>
                  <div>
                    {[...col, ...col].map((src, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setZoom(src)}
                        aria-label="Ingrandisci la carta"
                        tabIndex={i < col.length ? 0 : -1}
                      >
                        <img src={src} alt="" loading={i < 3 ? "eager" : "lazy"} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <i className="hm-sweep" aria-hidden />
          </div>
        </header>
      </div>


      <Anatomy />

      <section className="hm-sec" id="come">
        <h2 className="rv">Come nasce una carta</h2>
        <ol className="hm-steps">
          <li className="rv">
            <StepCompose />
            <h3>La componi tu</h3>
            <p>
              Nel configuratore scegli categoria, elemento, attacchi e frase, carichi la tua foto e
              vedi la carta finita prima di ordinarla.
            </p>
          </li>
          <li className="rv" style={{ ["--d" as string]: ".12s" }}>
            <StepPrint />
            <h3>La stampiamo noi</h3>
            <p>
              Controlliamo che foto e testi siano perfetti per la stampa, poi la stampiamo in alta
              qualità con il suo numero di serie.
            </p>
          </li>
          <li className="rv" style={{ ["--d" as string]: ".24s" }}>
            <StepShip />
            <h3>Ti arriva a casa</h3>
            <p>
              Stampata, numerata e protetta. Spedizione tracciata in tutta Italia a {euro(SPEDIZIONE)}.
            </p>
          </li>
        </ol>
      </section>

      <section className="hm-sec hm-feature">
        <div className="hm-feature-card rv">
          <HoloCard src="/carte/omega-riot.webp" alt="Carta con pellicola olografica" foil={0.9} />
        </div>
        <div className="rv" style={{ ["--d" as string]: ".1s" }}>
          <h2>Ogni carta è un pezzo unico</h2>
          <ul className="hm-facts">
            <li>
              <b>Con la tua foto.</b> Nessun modello già pronto: la carta la componi tu, con la tua
              immagine e le tue frasi.
            </li>
            <li>
              <b>Numerata.</b> Ogni carta ha il suo numero di serie, e un'altra uguale non esiste.
            </li>
            <li>
              <b>Olografica, se vuoi.</b> Con la pellicola i riflessi cambiano a ogni movimento. Passa
              il mouse sulla carta. +{euro(HOLO_PRICE)}
            </li>
          </ul>
        </div>
      </section>

      <section className="hm-sec hm-binder-sec" id="carte">
        <div className="hm-binder-head rv">
          <div>
            <h2>Dal nostro raccoglitore</h2>
            <p>Coppie, amici, artisti, cani di famiglia: alcune delle carte che abbiamo già stampato.</p>
          </div>
          <Link to="/carte" className="hm-link">
            Tutta la collezione
          </Link>
        </div>
        <div className="rv" style={{ ["--d" as string]: ".1s" }}>
          <Binder onOpen={setZoom} />
        </div>
      </section>

      <section className="hm-sec" id="prezzi">
        <h2 className="rv">Prezzi</h2>
        <div className="hm-price rv">
          <table>
            <caption>Carta</caption>
            <tbody>
              {CATS.map((c) => (
                <tr key={c.k}>
                  <th scope="row">{c.n}</th>
                  <td>{c.hint}</td>
                  <td>{euro(c.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <caption>Extra</caption>
            <tbody>
              <tr>
                <th scope="row">Olografica</th>
                <td>Pellicola con riflessi arcobaleno</td>
                <td>+{euro(HOLO_PRICE)}</td>
              </tr>
              {cases.map((c) => (
                <tr key={c.id}>
                  <th scope="row">{c.label}</th>
                  <td>Custodia</td>
                  <td>+{euro(c.price)}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Spedizione</th>
                <td>Corriere tracciato, tutta Italia</td>
                <td>{euro(SPEDIZIONE)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="hm-sec hm-faq">
        <h2 className="rv">Domande</h2>
        {FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <section className="hm-final rv">
        <h2>Hai già in mente chi mettere sulla carta?</h2>
        <Link to="/crea" className="hm-btn">
          Crea la tua carta
        </Link>
      </section>

      <CardZoom src={zoom} onClose={() => setZoom(null)} />
    </SiteShell>
  );
}

