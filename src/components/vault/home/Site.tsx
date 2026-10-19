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
        <Link
          to="/"
          hash=""
          aria-label="Vault Crafted, home"
          className="hm-logo"
          resetScroll
          onClick={() => {
            setMenu(false);
            // già in home: torna in cima con uno scorrimento morbido
            if (location.pathname === "/") {
              history.replaceState(null, "", "/");
              scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
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
  position:relative;isolation:isolate;min-height:100vh;color:var(--ink);
  background:var(--bg);font-family:Archivo,system-ui,sans-serif;font-size:17px;line-height:1.55;overflow-x:clip}
.hm::before{content:"";position:fixed;inset:-10%;z-index:-1;pointer-events:none;
  background:radial-gradient(38vmax 38vmax at 8% 18%,rgba(255,110,190,.16),transparent 70%),
    radial-gradient(42vmax 42vmax at 95% 45%,rgba(80,195,255,.16),transparent 70%),
    radial-gradient(36vmax 36vmax at 40% 105%,rgba(255,210,80,.13),transparent 70%);
  animation:hmdrift 30s ease-in-out infinite alternate}
.hm::after{content:"";position:fixed;inset:-180px;z-index:-1;pointer-events:none;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='%23141A3A' fill-opacity='.075'%3E%3Cpath d='M34 33C35.62 40.38 35.62 40.38 43 42C35.62 43.62 35.62 43.62 34 51C32.38 43.62 32.38 43.62 25 42C32.38 40.38 32.38 40.38 34 33Z'/%3E%3Cpath d='M128 112.5C128.99 117.01 128.99 117.01 133.5 118C128.99 118.99 128.99 118.99 128 123.5C127.01 118.99 127.01 118.99 122.5 118C127.01 117.01 127.01 117.01 128 112.5Z'/%3E%3Cpath d='M150 26.5C150.63 29.37 150.63 29.37 153.5 30C150.63 30.63 150.63 30.63 150 33.5C149.37 30.63 149.37 30.63 146.5 30C149.37 29.37 149.37 29.37 150 26.5Z'/%3E%3Ccircle cx='80' cy='150' r='2'/%3E%3Ccircle cx='100' cy='70' r='1.6'/%3E%3Ccircle cx='18' cy='120' r='1.6'/%3E%3C/g%3E%3Cg fill='none' stroke='%23141A3A' stroke-opacity='.06' stroke-width='1.4'%3E%3Crect x='62' y='90' width='18' height='25' rx='2.5' transform='rotate(-14 71 102)'/%3E%3Cpath d='M150 160h10M155 155v10'/%3E%3C/g%3E%3C/svg%3E") 0 0/180px 180px;animation:hmpattern 60s linear infinite;will-change:transform}
@keyframes hmpattern{to{transform:translate3d(180px,180px,0)}}
@keyframes hmdrift{to{transform:translate3d(4%,-3%,0) rotate(4deg)}}
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
.hm-col button{display:block;padding:0;border:0;background:none;cursor:zoom-in;border-radius:4.5% / 3.2%;overflow:hidden;
  box-shadow:0 14px 30px -18px rgba(20,26,58,.55);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
.hm-col button:hover{transform:translateY(-6px) translateZ(40px) scale(1.04);box-shadow:0 30px 50px -20px rgba(20,26,58,.7)}
.hm-col img{display:block;width:100%;height:auto}
.hm-col button,.hm-grid button{position:relative}
.hm-col button::after,.hm-grid button::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.55) 45%,rgba(255,120,200,.25) 50%,rgba(120,210,255,.25) 55%,transparent 70%);
  background-size:300% 100%;background-position:100% 0;mix-blend-mode:overlay;opacity:0;transition:opacity .3s}
.hm-col button:hover::after,.hm-grid button:hover::after{opacity:1;animation:hmglint .9s ease-out forwards}
@keyframes hmglint{to{background-position:0 0}}
@keyframes hmup{to{transform:translateY(calc(-50% - 8px))}}
@media (hover:none){.hm-wall-in{animation:hmsway 9s ease-in-out infinite alternate}}
@keyframes hmsway{from{transform:rotateX(14deg) rotateY(-18deg) rotateZ(4deg) scale(1.12)}to{transform:rotateX(8deg) rotateY(-6deg) rotateZ(3deg) scale(1.12)}}
/* sezioni */
.hm-sec{max-width:1240px;margin:0 auto;padding:100px 28px 10px}
.hm-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px;counter-reset:s}
.hm-steps li{counter-increment:s;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:14px 14px 22px}
.hm-steps li{transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s,opacity .8s cubic-bezier(.2,.8,.2,1)}
.hm-steps li.in:hover{transform:translateY(-6px);box-shadow:0 28px 46px -30px rgba(20,26,58,.55)}
/* schermate animate dei passaggi */
.st{position:relative;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:#EEF0F5;container-type:inline-size}
.st1-card{position:absolute;left:6%;top:12%;width:36%;border-radius:4.5% / 3.2%;overflow:hidden;box-shadow:0 14px 24px -14px rgba(20,26,58,.6);animation:st1tilt 9s ease-in-out infinite}
.st1-card img{display:block;width:100%;height:auto}
.st1-empty{position:absolute;inset:0;border:2.2cqw solid #1F2A5C;border-radius:inherit;
  background:#fff repeating-conic-gradient(#E3E6EE 0 25%,#fff 0 50%) 0 0/9% 6.5%;animation:st1wipe 9s cubic-bezier(.7,0,.3,1) infinite}
.st1-name{position:absolute;left:0;right:0;top:0;height:13%;background:#1F2A5C;color:#fff;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:4.2cqw;display:flex;align-items:center;padding-left:6%}
.st1-name i,.st1-input i{font-style:normal;display:inline-block;overflow:hidden;white-space:nowrap;width:0;vertical-align:bottom;animation:st1type 9s steps(6,end) infinite}
.st1-up{position:absolute;left:50%;top:52%;width:9cqw;height:9cqw;margin:-4.5cqw;border-radius:50%;background:#1F2A5C;color:#fff;display:grid;place-items:center}
.st1-up svg{width:60%}
.st1-flash{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.75) 48%,transparent 66%);background-size:300% 100%;background-position:100% 0;mix-blend-mode:overlay;animation:st1flash 9s ease-in-out infinite}
.st1-panel{position:absolute;left:48%;right:5%;top:8%;font-size:2.7cqw;color:var(--muted)}
.st1-panel b{display:block;font-family:'Saira Condensed',sans-serif;font-size:3.6cqw;color:var(--ink);margin:0 0 1.4cqw}
.st1-pills,.st1-dots{display:flex;gap:1.6cqw;margin-bottom:3.6cqw}
.st1-pills span{flex:1;text-align:center;padding:1.8cqw 0;border-radius:1.6cqw;background:#fff;border:1px solid var(--line);font-weight:700;color:var(--ink);transition:none}
.st1-pills span.on{animation:st1pill 9s step-end infinite}
.st1-dots span{width:6.6cqw;height:6.6cqw;border-radius:50%;box-shadow:0 0 0 .5cqw #fff}
.st1-dots span.on{animation:st1dot 9s step-end infinite}
.st1-input{height:8cqw;border-radius:1.6cqw;background:#fff;border:1px solid var(--line);display:flex;align-items:center;padding:0 2.4cqw;font-weight:700;color:var(--ink);font-size:3.4cqw;margin-bottom:3.6cqw}
.st1-input::after{content:"";width:.4cqw;height:4.4cqw;background:var(--ink);margin-left:.4cqw;animation:st1caret .8s steps(2) infinite}
.st1-btn{display:inline-block;padding:2cqw 3.6cqw;border-radius:1.6cqw;background:var(--ink);color:#fff;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:3.4cqw;animation:st1press 9s ease infinite}
.st1-cursor{position:absolute;width:5.4cqw;left:80%;top:90%;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3));animation:st1cur 9s cubic-bezier(.6,0,.3,1) infinite}
@keyframes st1cur{0%{left:86%;top:96%}9%,14%{left:66%;top:22%}24%,29%{left:51%;top:45%}38%,50%{left:62%;top:69%}60%,66%{left:60%;top:86%}80%,100%{left:86%;top:96%}}
@keyframes st1pill{0%{background:#fff;color:var(--ink);border-color:var(--line)}11%{background:var(--ink);color:#fff;border-color:var(--ink)}96%{background:#fff;color:var(--ink);border-color:var(--line)}}
@keyframes st1dot{0%{box-shadow:0 0 0 .5cqw #fff}26%{box-shadow:0 0 0 .6cqw #fff,0 0 0 1.2cqw var(--ink)}96%{box-shadow:0 0 0 .5cqw #fff}}
@keyframes st1type{0%,40%{width:0}52%,96%{width:3.3em}100%{width:0}}
@keyframes st1caret{50%{opacity:0}}
@keyframes st1press{0%,61%,65%,100%{transform:none}63%{transform:scale(.92)}}
@keyframes st1wipe{0%,64%{clip-path:inset(0 0 0 0);opacity:1}76%,94%{clip-path:inset(0 0 100% 0);opacity:1}97%{clip-path:inset(0 0 100% 0);opacity:0}98%,100%{clip-path:inset(0 0 0 0);opacity:0}}
@keyframes st1flash{0%,74%{background-position:100% 0}88%,100%{background-position:0 0}}
@keyframes st1tilt{0%,72%,100%{transform:none}82%{transform:rotate(-3deg) scale(1.04)}92%{transform:none}}
.st2{background:#E9EAEF}
.st2-fan{position:absolute;left:50%;top:50%;width:34%;aspect-ratio:703/980;translate:-50% -46%}
.st2-fan img{position:absolute;inset:0;width:100%;height:100%;border-radius:4.5% / 3.2%;box-shadow:0 16px 26px -14px rgba(20,26,58,.6);transition:transform 1s cubic-bezier(.2,.8,.2,1);transform-origin:50% 120%}
.in .st2-fan img:nth-child(1){transform:rotate(-16deg) translateX(-8%)}
.in .st2-fan img:nth-child(3){transform:rotate(16deg) translateX(8%)}
.in .st2-fan img{animation:st2breath 6s ease-in-out 1s infinite}
.in .st2-fan img:nth-child(1){animation-name:st2b1}
.in .st2-fan img:nth-child(3){animation-name:st2b3}
@keyframes st2breath{50%{transform:translateY(-4%)}}
@keyframes st2b1{0%,100%{transform:rotate(-16deg) translateX(-8%)}50%{transform:rotate(-20deg) translateX(-12%)}}
@keyframes st2b3{0%,100%{transform:rotate(16deg) translateX(8%)}50%{transform:rotate(20deg) translateX(12%)}}
.st2-fan li,.st2-fan img:nth-child(2){z-index:2}
.st2-scan{position:absolute;z-index:3;left:-4%;right:-4%;height:6%;top:0;border-radius:4px;pointer-events:none;
  background:linear-gradient(transparent,rgba(255,255,255,.9),transparent);box-shadow:0 0 18px 4px rgba(120,200,255,.55);mix-blend-mode:screen;animation:st2scan 3s cubic-bezier(.5,0,.5,1) infinite}
@keyframes st2scan{0%{top:-6%;opacity:0}10%{opacity:1}80%{opacity:1}90%,100%{top:100%;opacity:0}}
@property --sn{syntax:'<integer>';initial-value:41;inherits:false}
.st2-serial{position:absolute;right:5%;bottom:6%;z-index:4;background:var(--ink);color:#fff;border-radius:999px;padding:1.4cqw 3cqw;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:3.8cqw;letter-spacing:.04em}
.st2-serial i{font-style:normal;counter-reset:sn var(--sn);animation:st2count 24s steps(8,end) infinite}
.st2-serial i::after{content:"0" counter(sn)}
@keyframes st2count{from{--sn:41}to{--sn:49}}
.st3 img{display:block;width:100%;height:100%;object-fit:cover;animation:st3zoom 14s ease-in-out infinite alternate}
@keyframes st3zoom{from{transform:scale(1.02)}to{transform:scale(1.12) translateY(-2%)}}
.st3-glare{position:absolute;inset:0;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.55) 47%,rgba(255,255,255,.1) 52%,transparent 62%);background-size:300% 100%;mix-blend-mode:soft-light;animation:hmsweep 5s cubic-bezier(.45,0,.2,1) infinite}
.st3-track{position:absolute;left:5%;right:5%;bottom:5%;background:rgba(255,255,255,.93);backdrop-filter:blur(6px);border-radius:2.4cqw;padding:2.4cqw 3cqw 2.8cqw;box-shadow:0 10px 20px -12px rgba(20,26,58,.5)}
.st3-track div{display:flex;justify-content:space-between;font-size:3cqw;font-weight:700;color:var(--muted)}
.st3-track span:nth-child(2){animation:st3on2 8s step-end infinite}
.st3-track span:nth-child(3){animation:st3on3 8s step-end infinite}
.st3-track span:first-child{color:var(--ink)}
.st3-track p{margin:1.8cqw 0 0;height:1.4cqw;border-radius:9px;background:#E3E6EE;overflow:hidden}
.st3-track p i{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#3FB58A,#1F86D6);animation:st3bar 8s cubic-bezier(.6,0,.3,1) infinite}
@keyframes st3bar{0%,8%{width:6%}40%{width:52%}75%,94%{width:100%}100%{width:6%}}
@keyframes st3on2{0%{color:var(--muted)}40%{color:var(--ink)}97%{color:var(--muted)}}
@keyframes st3on3{0%{color:var(--muted)}75%{color:#1E8A5E}97%{color:var(--muted)}}
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
/* anatomia della carta */
@property --ax{syntax:'<percentage>';initial-value:50%;inherits:true}
@property --ay{syntax:'<percentage>';initial-value:50%;inherits:true}
.an{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:70px;align-items:center}
.an-card{position:relative;width:min(100%,420px);justify-self:center;border-radius:4.5% / 3.2%;transition:--ax .7s cubic-bezier(.2,.8,.2,1),--ay .7s cubic-bezier(.2,.8,.2,1),opacity .8s,transform .8s;
  box-shadow:0 50px 80px -40px rgba(20,26,58,.7)}
.an-card img{display:block;width:100%;height:auto;border-radius:inherit}
.hm-js .an-card.rv{transition:--ax .7s cubic-bezier(.2,.8,.2,1),--ay .7s cubic-bezier(.2,.8,.2,1),opacity .8s cubic-bezier(.2,.8,.2,1),transform .8s cubic-bezier(.2,.8,.2,1)}
.an-dim{position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(circle at var(--ax) var(--ay),transparent 0,transparent 17%,rgba(12,16,38,.62) 30%)}
.an-shine{position:absolute;inset:0;border-radius:inherit;pointer-events:none;mix-blend-mode:overlay;
  background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.6) 47%,rgba(255,110,200,.3) 51%,rgba(110,210,255,.3) 55%,transparent 65%);background-size:300% 100%;animation:hmsweep 6s cubic-bezier(.45,0,.2,1) infinite}
.an-pin{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;border:2px solid #fff;background:var(--ink);color:#fff;cursor:pointer;
  font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:16px;line-height:1;display:grid;place-items:center;box-shadow:0 4px 10px rgba(0,0,0,.4);transition:transform .3s cubic-bezier(.2,.8,.2,1),background .3s}
.an-pin[data-on=true]{background:var(--red);transform:scale(1.25)}
.an-pin[data-on=true]::after{content:"";position:absolute;inset:-8px;border-radius:50%;border:2px solid #fff;animation:anping 1.4s ease-out infinite}
@keyframes anping{from{transform:scale(.7);opacity:1}to{transform:scale(1.8);opacity:0}}
.an-lead{color:var(--muted);font-size:19px;margin:-6px 0 22px}
.an-list{list-style:none;margin:0 0 28px;padding:0;display:grid;gap:4px}
.an-list button{width:100%;display:flex;align-items:flex-start;gap:16px;text-align:left;padding:12px 14px;border:0;border-radius:14px;background:transparent;color:inherit;font:inherit;cursor:pointer;transition:background .3s}
.an-list b{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:50%;border:1.5px solid var(--line);font-family:'Saira Condensed',sans-serif;font-size:17px;transition:all .3s}
.an-list strong{display:block;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:24px;line-height:1.1}
.an-list em{display:block;font-style:normal;color:var(--muted);font-size:15px;max-height:0;overflow:hidden;opacity:0;transition:max-height .4s,opacity .4s,margin .4s}
.an-list li[data-on=true] button{background:var(--panel);box-shadow:0 14px 28px -22px rgba(20,26,58,.5)}
.an-list li[data-on=true] b{background:var(--red);border-color:var(--red);color:#fff}
.an-list li[data-on=true] em{max-height:60px;opacity:1;margin-top:4px}
/* il raccoglitore */
.hm-binder-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 30px;margin-bottom:34px}
.hm-binder-head h2{margin:0 0 8px}
.hm-binder-head p{margin:0;color:var(--muted);max-width:52ch}
.bd{perspective:2400px;width:min(100%,calc((100svh - 150px) * 1.5),1000px);margin:0 auto}
.bd-book{position:relative;display:grid;grid-template-columns:1fr 1fr;padding:20px;border-radius:20px;transform:rotateX(9deg);transform-style:preserve-3d;
  background:radial-gradient(120% 90% at 30% 0%,#2A3152,#161A2E 70%);
  box-shadow:0 60px 80px -40px rgba(20,26,58,.65),0 2px 0 rgba(255,255,255,.06) inset,0 0 0 1px rgba(0,0,0,.4)}
.bd-book::before{content:"";position:absolute;inset:9px;border-radius:13px;border:1.5px dashed rgba(255,255,255,.13);pointer-events:none}
.bd-page{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;padding:14px;border-radius:8px;
  background:linear-gradient(160deg,#262B44,#1A1E31);
  box-shadow:inset 0 0 0 9px rgba(214,220,234,.10),inset 0 0 0 10px rgba(255,255,255,.08)}
.bd-page.l{padding-right:40px;border-radius:8px 3px 3px 8px}
.bd-page.r{padding-left:40px;border-radius:3px 8px 8px 3px}
.bd-page::after{content:"";position:absolute;top:0;bottom:0;width:56px;pointer-events:none;z-index:3}
.bd-page.l::after{right:0;background:linear-gradient(90deg,transparent,rgba(0,0,0,.5))}
.bd-page.r::after{left:0;background:linear-gradient(270deg,transparent,rgba(0,0,0,.5))}
/* la busta: cuciture chiare, carta incassata, plastica lucida sopra */
.bd-pocket{position:relative;aspect-ratio:703/980;padding:5.5% 6% 5%;box-sizing:border-box;
  border:4px solid rgba(214,220,234,.13);margin:-2px;
  background:radial-gradient(circle,rgba(255,255,255,.16) 1px,transparent 1.6px) 0 0/7px 7px,rgba(255,255,255,.03);
  background-clip:border-box}
.bd-pocket>*{position:relative;z-index:1}
.bd-pocket button,.bd-pocket>img{display:block;width:100%;height:100%;padding:0;border:0;background:none;cursor:zoom-in}
.bd-pocket img{display:block;width:100%;height:100%;object-fit:cover;border-radius:4.5% / 3.2%;user-select:none;
  filter:brightness(.9) contrast(1.05) saturate(.96);box-shadow:0 1px 2px rgba(0,0,0,.7),0 0 0 1px rgba(0,0,0,.35);
  transition:transform .5s cubic-bezier(.2,.8,.2,1),filter .5s}
.bd-pocket button:hover img{transform:translateY(-9%);filter:brightness(1) contrast(1.04)}
.bd-pocket::before{content:"";position:absolute;z-index:2;left:3%;right:3%;top:3.2%;height:2px;border-radius:50%;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.45) 20%,rgba(255,255,255,.25) 80%,transparent);box-shadow:0 1px 2px rgba(0,0,0,.4)}
.bd-pocket::after{content:"";position:absolute;z-index:2;inset:1.5%;border-radius:3px;pointer-events:none;
  background:
    linear-gradient(118deg,rgba(255,255,255,.42) 0%,rgba(255,255,255,.14) 18%,transparent 34%,transparent 58%,rgba(255,255,255,.14) 74%,transparent 86%) var(--gx,30%) var(--gy,30%)/260% 260%,
    linear-gradient(rgba(240,244,255,.07),rgba(240,244,255,.04));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 1px 0 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(0,0,0,.35);transition:background-position .6s ease-out}
.bd-spine{position:absolute;left:50%;top:20px;bottom:20px;width:54px;margin-left:-27px;display:flex;flex-direction:column;justify-content:space-around;align-items:center;z-index:3;pointer-events:none;
  background:linear-gradient(90deg,rgba(0,0,0,.35),#12162A 30%,#0E1122 50%,#12162A 70%,rgba(0,0,0,.35))}
.bd-spine i{display:block;width:70px;height:14px;border-radius:8px;background:linear-gradient(180deg,#F4F6FA,#9AA1B4 45%,#E3E7EF 60%,#7A8196);box-shadow:0 4px 8px rgba(0,0,0,.5)}
.bd-leaf{position:absolute;top:20px;bottom:20px;z-index:4;transform-style:preserve-3d;pointer-events:none}
.bd-leaf.next{left:50%;right:20px;transform-origin:left center;animation:bdnext .9s cubic-bezier(.5,.05,.25,1) forwards}
.bd-leaf.prev{left:20px;right:50%;transform-origin:right center;animation:bdprev .9s cubic-bezier(.5,.05,.25,1) forwards}
.bd-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.bd-face .bd-page{height:100%;box-sizing:border-box}
.bd-face.back{transform:rotateY(180deg)}
.bd-face::after{content:"";position:absolute;inset:0;border-radius:8px;pointer-events:none;background:#000;opacity:0;animation:bdshade .9s ease-in-out forwards}
@keyframes bdnext{from{transform:rotateY(0)}to{transform:rotateY(-180deg)}}
@keyframes bdprev{from{transform:rotateY(0)}to{transform:rotateY(180deg)}}
@keyframes bdshade{50%{opacity:.35}}
.bd-nav{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:26px;color:var(--muted);font-weight:600;font-size:15px}
.bd-nav button{display:grid;place-items:center;width:48px;height:48px;border-radius:50%;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .2s}
.bd-nav button:hover{transform:translateY(-2px);border-color:var(--ink);box-shadow:0 10px 18px -12px rgba(20,26,58,.5)}
.bd-nav svg{width:20px}
@media (max-width:700px){
  .bd-book{grid-template-columns:1fr;padding:12px;transform:none}
  .bd-book::before{inset:5px}
  .bd-page.l{display:none}
  .bd-page.r{padding:12px 12px 12px 30px;gap:8px}
  .bd-spine{left:12px;margin-left:0;width:22px;top:12px;bottom:12px}
  .bd-spine i{width:30px;height:10px}
  .bd-leaf.next{left:12px;right:12px;top:12px;bottom:12px}
  .bd-leaf.prev{display:none}
  .bd-face.back{display:none}
}
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
.hm-head-anim>*{animation:hmrise .9s cubic-bezier(.2,.8,.2,1) both}
.hm-head-anim>*:nth-child(2){animation-delay:.12s}
.hm-head-anim>*:nth-child(3){animation-delay:.24s}
.hm-stag>*{animation:hmrise .8s cubic-bezier(.2,.8,.2,1) both}
.hm-js .hm-stag.rv:not(.in)>*{animation-play-state:paused}
.hm-stag>*:nth-child(2){animation-delay:.12s}
.hm-stag>*:nth-child(3){animation-delay:.24s}
.hm-page-head{max-width:1240px;margin:0 auto;padding:70px 28px 10px}
.hm-page-head h1{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(50px,6.4vw,96px);line-height:.9;margin:0 0 18px;max-width:14ch}
.hm-page-head p{font-size:clamp(17px,1.4vw,20px);color:var(--muted);max-width:52ch;margin:0 0 26px}
.hm-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
.hm-grid button{display:block;padding:0;border:0;background:none;cursor:zoom-in;border-radius:4.5% / 3.2%;overflow:hidden;box-shadow:0 14px 30px -18px rgba(20,26,58,.55);transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
.hm-grid button.in:hover,.hm-grid button:not(.rv):hover{transform:translateY(-6px) rotate(-1deg);box-shadow:0 26px 44px -20px rgba(20,26,58,.6)}
.hm-grid img{display:block;width:100%;height:auto}
.hm-cards3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.hm-cards3>div{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:22px 24px}
.hm-cards3 h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:28px;margin:0 0 6px}
.hm-cards3 p{margin:0;color:var(--muted)}
.hm-occ{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 34px}
.hm-occ div{padding:18px 0;border-top:1px solid var(--line)}
.hm-occ h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:24px;margin:0 0 4px}
.hm-occ p{margin:0;color:var(--muted);font-size:15px}
.hm-prose{max-width:1240px}
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
  .hm-col>div{gap:10px}
  .hm-col.c1{margin-top:-50px}
  .hm-col.c3{display:none}
  .hm-sec{padding:70px 18px 6px}
  .hm-steps,.hm-split,.hm-feature{grid-template-columns:1fr}
  .hm-binder-head{margin-bottom:22px}
  .an{grid-template-columns:1fr;gap:18px}
  .an-card{width:min(78vw,340px)}
  .an-txt{display:contents}
  .an-txt h2{order:0;margin-bottom:0}
  .an-lead{order:1;margin:0}
  .an-card{order:2}
  .an-list{order:3;margin:0}
  .an .hm-btn{order:4;justify-self:start}
  .an-pin{width:26px;height:26px;margin:-13px 0 0 -13px;font-size:14px}
  .hm-feature{gap:34px}
  .hm-feature-card{width:min(70vw,300px)}
  .hm-price{grid-template-columns:1fr;padding:14px 18px}
  .hm-price td:nth-child(2){display:none}
  .hm-price th{white-space:normal}
  .hm-final{padding:44px 18px;margin-top:60px}
}
@media (prefers-reduced-motion:reduce){.hm *{animation:none !important;transition:none !important}}
`;
