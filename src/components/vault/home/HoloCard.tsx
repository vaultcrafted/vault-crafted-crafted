import { useRef } from "react";

/**
 * Carta con effetto olografico: si inclina seguendo il puntatore, riflesso
 * di luce e pellicola arcobaleno che scorre. Senza puntatore ondeggia da sola.
 */
export function HoloCard({
  src,
  alt,
  className = "",
  foil = 0.55,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  foil?: number;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const set = (x: number, y: number, on: boolean) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    el.style.setProperty("--rx", `${((0.5 - y) * 22).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * 26).toFixed(2)}deg`);
    el.style.setProperty("--pos", `${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%`);
    el.classList.toggle("on", on);
  };
  return (
    <div
      ref={ref}
      className={`hx-holo ${className}`}
      style={{ ["--foil" as string]: foil }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, true);
      }}
      onPointerLeave={() => set(0.5, 0.5, false)}
      onClick={onClick}
    >
      <div className="hx-holo-in">
        <img src={src} alt={alt} draggable={false} />
        <i className="hx-foil" aria-hidden />
        <i className="hx-glare" aria-hidden />
      </div>
    </div>
  );
}

export const HOLO_CSS = `
.hx-holo{--mx:50%;--my:50%;--rx:0deg;--ry:0deg;--pos:50% 50%;perspective:1200px;position:relative}
.hx-holo-in{position:relative;border-radius:4.5% / 3.2%;overflow:hidden;transform:rotateX(var(--rx)) rotateY(var(--ry));transform-style:preserve-3d;
  transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s;box-shadow:0 40px 80px -30px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.08);animation:hxwobble 7s ease-in-out infinite}
.hx-holo.on .hx-holo-in{transition:transform .08s linear;animation:none;box-shadow:0 50px 90px -30px rgba(0,0,0,.85),0 0 60px -10px var(--glow,rgba(226,169,23,.55))}
.hx-holo img{display:block;width:100%;height:auto;user-select:none}
.hx-foil,.hx-glare{position:absolute;inset:0;pointer-events:none}
.hx-foil{opacity:calc(var(--foil) * .16);mix-blend-mode:color-dodge;transition:opacity .4s;
  background:
   repeating-linear-gradient(115deg,#ff2d6f 0%,#ffd23f 7%,#3dffb5 14%,#3dc8ff 21%,#b25cff 28%,#ff2d6f 35%) ,
   radial-gradient(farthest-corner at var(--mx) var(--my),rgba(255,255,255,.35),rgba(0,0,0,.35));
  background-size:300% 300%,100% 100%;background-position:var(--pos),center;background-blend-mode:overlay;filter:saturate(1.3) contrast(1.1)}
.hx-holo.on .hx-foil{opacity:calc(var(--foil) * .42)}
.hx-glare{background:radial-gradient(circle at var(--mx) var(--my),rgba(255,255,255,.55),rgba(255,255,255,.08) 28%,transparent 60%);mix-blend-mode:overlay;opacity:.35;transition:opacity .3s}
.hx-holo.on .hx-glare{opacity:1}
@keyframes hxwobble{0%,100%{transform:rotateX(4deg) rotateY(-8deg)}50%{transform:rotateX(-3deg) rotateY(8deg)}}
@media (prefers-reduced-motion:reduce){.hx-holo-in{animation:none}}
`;
