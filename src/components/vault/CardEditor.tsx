import { useEffect, useState } from "react";
import {
  CATS,
  ELEMENTS,
  MAX_EDITION,
  badgeURL,
  catOf,
  type CardData,
  type CatKey,
  type ElKey,
  type MoveMode,
} from "@/lib/vaultCard";

// testi d'esempio mostrati sulla carta finché il campo è vuoto
const SAMPLE = {
  name: "Il tuo nome",
  abName: "Nome abilità",
  abText: "Descrivi cosa fa la sua abilità speciale.",
  m1: "Primo attacco",
  t1: "Racconta la mossa: un'abitudine, una battuta, un ricordo che vi lega.",
  m2: "Secondo attacco",
  t2: "La mossa finale, quella che lo rende unico.",
  motto: "Il motto della carta.",
};
export const withSamples = (d: CardData): CardData => ({
  ...d,
  name: d.name || SAMPLE.name,
  abName: d.abName || SAMPLE.abName,
  abText: d.abText || SAMPLE.abText,
  m1: d.m1 || SAMPLE.m1,
  t1: d.t1 || SAMPLE.t1,
  m2: d.m2 || SAMPLE.m2,
  t2: d.t2 || SAMPLE.t2,
  motto: d.motto || SAMPLE.motto,
});

