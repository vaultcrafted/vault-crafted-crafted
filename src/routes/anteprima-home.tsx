import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FONTS_HREF } from "@/components/vault/CardEditor";
import { SCRUB_CSS, ScrubHero } from "@/components/vault/home/ScrubHero";
import { CATS } from "@/lib/vaultCard";
import { CUSTODIE, HOLO_PRICE, SPEDIZIONE } from "@/lib/vaultShop";

// Proposta della nuova home: apertura con video comandato dallo scorrimento
// (scrivania del collezionista), materiali acciaio e acrilico. Non collegata dal sito.
export const Route = createFileRoute("/anteprima-home")({
  component: HomePreview,
  head: () => ({
    meta: [
      { title: "Vault Crafted · Carte da collezione disegnate a mano" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#10151F" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: FONTS_HREF },
    ],
  }),
});

const FILES =
  "jaz-e-bobo etr kurolily grime-spitterz ikb diego-vallino epcoraw gino ric-de-large omega-riot warcard prodest lincio azzurra laura-massei mattak riccardo-salomoni poppi colle-der-fomento danno dj-craim fabri-fibra gemitaiz haxo lazza matteo-iuliani mirko-gardoni pipino-il-breve".split(
    " ",
  );
const CARDS = FILES.map((f) => `/carte/${f}.webp`);
const PAGES = Array.from({ length: Math.ceil(CARDS.length / 9) }, (_, i) => CARDS.slice(i * 9, i * 9 + 9));
const euro = (n: number) => `€${n.toFixed(2).replace(".", ",").replace(",00", "")}`;
const minPrice = Math.min(...CATS.map((c) => c.price));

const FAQ: [string, string][] = [
  [
    "Quanto ci vuole?",
    "La bozza arriva entro 24–48 ore dall'ordine. Dopo che l'approvi e paghi, stampiamo e spediamo in 3–4 giorni lavorativi. Il corriere ci mette altri 5–7 giorni.",
  ],
  [
    "Quando pago?",
    "Solo dopo aver visto e approvato la bozza. Ti mandiamo il totale e le istruzioni per email, e la stampa parte quando il pagamento arriva.",
  ],
  [
    "E se la bozza non mi convince?",
    "Ce lo dici e la sistemiamo. Le modifiche prima dell'approvazione sono gratis, tutte quelle che servono.",
  ],
  [
    "Che foto devo mandare?",
    "Una foto nitida e con buona luce, almeno 1000×1000 pixel. Se non va bene te lo diciamo prima di disegnare.",
  ],
  ["Posso regalarla?", "Sì: metti l'indirizzo di chi la riceve e scrivici nelle note se vuoi una dedica."],
];

function Binder() {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(0);
  const go = (d: number) => {
    setDir(d);
    setPage((p) => (p + d + PAGES.length) % PAGES.length);
  };
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (!(document.activeElement as HTMLElement | null)?.closest?.(".hm-binder")) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, []);
  const cards = PAGES[page];
  return (
    <div className="hm-binder">
      <div className="hm-sheet" key={page} data-dir={dir}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div className="hm-pocket" key={i}>
            {cards[i] ? <img src={cards[i]} alt="Carta realizzata da Vault Crafted" loading="lazy" /> : null}
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

function HomePreview() {
  const cases = CUSTODIE.filter((c) => c.price > 0);
  return (
    <main className="hm">
      <style>{SCRUB_CSS + HM_CSS}</style>

      <nav className="hm-nav">
        <Link to="/" aria-label="Vault Crafted, home">
          <img src="/LOGO.png" alt="Vault Crafted" />
        </Link>
        <div>
          <a href="#come">Come funziona</a>
          <a href="#carte">Le carte</a>
          <a href="#prezzi">Prezzi</a>
          <Link to="/crea" className="hm-btn sm">
            Crea la tua carta
          </Link>
        </div>
      </nav>

      <ScrubHero
        video="/home/hero-scrub.mp4"
        videoWebm="/home/hero-scrub.webm"
        poster="/home/hero-poster.jpg"
        ending="/home/hero-ending.jpg"
        settle={
          <>
            <img className="hm-slabcard" src="/carte/kurolily.webp" alt="Una carta Vault nella sua custodia" />
            <div className="hm-settle-txt">
              <h1>La prossima è la tua.</h1>
              <p>
                Ci mandi una foto, la disegniamo a mano e la stampiamo come una vera carta da
                collezione. Da {euro(minPrice)}, e paghi solo dopo aver visto la bozza.
              </p>
              <Link to="/crea" className="hm-btn">
                Crea la tua carta
              </Link>
            </div>
          </>
        }
      >
        <div className="hm-band l" data-band="0,0.3">
          <p className="hm-big">Una foto.</p>
          <p className="hm-big dim">Una carta che resta.</p>
        </div>
        <div className="hm-band r" data-band="0.32,0.6">
          <p className="hm-mid">Disegnata a mano, da zero.</p>
          <p>Niente filtri, niente modelli già pronti. Ogni carta parte dalla storia che ci racconti.</p>
        </div>
        <div className="hm-band l" data-band="0.62,0.84">
          <p className="hm-mid">Una su 420.</p>
          <p>Ogni carta ha il suo numero di serie. Un'altra uguale non esiste.</p>
        </div>
      </ScrubHero>

      <section className="hm-sec" id="come">
        <h2>Come nasce una carta</h2>
        <ol className="hm-steps">
          <li>
            <img src="/home/passo-configuratore.webp" alt="Il configuratore di Vault Crafted" loading="lazy" />
            <h3>La componi tu</h3>
            <p>
              Nel configuratore scegli categoria, elemento, attacchi e frase. Carichi la foto e vedi
              la carta mentre la scrivi.
            </p>
          </li>
          <li>
            <img src="/home/passo-illustrazione.webp" alt="Un'illustrazione disegnata a mano" loading="lazy" />
            <h3>La disegniamo noi</h3>
            <p>
              Entro due giorni ti mandiamo la bozza con l'illustrazione fatta a mano. La sistemiamo
              finché non ti piace.
            </p>
          </li>
          <li>
            <img src="/home/passo-custodia.webp" alt="Una carta Vault nella sua custodia" loading="lazy" />
            <h3>Ti arriva a casa</h3>
            <p>
              Stampata, numerata e protetta. Spedizione tracciata in tutta Italia a {euro(SPEDIZIONE)}.
            </p>
          </li>
        </ol>
      </section>

      <section className="hm-sec hm-split" id="carte">
        <div className="hm-split-txt">
          <h2>Dal nostro raccoglitore</h2>
          <p>
            Coppie, amici, artisti, cani di famiglia. Sfoglia alcune delle carte che abbiamo già
            disegnato.
          </p>
          <Link to="/carte" className="hm-link">
            Tutta la collezione
          </Link>
        </div>
        <Binder />
      </section>

      <section className="hm-sec" id="prezzi">
        <h2>Prezzi</h2>
        <div className="hm-price">
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
        <h2>Domande</h2>
        {FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <section className="hm-final">
        <h2>Hai già in mente chi mettere sulla carta?</h2>
        <Link to="/crea" className="hm-btn">
          Crea la tua carta
        </Link>
      </section>

      <footer className="hm-foot">
        <img src="/LOGO.png" alt="Vault Crafted" />
        <span>Carte da collezione disegnate a mano a Livorno Ferraris (VC)</span>
        <span>
          <Link to="/termini">Termini</Link>
          <a href="https://wa.me/393332876277">WhatsApp</a>
          <a href="https://www.instagram.com/vault_crafted">Instagram</a>
        </span>
      </footer>
    </main>
  );
}

const HM_CSS = `
.hm{--night:#10151F;--steel:#1B2230;--plate:#242C3B;--alloy:#9AA2B0;--frost:#E7EAEE;--lamp:#F3D9A8;--red:#D7262E;
  background:var(--night);color:var(--frost);font-family:Archivo,system-ui,sans-serif;font-size:17px;line-height:1.55;overflow-x:clip}
.hm a{color:inherit}
.hm :focus-visible{outline:2px solid var(--red);outline-offset:3px}
.hm h2{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(40px,5vw,68px);line-height:.95;margin:0 0 28px}
.hm-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 26px;border-radius:12px;background:var(--red);color:#fff !important;text-decoration:none;
  font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:22px;letter-spacing:.02em;box-shadow:0 12px 30px -14px rgba(215,38,46,.8);transition:transform .2s cubic-bezier(.2,.8,.2,1),background .2s}
.hm-btn:hover{transform:translateY(-2px);background:#E6333B}
.hm-btn.sm{min-height:40px;font-size:17px;padding:0 16px;border-radius:10px}
.hm-link{font-weight:700;text-decoration:underline;text-underline-offset:4px;text-decoration-color:var(--alloy)}
.hm-nav{position:fixed;inset:0 0 auto;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:12px 28px;background:rgba(16,21,31,.72);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 1px 0 rgba(255,255,255,.06)}
.hm-nav img{height:34px;display:block}
.hm-nav div{display:flex;align-items:center;gap:26px}
.hm-nav div a:not(.hm-btn){text-decoration:none;font-weight:600;font-size:15px;color:#C9CEDA}
.hm-nav div a:not(.hm-btn):hover{color:#fff}
/* didascalie sopra il video */
.hm-band{max-width:min(520px,34vw);isolation:isolate;text-shadow:0 1px 2px rgba(8,10,16,.95),0 3px 12px rgba(8,10,16,.75),0 10px 44px rgba(8,10,16,.8)}
.hm-band::before{content:"";position:absolute;inset:-30% -25%;z-index:-1;background:radial-gradient(ellipse 60% 55% at 50% 50%,rgba(10,13,20,.62),rgba(10,13,20,0) 75%)}
.hm-band.l{left:6vw;top:22vh}
.hm-band.r{right:6vw;top:30vh;text-align:right}
.hm-band p{margin:0 0 10px;color:#D4D8E1;font-size:clamp(17px,1.35vw,20px);max-width:40ch}
.hm-band.r p{margin-left:auto}
.hm-band .hm-big{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(54px,6.4vw,104px);line-height:.9;color:var(--frost);margin:0;max-width:none}
.hm-band .hm-big.dim{color:var(--lamp)}
.hm-band .hm-mid{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(38px,4vw,64px);line-height:.95;color:var(--frost);max-width:none;transform:translateY(calc((1 - var(--k,1)) * 18px))}
/* fine dello scorrimento: carta vera nella custodia */
.hm{--fh:max(56.25vw,100svh)}
.hm-slabcard{position:absolute;left:calc(50% + var(--fh) * 0.0014);top:calc(50% + var(--fh) * 0.0134);height:calc(var(--fh) * .497);width:auto;
  transform:translate(-50%,-50%) scale(calc(.97 + .03 * var(--k)));opacity:var(--k);border-radius:2.5% / 1.8%;filter:brightness(.96)}
.hm-settle-txt{position:absolute;left:6vw;bottom:12vh;max-width:min(470px,34vw);isolation:isolate;opacity:var(--k);transform:translateY(calc((1 - var(--k)) * 26px));text-shadow:0 2px 20px rgba(8,10,16,.8)}
.hm-settle-txt::before{content:"";position:absolute;inset:-40% -30%;z-index:-1;background:radial-gradient(ellipse 60% 60% at 40% 55%,rgba(10,13,20,.75),rgba(10,13,20,0) 75%)}
.hm-settle-txt h1{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(48px,5.6vw,90px);line-height:.92;margin:0 0 14px}
.hm-settle-txt p{color:#D4D8E1;margin:0 0 22px;max-width:40ch}
.hm-settle-txt .hm-btn{text-shadow:none}
/* sezioni */
.hm-sec{max-width:1240px;margin:0 auto;padding:110px 28px 20px}
.hm-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;counter-reset:s}
.hm-steps li{counter-increment:s}
.hm-steps img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px;background:var(--steel);box-shadow:0 0 0 1px rgba(255,255,255,.06)}
.hm-steps h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:30px;margin:18px 0 6px;display:flex;align-items:baseline;gap:12px}
.hm-steps h3::before{content:counter(s);font-size:18px;color:var(--alloy);font-weight:700}
.hm-steps p{margin:0;color:var(--alloy);max-width:38ch}
.hm-split{display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1.25fr);gap:56px;align-items:center}
.hm-split-txt p{color:var(--alloy);max-width:36ch;margin:0 0 18px}
/* il raccoglitore */
.hm-binder{perspective:1600px;width:min(100%,560px);justify-self:center}
.hm-sheet{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:18px 18px 18px 46px;border-radius:12px;
  background:linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.02)),var(--plate);box-shadow:0 30px 60px -30px rgba(0,0,0,.8),inset 0 0 0 1px rgba(255,255,255,.08);
  transform-origin:left center;animation:hmflip .55s cubic-bezier(.2,.8,.2,1)}
.hm-sheet[data-dir="-1"]{transform-origin:right center;animation-name:hmflipb}
.hm-sheet[data-dir="0"]{animation:none}
@keyframes hmflip{from{transform:rotateY(-24deg) translateX(30px);opacity:.3}}
@keyframes hmflipb{from{transform:rotateY(24deg) translateX(-30px);opacity:.3}}
.hm-pocket{position:relative;aspect-ratio:703/980;border-radius:6px;background:rgba(16,21,31,.55);box-shadow:inset 0 0 0 1px rgba(255,255,255,.1);overflow:hidden}
.hm-pocket img{display:block;width:100%;height:100%;object-fit:cover}
.hm-pocket::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.18),rgba(255,255,255,0) 28%,rgba(255,255,255,0) 70%,rgba(255,255,255,.08));pointer-events:none}
.hm-holes{position:absolute;left:14px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:space-around}
.hm-holes i{width:14px;height:14px;border-radius:50%;background:var(--night);box-shadow:inset 0 2px 3px rgba(0,0,0,.6)}
.hm-binder-nav{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:16px;color:var(--alloy);font-size:15px}
.hm-binder-nav button{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:var(--steel);color:var(--frost);font-size:26px;line-height:1;cursor:pointer}
.hm-binder-nav button:hover{border-color:rgba(255,255,255,.45)}
/* prezzi */
.hm-price{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px}
.hm-price table{width:100%;border-collapse:collapse}
.hm-price caption{text-align:left;font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:24px;color:var(--alloy);padding-bottom:8px}
.hm-price th,.hm-price td{padding:13px 0;border-top:1px solid rgba(255,255,255,.1);text-align:left;vertical-align:baseline}
.hm-price th{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:24px;white-space:nowrap;padding-right:18px}
.hm-price td{color:var(--alloy);font-size:15px}
.hm-price td:last-child{text-align:right;color:var(--frost);font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:24px;white-space:nowrap;padding-left:14px}
/* domande */
.hm-faq{max-width:860px}
.hm-faq details{border-top:1px solid rgba(255,255,255,.1)}
.hm-faq details:last-of-type{border-bottom:1px solid rgba(255,255,255,.1)}
.hm-faq summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px;padding:18px 0;font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:26px}
.hm-faq summary::-webkit-details-marker{display:none}
.hm-faq summary::after{content:"+";color:var(--alloy);transition:transform .25s}
.hm-faq details[open] summary::after{transform:rotate(45deg)}
.hm-faq details p{margin:0 0 20px;color:var(--alloy);max-width:62ch}
.hm-final{max-width:1240px;margin:110px auto 0;padding:70px 28px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;border-top:1px solid rgba(255,255,255,.1)}
.hm-final h2{margin:0;max-width:18ch}
.hm-foot{max-width:1240px;margin:0 auto;padding:28px 28px 40px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;color:var(--alloy);font-size:14px}
.hm-foot img{height:28px}
.hm-foot span:last-child{display:flex;gap:18px}
@media (max-width:900px){
  .hm-nav{padding:12px 16px}
  .hm-nav div a:not(.hm-btn){display:none}
  .hm-sec{padding:80px 18px 10px}
  .hm-steps,.hm-split,.hm-price{grid-template-columns:1fr}
  .hm-split{gap:28px}
  .hm-final{padding:50px 18px;margin-top:70px}
  .hm-price td:nth-child(2){display:none}
  .hm-price th{white-space:normal}
}
@media (max-width: 720px),(orientation: portrait) and (max-width: 1024px),(orientation: portrait) and (pointer: coarse),(orientation: landscape) and (pointer: coarse) and (max-height: 560px),(prefers-reduced-motion: reduce){
  .hm{--fh:64svh}
  .sh-stage{min-height:0}
  .sh-poster{inset:0 0 auto;height:var(--fh);background-size:auto 100%;background-position:center}
  .sh-poster::after{content:"";position:absolute;inset:auto 0 0;height:30%;background:linear-gradient(transparent,var(--night))}
  .hm-slabcard{top:calc(var(--fh) / 2 + var(--fh) * 0.0134);transform:translate(-50%,-50%)}
  .sh-scrim{display:none}
  .sh-settle{padding:calc(var(--fh) - 2svh) 18px 36px}
  .hm-settle-txt{position:relative;left:auto;bottom:auto;max-width:none;opacity:1;transform:none}
  .hm-settle-txt::before{display:none}
  .hm-settle-txt h1{font-size:50px}
}
@media (prefers-reduced-motion:reduce){.hm *{animation:none !important;transition:none !important}}
`;
