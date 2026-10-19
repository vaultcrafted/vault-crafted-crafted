import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { HoloCard } from "@/components/vault/home/HoloCard";
import { CATS } from "@/lib/vaultCard";
import { CUSTODIE, HOLO_PRICE, SPEDIZIONE } from "@/lib/vaultShop";
import { CARD_SRCS, SiteShell, CardZoom } from "@/components/vault/home/Site";

const CARDS = CARD_SRCS;
// quattro colonne per la parete di carte che scorre nell'apertura
const COLS = [0, 1, 2, 3].map((c) => CARDS.filter((_, i) => i % 4 === c));
const PAGES = Array.from({ length: Math.ceil(CARDS.length / 9) }, (_, i) => CARDS.slice(i * 9, i * 9 + 9));
const euro = (n: number) => `€${n.toFixed(2).replace(".", ",").replace(",00", "")}`;
const TICKER = [
  "Con la tua foto",
  "Numerata",
  "Stampata a Livorno Ferraris",
  "Olografica, se vuoi",
  "Spedizione tracciata in tutta Italia",
  "La vedi prima di ordinarla",
];
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

function Binder({ onOpen }: { onOpen: (src: string) => void }) {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(0);
  const go = (d: number) => {
    setDir(d);
    setPage((p) => (p + d + PAGES.length) % PAGES.length);
  };
  const cards = PAGES[page];
  return (
    <div className="hm-binder">
      <div className="hm-sheet" key={page} data-dir={dir}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div className="hm-pocket" key={i}>
            {cards[i] ? (
              <button type="button" onClick={() => onOpen(cards[i])} aria-label="Ingrandisci la carta">
                <img src={cards[i]} alt="Carta realizzata da Vault Crafted" loading="lazy" />
              </button>
            ) : null}
          </div>
        ))}
        <div className="hm-holes" aria-hidden>
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="hm-binder-nav">
        <button type="button" onClick={() => go(-1)} aria-label="Pagina precedente">
          ‹
        </button>
        <span aria-live="polite">
          Pagina {page + 1} di {PAGES.length}
        </span>
        <button type="button" onClick={() => go(1)} aria-label="Pagina successiva">
          ›
        </button>
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

      <div className="hm-ticker" aria-hidden>
        <div>
          {[0, 1].map((k) => (
            <span key={k}>
              {TICKER.map((t) => (
                <em key={t}>{t}</em>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="hm-sec" id="come">
        <h2 className="rv">Come nasce una carta</h2>
        <ol className="hm-steps">
          <li className="rv">
            <img src="/home/passo-configuratore.webp" alt="Il configuratore di Vault Crafted" loading="lazy" />
            <h3>La componi tu</h3>
            <p>
              Nel configuratore scegli categoria, elemento, attacchi e frase, carichi la tua foto e
              vedi la carta finita prima di ordinarla.
            </p>
          </li>
          <li className="rv" style={{ ["--d" as string]: ".12s" }}>
            <img src="/home/passo-stampa.webp" alt="Una carta Vault stampata" loading="lazy" />
            <h3>La stampiamo noi</h3>
            <p>
              Controlliamo che foto e testi siano perfetti per la stampa, poi la stampiamo in alta
              qualità con il suo numero di serie.
            </p>
          </li>
          <li className="rv" style={{ ["--d" as string]: ".24s" }}>
            <img src="/home/passo-custodia.webp" alt="Una carta Vault nella sua custodia" loading="lazy" />
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

      <section className="hm-sec hm-split" id="carte">
        <div className="hm-split-txt rv">
          <h2>Dal nostro raccoglitore</h2>
          <p>
            Coppie, amici, artisti, cani di famiglia. Sfoglia alcune delle carte che abbiamo già
            stampato.
          </p>
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