export function useCompact(query = "(max-width: 900px)") {
  const [c, setC] = useState(false);
  useEffect(() => {
    const m = matchMedia(query);
    const f = () => setC(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, [query]);
  return c;
}

/** Campi della carta, condivisi tra configuratore (/crea) e pannello admin. */
export function CardEditor({
  d,
  set,
  photoStep,
  showPrices = true,
}: {
  d: CardData;
  set: (p: Partial<CardData>) => void;
  photoStep?: React.ReactNode;
  showPrices?: boolean;
}) {
  const cat = catOf(d.cat);
  let n = 0;
  const next = () => ++n;
  return (
    <>
      <Step n={next()} title="Categoria">
        <div className="vc-cats">
          {CATS.map((c) => (
            <button
              key={c.k}
              type="button"
              aria-pressed={d.cat === c.k}
              onClick={() => set({ cat: c.k as CatKey })}
            >
              <span className="n">{c.n}</span>
              {showPrices && <span className="p">€{c.price}</span>}
            </button>
          ))}
        </div>
        <p className="vc-hint">{cat.hint}</p>
      </Step>

      <Step n={next()} title="Elemento">
        <div className="vc-els">
          {ELEMENTS.map(([k, name]) => (
            <button
              key={k}
              type="button"
              aria-pressed={d.el === k}
              title={name}
              onClick={() => set({ el: k })}
            >
              <img src={badgeURL(k)} alt="" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </Step>

      {photoStep && (
        <Step n={next()} title="La tua foto">
          {photoStep}
        </Step>
      )}

      <Step n={next()} title="Nome e HP">
        <div className="vc-row vc-r-nh">
          <Field label="Nome sulla carta">
            <input
              value={d.name}
              maxLength={28}
              placeholder="Es. Gino"
              onChange={(e) => set({ name: e.target.value })}
            />
          </Field>
          <Field label="HP">
            <input
              value={d.hp}
              inputMode="numeric"
              maxLength={3}
              onChange={(e) => set({ hp: e.target.value.replace(/\D/g, "").slice(0, 3) })}
            />
          </Field>
        </div>
      </Step>

      <Step n={next()} title="Attacchi e abilità">
        <div className="vc-seg">
          {(
            [
              ["two", "2 attacchi"],
              ["one", "1 attacco"],
              ["ab", "Abilità + 1 attacco"],
            ] as [MoveMode, string][]
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={d.mode === k}
              onClick={() => set({ mode: k })}
            >
              {l}
            </button>
          ))}
        </div>
        {d.mode === "ab" && (
          <div className="vc-move vc-ab">
            <h3>Abilità</h3>
            <Field label="Nome abilità">
              <input
                value={d.abName}
                maxLength={40}
                placeholder="Es. Re della Piazza"
                onChange={(e) => set({ abName: e.target.value })}
              />
            </Field>
            <Field label="Cosa fa">
              <textarea
                value={d.abText}
                maxLength={300}
                onChange={(e) => set({ abText: e.target.value })}
              />
            </Field>
          </div>
        )}
        <div className="vc-move">
          <h3>{d.mode === "ab" ? "Attacco" : "Primo attacco"}</h3>
          <div className="vc-row vc-r-nh">
            <Field label="Nome">
              <input
                value={d.m1}
                maxLength={40}
                placeholder="Es. It Gets Like That"
                onChange={(e) => set({ m1: e.target.value })}
              />
            </Field>
            <Field label="Danno">
              <input value={d.d1} maxLength={4} onChange={(e) => set({ d1: e.target.value })} />
            </Field>
          </div>
          <Field label="Descrizione">
            <textarea value={d.t1} maxLength={300} onChange={(e) => set({ t1: e.target.value })} />
          </Field>
        </div>
        {d.mode === "two" && (
          <div className="vc-move">
            <h3>Secondo attacco</h3>
            <div className="vc-row vc-r-nh">
              <Field label="Nome">
                <input value={d.m2} maxLength={40} onChange={(e) => set({ m2: e.target.value })} />
              </Field>
              <Field label="Danno">
                <input value={d.d2} maxLength={4} onChange={(e) => set({ d2: e.target.value })} />
              </Field>
            </div>
            <Field label="Descrizione">
              <textarea
                value={d.t2}
                maxLength={300}
                onChange={(e) => set({ t2: e.target.value })}
              />
            </Field>
          </div>
        )}
      </Step>

      <Step n={next()} title="Debolezza, resistenza, ritirata">
        <Trait label="Debolezza" value={d.weak} onPick={(k) => set({ weak: k })}>
          <input
            className="vc-small"
            value={d.weakV}
            maxLength={6}
            aria-label="Effetto debolezza"
            onChange={(e) => set({ weakV: e.target.value })}
          />
        </Trait>
        <Trait label="Resistenza" value={d.res} onPick={(k) => set({ res: k })}>
          <input
            className="vc-small"
            value={d.resV}
            maxLength={6}
            aria-label="Effetto resistenza"
            onChange={(e) => set({ resV: e.target.value })}
          />
        </Trait>
        <Trait
          label="Ritirata"
          value={d.ret}
          noNone
          onPick={(k) => set({ ret: (k || "vault") as ElKey })}
        >
          <div className="vc-seg vc-seg-s">
            {[0, 1, 2, 3].map((x) => (
              <button
                key={x}
                type="button"
                aria-pressed={d.retN === x}
                onClick={() => set({ retN: x })}
              >
                {x}
              </button>
            ))}
          </div>
        </Trait>
      </Step>

      <Step n={next()} title="Motto">
        <Field label="Una frase che lo descrive">
          <input
            value={d.motto}
            maxLength={60}
            placeholder="Es. Ogni piazza è il suo palco."
            onChange={(e) => set({ motto: e.target.value })}
          />
        </Field>
        <p className="vc-hint">
          Sotto il motto la carta porta il numero di serie e la tiratura (es. 1/{MAX_EDITION}),
          assegnati quando invii l'ordine.
        </p>
      </Step>
    </>
  );
}

export function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="vc-step">
      <h2>
        <span>{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="vc-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Trait({
  label,
  value,
  onPick,
  noNone,
  children,
}: {
  label: string;
  value: string;
  onPick: (k: ElKey | "") => void;
  noNone?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="vc-trait">
      <span className="vc-tl">{label}</span>
      <div className="vc-picks">
        {!noNone && (
          <button
            type="button"
            className="none"
            aria-pressed={value === ""}
            onClick={() => onPick("")}
          >
            Nessuna
          </button>
        )}
        {ELEMENTS.map(([k, name]) => (
          <button
            key={k}
            type="button"
            title={name}
            aria-label={name}
            aria-pressed={value === k}
            onClick={() => onPick(k)}
          >
            <img src={badgeURL(k)} alt="" />
          </button>
        ))}
      </div>
      {children && <div className="vc-tv">{children}</div>}
    </div>
  );
}

/** Stili condivisi di pagina e moduli Vault. */
export const EDITOR_CSS = `
.vc-page{--bg:#E9EAEF;--panel:#FFFFFF;--ink:#141A3A;--muted:#5A5D6B;--line:#D3D6DF;--field:#F4F5F8;--gold:#E2A917;--gold-ink:#2A1F00;--focus:#1F86D6;
  min-height:100vh;background:var(--bg);color:var(--ink);font-family:Archivo,system-ui,sans-serif;font-size:15px;padding-bottom:40px}
.vc-page *{box-sizing:border-box}
.vc-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 24px;background:#141A3A}
.vc-logo img{height:34px;display:block}
.vc-back{color:#C9CEE3;font-size:13px;text-decoration:none;background:none;border:0;cursor:pointer;font:inherit}
.vc-back:hover{color:#fff}
.vc-kicker{margin:0;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--muted)}
.vc-step{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 18px 16px}
.vc-step h2{margin:0 0 12px;display:flex;align-items:center;gap:10px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:24px}
.vc-step h2 span{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;background:var(--ink);color:#fff;border-radius:6px;padding:3px 7px}
.vc-hint{margin:8px 0 0;font-size:13px;line-height:1.45;color:var(--muted)}
.vc-err{color:#B42318;font-size:13px;margin:6px 0 0}
.vc-cats{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.vc-cats button,.vc-seg button,.vc-list button,.vc-els button,.vc-picks button{font:inherit;color:var(--ink);cursor:pointer;background:var(--field);border:1.5px solid var(--line);transition:transform .15s,border-color .15s,background .15s}
.vc-cats button{border-radius:12px;padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:2px}
.vc-cats .n{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:19px;line-height:1}
.vc-cats .p{font-size:13px;color:var(--muted)}
.vc-cats button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:#fff}
.vc-cats button[aria-pressed=true] .p{color:#C9CEE3}
.vc-els{display:grid;grid-template-columns:repeat(9,1fr);gap:6px}
.vc-els button{border-radius:12px;padding:8px 2px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;font-weight:600}
.vc-els img{width:34px;height:34px}
.vc-els button[aria-pressed=true],.vc-list button[aria-pressed=true]{border-color:var(--ink);background:#fff;box-shadow:0 0 0 1.5px var(--ink)}
.vc-upload{display:flex;align-items:center;gap:12px;margin-top:12px;cursor:pointer;flex-wrap:wrap}
.vc-upload input{position:absolute;opacity:0;width:1px;height:1px}
.vc-upload span{background:var(--ink);color:#fff;border-radius:10px;padding:10px 16px;font-weight:700}
.vc-upload em{font-size:13px;color:var(--muted);font-style:normal;overflow:hidden;text-overflow:ellipsis;max-width:240px;white-space:nowrap}
.vc-upload:focus-within span{outline:2px solid var(--focus);outline-offset:2px}
.vc-field{display:flex;flex-direction:column;gap:5px;margin-top:10px;min-width:0}
.vc-field>span{font-size:12px;font-weight:600}
.vc-field input:not([type=range]):not([type=checkbox]),.vc-field textarea,.vc-field select,.vc-small{width:100%;font:inherit;color:var(--ink);background:var(--field);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.vc-field textarea{min-height:64px;resize:vertical;line-height:1.4}
.vc-field input[type=range]{accent-color:var(--ink)}
.vc-page input:focus,.vc-page textarea:focus,.vc-page select:focus,.vc-page button:focus-visible{outline:2px solid var(--focus);outline-offset:1px}
.vc-row{display:grid;gap:10px}
.vc-r-nh{grid-template-columns:1fr 96px}
.vc-r2{grid-template-columns:1fr 1fr}
.vc-seg{display:flex;flex-wrap:wrap;gap:6px}
.vc-seg button{border-radius:9px;padding:8px 14px;font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:17px}
.vc-seg button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:#fff}
.vc-seg-s button{padding:6px 14px}
.vc-move{border:1px solid var(--line);border-radius:12px;padding:12px;margin-top:12px}
.vc-move h3{margin:0;font-family:'Saira Condensed',sans-serif;font-size:18px}
.vc-ab{border-color:#D7262E;background:#FDF1F1}
.vc-ab h3{color:#D7262E}
.vc-trait{display:grid;grid-template-columns:100px 1fr auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}
.vc-trait:first-of-type{border-top:0}
.vc-tl{font-weight:700;font-size:14px}
.vc-picks{display:flex;flex-wrap:wrap;gap:5px}
.vc-picks button{width:36px;height:36px;padding:0;border-radius:50%;display:grid;place-items:center;background:none;border-color:transparent}
.vc-picks button img{width:30px;height:30px}
.vc-picks button.none{width:auto;padding:0 10px;border-radius:18px;background:var(--field);border-color:var(--line);font-size:12px;font-weight:700;color:var(--muted)}
.vc-picks button[aria-pressed=true]{border-color:var(--ink)}
.vc-small{width:76px!important;text-align:center}
.vc-cases{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.vc-cases button{font:inherit;color:var(--ink);cursor:pointer;background:var(--field);border:1.5px solid var(--line);border-radius:14px;padding:6px 6px 10px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;transition:transform .15s,border-color .15s}
.vc-cases button:hover{transform:translateY(-2px)}
.vc-cases button[aria-pressed=true]{border-color:var(--ink);background:#fff;box-shadow:0 0 0 1.5px var(--ink)}
.vc-cases img,.vc-case-none{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,#AEB8D6,#737EA6);color:#fff;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:20px}
.vc-case-name{font-size:13px;font-weight:600;line-height:1.25;margin-top:4px}
.vc-cases b{font-family:'Saira Condensed',sans-serif;font-size:18px}
.vc-list{display:flex;flex-direction:column;gap:6px}
.vc-list button{display:flex;justify-content:space-between;border-radius:10px;padding:10px 14px;text-align:left}
.vc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--gold);color:var(--gold-ink);border:0;border-radius:12px;padding:10px 18px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:18px;letter-spacing:.04em;text-decoration:none;cursor:pointer}
.vc-btn.ghost{background:var(--field);color:var(--ink);border:1px solid var(--line)}
.vc-btn.dark{background:var(--ink);color:#fff}
.vc-btn.danger{background:#FFF1F0;color:#B42318;border:1px solid #F3C4BF}
.vc-btn-big{width:100%;margin-top:14px;padding:16px;font-size:24px}
.vc-btn:disabled{opacity:.6;cursor:default}
@media (max-width:900px){
  .vc-cats{grid-template-columns:repeat(3,1fr)}
  .vc-els{grid-template-columns:repeat(5,1fr)}
  .vc-trait{grid-template-columns:1fr auto}
  .vc-picks{grid-column:1/-1;grid-row:2}
  .vc-r2{grid-template-columns:1fr}
  .vc-cases{grid-template-columns:repeat(2,1fr)}
}
`;

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;700;800&family=Archivo:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@500;700&display=swap";
