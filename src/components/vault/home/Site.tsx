import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { WhatsappButton } from "@/components/vault/WhatsappButton";
import { HOLO_CSS, HoloCard } from "./HoloCard";

/** Cornice comune delle pagine pubbliche: barra in alto, piè di pagina, stile chiaro. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="hm">
      <style>{HOLO_CSS + SITE_CSS}</style>
      <nav className="hm-nav">
        <Link to="/" aria-label="Vault Crafted, home" className="hm-logo">
          <img src="/LOGO.png" alt="Vault Crafted" />
        </Link>
        <div>
          <Link to="/carte" activeProps={{ "aria-current": "page" }}>
            Le carte
          </Link>
          <Link to="/regalo" activeProps={{ "aria-current": "page" }}>
            Regalo
          </Link>
          <Link to="/chi-siamo" activeProps={{ "aria-current": "page" }}>
            Chi siamo
          </Link>
          <Link to="/crea" className="hm-btn sm">
            Crea la tua carta
          </Link>
        </div>
      </nav>
      {children}
      <footer className="hm-foot">
        <img src="/LOGO.png" alt="Vault Crafted" />
        <span>Carte da collezione personalizzate, stampate a Livorno Ferraris (VC)</span>
        <span>
          <Link to="/carte">Le carte</Link>
          <Link to="/regalo">Regalo</Link>
          <Link to="/chi-siamo">Chi siamo</Link>
          <Link to="/termini">Termini</Link>
          <a href="https://www.instagram.com/vault_crafted">Instagram</a>
        </span>
      </footer>
      <WhatsappButton />
    </main>
  );
}

/** Carta ingrandita sopra la pagina, con effetto olografico. */
export function CardZoom({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, [src, onClose]);
  if (!src) return null;
  return (
    <div className="hm-lb" role="dialog" aria-modal="true" aria-label="Carta ingrandita" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <HoloCard src={src} alt="Carta ingrandita" foil={0.5} />
      </div>
      <button type="button" onClick={onClose} aria-label="Chiudi">
        ✕
      </button>
    </div>
  );
}

export const CARD_FILES =
  "jaz-e-bobo etr kurolily grime-spitterz ikb diego-vallino epcoraw gino ric-de-large omega-riot warcard prodest lincio azzurra laura-massei mattak riccardo-salomoni poppi colle-der-fomento danno dj-craim fabri-fibra gemitaiz haxo lazza matteo-iuliani mirko-gardoni pipino-il-breve".split(
    " ",
  );
export const CARD_SRCS = CARD_FILES.map((f) => `/carte/${f}.webp`);

