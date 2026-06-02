import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Upload, Send, HelpCircle, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { Header } from "@/components/vault/Header";

export const Route = createFileRoute("/ordina")({
  component: OrdinaPage,
  head: () => ({
    meta: [
      { title: "Ordina la tua carta — Vault Crafted" },
      { name: "description", content: "Compila il modulo e crea la tua carta da collezione personalizzata. Scegli energia, tipologia, attacchi e design. Pezzo unico, consegna in 7-10 giorni." },
      { name: "robots", content: "index, follow" },
      { property: "og:url", content: "https://vaultcrafted.com/ordina" },
      { property: "og:title", content: "Ordina la tua carta — Vault Crafted" },
      { property: "og:description", content: "Crea la tua carta personalizzata in pochi minuti. Zero template, design unico, packaging premium." },
    ],
  }),
});

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx8QLjmeBLw62VDxf3hakKu4HpIHHXw7THzMCrkMGvnG0TziDPYWQ-aySJrpyf5ZSdsjg/exec";

const ENERGIE = [
  { id: "normale",  label: "Normale",  img: "/energie/NORMALE.png",  color: "#a8a8a0" },
  { id: "lotta",    label: "Lotta",    img: "/energie/LOTTA.png",    color: "#c97c30" },
  { id: "drago",    label: "Drago",    img: "/energie/DRAGO.png",    color: "#185fa5" },
  { id: "acqua",    label: "Acqua",    img: "/energie/ACQUA.png",    color: "#378add" },
  { id: "psico",    label: "Psico",    img: "/energie/PSICO.png",    color: "#7f77dd" },
  { id: "fuoco",    label: "Fuoco",    img: "/energie/FUOCO.png",    color: "#e24b4a" },
  { id: "erba",     label: "Erba",     img: "/energie/ERBA.png",     color: "#639922" },
  { id: "elettro",  label: "Lampo",    img: "/energie/ELETTRO.png",  color: "#ef9f27" },
  { id: "folletto", label: "Folletto", img: "/energie/FOLLETTO.png", color: "#d4537e" },
  { id: "acciaio",  label: "Metallo",  img: "/energie/ACCIAIO.png",  color: "#888780" },
  { id: "spettro",  label: "Oscurità", img: "/energie/SPETTRO.png",  color: "#534ab7" },
];

const TIPOLOGIE = [
  { id: "normale",     label: "Carta Normale",  short: "Base",  price: 20, img: "/tipologie/CARTA-NORMALE.png" },
  { id: "normale-ex",  label: "Normale EX",     short: "EX",    price: 20, img: "/tipologie/CARTA-NORMALE-EX.png" },
  { id: "full-art-ex", label: "Full-Art EX",    short: "FA EX", price: 22, img: "/tipologie/CARTA-FULL-ART-EX.png" },
  { id: "v",           label: "Carta V",         short: "V",     price: 23, img: "/tipologie/CARTA-V.png" },
  { id: "v-max",       label: "V-MAX",           short: "VMAX",  price: 25, img: "/tipologie/CARTA-V-MAX.png" },
];

const CUSTODIE = [
  { id: "one-touch-35pt",       label: "One Touch 35pt",            price: 1 },
  { id: "one-touch-bordo-nero", label: "One Touch 35pt Bordo Nero", price: 2 },
  { id: "screwdown-bordo-nero", label: "Screwdown Bordo Nero",      price: 5 },
  { id: "screwdown-recessed",   label: "Screwdown Recessed",        price: 3 },
  { id: "recessed-snap",        label: "Recessed Snap",             price: 2 },
  { id: "mini-snap",            label: "Mini Snap",                 price: 2 },
];

const HP_PRESETS    = [60, 100, 150, 200, 250, 300, 999];
const DMG_PRESETS_1 = [30, 60, 90, 120, 150, 200, 300];
const DMG_PRESETS_2 = [20, 40, 60, 80, 100, 150];
const SPEDIZIONE    = 4.99;
const PREZZO_OLOGRAFICA = 9.99;
const TOTAL_STEPS   = 7;
const STEP_LABELS   = ["Tipo & elemento", "Nome & HP", "Attacchi", "Statistiche", "Foto", "Custodia & extra", "Spedizione"];

interface FormState {
  energia: string;
  tipologia: string;
  nome: string;
  hp: number;
  atk1: string;
  atk1_desc: string;
  atk1_dmg: string;
  atk1_energie: string[];
  atk2: string;
  atk2_desc: string;
  atk2_dmg: string;
  atk2_energie: string[];
  debolezza: string;
  resistenza: string;
  ritirata: number;
  frase: string;
  graficaBase64: string | null;
  graficaName: string;
  graficaType: string;
  custodia: string;
  olografica: boolean;
  nome_cognome: string;
  email_contatto: string;
  cellulare: string;
  spedizione: string;
}

const initialState: FormState = {
  energia: "acqua", tipologia: "v", nome: "", hp: 120,
  atk1: "", atk1_desc: "", atk1_dmg: "90", atk1_energie: ["acqua", "acqua"],
  atk2: "", atk2_desc: "", atk2_dmg: "", atk2_energie: ["acqua"],
  debolezza: "", resistenza: "", ritirata: 2, frase: "",
  graficaBase64: null, graficaName: "", graficaType: "",
  custodia: "one-touch-35pt", olografica: false,
  nome_cognome: "", email_contatto: "", cellulare: "", spedizione: "",
};

