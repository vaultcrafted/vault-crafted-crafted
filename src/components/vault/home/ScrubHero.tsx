import { useEffect, useRef } from "react";

/**
 * Apertura con video comandato dallo scorrimento: scendi e il video va avanti,
 * risali e torna indietro. Il video viene scaricato intero (Blob) così lo
 * scorrimento funziona su qualunque hosting; su telefono, tablet in verticale e
 * con "riduci movimento" si vede solo il fotogramma finale, già composto.
 */
export const STATIC_GATES = [
  "(max-width: 720px)",
  "(orientation: portrait) and (max-width: 1024px)",
  "(orientation: portrait) and (pointer: coarse)",
  "(orientation: landscape) and (pointer: coarse) and (max-height: 560px)",
  "(prefers-reduced-motion: reduce)",
];

const smooth = (p: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function ScrubHero({
  video,
  videoWebm,
  poster,
  ending,
  children,
  settle,
}: {
  video: string;
  /** versione WebM (VP9), più leggera: usata dove il browser la supporta */
  videoWebm?: string;
  poster: string;
  ending: string;
  /** didascalie: elementi con data-band="a,b" (avanzamento 0..1) */
  children: React.ReactNode;
  /** contenuto che compare quando il video si ferma (anche nella versione statica) */
  settle: React.ReactNode;
}) {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const ring = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = wrap.current!,
      st = stage.current!,
      v = vid.current!;
    const bands = [...st.querySelectorAll<HTMLElement>("[data-band]")].map((el) => {
      const [a, b] = (el.dataset.band ?? "0,1").split(",").map(Number);
      return { el, a, b, op: -1, k: -1 };
    });
    const settleEl = st.querySelector<HTMLElement>(".sh-settle");
    let lastSettle = -1;

    let target = 0,
      shown = 0,
      raf: number | null = null,
      last = 0,
      onScreen = true,
      started = false,
      seekBusy = false,
      pending: number | null = null,
      on = false;

    const progress = () => {
      const r = root.getBoundingClientRect();
      const total = r.height - innerHeight;
      return Math.max(0, Math.min(1, -r.top / Math.max(1, total)));
    };
    const seek = (t: number) => {
      if (!v.duration) return;
      if (seekBusy) {
        pending = t;
        return;
      }
      seekBusy = true;
      v.currentTime = t;
    };
    v.addEventListener("seeked", () => {
      seekBusy = false;
      if (pending !== null) {
        const t = pending;
        pending = null;
        seek(t);
      }
    });
    v.addEventListener("error", () => {
      seekBusy = false;
      pending = null;
      st.classList.add("sh-failed");
    });

    const paint = (p: number) => {
      bands.forEach((b, i) => {
        const f = Math.min(0.05, (b.b - b.a) / 4);
        const inn = i === 0 ? 1 : smooth(p, b.a, b.a + f);
        const out = 1 - smooth(p, b.b - f, b.b);
        const op = Math.round(inn * out * 100) / 100;
        if (op !== b.op) {
          b.op = op;
          b.el.style.opacity = String(op);
          b.el.style.visibility = op <= 0 ? "hidden" : "visible";
        }
        const k = Math.round(Math.min(1, Math.max(0, i === 0 ? 1 : (p - b.a) / (f * 1.6))) * 100) / 100;
        if (k !== b.k) {
          b.k = k;
          b.el.style.setProperty("--k", String(k));
        }
      });
      const s = Math.round(smooth(p, 0.86, 0.99) * 100) / 100;
      if (s !== lastSettle && settleEl) {
        lastSettle = s;
        settleEl.style.setProperty("--k", String(s));
        settleEl.style.visibility = s <= 0 ? "hidden" : "visible";
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(100, now - (last || now));
      last = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.14, dt / 16.667));
      if (Math.abs(target - shown) < 0.0005) {
        shown = target;
        raf = null;
        last = 0;
      } else raf = requestAnimationFrame(tick);
      seek(shown * (v.duration || 0));
      paint(shown);
    };
    const onScroll = () => {
      target = progress();
      if (raf === null && onScreen) raf = requestAnimationFrame(tick);
    };

    const startFetch = async () => {
      if (started) return;
      started = true;
      try {
        const ctrl = new AbortController();
        let dog = setTimeout(() => ctrl.abort(), 20000);
        const webm = videoWebm && v.canPlayType('video/webm; codecs="vp9"') ? videoWebm : null;
        const res = await fetch(webm ?? video, { signal: ctrl.signal });
        if (!res.ok || !res.body) throw new Error("video");
        const total = Number(res.headers.get("Content-Length")) || 6_000_000;
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let got = 0,
          lastRing = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          clearTimeout(dog);
          dog = setTimeout(() => ctrl.abort(), 20000);
          chunks.push(value);
          got += value.length;
          const nowT = performance.now();
          if (nowT - lastRing > 100) {
            lastRing = nowT;
            ring.current?.style.setProperty("--ld", String(Math.round(126 * (1 - Math.min(1, got / total)))));
          }
        }
        clearTimeout(dog);
        ring.current?.style.setProperty("--ld", "0");
        v.src = URL.createObjectURL(new Blob(chunks as BlobPart[], { type: webm ? "video/webm" : "video/mp4" }));
        v.load();
        v.addEventListener(
          "canplay",
          () => {
            seek(progress() * v.duration);
            st.classList.add("sh-ready");
          },
          { once: true },
        );
      } catch {
        st.classList.add("sh-failed");
      }
    };

    const enable = () => {
      if (on) return;
      on = true;
      st.style.setProperty("--poster", `url('${poster}')`);
      const im = new Image();
      im.onload = () => void startFetch();
      im.onerror = () => void startFetch();
      im.src = poster;
      setTimeout(() => void startFetch(), 4000);
      bands.forEach((b) => {
        b.op = -1;
        b.k = -1;
      });
      lastSettle = -1;
      addEventListener("scroll", onScroll, { passive: true });
      shown = target = progress();
      paint(shown);
      onScroll();
    };
    const disable = () => {
      if (!on) return;
      on = false;
      removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
    };
    const mqls = STATIC_GATES.map((q) => matchMedia(q));
    const apply = () => (mqls.some((m) => m.matches) ? disable() : enable());
    mqls.forEach((m) => m.addEventListener("change", apply));
    apply();
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) onScroll();
    });
    io.observe(root);
    addEventListener("resize", onScroll);
    return () => {
      disable();
      io.disconnect();
      removeEventListener("resize", onScroll);
      mqls.forEach((m) => m.removeEventListener("change", apply));
    };
  }, [video, videoWebm, poster]);

  return (
    <section ref={wrap} className="sh">
      <div ref={stage} className="sh-stage" style={{ ["--ending" as string]: `url('${ending}')` }}>
        <div className="sh-poster" aria-hidden />
        <video ref={vid} className="sh-video" muted playsInline preload="none" aria-hidden tabIndex={-1} />
        <div className="sh-scrim" aria-hidden />
        <div className="sh-bands">{children}</div>
        <div className="sh-settle">{settle}</div>
        <svg ref={ring} className="sh-ring" viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="126"
            style={{ strokeDashoffset: "var(--ld,126)" }}
          />
        </svg>
      </div>
    </section>
  );
}

