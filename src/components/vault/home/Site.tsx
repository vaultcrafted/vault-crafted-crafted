import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { WhatsappButton } from "@/components/vault/WhatsappButton";
import { HOLO_CSS, HoloCard } from "./HoloCard";

/** Cornice comune delle pagine pubbliche: barra in alto, piè di pagina, stile chiaro. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [menu, setMenu] = useState(false);
  const [bar, setBar] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.classList.add("hm-js");
    // comparsa morbida degli elementi .rv quando entrano nello schermo
    const els = root.querySelectorAll<HTMLElement>(".rv");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((e) => io.observe(e));
    const onScroll = () => setBar(scrollY > 560 && innerHeight + scrollY < document.body.scrollHeight - 260);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
    };
  }, []);

  const links = (
    <>
      <Link to="/carte" activeProps={{ "aria-current": "page" }} onClick={() => setMenu(false)}>
        Le carte
      </Link>
      <Link to="/regalo" activeProps={{ "aria-current": "page" }} onClick={() => setMenu(false)}>
        Regalo
      </Link>
      <Link to="/chi-siamo" activeProps={{ "aria-current": "page" }} onClick={() => setMenu(false)}>
        Chi siamo
      </Link>
    </>
  );

  return (
    <main className="hm" ref={ref}>
      <style>{HOLO_CSS + SITE_CSS}</style>
      <nav className="hm-nav">
        <Link to="/" aria-label="Vault Crafted, home" className="hm-logo">
          <img src="/LOGO.png" alt="Vault Crafted" />
        </Link>
        <div>
          {links}
          <Link to="/crea" className="hm-btn sm">
            Crea la tua carta
          </Link>
          <button
            type="button"
            className="hm-burger"
            aria-label={menu ? "Chiudi il menu" : "Apri il menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <i />
            <i />
          </button>
        </div>
        {menu && <div className="hm-menu">{links}</div>}
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
      <div className={`hm-bar${bar ? " on" : ""}`} aria-hidden={!bar}>
        <span>
          Da <b>€20</b> · numerata
        </span>
        <Link to="/crea" className="hm-btn" tabIndex={bar ? 0 : -1}>
          Crea la tua carta
        </Link>
      </div>
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
.hm-burger{display:none;width:42px;height:40px;border:0;border-radius:10px;background:rgba(255,255,255,.08);cursor:pointer;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.hm-burger i{display:block;width:18px;height:2px;background:#fff;border-radius:2px;transition:transform .25s}
.hm-burger[aria-expanded=true] i:first-child{transform:translateY(4px) rotate(45deg)}
.hm-burger[aria-expanded=true] i:last-child{transform:translateY(-4px) rotate(-45deg)}
.hm-menu{position:absolute;left:0;right:0;top:100%;background:#141A3A;display:flex;flex-direction:column;padding:6px 16px 18px;box-shadow:0 20px 30px -20px rgba(0,0,0,.5);animation:hmdrop .25s cubic-bezier(.2,.8,.2,1)}
.hm-menu a{color:#fff;text-decoration:none;font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:26px;padding:10px 0;border-top:1px solid rgba(255,255,255,.1)}
@keyframes hmdrop{from{opacity:0;transform:translateY(-8px)}}
.hm-bar{display:none}
/* comparsa allo scroll */
.hm-js .rv{transition:opacity .8s cubic-bezier(.2,.8,.2,1),transform .8s cubic-bezier(.2,.8,.2,1);transition-delay:var(--d,0s)}
.hm-js .rv:not(.in){opacity:0;transform:translateY(34px)}
/* apertura */
.hm-hero-wrap{--px:.5;--py:.5;position:relative;overflow:hidden;
  background:radial-gradient(900px circle at calc(var(--px) * 100%) calc(var(--py) * 100%),rgba(255,255,255,.85),rgba(255,255,255,0) 60%)}