interface StepProps {
  state: FormState;
  setState: (p: Partial<FormState>) => void;
}

function getEnergiaById(id: string) {
  return ENERGIE.find((e) => e.id === id) ?? ENERGIE.find((e) => e.id === "acqua")!;
}

function getStatLabel(id: string) {
  if (!id) return null;
  const e = ENERGIE.find((x) => x.id === id);
  if (e) return { label: e.label, color: e.color, isEmoji: false };
  return { label: id, color: "#888780", isEmoji: true };
}

// ─── Energie attacco selector ─────────────────────────────────────────────────

function EnergieAttaccoSelector({ value, onChange, label }: { value: string[]; onChange: (v: string[]) => void; label: string }) {
  const count = value.length;
  function setCount(n: number) {
    if (n < 1 || n > 4) return;
    if (n > count) onChange([...value, ...Array(n - count).fill(value[value.length - 1] ?? "acqua")]);
    else onChange(value.slice(0, n));
  }
  function setEnergia(idx: number, id: string) {
    const next = [...value]; next[idx] = id; onChange(next);
  }
  return (
    <div className="space-y-3">
      <label className="block text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Quante energie?</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setCount(count - 1)} disabled={count <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold hover:text-foreground active:scale-95 disabled:opacity-30">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-5 text-center font-semibold text-lg">{count}</span>
          <button type="button" onClick={() => setCount(count + 1)} disabled={count >= 4}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold hover:text-foreground active:scale-95 disabled:opacity-30">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1.5 ml-1">
          {value.map((id, i) => (
            <img key={i} src={getEnergiaById(id).img} alt="" style={{ width: 18, height: 18, objectFit: "contain" }} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {value.map((id, idx) => (
          <div key={idx}>
            <span className="text-xs text-muted-foreground block mb-1.5">Energia {idx + 1}</span>
            <div className="grid grid-cols-11 gap-1.5">
              {ENERGIE.map((e) => (
                <button key={e.id} type="button" onClick={() => setEnergia(idx, e.id)}
                  title={e.label}
                  className={`flex items-center justify-center rounded-full p-0.5 transition-all active:scale-95 ${id === e.id ? "ring-2 ring-gold ring-offset-1 ring-offset-background" : "opacity-50 hover:opacity-100"}`}
                  style={{ width: 32, height: 32 }}>
                  <img src={e.img} alt={e.label} style={{ width: 26, height: 26, objectFit: "contain" }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat selector ────────────────────────────────────────────────────────────

function StatSelector({ value, onChange, label, required }: { value: string; onChange: (v: string) => void; label: string; required?: boolean }) {
  const isEnergia = ENERGIE.some((e) => e.id === value);
  const emojiValue = isEnergia || value === "" ? "" : value;
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="grid grid-cols-6 gap-2 mb-4 sm:grid-cols-11">
        {ENERGIE.map((e) => (
          <button key={e.id} type="button" onClick={() => onChange(e.id)} title={e.label}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all active:scale-95 ${value === e.id ? "border-gold shadow-[0_0_0_1px_var(--gold)] bg-gold/5" : "border-border hover:border-gold/60"}`}>
            <img src={e.img} alt={e.label} className="h-8 w-8 object-contain" />
            <span className="text-[9px] leading-tight text-center hidden sm:block">{e.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground shrink-0">Oppure scrivi un'emoji:</span>
        <input type="text" maxLength={4} placeholder="😎 🔥 ⚡ 💀 ❄️ ..."
          value={emojiValue}
          onChange={(e) => { if (e.target.value) onChange(e.target.value); }}
          className="vault-input" style={{ maxWidth: 140, fontSize: "1.2rem" }} />
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Check className="h-3 w-3 text-gold" />
          Selezionato: <strong className="text-foreground">{getStatLabel(value)?.label ?? value}</strong>
        </div>
      )}
    </div>
  );
}

// ─── Card Preview ─────────────────────────────────────────────────────────────

function CardPreview({ state, size = "desktop" }: { state: FormState; size?: "desktop" | "mobile" }) {
  const energia = getEnergiaById(state.energia);
  const tipologia = TIPOLOGIE.find((t) => t.id === state.tipologia) ?? TIPOLOGIE[3];
  const W = size === "mobile" ? 200 : 320;
  const H = size === "mobile" ? 279 : 448;
  const scale = W / 178;

  function EnergyImg({ id, sz = 14 }: { id?: string; sz?: number }) {
    const e = id ? getEnergiaById(id) : energia;
    return <img src={e.img} alt={e.label} style={{ width: sz, height: sz, objectFit: "contain", flexShrink: 0, display: "inline-block" }} />;
  }

  return (
    <div style={{ width: W, height: H, borderRadius: 10 * scale, position: "relative", overflow: "hidden",
      fontFamily: "'Arial Black', Arial, sans-serif", boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
      background: "#111", border: `${2 * scale}px solid #c8a84b`, flexShrink: 0 }}>
      {state.graficaBase64 ? (
        <img src={state.graficaBase64} alt="bg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "linear-gradient(160deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Upload style={{ width: 42 * scale / 1.8, height: 42 * scale / 1.8, color: "rgba(255,255,255,0.1)" }} />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,0) 42%,rgba(0,0,0,0.72) 65%,rgba(0,0,0,0.92) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, borderRadius: 8 * scale, border: `${1.5 * scale}px solid rgba(200,168,75,0.55)`, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, padding: `${7 * scale}px ${10 * scale}px ${4 * scale}px`,
        background: "linear-gradient(to bottom,rgba(0,0,0,0.7) 0%,transparent 100%)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ background: "#e8d48b", color: "#000", fontSize: 10 * scale / 1.8, fontWeight: 900, padding: `${1 * scale}px ${5 * scale}px`, borderRadius: 3, letterSpacing: "0.05em", textTransform: "uppercase", flexShrink: 0 }}>{tipologia.short}</div>
        <div style={{ color: "#fff", fontSize: 14 * scale / 1.8, fontWeight: 900, textShadow: "1px 1px 3px #000", flex: 1, margin: `0 ${5 * scale}px`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {state.nome || "Il tuo nome"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}>
          <span style={{ color: "#aaa", fontSize: 10 * scale / 1.8, fontWeight: 700 }}>HP</span>
          <span style={{ color: "#fff", fontSize: 19 * scale / 1.8, fontWeight: 900 }}>{state.hp}</span>
          <EnergyImg sz={26 * scale / 1.8} />
        </div>
      </div>

      {/* Bottom */}
      <div style={{ position: "absolute", bottom: 20 * scale / 1.8, left: 0, right: 0, zIndex: 3, padding: `0 ${10 * scale}px ${5 * scale}px` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
            <div style={{ display: "flex", gap: 2, marginTop: 1, flexShrink: 0 }}>
              {(state.atk1_energie.length ? state.atk1_energie : ["acqua","acqua"]).map((id, i) => (
                <EnergyImg key={i} id={id} sz={14 * scale / 1.8} />
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 12 * scale / 1.8, fontWeight: 900, textShadow: "1px 1px 2px #000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {state.atk1 || "Attacco principale"}
              </div>
              {state.atk1_desc && <div style={{ color: "rgba(255,255,255,0.68)", fontSize: 8 * scale / 1.8, lineHeight: 1.3, marginTop: 1 }}>{state.atk1_desc}</div>}
            </div>
            <div style={{ color: "#fff", fontSize: 18 * scale / 1.8, fontWeight: 900, textShadow: "1px 1px 3px #000", flexShrink: 0, marginLeft: 3 }}>{state.atk1_dmg || "—"}</div>
          </div>
          {state.atk2 && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
              <div style={{ display: "flex", gap: 2, marginTop: 1, flexShrink: 0 }}>
                {(state.atk2_energie.length ? state.atk2_energie : ["acqua"]).map((id, i) => (
                  <EnergyImg key={i} id={id} sz={14 * scale / 1.8} />
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#fff", fontSize: 12 * scale / 1.8, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{state.atk2}</div>
                {state.atk2_desc && <div style={{ color: "rgba(255,255,255,0.68)", fontSize: 8 * scale / 1.8, lineHeight: 1.3, marginTop: 1 }}>{state.atk2_desc}</div>}
              </div>
              <div style={{ color: "#fff", fontSize: 18 * scale / 1.8, fontWeight: 900, flexShrink: 0, marginLeft: 3 }}>{state.atk2_dmg || "—"}</div>
            </div>
          )}
        </div>
        <div style={{ height: 0.5, background: "rgba(200,168,75,0.45)", margin: "3px 0" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          {[
            { label: "Deb",      statId: state.debolezza },
            { label: "Res",      statId: state.resistenza },
            { label: "Ritirata", statId: null },
          ].map((s, i) => {
            const sv = s.statId ? getStatLabel(s.statId) : null;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 2, background: "rgba(0,0,0,0.5)", borderRadius: 3, padding: `2px ${4 * scale / 1.8}px` }}>
                <span style={{ color: "#c8a84b", fontSize: 7 * scale / 1.8, fontWeight: 700, textTransform: "uppercase" }}>{s.label}</span>
                {i < 2 ? (
                  sv ? (
                    sv.isEmoji
                      ? <span style={{ fontSize: 10 * scale / 1.8 }}>{sv.label}</span>
                      : <EnergyImg id={ENERGIE.find(e => e.label === sv.label)?.id} sz={11 * scale / 1.8} />
                  ) : <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 8 * scale / 1.8 }}>—</span>
                ) : (
                  <span style={{ fontSize: 9 * scale / 1.8, color: "#fff" }}>{"⬛".repeat(Math.min(state.ritirata || 2, 4))}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3, background: "rgba(0,0,0,0.88)", padding: `2px ${8 * scale / 1.8}px`,
        display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "0.5px solid rgba(200,168,75,0.35)" }}>
        <div style={{ color: "#c8a84b", fontSize: 7 * scale / 1.8, fontWeight: 700 }}>1/1 ★</div>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 6 * scale / 1.8, textAlign: "center", flex: 1, margin: "0 4px", lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          {state.frase || "Vault Crafted · Pezzo unico"}
        </div>
        <div style={{ color: "#c8a84b", fontSize: 7 * scale / 1.8, fontWeight: 700 }}>N°1</div>
      </div>
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function StepTipoEnergia({ state, setState }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl md:text-2xl mb-1">Che tipo di carta vuoi?</h2>
        <p className="text-sm text-muted-foreground mb-4">Ogni tipo ha un layout diverso.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {TIPOLOGIE.map((t) => (
            <label key={t.id} className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-gold has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_1px_var(--gold)] active:scale-[0.98]">
              <input type="radio" name="tipologia" value={t.label} required className="sr-only" checked={state.tipologia === t.id} onChange={() => setState({ tipologia: t.id })} />
              <div className="h-28 w-full overflow-hidden bg-surface-1">
                <img src={t.img} alt={t.label} className="h-full w-full object-contain scale-110" />
              </div>
              <div className="flex items-center justify-between px-2.5 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide leading-tight">{t.label}</span>
                <span className="text-xs font-semibold text-gold ml-1 shrink-0">€{t.price}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-display text-xl md:text-2xl mb-1">Che "elemento" è il tuo personaggio?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          <strong className="text-foreground">Fuoco</strong> per i vulcanici, <strong className="text-foreground">Acqua</strong> per i calmi, <strong className="text-foreground">Psico</strong> per i misteriosi...
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-11">
          {ENERGIE.map((e) => (
            <label key={e.id} className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-1 py-3 transition-all hover:border-gold has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_1px_var(--gold)] active:scale-95">
              <input type="radio" name="energia" value={e.label} required className="sr-only" checked={state.energia === e.id} onChange={() => setState({ energia: e.id })} />
              <img src={e.img} alt={e.label} className="h-9 w-9 object-contain" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-center leading-tight">{e.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function StepNomeHP({ state, setState }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl md:text-2xl mb-1">Come si chiama il tuo personaggio?</h2>
        <p className="text-sm text-muted-foreground mb-4">Apparirà in cima alla carta.</p>
        <input type="text" name="nome" required maxLength={40}
          placeholder="Es: SuperMario, La Nonna, Zio Peppe..."
          value={state.nome} onChange={(e) => setState({ nome: e.target.value })}
          className="vault-input text-lg" />
      </div>
      <div>
        <h2 className="font-display text-xl md:text-2xl mb-1">Quanto è forte? (HP)</h2>
        <p className="text-sm text-muted-foreground mb-3">Scegli liberamente — non servono le regole Pokémon.</p>
        <div className="rounded-lg border border-border/50 bg-surface-1/60 p-3 text-sm text-muted-foreground mb-4">
          <strong className="text-foreground">Suggerimento:</strong> Indistruttibile? Vai alto (250–999). Veloce ma fragile? Basso (60–100). Esagerato? 999.
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4 sm:flex sm:flex-wrap">
          {HP_PRESETS.map((v) => (
            <button key={v} type="button" onClick={() => setState({ hp: v })}
              className={`rounded-full border py-2.5 text-sm font-semibold transition-all active:scale-95 ${state.hp === v ? "border-gold bg-gold/10 text-foreground shadow-[0_0_0_1px_var(--gold)]" : "border-border text-muted-foreground hover:border-gold/60"}`}>
              {v} HP
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="range" min={30} max={999} step={10} value={state.hp}
            onChange={(e) => setState({ hp: Number(e.target.value) })}
            className="flex-1 accent-gold" style={{ height: 6 }} />
          <input type="number" min={1} max={9999} value={state.hp}
            onChange={(e) => setState({ hp: Math.max(1, Math.min(9999, Number(e.target.value) || 1)) })}
            className="font-display text-2xl text-gold bg-transparent border-b border-gold/40 outline-none w-20 text-right focus:border-gold transition-colors" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function StepAttacchi({ state, setState }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border/50 bg-surface-1/60 p-3 text-sm text-muted-foreground">
        <strong className="text-foreground">Come funziona?</strong> Ogni carta ha 1–2 attacchi con un nome, le energie necessarie (1–4) e i danni. Possono essere divertenti, assurdi, personalissimi!
      </div>

      <div className="rounded-xl border border-border/50 bg-surface-1/60 p-4 space-y-5">
        <h3 className="font-display text-xl">Attacco principale <span className="text-destructive">*</span></h3>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Nome</label>
          <input type="text" name="attacco1" required maxLength={60}
            placeholder="Es: Carbonara Letale, Sguardo di ghiaccio..."
            value={state.atk1} onChange={(e) => setState({ atk1: e.target.value })} className="vault-input" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Descrizione <span className="normal-case font-normal">(opzionale)</span></label>
          <input type="text" name="attacco1_descrizione" maxLength={200}
            placeholder="Es: Il nemico subisce 20 danni aggiuntivi per 3 turni."
            value={state.atk1_desc} onChange={(e) => setState({ atk1_desc: e.target.value })} className="vault-input" />
        </div>
        <EnergieAttaccoSelector value={state.atk1_energie} onChange={(v) => setState({ atk1_energie: v })} label="Energie (1–4)" />
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Danni <span className="text-destructive">*</span></label>
          <div className="grid grid-cols-4 gap-2 mb-3 sm:flex sm:flex-wrap">
            {DMG_PRESETS_1.map((v) => (
              <button key={v} type="button" onClick={() => setState({ atk1_dmg: String(v) })}
                className={`rounded-full border py-2.5 text-sm font-semibold transition-all active:scale-95 ${state.atk1_dmg === String(v) ? "border-gold bg-gold/10 text-foreground shadow-[0_0_0_1px_var(--gold)]" : "border-border text-muted-foreground hover:border-gold/60"}`}>
                {v}
              </button>
            ))}
          </div>
          <input type="text" name="attacco1_danni" required maxLength={10}
            placeholder="oppure scrivi un numero..."
            value={state.atk1_dmg} onChange={(e) => setState({ atk1_dmg: e.target.value })} className="vault-input" />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-surface-1/60 p-4 space-y-5">
        <h3 className="font-display text-xl">Attacco secondario <span className="text-sm font-sans font-normal text-muted-foreground">(facoltativo)</span></h3>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Nome</label>
          <input type="text" name="attacco2" maxLength={60}
            placeholder="Lascia vuoto se non vuoi un secondo attacco..."
            value={state.atk2} onChange={(e) => setState({ atk2: e.target.value })} className="vault-input" />
        </div>
        {state.atk2 && (
          <>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Descrizione <span className="normal-case font-normal">(opzionale)</span></label>
              <input type="text" name="attacco2_descrizione" maxLength={200} placeholder="Descrizione..."
                value={state.atk2_desc} onChange={(e) => setState({ atk2_desc: e.target.value })} className="vault-input" />
            </div>
            <EnergieAttaccoSelector value={state.atk2_energie} onChange={(v) => setState({ atk2_energie: v })} label="Energie attacco 2 (1–4)" />
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Danni</label>
              <div className="grid grid-cols-4 gap-2 mb-3 sm:flex sm:flex-wrap">
                {DMG_PRESETS_2.map((v) => (
                  <button key={v} type="button" onClick={() => setState({ atk2_dmg: String(v) })}
                    className={`rounded-full border py-2.5 text-sm font-semibold transition-all active:scale-95 ${state.atk2_dmg === String(v) ? "border-gold bg-gold/10 text-foreground shadow-[0_0_0_1px_var(--gold)]" : "border-border text-muted-foreground hover:border-gold/60"}`}>
                    {v}
                  </button>
                ))}
              </div>
              <input type="text" name="attacco2_danni" maxLength={10} placeholder="oppure scrivi un numero..."
                value={state.atk2_dmg} onChange={(e) => setState({ atk2_dmg: e.target.value })} className="vault-input" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

function StepStatistiche({ state, setState }: StepProps) {
  return (
    <div className="space-y-7">
      <div className="rounded-lg border border-border/50 bg-surface-1/60 p-3 text-sm text-muted-foreground">
        <strong className="text-foreground">Non sai cosa mettere?</strong> Scegli qualcosa che ti sembra logico, oppure un'emoji. Puoi anche lasciare "a vostra scelta" nel campo emoji e pensiamo noi.
      </div>
      <StatSelector value={state.debolezza} onChange={(v) => setState({ debolezza: v })} label="Debole a quale elemento?" required />
      <div className="h-px bg-border/40" />
      <StatSelector value={state.resistenza} onChange={(v) => setState({ resistenza: v })} label="Resistente a quale elemento?" required />
      <div className="h-px bg-border/40" />
      <div>
        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Costo ritirata</label>
        <p className="text-sm text-muted-foreground mb-3">Quanto è difficile "salvare" il personaggio? 1 = facile, 4 = impossibile.</p>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((v) => (
            <button key={v} type="button" onClick={() => setState({ ritirata: v })}
              className={`rounded-xl border py-3.5 text-sm font-semibold transition-all active:scale-95 ${state.ritirata === v ? "border-gold bg-gold/10 shadow-[0_0_0_1px_var(--gold)]" : "border-border text-muted-foreground hover:border-gold/60"}`}>
              {"⬛".repeat(v)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Frase in fondo alla carta <span className="normal-case font-normal">(opzionale)</span></label>
        <p className="text-sm text-muted-foreground mb-3">Un motto, una dedica, una battuta.</p>
        <input type="text" name="frase" maxLength={100}
          placeholder="Es: Suona più forte delle bombe! · Classe 2001..."
          value={state.frase} onChange={(e) => setState({ frase: e.target.value })} className="vault-input" />
      </div>
    </div>
  );
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────

function StepFoto({ state, setState, error, setError }: StepProps & { error: string | null; setError: (e: string | null) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl md:text-2xl mb-1">Carica la foto per la carta</h2>
        <p className="text-sm text-muted-foreground">Sarà l'immagine di sfondo. Guarda l'anteprima qui sotto.</p>
      </div>
      <div className="rounded-lg border border-border/50 bg-surface-1/60 p-3 text-sm text-muted-foreground">
        <strong className="text-foreground">Per un bel risultato:</strong> Ritratto (busto in su), sfondo non caotico, min 1000×1000px. JPG, PNG, PDF · max 10MB.
      </div>
      <label className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all active:scale-[0.98] ${state.graficaBase64 ? "border-green-500/60 bg-green-500/5" : "border-gold/30 bg-surface-2/40 hover:border-gold"}`}>
        <Upload className={`h-10 w-10 ${state.graficaBase64 ? "text-green-400" : "text-gold"}`} />
        <div className="text-center">
          <p className={`font-semibold text-base uppercase tracking-wider ${state.graficaBase64 ? "text-green-400" : "text-gold"}`}>
            {state.graficaName || "Tocca per caricare la foto"}
          </p>
          {state.graficaBase64 && <p className="text-xs text-muted-foreground mt-1">Tocca per cambiare</p>}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG, PDF · max 10MB</p>
        <input type="file" name="grafica" required accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 10 * 1024 * 1024) { setError("Il file supera i 10 MB"); e.target.value = ""; return; }
            setError(null);
            const reader = new FileReader();
            reader.onload = (ev) => setState({ graficaBase64: ev.target?.result as string, graficaName: f.name, graficaType: f.type });
            reader.readAsDataURL(f);
          }} />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {state.graficaBase64 && (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <Check className="h-4 w-4" /> Foto caricata
        </div>
      )}
    </div>
  );
}

// ─── Step 6 ───────────────────────────────────────────────────────────────────

function StepCustodia({ state, setState }: StepProps) {
  const tipologia = TIPOLOGIE.find((t) => t.id === state.tipologia) ?? TIPOLOGIE[3];
  const custodia  = CUSTODIE.find((c) => c.id === state.custodia)   ?? CUSTODIE[0];
  const totale    = tipologia.price + custodia.price + (state.olografica ? PREZZO_OLOGRAFICA : 0) + SPEDIZIONE;
  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-display text-xl md:text-2xl mb-1">Scegli la custodia</h2>
        <p className="text-sm text-muted-foreground mb-4">La più venduta è la <strong className="text-foreground">One Touch Bordo Nero</strong>.</p>
        <div className="space-y-2">
          {CUSTODIE.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-4 transition-all active:scale-[0.98] hover:border-gold has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_1px_var(--gold)]">
              <input type="radio" name="custodia" value={`${c.label} +${c.price}€`} required className="sr-only" checked={state.custodia === c.id} onChange={() => setState({ custodia: c.id })} />
              <span className="text-sm font-semibold">{c.label}</span>
              <span className="text-sm font-semibold text-gold whitespace-nowrap shrink-0">+ €{c.price}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-display text-xl md:text-2xl mb-1">Pellicola olografica?</h2>
        <p className="text-sm text-muted-foreground mb-4">Effetto brillante come le carte rare. <span className="text-gold font-semibold">+€{PREZZO_OLOGRAFICA.toFixed(2)}</span></p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: true,  label: "✨ Sì!", sub: "Effetto cangiante", price: `+€${PREZZO_OLOGRAFICA.toFixed(2)}` },
            { val: false, label: "No grazie", sub: "Carta standard",  price: "+€0" },
          ].map((opt) => (
            <label key={String(opt.val)} className="flex cursor-pointer flex-col gap-1 rounded-xl border border-border bg-background px-4 py-4 transition-all active:scale-[0.98] hover:border-gold has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_1px_var(--gold)]">
              <input type="radio" name="olografica" value={opt.val ? "Sì — Pellicola olografica +€9.99" : "No — Senza pellicola olografica"} required className="sr-only" checked={state.olografica === opt.val} onChange={() => setState({ olografica: opt.val })} />
              <p className="text-sm font-semibold uppercase tracking-wide">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.sub}</p>
              <p className="text-sm font-semibold text-gold">{opt.price}</p>
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gold/30 bg-surface-2/60 p-4">
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-3">Riepilogo</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Carta ({tipologia.label})</span><span className="font-semibold">€{tipologia.price}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Custodia</span><span className="font-semibold">+€{custodia.price}</span></div>
          {state.olografica && <div className="flex justify-between"><span className="text-muted-foreground">Olografica</span><span className="font-semibold">+€{PREZZO_OLOGRAFICA.toFixed(2)}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Spedizione</span><span className="font-semibold">€{SPEDIZIONE.toFixed(2)}</span></div>
          <div className="flex justify-between border-t border-gold/20 pt-2 mt-1">
            <span className="font-display text-lg">Totale</span>
            <span className="font-display text-2xl text-gold">€{totale.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 7 ───────────────────────────────────────────────────────────────────

function StepSpedizione({ state, setState }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl md:text-2xl mb-1">Quasi fatto!</h2>
        <p className="text-sm text-muted-foreground">Ultime info per contattarti e spedirti la carta.</p>
      </div>
      <div className="space-y-6">
        {([
          { label: "Nome e cognome",                   key: "nome_cognome"   as const, type: "text",  placeholder: "Mario Rossi" },
          { label: "Email",                            key: "email_contatto" as const, type: "email", placeholder: "mario@example.com" },
          { label: "Cellulare",                        key: "cellulare"      as const, type: "tel",   placeholder: "+39 333 1234567" },
          { label: "Indirizzo di spedizione completo", key: "spedizione"     as const, type: "text",  placeholder: "Via Roma 1, 10100 Torino (TO)" },
        ] as const).map((f) => (
          <div key={f.key}>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{f.label} <span className="text-destructive">*</span></label>
            <input type={f.type} required maxLength={255} placeholder={f.placeholder}
              value={state[f.key]} onChange={(e) => setState({ [f.key]: e.target.value })}
              className="vault-input text-base" style={{ fontSize: "1rem" }} />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border/50 bg-surface-1/60 p-3 text-sm text-muted-foreground">
        Dopo l'invio ti manderemo la <strong className="text-foreground">bozza grafica</strong> via email. Modifiche illimitate, gratis. La produzione parte solo dopo la tua approvazione.
      </div>
    </div>
  );
}

// ─── Sidebar desktop ──────────────────────────────────────────────────────────

function StepIndicator({ current, labels }: { current: number; labels: string[] }) {
  return (
    <nav className="hidden lg:flex flex-col gap-1 w-48 shrink-0">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground px-3 pb-2">La tua carta</p>
      {labels.map((label, i) => {
        const n = i + 1, done = n < current, active = n === current;
        return (
          <div key={n} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${active ? "bg-surface-2 border border-gold/30" : "opacity-60"}`}>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${done ? "bg-green-500 text-background" : active ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground border border-border"}`}>
              {done ? <Check className="h-3 w-3" /> : n}
            </div>
            <span className={`text-xs ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="h-1 w-full bg-border/40">
      <motion.div className="h-full bg-gold" initial={false}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function OrdinaPage() {
  const [step, setStep] = useState(1);
  const [state, setStateRaw] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const setState = useCallback((p: Partial<FormState>) => setStateRaw((prev) => ({ ...prev, ...p })), []);

  const tipologia = TIPOLOGIE.find((t) => t.id === state.tipologia) ?? TIPOLOGIE[3];
  const custodia  = CUSTODIE.find((c) => c.id === state.custodia)   ?? CUSTODIE[0];
  const totale    = tipologia.price + custodia.price + (state.olografica ? PREZZO_OLOGRAFICA : 0) + SPEDIZIONE;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const energia = ENERGIE.find((e) => e.id === state.energia);
      const energieAtk1 = state.atk1_energie.map((id) => getEnergiaById(id).label).join(", ");
      const energieAtk2 = state.atk2_energie.map((id) => getEnergiaById(id).label).join(", ");
      const debLabel = getStatLabel(state.debolezza)?.label ?? state.debolezza;
      const resLabel = getStatLabel(state.resistenza)?.label ?? state.resistenza;
      const payload: Record<string, unknown> = {
        energia: energia?.label ?? state.energia,
        tipologia: `${tipologia.label} - €${tipologia.price}`,
        nome: state.nome, hp: String(state.hp),
        attacco1: state.atk1, attacco1_descrizione: state.atk1_desc,
        attacco1_energie: energieAtk1, attacco1_danni: state.atk1_dmg,
        attacco2: state.atk2, attacco2_descrizione: state.atk2_desc,
        attacco2_energie: state.atk2 ? energieAtk2 : "", attacco2_danni: state.atk2_dmg,
        resistenza: resLabel, debolezza: debLabel,
        costo_ritirata: `${state.ritirata}`, frase: state.frase,
        custodia: `${custodia.label} +${custodia.price}€`,
        olografica: state.olografica ? "Sì — Pellicola olografica +€9.99" : "No — Senza pellicola olografica",
        nome_cognome: state.nome_cognome, cellulare: state.cellulare,
        email_contatto: state.email_contatto, spedizione: state.spedizione,
      };
      if (state.graficaBase64 && state.graficaName) {
        payload.fileName  = state.graficaName;
        payload.fileType  = state.graficaType;
        payload.fileBase64 = state.graficaBase64.split(",")[1] ?? state.graficaBase64;
      }
      await fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("Si è verificato un errore. Riprova o contattaci su WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-background text-foreground vault-grain">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
              <Check className="h-12 w-12 text-gold" />
            </div>
            <h1 className="font-display text-4xl leading-tight md:text-6xl">Ordine ricevuto!</h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Ti manderemo la <strong className="text-foreground">bozza grafica</strong> via email entro 24–48 ore.<br />
              Modifiche illimitate, gratuite.
            </p>
            <Link to="/" className="btn-gold mt-12 inline-flex items-center gap-3 rounded-full px-9 py-4 text-sm font-semibold uppercase tracking-[0.25em]">
              <ArrowLeft className="h-4 w-4" /> Torna alla home
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background text-foreground vault-grain" style={{ paddingBottom: "5rem" }}>
      <Header />

      {/* Hero — compatto su mobile */}
      <section className="relative overflow-hidden border-b border-border/40 bg-surface-1 px-4 py-8 text-center md:py-14">
        <div aria-hidden className="absolute left-1/2 top-0 h-[200px] w-[400px] -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 mx-auto max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-surface-2/60 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Crea la tua carta</span>
          </div>
          <h1 className="font-display text-3xl leading-[0.95] tracking-tight md:text-5xl">VAULT <em className="shimmer-text">CRAFTED</em></h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">Pochi minuti. Un'idea. <strong className="text-foreground">Una carta che nessun altro avrà mai.</strong></p>
        </motion.div>
      </section>

      <ProgressBar current={step} total={TOTAL_STEPS} />

      {/* Step pills su mobile */}
      <div className="lg:hidden overflow-x-auto px-4 py-3 flex gap-2 border-b border-border/40 bg-surface-1/40">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = n < step, active = n === step;
          return (
            <div key={n} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs shrink-0 border transition-all ${active ? "border-gold bg-gold/10 text-foreground font-semibold" : done ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-border text-muted-foreground"}`}>
              {done ? <Check className="h-3 w-3" /> : <span className="w-3.5 text-center">{n}</span>}
              {active && <span>{label}</span>}
            </div>
          );
        })}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <div className="flex gap-8 items-start">

          <StepIndicator current={step} labels={STEP_LABELS} />

          <div className="flex-1 min-w-0">
            {/* Step header desktop */}
            <div className="hidden md:flex mb-6 items-center gap-3">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Passo {step} di {TOTAL_STEPS}</span>
              <span className="h-px flex-1 bg-border/40" />
              <span className="text-xs uppercase tracking-[0.3em] text-gold">{STEP_LABELS[step - 1]}</span>
            </div>

            {/* Anteprima collassabile su mobile */}
            <div className="xl:hidden mb-5">
              <button type="button" onClick={() => setPreviewOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-xl border border-gold/30 bg-surface-2/60 px-4 py-3 text-sm font-semibold text-gold">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Anteprima carta
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  €{totale.toFixed(2)}
                  {previewOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>
              <AnimatePresence>
                {previewOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="flex justify-center pt-4 pb-2">
                      <CardPreview state={state} size="mobile" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                {step === 1 && <StepTipoEnergia state={state} setState={setState} />}
                {step === 2 && <StepNomeHP state={state} setState={setState} />}
                {step === 3 && <StepAttacchi state={state} setState={setState} />}
                {step === 4 && <StepStatistiche state={state} setState={setState} />}
                {step === 5 && <StepFoto state={state} setState={setState} error={fileError} setError={setFileError} />}
                {step === 6 && <StepCustodia state={state} setState={setState} />}
                {step === 7 && <StepSpedizione state={state} setState={setState} />}
              </motion.div>
            </AnimatePresence>

            {/* Nav buttons desktop */}
            <div className="hidden md:flex mt-10 items-center justify-between gap-4">
              <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-all hover:border-gold hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed">
                <ArrowLeft className="h-4 w-4" /> Indietro
              </button>
              <div className="flex items-center gap-4">
                {error && <p className="text-sm text-destructive max-w-xs text-right">{error}</p>}
                {step < TOTAL_STEPS ? (
                  <button type="button" onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                    className="btn-gold inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em]">
                    Continua <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={submitting}
                    className="btn-gold inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Invio in corso…</> : <><Send className="h-4 w-4" /> Invia ordine</>}
                  </button>
                )}
              </div>
            </div>
            <p className="hidden md:block mt-4 text-center text-xs text-muted-foreground">Inviando il modulo accetti di essere contattato per definire i dettagli dell'ordine.</p>
          </div>

          {/* Preview desktop sticky */}
          <div className="hidden xl:flex flex-col items-center gap-4 shrink-0 sticky top-8" style={{ width: 345 }}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Anteprima live</p>
            <CardPreview state={state} />
            <p className="text-[10px] text-muted-foreground text-center">Si aggiorna mentre compili</p>
            <div className="w-full rounded-lg border border-border/50 bg-surface-1/60 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">Totale stimato</p>
              <p className="font-display text-2xl text-gold">€{totale.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">spedizione inclusa</p>
            </div>
            <a href="https://wa.me/393332876277?text=Ciao!%20Ho%20una%20domanda%20sulla%20carta" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="h-3.5 w-3.5" /> Hai dubbi? Scrivici su WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar — navigazione integrata */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-gold/30 bg-background/98 backdrop-blur-md">
        {/* Pulsanti nav */}
        <div className="flex items-center gap-2 px-3 pt-2 pb-1">
          <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed">
            <ArrowLeft className="h-4 w-4" /> Indietro
          </button>
          <div className="flex-1">
            {error && <p className="text-xs text-destructive text-center px-2">{error}</p>}
          </div>
          {step < TOTAL_STEPS ? (
            <button type="button" onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
              className="btn-gold flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] active:scale-95">
              Continua <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="btn-gold flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] active:scale-95 disabled:opacity-60">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Invio…</> : <><Send className="h-4 w-4" /> Invia</>}
            </button>
          )}
        </div>
        {/* Totale */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          <div className="flex items-center gap-3 text-xs overflow-x-auto">
            <span className="text-muted-foreground shrink-0">Carta <strong className="text-foreground">€{tipologia.price}</strong></span>
            {state.olografica && <span className="text-muted-foreground shrink-0">Holo <strong className="text-foreground">+€9.99</strong></span>}
            <span className="text-muted-foreground shrink-0">Cust. <strong className="text-foreground">+€{custodia.price}</strong></span>
            <span className="text-muted-foreground shrink-0">Sped. <strong className="text-foreground">€4.99</strong></span>
          </div>
          <div className="shrink-0 text-right ml-2">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Totale</p>
            <p className="font-display text-lg text-gold leading-none">€{totale.toFixed(2)}</p>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground pb-2 px-4">Inviando accetti di essere contattato per definire i dettagli.</p>
      </div>

      <style>{`
        .vault-input { width:100%; background:transparent; border:none; border-bottom:1px solid color-mix(in oklab,var(--gold) 30%,transparent); padding:0.75rem 0.25rem; color:var(--foreground); font-family:var(--font-sans); font-size:1rem; outline:none; transition:border-color 0.2s ease; -webkit-appearance:none; }
        .vault-input::placeholder { color:color-mix(in oklab,var(--foreground) 35%,transparent); }
        .vault-input:focus { border-bottom-color:var(--gold); }
        input[type='range'].accent-gold { accent-color:var(--gold); cursor:pointer; }
        input[type='number']::-webkit-inner-spin-button, input[type='number']::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        @media (max-width: 768px) { .vault-input { font-size:1rem; padding:0.875rem 0.25rem; } }
      `}</style>
    </main>
  );
}
