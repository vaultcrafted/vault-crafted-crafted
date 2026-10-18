import { useEffect, useRef } from "react";
import {
  CARD_H,
  CARD_W,
  elementOf,
  renderCard,
  type ArtState,
  type CardData,
} from "@/lib/vaultCard";

/**
 * Anteprima dal vivo della carta: canvas ritagliato sul formato finito,
 * sfondo con aurora, raggi, particelle, stelle cadenti, e carta che si
 * inclina seguendo il mouse. Trascinando si sposta l'illustrazione.
 */
export function CardStage({
  data,
  art,
  artVersion,
  fontsVersion,
  compact = false,
}: {
  data: CardData;
  art: React.MutableRefObject<ArtState>;
  artVersion: number;
  fontsVersion: number;
  compact?: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef(data);
  const dragging = useRef<null | { x: number; y: number; px: number; py: number }>(null);
  dataRef.current = data;

  const draw = () => {
    const cv = cvRef.current,
      c = cv?.getContext("2d");
    if (!cv || !c) return;
    cv.style.touchAction = art.current.img ? "none" : "auto";
    void renderCard(c, dataRef.current, art.current);
  };

  useEffect(draw, [data, artVersion, fontsVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // trascinamento illustrazione
  useEffect(() => {
    const cv = cvRef.current!;
    const down = (e: PointerEvent) => {
      if (!art.current.img) return;
      dragging.current = { x: e.clientX, y: e.clientY, px: art.current.px, py: art.current.py };
      cv.setPointerCapture(e.pointerId);
      cv.classList.add("is-drag");
    };
    const move = (e: PointerEvent) => {
      const d = dragging.current;
      if (!d) return;
      const k = CARD_W / cv.getBoundingClientRect().width;
      art.current.px = d.px + (e.clientX - d.x) * k;
      art.current.py = d.py + (e.clientY - d.y) * k;
      draw();
    };
    const up = () => {
      dragging.current = null;
      cv.classList.remove("is-drag");
    };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    return () => {
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // effetti
  useEffect(() => {
    const stage = stageRef.current!,
      fx = fxRef.current!,
      card = cardRef.current!,
      glare = glareRef.current!;
    const g = fx.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0,
      H = 0,
      raf = 0;
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = stage.clientWidth;
      H = stage.clientHeight;
      fx.width = W * dpr;
      fx.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(size);
    ro.observe(stage);
    size();

    const P = Array.from({ length: compact ? 120 : 220 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 2.8,
      v: 0.00015 + Math.random() * 0.0005,
      dx: (Math.random() - 0.5) * 0.0002,
      ph: Math.random() * 6.28,
      c: Math.random() < 0.45,
    }));
    const STARS: { x: number; y: number; s: number; life: number; max: number; c: boolean }[] = [];
    const STREAKS: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    const BURST: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
      r: number;
      c: boolean;
    }[] = [];
    let mx = 0.5,
      my = 0.5,
      tx = 0,
      ty = 0,
      rx = 0,
      ry = 0,
      hover = false,
      lastAcc = "",
      nextStreak = 0;

    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
      hover = e.pointerType === "mouse" && mx >= -0.15 && mx <= 1.15 && my >= -0.1 && my <= 1.1;
      tx = hover ? (mx - 0.5) * 2 : 0;
      ty = hover ? (my - 0.5) * 2 : 0;
    };
    const onLeave = () => {
      hover = false;
      tx = ty = 0;
    };
    const onDown = (e: PointerEvent) => {
      if (reduce) return;
      const r = stage.getBoundingClientRect(),
        x = e.clientX - r.left,
        y = e.clientY - r.top;
      for (let i = 0; i < 46; i++) {
        const a = Math.random() * 6.283,
          v = 1.5 + Math.random() * 5;
        BURST.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 1.5,
          life: 0,
          max: 40 + Math.random() * 40,
          r: 1 + Math.random() * 2.5,
          c: Math.random() < 0.6,
        });
      }
    };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointerdown", onDown);

    const star = (x: number, y: number, s: number, a: number, col: string) => {
      g.save();
      g.globalAlpha = a;
      g.fillStyle = col;
      g.shadowColor = col;
      g.shadowBlur = s * 1.5;
      g.translate(x, y);
      g.beginPath();
      g.moveTo(0, -s);
      g.quadraticCurveTo(0, 0, s, 0);
      g.quadraticCurveTo(0, 0, 0, s);
      g.quadraticCurveTo(0, 0, -s, 0);
      g.quadraticCurveTo(0, 0, 0, -s);
      g.fill();
      g.restore();
    };

    const frame = (t: number) => {
      const acc = elementOf(dataRef.current.el)[2];
      if (acc !== lastAcc) {
        stage.style.setProperty("--acc", acc);
        lastAcc = acc;
      }
      g.clearRect(0, 0, W, H);
      if (!reduce) {
        if (Math.random() < 0.08)
          STARS.push({
            x: Math.random() * W,
            y: Math.random() * H,
            s: 5 + Math.random() * 11,
            life: 0,
            max: 50 + Math.random() * 70,
            c: Math.random() < 0.5,
          });
        for (let i = STARS.length - 1; i >= 0; i--) {
          const s = STARS[i];
          s.life++;
          const k = Math.sin((Math.PI * s.life) / s.max);
          star(s.x, s.y, s.s * k, k * 0.95, s.c ? acc : "#FFFFFF");
          if (s.life >= s.max) STARS.splice(i, 1);
        }
        if (t > nextStreak) {
          nextStreak = t + 1200 + Math.random() * 2600;
          const fromL = Math.random() < 0.5;
          STREAKS.push({
            x: fromL ? -40 : W + 40,
            y: Math.random() * H * 0.6,
            vx: (fromL ? 1 : -1) * (9 + Math.random() * 7),
            vy: 3 + Math.random() * 3,
            life: 0,
          });
        }
        for (let i = STREAKS.length - 1; i >= 0; i--) {
          const s = STREAKS[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life++;
          const gr = g.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
          gr.addColorStop(0, "rgba(255,255,255,.95)");
          gr.addColorStop(1, "rgba(255,255,255,0)");
          g.strokeStyle = gr;
          g.lineWidth = 2;
          g.lineCap = "round";
          g.beginPath();
          g.moveTo(s.x, s.y);
          g.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
          g.stroke();
          star(s.x, s.y, 5, 1, "#FFFFFF");
          if (s.life > 120 || s.x < -200 || s.x > W + 200 || s.y > H + 100) STREAKS.splice(i, 1);
        }
        for (let i = BURST.length - 1; i >= 0; i--) {
          const b = BURST[i];
          b.x += b.vx;
          b.y += b.vy;
          b.vx *= 0.96;
          b.vy = b.vy * 0.96 + 0.12;
          b.life++;
          g.globalAlpha = 1 - b.life / b.max;
          g.fillStyle = b.c ? acc : "#FFFFFF";
          g.shadowColor = g.fillStyle as string;
          g.shadowBlur = 8;
          g.beginPath();
          g.arc(b.x, b.y, b.r, 0, 6.283);
          g.fill();
          if (b.life >= b.max) BURST.splice(i, 1);
        }
        g.globalAlpha = 1;
        g.shadowBlur = 0;
      }
      for (const p of P) {
        if (!reduce) {
          p.y -= p.v;
          p.x += p.dx + (hover ? (mx - 0.5) * 0.0004 : 0);
          if (p.y < -0.02) {
            p.y = 1.02;
            p.x = Math.random();
          }
          if (p.x < -0.02) p.x = 1.02;
          if (p.x > 1.02) p.x = -0.02;
        }
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.0012 + p.ph));
        g.globalAlpha = tw * (p.c ? 0.9 : 0.7);
        g.fillStyle = p.c ? acc : "#FFFFFF";
        g.shadowColor = g.fillStyle as string;
        g.shadowBlur = p.r * 5;
        g.beginPath();
        g.arc(p.x * W, p.y * H, p.r, 0, 6.283);
        g.fill();
      }
      g.globalAlpha = 1;
      g.shadowBlur = 0;
      const k = reduce || dragging.current ? 0 : 1;
      rx += (-ty * 9 * k - rx) * 0.12;
      ry += (tx * 12 * k - ry) * 0.12;
      card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      glare.style.opacity = hover && !dragging.current ? "1" : "0";
      glare.style.background = `radial-gradient(circle at ${(mx * 100).toFixed(1)}% ${(my * 100).toFixed(1)}%, rgba(255,255,255,.75), rgba(255,255,255,.15) 30%, rgba(0,0,0,.25) 75%)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointerdown", onDown);
    };
  }, [compact]);

  return (
    <div ref={stageRef} className={`vc-stage${compact ? " vc-compact" : ""}`}>
      <div className="vc-aura" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="vc-rays" aria-hidden />
      <div className="vc-halo" aria-hidden />
      <canvas ref={fxRef} className="vc-fx" aria-hidden />
      <div ref={cardRef} className="vc-card">
        <canvas ref={cvRef} width={CARD_W} height={CARD_H} aria-label="Anteprima della tua carta" />
        <div ref={glareRef} className="vc-glare" />
      </div>
    </div>
  );
}

export const STAGE_CSS = `
.vc-stage{--acc:#E2A917;position:relative;overflow:hidden;perspective:1100px;display:flex;align-items:center;justify-content:center;padding:40px 28px;border-radius:22px;
  background:radial-gradient(120% 80% at 50% 35%,#AEB8D6 0%,#8C97BC 60%,#737EA6 100%);box-shadow:inset 0 0 0 1px rgba(20,26,58,.08)}
.vc-stage.vc-compact{padding:14px;border-radius:0}
.vc-aura,.vc-rays,.vc-halo{position:absolute;pointer-events:none;z-index:0}
.vc-aura{inset:-25%;filter:blur(50px);opacity:.8}
.vc-aura i{position:absolute;width:48%;aspect-ratio:1;border-radius:50%;mix-blend-mode:screen;opacity:.75}
.vc-aura i:nth-child(1){background:var(--acc);left:8%;top:12%;animation:vcau1 13s ease-in-out infinite alternate;transition:background 1s}
.vc-aura i:nth-child(2){background:#59B8FF;right:4%;top:38%;animation:vcau2 17s ease-in-out infinite alternate}
.vc-aura i:nth-child(3){background:#FF7AB6;left:28%;bottom:2%;animation:vcau3 21s ease-in-out infinite alternate;opacity:.5}
@keyframes vcau1{to{transform:translate(40%,30%) scale(1.25)}}
@keyframes vcau2{to{transform:translate(-45%,-20%) scale(.85)}}
@keyframes vcau3{to{transform:translate(20%,-40%) scale(1.2)}}
.vc-rays{left:50%;top:50%;width:190%;aspect-ratio:1;translate:-50% -50%;
  background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.55) 0 3deg,transparent 3deg 12deg);
  -webkit-mask:radial-gradient(circle,#000 0,rgba(0,0,0,.35) 25%,transparent 55%);mask:radial-gradient(circle,#000 0,rgba(0,0,0,.35) 25%,transparent 55%);
  mix-blend-mode:soft-light;animation:vcspin 70s linear infinite}
@keyframes vcspin{to{rotate:360deg}}
.vc-halo{left:50%;top:50%;width:80%;aspect-ratio:1;translate:-50% -50%;border-radius:50%;
  background:radial-gradient(circle,color-mix(in srgb,var(--acc) 70%,#fff) 0,transparent 62%);opacity:.55;animation:vcpulse 4.5s ease-in-out infinite}
@keyframes vcpulse{50%{opacity:.9;scale:1.12}}
.vc-fx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
.vc-card{position:relative;z-index:2;width:min(100%,460px);aspect-ratio:744/1040;border-radius:4.7%/3.37%;overflow:hidden;transform-style:preserve-3d;will-change:transform;
  background:repeating-conic-gradient(#d9dbe2 0 25%,#f3f4f7 0 50%) 0 0/24px 24px;box-shadow:0 30px 60px -18px rgba(20,26,58,.65),0 0 0 1px rgba(20,26,58,.18)}
.vc-compact .vc-card{width:auto;height:min(36vh,330px)}
.vc-card canvas{position:absolute;left:-7.93%;top:-5.673%;width:115.86%;height:111.35%;display:block;touch-action:none;cursor:grab}
.vc-card canvas.is-drag{cursor:grabbing}
.vc-glare{position:absolute;inset:0;pointer-events:none;mix-blend-mode:soft-light;opacity:0;transition:opacity .3s;border-radius:inherit}
@media (prefers-reduced-motion:reduce){.vc-aura i,.vc-rays,.vc-halo{animation:none}}
`;