.hm-hero-wrap::before{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(rgba(20,26,58,.22) 1px,transparent 1.4px);background-size:22px 22px;
  -webkit-mask-image:radial-gradient(520px circle at calc(var(--px) * 100%) calc(var(--py) * 100%),#000,transparent 70%);
  mask-image:radial-gradient(520px circle at calc(var(--px) * 100%) calc(var(--py) * 100%),#000,transparent 70%)}
.hm-hero{position:relative;padding:0 0 0 max(28px,calc(50% - 672px));display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.2fr);gap:40px;align-items:center;min-height:calc(100svh - 64px)}
.hm-hero-txt{padding:60px 0;position:relative;z-index:2}
.hm-hero h1{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(52px,6.6vw,104px);line-height:.9;letter-spacing:-.01em;margin:0 0 22px;max-width:11ch}
.hm-hero h1 .ln{display:inline-block;animation:hmrise .9s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d)}
.hm-hero .up{animation:hmrise .9s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d)}
@keyframes hmrise{from{opacity:0;transform:translateY(40px);filter:blur(6px)}}
.hm-hero p{font-size:clamp(17px,1.4vw,20px);color:var(--muted);max-width:44ch;margin:0 0 28px}
.hm-cta{display:flex;flex-wrap:wrap;align-items:center;gap:22px}
.hm-btn-shine{position:relative;overflow:hidden}
.hm-btn-shine::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.35) 50%,transparent 65%);transform:translateX(-120%);animation:hmshine 4.5s ease-in-out 1.6s infinite}
@keyframes hmshine{0%,60%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
.hm-trust{list-style:none;display:flex;flex-wrap:wrap;gap:8px 18px;margin:30px 0 0;padding:0;font-size:14px;color:var(--muted)}
.hm-trust li{display:flex;align-items:center;gap:7px}
.hm-trust li::before{content:"";width:16px;height:16px;border-radius:50%;background:var(--ink) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 8.2l2.2 2.2 4.8-4.8' fill='none' stroke='%23fff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/100% no-repeat}
.hm-wall{position:relative;height:calc(100svh - 64px);perspective:1500px;
  -webkit-mask-image:linear-gradient(transparent,#000 10%,#000 90%,transparent),linear-gradient(90deg,transparent,#000 9%,#000 96%,transparent);
  -webkit-mask-composite:source-in;
  mask-image:linear-gradient(transparent,#000 10%,#000 90%,transparent),linear-gradient(90deg,transparent,#000 9%,#000 96%,transparent);mask-composite:intersect;
  animation:hmfade 1.4s .2s both}
.hm-wall-in{height:100%;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;transform-origin:50% 50%;
  transform:rotateX(calc(12deg + (var(--py) - .5) * -10deg)) rotateY(calc(-14deg + (var(--px) - .5) * 14deg)) rotateZ(4deg) scale(1.12)}
.hm-sweep{position:absolute;inset:-10% -30%;pointer-events:none;mix-blend-mode:overlay;
  background:linear-gradient(105deg,transparent 38%,rgba(255,90,170,.35) 45%,rgba(255,255,255,.75) 50%,rgba(80,200,255,.35) 55%,transparent 62%);
  background-size:300% 100%;animation:hmsweep 7s cubic-bezier(.45,0,.2,1) 1.2s infinite}
@keyframes hmsweep{0%{background-position:100% 0}55%,100%{background-position:0 0}}
.hm-col{min-width:0}
.hm-col>div{display:flex;flex-direction:column;gap:16px;animation:hmup 60s linear infinite}
.hm-col.c1>div{animation-direction:reverse;animation-duration:70s}
.hm-col.c2>div{animation-duration:54s}
.hm-col.c1{margin-top:-90px}
.hm-col.c3>div{animation-direction:reverse;animation-duration:64s}
.hm-col.c3{margin-top:-40px}
.hm-wall:hover .hm-col>div{animation-play-state:paused}
.hm-col button{display:block;padding:0;border:0;background:none;cursor:zoom-in;border-radius:4.5% / 3.2%;overflow:hidden;
  box-shadow:0 14px 30px -18px rgba(20,26,58,.55);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
.hm-col button:hover{transform:translateY(-6px) translateZ(40px) scale(1.04);box-shadow:0 30px 50px -20px rgba(20,26,58,.7)}
.hm-col img{display:block;width:100%;height:auto}
@keyframes hmup{to{transform:translateY(calc(-50% - 8px))}}
@media (hover:none){.hm-wall-in{animation:hmsway 9s ease-in-out infinite alternate}}
@keyframes hmsway{from{transform:rotateX(14deg) rotateY(-18deg) rotateZ(4deg) scale(1.12)}to{transform:rotateX(8deg) rotateY(-6deg) rotateZ(3deg) scale(1.12)}}
/* nastro */
.hm-ticker{overflow:hidden;background:var(--ink);color:#fff;padding:16px 0;transform:rotate(-1.2deg);margin:10px -10px 0;box-shadow:0 20px 40px -24px rgba(20,26,58,.7)}
.hm-ticker>div{display:flex;width:max-content;animation:hmtick 38s linear infinite}
.hm-ticker span{display:flex}
.hm-ticker em{font-style:normal;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:26px;letter-spacing:.02em;white-space:nowrap;padding:0 22px;display:flex;align-items:center;gap:44px}
.hm-ticker em::after{content:"";width:9px;height:9px;transform:rotate(45deg);background:linear-gradient(135deg,#ff5aa8,#ffd23f,#3dffb5,#3dc8ff);margin-left:22px}
@keyframes hmtick{to{transform:translateX(-50%)}}
/* sezioni */
.hm-sec{max-width:1240px;margin:0 auto;padding:100px 28px 10px}
.hm-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px;counter-reset:s}
.hm-steps li{counter-increment:s;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:14px 14px 22px}
.hm-steps img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;background:var(--bg)}
.hm-steps h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:30px;margin:16px 6px 6px;display:flex;align-items:baseline;gap:12px}
.hm-steps h3::before{content:counter(s);font-size:18px;color:var(--muted);font-weight:700}
.hm-steps p{margin:0 6px;color:var(--muted);max-width:38ch}
.hm-feature{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:64px;align-items:center}
.hm-feature-card{width:min(100%,380px);justify-self:center;position:relative}
.hm-feature-card::before{content:"";position:absolute;inset:8% -6%;border-radius:40%;filter:blur(50px);opacity:.55;z-index:-1;
  background:conic-gradient(from 0deg,#ff5aa8,#ffd23f,#3dffb5,#3dc8ff,#b25cff,#ff5aa8);animation:hmspin 14s linear infinite}
@keyframes hmspin{to{transform:rotate(360deg)}}
.hm-feature{position:relative;isolation:isolate}
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
.hm-price tr{transition:background .2s}
.hm-price tbody tr:hover{background:#F5F6FA}
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
  .hm-nav div{gap:10px}
  .hm-nav div a:not(.hm-btn){display:none}
  .hm-burger{display:flex}
  .hm-bar{display:flex;position:fixed;left:10px;right:84px;bottom:14px;z-index:40;align-items:center;justify-content:space-between;gap:10px;padding:8px 8px 8px 16px;border-radius:16px;
    background:rgba(255,255,255,.92);backdrop-filter:blur(10px);box-shadow:0 14px 34px -14px rgba(20,26,58,.5);font-size:14px;color:var(--muted);
    transform:translateY(120%);opacity:0;transition:transform .35s cubic-bezier(.2,.8,.2,1),opacity .35s}
  .hm-bar.on{transform:none;opacity:1}
  .hm-bar b{color:var(--ink)}
  .hm-bar .hm-btn{min-height:44px;font-size:18px;padding:0 16px}
  .hm-hero{grid-template-columns:1fr;min-height:0;padding:0;gap:0}
  .hm-hero-txt{padding:34px 18px 26px}
  .hm-wall{height:62svh;padding:0 10px;order:2}
  .hm-wall-in{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .hm-ticker em{font-size:20px}
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
