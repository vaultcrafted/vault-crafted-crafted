import { useEffect, useRef, useState } from "react";
import { acc, type Me } from "@/lib/accountClient";

const ICON = (
  <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4" />
  </svg>
);

const LINKS: [string, string][] = [
  ["ordini", "I miei ordini"],
  ["collezione", "Collezione e traguardi"],
  ["bozze", "Bozze salvate"],
  ["indirizzi", "Indirizzi"],
  ["profilo", "Profilo e password"],
];

/** Pulsante profilo in alto a destra con il menù rapido. */
export function AccountMenu({ me }: { me: Me | null | undefined }) {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/login", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((r: { admin?: boolean }) => setAdmin(!!r.admin))
      .catch(() => null);
  }, []);
  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("mousedown", click);
    addEventListener("keydown", key);
    return () => {
      removeEventListener("mousedown", click);
      removeEventListener("keydown", key);
    };
  }, [open]);

  const logout = async () => {
    await acc("sessione", { method: "DELETE" }).catch(() => null);
    location.href = "/";
  };
  const logoutAdmin = async () => {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "same-origin" }).catch(() => null);
    location.reload();
  };
  const label = me ? me.name.split(" ")[0] || "Il mio Vault" : admin ? "Admin" : "Accedi";

  return (
    <div className="am" ref={box}>
      <button type="button" className="hm-acc" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}>
        {ICON}
        <span>{label}</span>
        <svg className="am-caret" viewBox="0 0 12 12" aria-hidden>
          <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="am-pop" role="menu">
          {me ? (
            <>
              <a href="/account" className="am-who" role="menuitem">
                <i>{(me.name || me.email).slice(0, 1).toUpperCase()}</i>
                <span>
                  <b>{me.name || "Il mio Vault"}</b>
                  <em>{me.email}</em>
                </span>
              </a>
              {!me.verified && (
                <a href="/account" className="am-warn" role="menuitem">
                  Conferma la tua email
                </a>
              )}
              {LINKS.map(([t, l]) => (
                <a key={t} href={`/account?tab=${t}`} role="menuitem">
                  {l}
                </a>
              ))}
              <a href="/crea" role="menuitem">
                Crea una nuova carta
              </a>
            </>
          ) : (
            <>
              <p className="am-hint">Segui i tuoi ordini e la tua collezione.</p>
              <a href="/account/accedi" className="am-primary" role="menuitem">
                Accedi
              </a>
              <a href="/account/accedi?nuovo=1" role="menuitem">
                Crea account
              </a>
            </>
          )}
          {admin && (
            <a href="/admin" className="am-admin" role="menuitem">
              Pannello admin <small>· solo su questo dispositivo</small>
            </a>
          )}
          {me && (
            <button type="button" role="menuitem" onClick={logout}>
              Esci
            </button>
          )}
          {admin && (
            <button type="button" role="menuitem" onClick={logoutAdmin}>
              Esci dal pannello admin
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const AM_CSS = `
.am{position:relative}
.am .hm-acc{border:0;background:none;cursor:pointer;font:inherit;font-weight:600;font-size:15px;padding:6px 4px}
.am-caret{width:12px;height:12px;transition:transform .2s}
.am .hm-acc[aria-expanded=true] .am-caret{transform:rotate(180deg)}
.am-pop{position:absolute;right:0;top:calc(100% + 12px);z-index:50;width:270px;background:#fff;color:var(--ink);border-radius:16px;padding:8px;
  box-shadow:0 24px 50px -18px rgba(20,26,58,.55),0 0 0 1px rgba(20,26,58,.08);display:flex;flex-direction:column;animation:hmdrop .2s cubic-bezier(.2,.8,.2,1)}
.am-pop a,.am-pop button{display:block;text-align:left;border:0;background:none;font:inherit;font-size:15px;font-weight:500;color:var(--ink) !important;text-decoration:none;padding:10px 12px;border-radius:10px;cursor:pointer}
.am-pop a:hover,.am-pop button:hover{background:#F1F2F6}
.am-pop button{color:var(--muted) !important;border-top:1px solid #EEF0F4;border-radius:0 0 10px 10px;margin-top:4px}
.am-pop a.am-who{display:flex !important;align-items:center;gap:12px;padding:10px 10px 12px !important;border-bottom:1px solid #EEF0F4;border-radius:10px 10px 0 0 !important;margin-bottom:4px}
.am-who i{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:#141A3A;color:#fff;font-style:normal;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:20px}
.am-who span{min-width:0}
.am-who b{display:block;font-size:15px}
.am-who em{display:block;font-style:normal;font-size:12.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.am-pop a.am-warn{background:#FFF7E0;color:#5A4300 !important;font-size:13.5px !important;font-weight:600 !important;margin-bottom:4px}
.am-pop a.am-admin small{font-weight:500;color:var(--muted);font-size:12px}
.am-hint{margin:6px 12px 8px;font-size:13.5px;color:var(--muted)}
.am-pop a.am-primary,.am-pop a.am-primary:hover{background:#141A3A !important;color:#fff !important;text-align:center !important;font-weight:700 !important;margin-bottom:4px}
.am-pop a.am-admin{color:#1F86D6 !important;font-weight:700 !important;border-top:1px solid #EEF0F4;border-radius:0 !important;margin-top:4px}
@media (max-width:900px){.am-pop{position:fixed;right:12px;left:12px;top:64px;width:auto}}
`;