export const SCRUB_CSS = `
.sh{position:relative;height:260vh}
.sh-stage{position:sticky;top:0;height:100svh;overflow:hidden;background:#10151F}
.sh-poster,.sh-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sh-poster{background:var(--poster) center/cover no-repeat}
.sh-video{opacity:0;transition:opacity .6s;transform:translateZ(0)}
.sh-stage.sh-ready .sh-video{opacity:1}
.sh-scrim{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 120% 95% at 50% 50%,rgba(16,21,31,0) 40%,rgba(16,21,31,.7) 100%)}
.sh-bands>*{position:absolute;opacity:0;visibility:hidden;will-change:opacity}
.sh-bands>*:first-child{opacity:1;visibility:visible}
.sh-settle{--k:0;position:absolute;inset:0;visibility:hidden;pointer-events:none}
.sh-settle>*{pointer-events:auto}
.sh-ring{position:absolute;right:28px;bottom:26px;width:34px;height:34px;color:#E7EAEE;transition:opacity .5s}
.sh-stage.sh-ready .sh-ring,.sh-stage.sh-failed .sh-ring{opacity:0}
@media (max-width: 720px),(orientation: portrait) and (max-width: 1024px),(orientation: portrait) and (pointer: coarse),(orientation: landscape) and (pointer: coarse) and (max-height: 560px),(prefers-reduced-motion: reduce){
  .sh{height:auto}
  .sh-stage{position:relative;height:auto;min-height:100svh}
  .sh-poster{background-image:var(--ending)}
  .sh-video,.sh-ring,.sh-bands{display:none}
  .sh-settle{--k:1 !important;visibility:visible !important;position:relative;inset:auto}
}
`;
