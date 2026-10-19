import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { acc } from "@/lib/accountClient";

/** Accesso e registrazione cliente. Chiama onDone quando il cliente è dentro. */
export function AuthForm({ onDone, initial = "login" }: { onDone: () => void; initial?: "login" | "signup" }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initial);
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      if (mode === "login") {
        await acc("sessione", { json: { email: f.email, password: f.password } });
        onDone();
      } else if (mode === "signup") {
        await acc("registrati", { json: f });
        onDone();
      } else {
        await acc("password", { json: { email: f.email } });
        setMsg("Se l'email è registrata, ti abbiamo mandato un link per scegliere una nuova password. Controlla anche lo spam.");
      }
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="au">
      {mode !== "forgot" ? (
        <div className="au-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => (setMode("login"), setErr(""))}>
            Accedi
          </button>
          <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => (setMode("signup"), setErr(""))}>
            Crea account
          </button>
        </div>
      ) : (
        <h2 className="au-title">Password dimenticata</h2>
      )}
      <form onSubmit={submit} className="au-form">
        {mode === "signup" && (
          <label>
            <span>Nome e cognome</span>
            <input value={f.name} onChange={up("name")} autoComplete="name" required />
          </label>
        )}
        <label>
          <span>Email</span>
          <input type="email" value={f.email} onChange={up("email")} autoComplete="email" required />
        </label>
        {mode !== "forgot" && (
          <label>
            <span>Password</span>
            <div className="au-pw">
              <input
                type={show ? "text" : "password"}
                value={f.password}
                onChange={up("password")}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "signup" ? 8 : undefined}
                required
              />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Nascondi password" : "Mostra password"}>
                {show ? "Nascondi" : "Mostra"}
              </button>
            </div>
            {mode === "signup" && <em>Almeno 8 caratteri.</em>}
          </label>
        )}
        {mode === "signup" && (
          <label>
            <span>Cellulare (facoltativo)</span>
            <input type="tel" value={f.phone} onChange={up("phone")} autoComplete="tel" />
          </label>
        )}
        {err && <p className="au-err" role="alert">{err}</p>}
        {msg && <p className="au-ok" role="status">{msg}</p>}
        <button type="submit" className="hm-btn" disabled={busy}>
          {busy ? "Un attimo…" : mode === "login" ? "Accedi" : mode === "signup" ? "Crea il mio account" : "Mandami il link"}
        </button>
        {mode === "login" && (
          <button type="button" className="au-link" onClick={() => (setMode("forgot"), setErr(""))}>
            Hai dimenticato la password?
          </button>
        )}
        {mode === "forgot" && (
          <button type="button" className="au-link" onClick={() => (setMode("login"), setMsg(""))}>
            ← Torna all'accesso
          </button>
        )}
        {mode === "signup" && (
          <p className="au-small">
            Creando l'account accetti i <Link to="/termini">termini</Link>. Usiamo i tuoi dati solo per gli ordini.
          </p>
        )}
      </form>
    </div>
  );
}

export const AUTH_CSS = `
.au{width:100%;max-width:440px}
.au-tabs{display:grid;grid-template-columns:1fr 1fr;background:#DEE0E7;border-radius:12px;padding:4px;margin-bottom:22px}
.au-tabs button{border:0;background:transparent;border-radius:9px;padding:10px;font:inherit;font-weight:700;color:var(--muted);cursor:pointer}
.au-tabs button[aria-selected=true]{background:#fff;color:var(--ink);box-shadow:0 4px 10px -6px rgba(20,26,58,.4)}
.au-title{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:34px;margin:0 0 14px}
.au-form{display:grid;gap:14px}
.au-form label{display:grid;gap:6px;font-size:14px;font-weight:600}
.au-form label em{font-style:normal;font-weight:400;color:var(--muted);font-size:13px}
.au-form input{width:100%;box-sizing:border-box;border:1px solid var(--line);background:#fff;border-radius:10px;padding:12px 14px;font:inherit;font-size:16px;color:var(--ink)}
.au-form input:focus{outline:2px solid #1F86D6;outline-offset:0;border-color:transparent}
.au-pw{position:relative}
.au-pw input{padding-right:92px}
.au-pw button{position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;background:none;color:var(--muted);font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:8px}
.au-form .hm-btn{width:100%;border:0;cursor:pointer;margin-top:4px}
.au-form .hm-btn:disabled{opacity:.6;cursor:default}
.au-link{border:0;background:none;color:var(--ink);font:inherit;font-weight:600;text-decoration:underline;text-underline-offset:3px;cursor:pointer;justify-self:center;font-size:14px}
.au-err{margin:0;background:#FFF1F0;color:#7A1A12;border-radius:10px;padding:10px 12px;font-size:14px}
.au-ok{margin:0;background:#EAF7F0;color:#14502F;border-radius:10px;padding:10px 12px;font-size:14px}
.au-small{margin:0;color:var(--muted);font-size:12.5px;text-align:center}
`;