export const SITE_CSS = `
.hm{--bg:#E9EAEF;--panel:#FFFFFF;--ink:#141A3A;--muted:#5A5D6B;--line:#D3D6DF;--red:#D7262E;
  min-height:100vh;background:var(--bg);color:var(--ink);font-family:Archivo,system-ui,sans-serif;font-size:17px;line-height:1.55;overflow-x:clip}
.hm a{color:inherit}
.hm :focus-visible{outline:2px solid #1F86D6;outline-offset:3px}
.hm h2{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(38px,4.6vw,62px);line-height:.95;margin:0 0 26px}
.hm-btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 26px;border-radius:12px;background:var(--ink);color:#fff !important;text-decoration:none;
  font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:22px;letter-spacing:.02em;transition:transform .2s cubic-bezier(.2,.8,.2,1),background .2s}
.hm-btn:hover{transform:translateY(-2px);background:#232B5C}
.hm-btn.sm{min-height:40px;font-size:17px;padding:0 16px;border-radius:10px;background:#fff;color:var(--ink) !important}
.hm-btn.sm:hover{background:#F1F2F6}
.hm-link{font-weight:700;text-decoration:underline;text-underline-offset:4px;text-decoration-color:var(--line)}
.hm-link:hover{text-decoration-color:var(--ink)}
.hm-nav{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:12px 28px;background:#141A3A}
.hm-logo img{height:34px;display:block}
.hm-nav div{display:flex;align-items:center;gap:26px}
.hm-nav div a:not(.hm-btn){text-decoration:none;font-weight:600;font-size:15px;color:#C9CEE3}
.hm-nav div a:not(.hm-btn):hover,.hm-nav div a[aria-current=page]{color:#fff}
/* apertura */
.hm-hero{max-width:1400px;margin:0 auto;padding:0 28px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.2fr);gap:40px;align-items:center;min-height:calc(100svh - 64px)}
.hm-hero-txt{padding:60px 0}
.hm-hero h1{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(52px,6.6vw,104px);line-height:.9;letter-spacing:-.01em;margin:0 0 22px;max-width:11ch}
.hm-hero p{font-size:clamp(17px,1.4vw,20px);color:var(--muted);max-width:44ch;margin:0 0 28px}
.hm-cta{display:flex;flex-wrap:wrap;align-items:center;gap:22px}
.hm-wall{position:relative;height:calc(100svh - 64px);display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;overflow:hidden;
  -webkit-mask-image:linear-gradient(transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(transparent,#000 12%,#000 88%,transparent)}
.hm-col>div{display:flex;flex-direction:column;gap:16px;animation:hmup 60s linear infinite}
.hm-col.c1>div{animation-direction:reverse;animation-duration:70s}
.hm-col.c2>div{animation-duration:54s}
.hm-col.c1{margin-top:-90px}
.hm-col.c3>div{animation-direction:reverse;animation-duration:64s}
.hm-col.c3{margin-top:-40px}
.hm-wall:hover .hm-col>div{animation-play-state:paused}
.hm-col button{display:block;padding:0;border:0;background:none;cursor:zoom-in;border-radius:4.5% / 3.2%;overflow:hidden;
  box-shadow:0 14px 30px -18px rgba(20,26,58,.55);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
.hm-col button:hover{transform:translateY(-6px) scale(1.03);box-shadow:0 26px 44px -20px rgba(20,26,58,.6)}
.hm-col img{display:block;width:100%;height:auto}
@keyframes hmup{to{transform:translateY(calc(-50% - 8px))}}
/* sezioni */
.hm-sec{max-width:1240px;margin:0 auto;padding:100px 28px 10px}
.hm-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px;counter-reset:s}
.hm-steps li{counter-increment:s;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:14px 14px 22px}
.hm-steps img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;background:var(--bg)}
.hm-steps h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:30px;margin:16px 6px 6px;display:flex;align-items:baseline;gap:12px}
.hm-steps h3::before{content:counter(s);font-size:18px;color:var(--muted);font-weight:700}
.hm-steps p{margin:0 6px;color:var(--muted);max-width:38ch}
.hm-feature{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:64px;align-items:center}
.hm-feature-card{width:min(100%,380px);justify-self:center}
.hm-feature-card .hx-holo-in{box-shadow:0 40px 70px -30px rgba(20,26,58,.6)}
.hm-facts{list-style:none;margin:0;padding:0;display:grid;gap:18px}
.hm-facts li{color:var(--muted);max-width:52ch;padding-left:18px;border-left:3px solid var(--line)}
.hm-facts b{color:var(--ink)}
.hm-split{display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1.25fr);gap:56px;align-items:center}
.hm-split-txt p{color:var(--muted);max-width:36ch;margin:0 0 18px}
/* il raccoglitore */
.hm-binder{perspective:1600px;width:min(100%,560px);justify-self:center}
.hm-sheet{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:18px 18px 18px 46px;border-radius:12px;background:#2A3047;
  box-shadow:0 30px 60px -30px rgba(20,26,58,.6);transform-origin:left center;animation:hmflip .55s cubic-bezier(.2,.8,.2,1)}
.hm-sheet[data-dir="-1"]{transform-origin:right center;animation-name:hmflipb}
.hm-sheet[data-dir="0"]{animation:none}
@keyframes hmflip{from{transform:rotateY(-24deg) translateX(30px);opacity:.3}}
@keyframes hmflipb{from{transform:rotateY(24deg) translateX(-30px);opacity:.3}}
.hm-pocket{position:relative;aspect-ratio:703/980;border-radius:6px;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);overflow:hidden}
.hm-pocket button{display:block;width:100%;height:100%;padding:0;border:0;background:none;cursor:zoom-in}
.hm-pocket img{display:block;width:100%;height:100%;object-fit:cover}
.hm-pocket::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.2),rgba(255,255,255,0) 28%,rgba(255,255,255,0) 70%,rgba(255,255,255,.08));pointer-events:none}
.hm-holes{position:absolute;left:14px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:space-around}
.hm-holes i{width:14px;height:14px;border-radius:50%;background:var(--bg);box-shadow:inset 0 2px 3px rgba(0,0,0,.35)}
.hm-binder-nav{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:16px;color:var(--muted);font-size:15px}
.hm-binder-nav button{width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:#fff;color:var(--ink);font-size:26px;line-height:1;cursor:pointer}
.hm-binder-nav button:hover{border-color:var(--ink)}
/* prezzi */
.hm-price{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:22px 28px}
.hm-price table{width:100%;border-collapse:collapse}
.hm-price caption{text-align:left;font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:22px;color:var(--muted);padding-bottom:6px}
.hm-price th,.hm-price td{padding:12px 0;border-top:1px solid #E6E8EE;text-align:left;vertical-align:baseline}
.hm-price th{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:23px;white-space:nowrap;padding-right:16px}
.hm-price td{color:var(--muted);font-size:15px}
.hm-price td:last-child{text-align:right;color:var(--ink);font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:23px;white-space:nowrap;padding-left:14px}
/* domande */
.hm-faq{max-width:860px}
.hm-faq details{border-top:1px solid var(--line)}
.hm-faq details:last-of-type{border-bottom:1px solid var(--line)}
.hm-faq summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px;padding:18px 0;font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:25px}
.hm-faq summary::-webkit-details-marker{display:none}
.hm-faq summary::after{content:"+";color:var(--muted);transition:transform .25s}
.hm-faq details[open] summary::after{transform:rotate(45deg)}
.hm-faq details p{margin:0 0 20px;color:var(--muted);max-width:62ch}
.hm-final{max-width:1240px;margin:100px auto 0;padding:56px 28px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;border-top:1px solid var(--line)}
.hm-final h2{margin:0;max-width:18ch}
.hm-foot{background:#141A3A;color:#A7AEC9;font-size:14px}
.hm-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;padding:26px max(28px,calc(50% - 592px)) 34px}
.hm-foot img{height:28px}
.hm-foot span:last-child{display:flex;gap:18px}
.hm-foot a{color:#fff}
/* carta ingrandita */
.hm-lb{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:rgba(20,26,58,.82);backdrop-filter:blur(6px);animation:hmfade .2s}
.hm-lb>div{width:min(82vw,56vh)}
.hm-lb>button{position:absolute;top:16px;right:18px;width:44px;height:44px;border-radius:50%;border:0;background:#fff;color:var(--ink);font-size:18px;cursor:pointer}
@keyframes hmfade{from{opacity:0}}
/* pagine interne */
.hm-page-head{max-width:1240px;margin:0 auto;padding:70px 28px 10px}
.hm-page-head h1{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(50px,6.4vw,96px);line-height:.9;margin:0 0 18px;max-width:14ch}
.hm-page-head p{font-size:clamp(17px,1.4vw,20px);color:var(--muted);max-width:52ch;margin:0 0 26px}
.hm-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
.hm-grid button{display:block;padding:0;border:0;background:none;cursor:zoom-in;border-radius:4.5% / 3.2%;overflow:hidden;box-shadow:0 14px 30px -18px rgba(20,26,58,.55);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
.hm-grid button:hover{transform:translateY(-6px);box-shadow:0 26px 44px -20px rgba(20,26,58,.6)}
.hm-grid img{display:block;width:100%;height:auto}
.hm-cards3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.hm-cards3>div{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:22px 24px}
.hm-cards3 h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:28px;margin:0 0 6px}
.hm-cards3 p{margin:0;color:var(--muted)}
.hm-occ{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 34px}
.hm-occ div{padding:18px 0;border-top:1px solid var(--line)}
.hm-occ h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:24px;margin:0 0 4px}
.hm-occ p{margin:0;color:var(--muted);font-size:15px}
.hm-prose{max-width:720px}
.hm-prose p{font-size:19px;color:#3A3D4B;margin:0 0 18px;max-width:62ch}
.hm-prose b{color:var(--ink)}
@media (max-width:900px){
  .hm-page-head{padding:44px 18px 6px}
  .hm-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .hm-cards3,.hm-occ{grid-template-columns:1fr}
  .hm-nav{padding:10px 16px}
  .hm-nav div a:not(.hm-btn){display:none}
  .hm-hero{grid-template-columns:1fr;min-height:0;padding:0;gap:0}
  .hm-hero-txt{padding:34px 18px 26px}
  .hm-wall{height:62svh;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:0 10px;order:2}
  .hm-col>div{gap:10px}
  .hm-col.c1{margin-top:-50px}
  .hm-col.c3{display:none}
  .hm-sec{padding:70px 18px 6px}
  .hm-steps,.hm-split,.hm-feature{grid-template-columns:1fr}
  .hm-feature{gap:34px}
  .hm-feature-card{width:min(70vw,300px)}
  .hm-price{grid-template-columns:1fr;padding:14px 18px}
  .hm-price td:nth-child(2){display:none}
  .hm-price th{white-space:normal}
  .hm-final{padding:44px 18px;margin-top:60px}
}
@media (prefers-reduced-motion:reduce){.hm *{animation:none !important;transition:none !important}}
`;
