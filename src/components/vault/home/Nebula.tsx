import { useEffect, useRef } from "react";

/**
 * Sfondo animato in WebGL: nebulosa che scorre, raggi di luce e scintille,
 * con il colore d'accento che si può cambiare. Ricade su un gradiente CSS se
 * WebGL non c'è; con "riduci movimento" disegna un solo fotogramma.
 */
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uAcc;
uniform float uRays;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8,-0.6,0.6,0.8);
  for (int i = 0; i < 5; i++){ v += a*noise(p); p = r*p*2.02; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - 0.5*uRes.xy) / uRes.y;
  float t = uTime * 0.045;
  vec2 m = (uMouse - 0.5) * 0.35;
  // nebulosa con distorsione a dominio
  vec2 q = vec2(fbm(p*1.6 + vec2(0.0, t) + m), fbm(p*1.6 + vec2(5.2, -t*0.8) - m));
  vec2 r = vec2(fbm(p*1.8 + 3.0*q + vec2(1.7, 9.2) + t*1.3), fbm(p*1.8 + 3.0*q + vec2(8.3, 2.8) - t));
  float n = fbm(p*1.4 + 2.5*r);
  vec3 deep = vec3(0.020, 0.028, 0.090);
  vec3 navy = vec3(0.090, 0.110, 0.300);
  vec3 violet = vec3(0.330, 0.170, 0.560);
  vec3 col = mix(deep, navy, smoothstep(0.15, 0.75, n));
  col = mix(col, violet, smoothstep(0.45, 0.95, length(q)) * 0.75);
  col = mix(col, uAcc, smoothstep(0.62, 1.05, r.x * n * 1.7) * 0.85);
  // raggi di luce dall'alto
  vec2 o = p - vec2(m.x*0.6, 0.62);
  float ang = atan(o.x, -o.y);
  float rays = pow(max(0.0, sin(ang*14.0 + t*6.0) * 0.5 + 0.5), 6.0) + pow(max(0.0, sin(ang*7.0 - t*4.0)*0.5+0.5), 9.0);
  rays *= smoothstep(1.6, 0.0, length(o)) * uRays;
  col += uAcc * rays * 0.22 + vec3(1.0) * rays * 0.05;
  // bagliore centrale
  col += uAcc * 0.35 * exp(-3.2 * length(p - vec2(m.x, -0.05 + m.y)));
  // stelle
  vec2 g = gl_FragCoord.xy / 3.0;
  float s = hash(floor(g));
  float tw = 0.5 + 0.5*sin(uTime*2.0 + s*60.0);
  col += vec3(step(0.9975, s) * tw * 0.9);
  // vignetta e grana
  col *= smoothstep(1.25, 0.25, length(uv - 0.5) * 1.3);
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const hexToRgb = (h: string) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function Nebula({
  accent = "#E2A917",
  rays = 1,
  className = "",
}: {
  accent?: string;
  rays?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const acc = useRef(hexToRgb(accent));
  const target = useRef(hexToRgb(accent));
  target.current = hexToRgb(accent);

  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) {
      cv.style.background = "radial-gradient(120% 90% at 50% 30%,#2B3570,#070A1F 70%)";
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      cv.style.background = "radial-gradient(120% 90% at 50% 30%,#2B3570,#070A1F 70%)";
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uAcc = gl.getUniformLocation(prog, "uAcc");
    const uRays = gl.getUniformLocation(prog, "uRays");

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scale = Math.min(1, (devicePixelRatio || 1) * 0.55);
    const size = () => {
      cv.width = Math.max(2, Math.round(cv.clientWidth * scale));
      cv.height = Math.max(2, Math.round(cv.clientHeight * scale));
      gl.viewport(0, 0, cv.width, cv.height);
    };
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    size();

    let mx = 0.5,
      my = 0.5,
      sx = 0.5,
      sy = 0.5,
      raf = 0,
      visible = true;
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    });
    io.observe(cv);
    const t0 = performance.now();
    const frame = (now: number) => {
      sx += (mx - sx) * 0.04;
      sy += (my - sy) * 0.04;
      for (let i = 0; i < 3; i++) acc.current[i] += (target.current[i] - acc.current[i]) * 0.05;
      gl.uniform2f(uRes, cv.width, cv.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uMouse, sx, sy);
      gl.uniform3f(uAcc, acc.current[0], acc.current[1], acc.current[2]);
      gl.uniform1f(uRays, rays);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [rays]);

  return <canvas ref={ref} className={`hx-nebula ${className}`} aria-hidden />;
}

/** Scintille e polvere luminosa sopra la nebulosa; esplodono al clic. */
export function Sparks({ accent = "#E2A917", count = 160 }: { accent?: string; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const accRef = useRef(accent);
  accRef.current = accent;
  useEffect(() => {
    const cv = ref.current!;
    const g = cv.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0,
      H = 0,
      raf = 0;
    const size = () => {
      const d = Math.min(2, devicePixelRatio || 1);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = W * d;
      cv.height = H * d;
      g.setTransform(d, 0, 0, d, 0, 0);
    };
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    size();
    const P = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 2.2,
      v: 0.0002 + Math.random() * 0.0007,
      ph: Math.random() * 6.3,
      c: Math.random() < 0.4,
    }));
    const B: { x: number; y: number; vx: number; vy: number; l: number; m: number; c: boolean }[] = [];
    const burst = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left,
        y = e.clientY - r.top;
      if (y < 0 || y > r.height) return;
      for (let i = 0; i < 60; i++) {
        const a = Math.random() * 6.283,
          v = 2 + Math.random() * 7;
        B.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, l: 0, m: 40 + Math.random() * 50, c: Math.random() < 0.6 });
      }
    };
    window.addEventListener("pointerdown", burst);
    const frame = (t: number) => {
      g.clearRect(0, 0, W, H);
      const acc = accRef.current;
      for (const p of P) {
        p.y -= p.v;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.0013 + p.ph));
        g.globalAlpha = tw * (p.c ? 0.95 : 0.6);
        g.fillStyle = p.c ? acc : "#fff";
        g.shadowColor = g.fillStyle;
        g.shadowBlur = p.r * 6;
        g.beginPath();
        g.arc(p.x * W, p.y * H, p.r, 0, 6.283);
        g.fill();
      }
      for (let i = B.length - 1; i >= 0; i--) {
        const b = B[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.955;
        b.vy = b.vy * 0.955 + 0.14;
        b.l++;
        g.globalAlpha = 1 - b.l / b.m;
        g.fillStyle = b.c ? acc : "#fff";
        g.shadowColor = g.fillStyle;
        g.shadowBlur = 10;
        g.beginPath();
        g.arc(b.x, b.y, 2, 0, 6.283);
        g.fill();
        if (b.l >= b.m) B.splice(i, 1);
      }
      g.globalAlpha = 1;
      g.shadowBlur = 0;
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointerdown", burst);
    };
  }, [count]);
  return <canvas ref={ref} className="hx-sparks" aria-hidden />;
}
