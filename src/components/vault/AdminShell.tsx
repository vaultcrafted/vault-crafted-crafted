import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EDITOR_CSS } from "./CardEditor";
import { STAGE_CSS } from "./CardStage";

export const STATUS_LABELS: Record<string, string> = {
  nuovo: "Nuovo",
  in_lavorazione: "In lavorazione",
  bozza_inviata: "Attesa pagamento",
  approvato: "Pronto per la stampa",
  in_stampa: "In stampa",
  spedito: "Spedito",
  consegnato: "Consegnato",
  annullato: "Annullato",
  storico: "Storico",
};
export const STATUS_COLORS: Record<string, string> = {
  nuovo: "#E8462A",
  in_lavorazione: "#1F86D6",
  bozza_inviata: "#8B5CF6",
  approvato: "#3FB58A",
  in_stampa: "#E2A917",
  spedito: "#0EA5E9",
  consegnato: "#5A5D6B",
  annullato: "#9CA3AF",
  storico: "#A3A8BC",
};

export async function api<T = unknown>(
  url: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const r = await fetch(url, {
    ...init,
    headers: {
      ...(init?.json !== undefined ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    credentials: "same-origin",
  });
  const data = (await r.json().catch(() => ({}))) as T & { error?: string };
  if (r.status === 401) {
    window.dispatchEvent(new Event("vault-admin-logout"));
  }
  if (!r.ok) throw new Error(data.error ?? `Errore ${r.status}`);
  return data;
}

export function StatusPill({ s }: { s: string }) {
  return (
    <span className="pan-pill" style={{ ["--c" as string]: STATUS_COLORS[s] ?? "#5A5D6B" }}>
      {STATUS_LABELS[s] ?? s}
    </span>
  );
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
export const euro = (n: number) => `€${(n ?? 0).toFixed(2).replace(".", ",")}`;

/** Cornice del pannello: verifica l'accesso e mostra il login se serve. */
export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const [state, setState] = useState<"loading" | "in" | "out" | "unset">("loading");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(true);

  const check = () =>
    api<{ admin: boolean; configured: boolean }>("/api/admin/login")
      .then((r) => setState(r.admin ? "in" : r.configured ? "out" : "unset"))
      .catch(() => setState("out"));
  useEffect(() => {
    void check();
    const off = () => setState("out");
    window.addEventListener("vault-admin-logout", off);
    return () => window.removeEventListener("vault-admin-logout", off);
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api("/api/admin/login", { method: "POST", json: { password: pw, remember } });
      setPw("");
      setState("in");
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    await api("/api/admin/login", { method: "DELETE" }).catch(() => {});
    setState("out");
  };

  return (
    <main className="vc-page ad">
      <style>{EDITOR_CSS + STAGE_CSS + ADMIN_CSS}</style>
      <nav className="vc-top">
        <Link to="/admin" className="vc-logo" aria-label="Pannello Vault">
          <img src="/LOGO.png" alt="Vault Crafted" />
        </Link>
        {state === "in" && (
          <div className="pan-nav">
            <Link to="/admin" activeOptions={{ exact: true }} activeProps={{ className: "on" }}>
              Ordini
            </Link>
            <Link to="/admin/stampa" activeProps={{ className: "on" }}>
              Stampa
            </Link>
            <Link to="/admin/clienti" activeProps={{ className: "on" }}>
              Clienti
            </Link>
            <Link to="/admin/contatti" activeProps={{ className: "on" }}>
              Contatti
            </Link>
            <Link to="/admin/impostazioni" activeProps={{ className: "on" }}>
              Impostazioni
            </Link>
            <a href="/" className="pan-site">
              Vai al sito ↗
            </a>
            <button type="button" className="vc-back" onClick={logout}>
              Esci
            </button>
          </div>
        )}
      </nav>
      {state === "loading" && <p className="pan-wrap vc-hint">Caricamento…</p>}
      {state === "unset" && (
        <div className="pan-login">
          <h1>Pannello non ancora attivo</h1>
          <p className="vc-hint">
            Manca la password del pannello: va impostata su Cloudflare come segreto ADMIN_PASSWORD.
          </p>
        </div>
      )}
      {state === "out" && (
        <form className="pan-login" onSubmit={login}>
          <p className="vc-kicker">VAULT · PANNELLO</p>
          <h1>Accedi</h1>
          <input type="email" name="username" value="vaultcrafted@gmail.com" autoComplete="username" readOnly hidden />
          <label className="vc-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={pw}
              autoFocus
              autoComplete="current-password"
              onChange={(e) => setPw(e.target.value)}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0", fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Ricordami su questo dispositivo
          </label>
          {err && <p className="vc-err">{err}</p>}
          <button className="vc-btn vc-btn-big" disabled={busy || !pw}>
            {busy ? "Verifico…" : "Entra"}
          </button>
        </form>
      )}
      {state === "in" && (
        <div className="pan-wrap">
          <h1 className="pan-title">{title}</h1>
          {children}
        </div>
      )}
    </main>
  );
}

export const ADMIN_CSS = `
.ad{padding-bottom:60px}
.pan-wrap{max-width:1320px;margin:0 auto;padding:22px 24px}
.pan-title{margin:0 0 16px;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:40px;line-height:1}
.pan-nav{display:flex;align-items:center;gap:18px}
.pan-nav a{color:#C9CEE3;text-decoration:none;font-weight:600;font-size:14px}
.pan-nav a.on,.pan-nav a:hover{color:#fff}
.pan-nav a.pan-site{background:#fff;color:#141A3A;padding:7px 12px;border-radius:9px}
.pan-nav a.pan-site:hover{background:#E9EAEF;color:#141A3A}
@media (max-width:700px){.vc-top{flex-wrap:wrap;row-gap:8px}.pan-nav{width:100%;overflow-x:auto;gap:14px;white-space:nowrap;padding-bottom:4px;scrollbar-width:none}.pan-nav>*{flex:none}}
.pan-login{max-width:380px;margin:60px auto;background:#fff;border:1px solid var(--line);border-radius:18px;padding:26px}
.pan-login h1{margin:4px 0 8px;font-family:'Saira Condensed',sans-serif;font-size:36px}
.pan-pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:color-mix(in srgb,var(--c) 14%,#fff);color:color-mix(in srgb,var(--c) 75%,#000);white-space:nowrap}
.pan-pill::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--c)}
.pan-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}
.pan-stat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 16px}
.pan-stat span{display:block;font-size:12px;color:var(--muted);font-weight:600}
.pan-stat b{font-family:'Saira Condensed',sans-serif;font-size:30px}
.pan-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.pan-tabs button{font:inherit;font-size:13px;font-weight:700;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:999px;padding:6px 12px;cursor:pointer}
.pan-tabs button[aria-pressed=true]{background:var(--ink);color:#fff;border-color:var(--ink)}
.pan-tabs button em{font-style:normal;opacity:.6;margin-left:4px}
.pan-filters{display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin:-2px 0 14px}
.pan-filters label{display:grid;gap:4px}
.pan-filters label span{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.pan-filters select{font:inherit;font-size:13px;font-weight:600;background:#fff;color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:7px 30px 7px 10px;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23141A3A' stroke-width='1.6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}
.pan-filters-x{font:inherit;font-size:13px;font-weight:700;border:0;background:none;color:#B45309;cursor:pointer;padding:8px 4px;text-decoration:underline}
.pan-filters-n{margin-left:auto;font-style:normal;font-size:13px;color:var(--muted);padding-bottom:8px}
.pan-pillsel{font:inherit;font-size:12px;font-weight:700;border:0;border-radius:999px;padding:4px 24px 4px 10px;cursor:pointer;appearance:none;background:color-mix(in srgb,var(--c) 14%,#fff) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M1 1l3 3 3-3' fill='none' stroke='%23555' stroke-width='1.4'/%3E%3C/svg%3E") no-repeat right 9px center;color:color-mix(in srgb,var(--c) 75%,#000)}
.pan-pillsel:hover,.pan-paysel:hover{box-shadow:0 0 0 2px color-mix(in srgb,var(--ink) 15%,transparent)}
.pan-paysel{display:block;width:max-content;margin-top:2px;font:inherit;font-size:12px;font-weight:700;border:0;border-radius:6px;padding:1px 18px 1px 0;cursor:pointer;appearance:none;background:transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M1 1l3 3 3-3' fill='none' stroke='%23888' stroke-width='1.4'/%3E%3C/svg%3E") no-repeat right 4px center}
.pan-paysel.is-pagato{color:#127A4B}
.pan-paysel.is-da_pagare{color:#B45309}
.pan-paysel.is-omaggio{color:#8B5CF6}
.pan-paysel.is-off{color:var(--muted)}
.pan-search{width:100%;font:inherit;background:#fff;border:1px solid var(--line);border-radius:12px;padding:11px 14px;margin-bottom:12px}
.pan-table{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.pan-table th{text-align:left;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:10px 12px;background:#F7F8FA;border-bottom:1px solid var(--line)}
.pan-table td{padding:11px 12px;border-bottom:1px solid #EEF0F4;font-size:14px;vertical-align:middle}
.pan-table tr:last-child td{border-bottom:0}
.pan-table tbody tr{cursor:pointer}
.pan-table tbody tr:hover td{background:#FAFAFC}
.pan-table .pan-chk{width:36px;padding-right:0;cursor:default}
.pan-table .pan-chk input{width:18px;height:18px;accent-color:var(--ink);cursor:pointer}
.pan-table tr.is-sel td{background:#F1F3FA}
.pan-bulk{position:sticky;top:8px;z-index:5;display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:var(--ink);color:#fff;border-radius:14px;padding:10px 12px;margin:0 0 12px;box-shadow:0 10px 30px rgba(20,26,58,.25)}
.pan-bulk b{font-size:14px;margin-right:4px}
.pan-bulk select,.pan-bulk button{font:inherit;font-size:13px;font-weight:700;border:0;border-radius:999px;padding:7px 12px;background:#fff;color:var(--ink);cursor:pointer}
.pan-bulk .pan-bulk-x{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4);margin-left:auto}
.pan-num{font-family:'JetBrains Mono',monospace;font-weight:700}
.pan-sub{display:block;font-size:12px;color:var(--muted)}
.pan-paid{display:block;font-size:12px;font-weight:700;color:#127A4B}
.pan-unpaid{display:block;font-size:12px;font-weight:700;color:#B45309}
.pan-empty{background:#fff;border:1px dashed var(--line);border-radius:14px;padding:30px;text-align:center;color:var(--muted)}
.pan-grid{display:grid;grid-template-columns:minmax(0,440px) minmax(0,1fr);gap:22px;align-items:start}
.pan-side{position:sticky;top:16px;display:flex;flex-direction:column;gap:12px}
.pan-side .vc-stage{min-height:600px;padding:26px}
.pan-box{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 18px}
.pan-box h2{margin:0 0 10px;font-family:'Saira Condensed',sans-serif;font-size:22px}
.pan-actions{display:flex;flex-wrap:wrap;gap:8px}
.pan-actions .vc-btn{font-size:16px;padding:9px 14px}
.pan-head{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:16px}
.pan-head h1{margin:0;font-family:'Saira Condensed',sans-serif;font-size:40px;line-height:1}
.pan-head .grow{flex:1}
.pan-kv{display:grid;grid-template-columns:150px 1fr;gap:6px 12px;font-size:14px}
.pan-kv dt{color:var(--muted)}
.pan-kv dd{margin:0;word-break:break-word}
.pan-save{position:sticky;bottom:12px;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:12px;background:#141A3A;color:#fff;border-radius:14px;padding:10px 12px 10px 16px;box-shadow:0 10px 30px -10px rgba(20,26,58,.6)}
.pan-toast{position:fixed;left:50%;bottom:20px;translate:-50% 0;background:#141A3A;color:#fff;padding:10px 16px;border-radius:12px;font-weight:600;z-index:50}
.pan-check{display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px;cursor:pointer}
.pan-check input{width:18px;height:18px;accent-color:#127A4B}
.ad .vc-step{border-radius:14px}
@media (max-width:1000px){
  .pan-grid{grid-template-columns:1fr}
  .pan-side{position:static}
  .pan-side .vc-stage{min-height:480px}
  .pan-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pan-table .hide-m{display:none}
  .pan-wrap{padding:16px}
}
`;
