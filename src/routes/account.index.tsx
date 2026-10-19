import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FONTS_HREF } from "@/components/vault/CardEditor";
import { SiteShell } from "@/components/vault/home/Site";
import { AUTH_CSS } from "@/components/vault/account/AuthForm";
import { CardThumb, THUMB_CSS } from "@/components/vault/account/CardThumb";
import { BadgeIcon } from "@/components/vault/account/Icons";
import { acc, useMe, type Me } from "@/lib/accountClient";
import { isCollected, progress } from "@/lib/gamification";
import { catOf } from "@/lib/vaultCard";

export const Route = createFileRoute("/account/")({
  component: Account,
  head: () => ({
    meta: [{ title: "Il mio Vault — Vault Crafted" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "stylesheet", href: FONTS_HREF }],
  }),
});

interface Order {
  id: string;
  serial: number | null;
  edition: number | null;
  created_at: string;
  status: string;
  paid: number;
  customer_name: string;
  address: string;
  category: string;
  card_name: string;
  card_json: string;
  art_pos: string;
  case_id: string;
  case_label: string;
  total: number;
  photo_key: string;
  art_key: string;
  tracking: string;
  source: string;
}
interface Draft {
  id: string;
  title: string;
  card_json: string;
  art_pos: string;
  photo_key: string;
  updated_at: string;
}
interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  address: string;
  is_default: number;
}

const TABS = [
  ["ordini", "Ordini"],
  ["collezione", "Collezione"],
  ["bozze", "Bozze"],
  ["indirizzi", "Indirizzi"],
  ["profilo", "Profilo"],
] as const;
type Tab = (typeof TABS)[number][0];

const pad = (n: number | null) => (n == null ? "—" : String(n).padStart(3, "0"));
const eur = (n: number) => `€${n.toFixed(2).replace(".", ",")}`;
const date = (s: string) => new Date(s).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

// passaggi mostrati al cliente
const STEPS = ["Ricevuto", "Pagamento", "Stampa", "Spedita", "Consegnata"];
const stepOf = (o: Order) => {
  if (o.status === "consegnato" || o.status === "storico") return 4;
  if (o.status === "spedito") return 3;
  if (o.status === "in_stampa" || o.status === "approvato" || o.paid) return 2;
  if (o.status === "bozza_inviata") return 1;
  return 0;
};
const statusText = (o: Order) =>
  o.status === "storico"
    ? "Consegnata"
    : o.status === "consegnato"
      ? "Consegnata"
      : o.status === "spedito"
        ? "In viaggio"
        : o.status === "in_stampa"
          ? "In stampa"
          : o.paid || o.status === "approvato"
            ? "Pagata, in coda di stampa"
            : o.status === "bozza_inviata"
              ? "In attesa di pagamento"
              : "Ricevuto, lo stiamo controllando";

function Account() {
  const { me, setMe } = useMe();
  const [tab, setTab] = useState<Tab>("ordini");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [payInfo, setPayInfo] = useState("");
  const [flash, setFlash] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const t = q.get("tab") as Tab | null;
    if (t && TABS.some(([k]) => k === t)) setTab(t);
    if (q.get("verifica") === "ok") setFlash("Email confermata: ora vedi anche gli ordini fatti prima di creare l'account.");
    if (q.get("verifica") === "scaduta") setFlash("Il link di conferma è scaduto o già usato: chiedine uno nuovo qui sotto.");
    if (q.get("password") === "ok") setFlash("Password aggiornata.");
  }, []);
  useEffect(() => {
    if (me === null) location.href = "/account/accedi?next=/account";
    if (!me) return;
    acc<{ orders: Order[]; paymentInfo: string }>("ordini")
      .then((r) => {
        setOrders(r.orders);
        setPayInfo(r.paymentInfo);
      })
      .catch(() => setOrders([]));
  }, [me]);

  const pick = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `/account?tab=${t}`);
  };
  const logout = async () => {
    await acc("sessione", { method: "DELETE" }).catch(() => null);
    location.href = "/";
  };

  if (!me)
    return (
      <SiteShell>
        <div style={{ minHeight: "60vh" }} />
      </SiteShell>
    );

  const g = progress(orders ?? [], me);
  return (
    <SiteShell>
      <style>{AUTH_CSS + THUMB_CSS + ACC_CSS}</style>
      <header className="ac-head">
        <div>
          <p className="ac-hi">Ciao {me.name.split(" ")[0]},</p>
          <h1>Il tuo Vault</h1>
        </div>
        <button type="button" className="ac-level" onClick={() => pick("collezione")} style={{ ["--lv" as string]: g.level.color }}>
          <i>{g.n}</i>
          <span>
            <b>{g.level.name}</b>
            <em>{g.next ? `${g.next.min - g.n} ${g.next.min - g.n === 1 ? "carta" : "carte"} a ${g.next.name}` : "Livello massimo"}</em>
          </span>
        </button>
      </header>

      {flash && <p className="ac-flash">{flash}</p>}
      {!me.verified && <VerifyBanner email={me.email} />}

      <div className="ac-wrap hm-fill">
        <nav className="ac-tabs" aria-label="Sezioni dell'account">
          {TABS.map(([k, l]) => (
            <button key={k} type="button" aria-current={tab === k ? "page" : undefined} onClick={() => pick(k)}>
              {l}
              {k === "ordini" && orders && orders.some((o) => stepOf(o) < 3) ? <span className="ac-dot" /> : null}
            </button>
          ))}
          <button type="button" className="ac-out" onClick={logout}>
            Esci
          </button>
        </nav>
        <section className="ac-main">
          {tab === "ordini" && <Orders orders={orders} payInfo={payInfo} />}
          {tab === "collezione" && <Collection orders={orders} me={me} />}
          {tab === "bozze" && <Drafts />}
          {tab === "indirizzi" && <Addresses />}
          {tab === "profilo" && <Profile me={me} onSaved={setMe} />}
        </section>
      </div>
    </SiteShell>
  );
}

function VerifyBanner({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="ac-verify">
      <span>
        Conferma la tua email (<b>{email}</b>) per vedere anche gli ordini fatti prima di creare l'account.
      </span>
      <button
        type="button"
        disabled={sent}
        onClick={() => acc("verifica", { method: "POST" }).then(() => setSent(true)).catch(() => setSent(true))}
      >
        {sent ? "Email inviata" : "Rimanda l'email"}
      </button>
    </div>
  );
}

async function reorder(orderId: string) {
  try {
    const r = await acc<{ id: string }>("riordina", { json: { orderId } });
    location.href = `/crea?bozza=${r.id}`;
  } catch (e) {
    alert((e as Error).message);
  }
}

function Orders({ orders, payInfo }: { orders: Order[] | null; payInfo: string }) {
  if (!orders) return <p className="ac-muted">Carico i tuoi ordini…</p>;
  if (!orders.length)
    return (
      <Empty title="Ancora nessun ordine" text="Quando ordini una carta la trovi qui, con lo stato e la spedizione.">
        <Link to="/crea" className="hm-btn">
          Crea la tua prima carta
        </Link>
      </Empty>
    );
  return (
    <div className="ac-orders">
      {orders.map((o) => {
        const st = stepOf(o);
        const waiting = !o.paid && st <= 1 && o.status !== "storico";
        return (
          <article className="ac-order" key={o.id}>
            <div className="ac-o-thumb">
              {o.card_json.length > 4 ? (
                <CardThumb cardJson={o.card_json} artPos={o.art_pos} photoKey={o.art_key || o.photo_key} serial={o.serial} edition={o.edition} />
              ) : (
                <span className="ct ac-legacy">N° {pad(o.serial)}</span>
              )}
            </div>
            <div className="ac-o-body">
              <div className="ac-o-top">
                <div>
                  <h3>{o.card_name || "Carta Vault"}</h3>
                  <p className="ac-muted">
                    N° {pad(o.serial)} · {o.category ? catOf(o.category).n : "Carta"} · {date(o.created_at)}
                  </p>
                </div>
                <b className="ac-total">{o.total ? eur(o.total) : ""}</b>
              </div>
              <p className="ac-status">{statusText(o)}</p>
              <ol className="ac-steps" aria-label="Avanzamento">
                {STEPS.map((s, i) => (
                  <li key={s} data-done={i <= st} data-now={i === st}>
                    <i />
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              {waiting && (
                <div className="ac-pay">
                  <b>Come pagare</b>
                  {payInfo ? <p>{payInfo}</p> : <p>Ti scriviamo noi via email con le istruzioni.</p>}
                  <p className="ac-muted">
                    Causale: <b>Vault N° {pad(o.serial)}</b> · Totale <b>{eur(o.total)}</b>
                  </p>
                </div>
              )}
              {o.tracking && (
                <div className="ac-track">
                  <span>Codice di tracking</span>
                  <code>{o.tracking}</code>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(o.tracking)}>
                    Copia
                  </button>
                </div>
              )}
              <div className="ac-o-actions">
                {o.address && <span className="ac-muted ac-addr">Spedita a {o.address.split("\n")[0]}</span>}
                {o.card_json.length > 4 && (
                  <button type="button" className="ac-ghost" onClick={() => void reorder(o.id)}>
                    Riordina o modifica
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Collection({ orders, me }: { orders: Order[] | null; me: Me }) {
  if (!orders) return <p className="ac-muted">Carico la tua collezione…</p>;
  const g = progress(orders, me);
  const mine = orders.filter(isCollected);
  return (
    <div className="ac-col">
      <div className="ac-lvl" style={{ ["--lv" as string]: g.level.color }}>
        <div className="ac-lvl-medal">
          <b>{g.n}</b>
          <span>{g.n === 1 ? "carta" : "carte"}</span>
        </div>
        <div className="ac-lvl-txt">
          <p className="ac-muted">Il tuo livello</p>
          <h2>{g.level.name}</h2>
          <div className="ac-bar">
            <i style={{ width: `${g.pct}%` }} />
          </div>
          <p className="ac-muted">
            {g.next
              ? `Ancora ${g.next.min - g.n} ${g.next.min - g.n === 1 ? "carta" : "carte"} per diventare ${g.next.name}.`
              : "Sei al livello più alto. Rispetto."}
          </p>
        </div>
      </div>

      <h2 className="ac-h2">
        Traguardi <small>{g.unlocked} di {g.badges.length}</small>
      </h2>
      <ul className="ac-badges">
        {g.badges.map((b) => (
          <li key={b.id} data-ok={b.ok} title={b.hint}>
            <span className="ac-badge">
              <BadgeIcon id={b.id} />
            </span>
            <b>{b.name}</b>
            <em>{b.ok ? "Sbloccato" : b.hint}</em>
          </li>
        ))}
      </ul>

      <h2 className="ac-h2">La tua collezione</h2>
      {mine.length ? (
        <div className="ac-binder">
          {mine.map((o) => (
            <div className="ac-pocket" key={o.id}>
              {o.card_json.length > 4 ? (
                <CardThumb cardJson={o.card_json} artPos={o.art_pos} photoKey={o.art_key || o.photo_key} serial={o.serial} edition={o.edition} />
              ) : (
                <span className="ct ac-legacy">N° {pad(o.serial)}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty title="La collezione è vuota" text="Le carte entrano qui appena il pagamento è confermato.">
          <Link to="/crea" className="hm-btn">
            Crea una carta
          </Link>
        </Empty>
      )}
    </div>
  );
}

function Drafts() {
  const [list, setList] = useState<Draft[] | null>(null);
  const load = () => acc<{ drafts: Draft[] }>("bozze").then((r) => setList(r.drafts)).catch(() => setList([]));
  useEffect(() => {
    void load();
  }, []);
  if (!list) return <p className="ac-muted">Carico le bozze…</p>;
  if (!list.length)
    return (
      <Empty title="Nessuna bozza" text="Nel configuratore premi “Salva bozza” per riprendere la carta più tardi.">
        <Link to="/crea" className="hm-btn">
          Inizia una carta
        </Link>
      </Empty>
    );
  return (
    <div className="ac-drafts">
      {list.map((d) => (
        <article key={d.id} className="ac-draft">
          <a href={`/crea?bozza=${d.id}`} className="ac-d-thumb">
            <CardThumb cardJson={d.card_json} artPos={d.art_pos} photoKey={d.photo_key} />
          </a>
          <h3>{d.title}</h3>
          <p className="ac-muted">Modificata il {date(d.updated_at)}</p>
          <div className="ac-d-actions">
            <a href={`/crea?bozza=${d.id}`} className="hm-btn sm ac-dark">
              Continua
            </a>
            <button
              type="button"
              className="ac-ghost"
              onClick={async () => {
                if (!confirm("Eliminare questa bozza?")) return;
                await acc(`bozze?id=${d.id}`, { method: "DELETE" }).catch(() => null);
                void load();
              }}
            >
              Elimina
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

const EMPTY_ADDR = { label: "", recipient: "", phone: "", address: "", is_default: 0 };
function Addresses() {
  const [list, setList] = useState<Address[] | null>(null);
  const [edit, setEdit] = useState<(Omit<Address, "id"> & { id?: string }) | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    acc<{ addresses: Address[] }>("indirizzi").then((r) => setList(r.addresses)).catch(() => setList([]));
  }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    setErr("");
    try {
      const r = await acc<{ addresses: Address[] }>(edit.id ? `indirizzi?id=${edit.id}` : "indirizzi", {
        method: edit.id ? "PUT" : "POST",
        json: edit,
      });
      setList(r.addresses);
      setEdit(null);
    } catch (x) {
      setErr((x as Error).message);
    }
  };
  if (!list) return <p className="ac-muted">Carico gli indirizzi…</p>;
  return (
    <div>
      <div className="ac-addrs">
        {list.map((a) => (
          <article key={a.id} className="ac-addr-card" data-def={!!a.is_default}>
            <div className="ac-addr-top">
              <b>{a.label}</b>
              {!!a.is_default && <span className="ac-pill">Predefinito</span>}
            </div>
            <p>
              {a.recipient}
              <br />
              {a.address}
              {a.phone && (
                <>
                  <br />
                  {a.phone}
                </>
              )}
            </p>
            <div className="ac-d-actions">
              <button type="button" className="ac-ghost" onClick={() => setEdit({ ...a })}>
                Modifica
              </button>
              <button
                type="button"
                className="ac-ghost"
                onClick={async () => {
                  if (!confirm("Eliminare questo indirizzo?")) return;
                  const r = await acc<{ addresses: Address[] }>(`indirizzi?id=${a.id}`, { method: "DELETE" });
                  setList(r.addresses);
                }}
              >
                Elimina
              </button>
            </div>
          </article>
        ))}
        {!edit && (
          <button type="button" className="ac-addr-new" onClick={() => setEdit({ ...EMPTY_ADDR })}>
            <span>+</span> Aggiungi indirizzo
          </button>
        )}
      </div>
      {edit && (
        <form className="au-form ac-form" onSubmit={save}>
          <h2 className="ac-h2">{edit.id ? "Modifica indirizzo" : "Nuovo indirizzo"}</h2>
          <div className="ac-2">
            <label>
              <span>Nome dell'indirizzo</span>
              <input placeholder="Casa, Ufficio, Mamma…" value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} />
            </label>
            <label>
              <span>Destinatario</span>
              <input value={edit.recipient} onChange={(e) => setEdit({ ...edit, recipient: e.target.value })} required />
            </label>
          </div>
          <label>
            <span>Indirizzo completo</span>
            <textarea
              className="ac-ta"
              placeholder="Via, numero, CAP, città, provincia"
              value={edit.address}
              onChange={(e) => setEdit({ ...edit, address: e.target.value })}
              required
            />
          </label>
          <label>
            <span>Telefono per il corriere (facoltativo)</span>
            <input type="tel" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
          </label>
          <label className="ac-check">
            <input type="checkbox" checked={!!edit.is_default} onChange={(e) => setEdit({ ...edit, is_default: e.target.checked ? 1 : 0 })} />
            <span>Usa come indirizzo predefinito</span>
          </label>
          {err && <p className="au-err">{err}</p>}
          <div className="ac-d-actions">
            <button type="submit" className="hm-btn">
              Salva indirizzo
            </button>
            <button type="button" className="ac-ghost" onClick={() => setEdit(null)}>
              Annulla
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Profile({ me, onSaved }: { me: Me; onSaved: (m: Me) => void }) {
  const [f, setF] = useState({ name: me.name, phone: me.phone });
  const [pw, setPw] = useState({ current: "", password: "" });
  const [msg, setMsg] = useState<[string, string]>(["", ""]);
  const [pmsg, setPmsg] = useState<[string, string]>(["", ""]);
  return (
    <div className="ac-profile">
      <form
        className="au-form ac-form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const r = await acc<{ customer: Me }>("profilo", { method: "PUT", json: f });
            onSaved(r.customer);
            setMsg(["ok", "Dati salvati."]);
          } catch (x) {
            setMsg(["err", (x as Error).message]);
          }
        }}
      >
        <h2 className="ac-h2">I tuoi dati</h2>
        <label>
          <span>Email</span>
          <input value={me.email} disabled />
          <em>{me.verified ? "Email confermata." : "Email da confermare."} Per cambiarla scrivici.</em>
        </label>
        <div className="ac-2">
          <label>
            <span>Nome e cognome</span>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
          </label>
          <label>
            <span>Cellulare</span>
            <input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          </label>
        </div>
        {msg[1] && <p className={msg[0] === "ok" ? "au-ok" : "au-err"}>{msg[1]}</p>}
        <button type="submit" className="hm-btn">
          Salva
        </button>
      </form>
      <form
        className="au-form ac-form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await acc("password", { method: "PATCH", json: pw });
            setPw({ current: "", password: "" });
            setPmsg(["ok", "Password cambiata."]);
          } catch (x) {
            setPmsg(["err", (x as Error).message]);
          }
        }}
      >
        <h2 className="ac-h2">Cambia password</h2>
        <div className="ac-2">
          <label>
            <span>Password attuale</span>
            <input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
          </label>
          <label>
            <span>Nuova password</span>
            <input type="password" autoComplete="new-password" minLength={8} value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} required />
          </label>
        </div>
        {pmsg[1] && <p className={pmsg[0] === "ok" ? "au-ok" : "au-err"}>{pmsg[1]}</p>}
        <button type="submit" className="hm-btn">
          Cambia password
        </button>
      </form>
      <p className="ac-muted" style={{ fontSize: 14 }}>
        Account creato il {date(me.since)}. Vuoi eliminarlo? Scrivici a vaultcrafted@gmail.com.
      </p>
    </div>
  );
}

function Empty({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="ac-empty">
      <h3>{title}</h3>
      <p className="ac-muted">{text}</p>
      {children}
    </div>
  );
}

const ACC_CSS = `
.ac-head{max-width:1240px;margin:0 auto;padding:54px 28px 18px;display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:20px}
.ac-hi{margin:0;color:var(--muted);font-size:18px}
.ac-head h1{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(46px,5.5vw,80px);line-height:.9;margin:4px 0 0}
.ac-level{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:10px 18px 10px 10px;cursor:pointer;font:inherit;color:inherit;text-align:left;transition:transform .2s,box-shadow .2s}
.ac-level:hover{transform:translateY(-2px);box-shadow:0 14px 26px -18px rgba(20,26,58,.5)}
.ac-level i{display:grid;place-items:center;width:48px;height:48px;border-radius:50%;font-style:normal;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:24px;color:#fff;background:var(--lv);box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}
.ac-level b{display:block;font-family:'Saira Condensed',sans-serif;font-size:21px}
.ac-level em{display:block;font-style:normal;font-size:13px;color:var(--muted)}
.ac-flash,.ac-verify{max-width:1184px;margin:0 auto 14px;box-sizing:border-box;border-radius:12px;padding:12px 16px;font-size:15px}
.ac-flash{background:#EAF7F0;color:#14502F}
.ac-verify{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;justify-content:space-between;background:#FFF7E0;color:#5A4300}
.ac-verify button{border:0;border-radius:9px;background:#5A4300;color:#fff;font:inherit;font-weight:700;font-size:14px;padding:8px 14px;cursor:pointer}
.ac-verify button:disabled{opacity:.6}
@media (min-width:1241px){.ac-flash,.ac-verify{margin-left:auto;margin-right:auto}}
.ac-wrap{max-width:1240px;margin:0 auto;padding:10px 28px 40px;display:grid;align-content:start;grid-template-columns:200px minmax(0,1fr);gap:34px;align-items:start}
.ac-tabs{position:sticky;top:84px;display:flex;flex-direction:column;gap:4px}
.ac-tabs button{position:relative;text-align:left;border:0;background:none;font:inherit;font-weight:600;font-size:16px;color:var(--muted);padding:11px 14px;border-radius:10px;cursor:pointer}
.ac-tabs button:hover{color:var(--ink);background:rgba(255,255,255,.6)}
.ac-tabs button[aria-current=page]{background:#fff;color:var(--ink);box-shadow:0 6px 14px -10px rgba(20,26,58,.5)}
.ac-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--red);margin-left:8px;vertical-align:middle}
.ac-out{margin-top:14px;border-top:1px solid var(--line) !important;border-radius:0 !important}
.ac-muted{color:var(--muted);margin:0}
.ac-h2{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:30px;margin:0 0 14px;display:flex;align-items:baseline;gap:12px}
.ac-h2 small{font-family:Archivo,sans-serif;font-weight:600;font-size:14px;color:var(--muted)}
.ac-orders{display:grid;gap:18px}
.ac-order{display:grid;grid-template-columns:150px minmax(0,1fr);gap:24px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px}
.ac-o-top{display:flex;justify-content:space-between;gap:12px}
.ac-o-top h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:28px;margin:0}
.ac-total{font-family:'Saira Condensed',sans-serif;font-size:26px;white-space:nowrap}
.ac-status{margin:12px 0 10px;font-weight:700}
.ac-steps{list-style:none;margin:0 0 14px;padding:0;display:grid;grid-template-columns:repeat(5,1fr)}
.ac-steps li{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;color:var(--muted);text-align:center}
.ac-steps li::before{content:"";position:absolute;top:7px;left:-50%;width:100%;height:3px;background:var(--line);z-index:0}
.ac-steps li:first-child::before{display:none}
.ac-steps li[data-done=true]::before{background:#3FB58A}
.ac-steps i{position:relative;z-index:1;width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid var(--line);box-sizing:border-box}
.ac-steps li[data-done=true] i{background:#3FB58A;border-color:#3FB58A}
.ac-steps li[data-now=true] i{box-shadow:0 0 0 5px rgba(63,181,138,.25)}
.ac-steps li[data-done=true] span{color:var(--ink);font-weight:600}
.ac-pay{background:#F4F6FB;border-radius:12px;padding:12px 14px;margin-bottom:12px}
.ac-pay p{margin:6px 0 0;white-space:pre-wrap;font-size:14.5px}
.ac-track{display:flex;flex-wrap:wrap;align-items:center;gap:10px;background:#EAF7F0;border-radius:12px;padding:10px 14px;margin-bottom:12px;font-size:14px}
.ac-track code{font-size:15px;font-weight:700;background:#fff;border-radius:6px;padding:3px 8px}
.ac-track button,.ac-ghost{border:1px solid var(--line);background:#fff;border-radius:9px;padding:8px 14px;font:inherit;font-size:14px;font-weight:600;color:var(--ink);cursor:pointer}
.ac-ghost:hover,.ac-track button:hover{border-color:var(--ink)}
.ac-o-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px}
.ac-addr{font-size:13.5px}
.ac-legacy{display:grid !important;place-items:center;background:#141A3A;color:#fff;font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:22px}
.ac-empty{background:#fff;border:1px dashed var(--line);border-radius:18px;padding:40px 24px;text-align:center;display:grid;justify-items:center;gap:10px}
.ac-empty h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:30px;margin:0}
.ac-lvl{display:flex;align-items:center;gap:26px;background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px;margin-bottom:34px;position:relative;overflow:hidden}
.ac-lvl::after{content:"";position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:var(--lv);opacity:.12}
.ac-lvl-medal{flex:none;width:118px;height:118px;border-radius:50%;display:grid;place-content:center;text-align:center;color:#fff;
  background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.45),transparent 45%),var(--lv);box-shadow:0 0 0 6px #fff,0 0 0 8px var(--lv),0 18px 30px -16px rgba(20,26,58,.6)}
.ac-lvl-medal b{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:46px;line-height:.9}
.ac-lvl-medal span{font-size:13px;font-weight:600}
.ac-lvl-txt{flex:1;min-width:0}
.ac-lvl-txt h2{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:36px;margin:0 0 12px}
.ac-bar{height:12px;border-radius:9px;background:#E3E6EE;overflow:hidden;margin-bottom:10px}
.ac-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--lv),#3dc8ff);transition:width 1s cubic-bezier(.2,.8,.2,1)}
.ac-badges{list-style:none;margin:0 0 34px;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}
.ac-badges li{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 10px;text-align:center;display:grid;justify-items:center;gap:6px}
.ac-badge{display:grid;place-items:center;width:54px;height:54px;border-radius:16px;transform:rotate(45deg);background:#E3E6EE;color:#9AA0AE}
.ac-badge svg{width:26px;height:26px;transform:rotate(-45deg)}
.ac-badges li[data-ok=true] .ac-badge{background:linear-gradient(135deg,#ff5aa8,#ffd23f 35%,#3dffb5 65%,#3dc8ff);color:#141A3A;box-shadow:0 10px 20px -10px rgba(20,26,58,.6)}
.ac-badges li b{font-size:14px;margin-top:8px}
.ac-badges li em{font-style:normal;font-size:12px;color:var(--muted)}
.ac-badges li[data-ok=false]{opacity:.75}
.ac-binder{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;background:linear-gradient(160deg,#262B44,#1A1E31);border-radius:18px;padding:18px}
.ac-pocket{padding:6%;border:3px solid rgba(214,220,234,.13);border-radius:4px;background:rgba(255,255,255,.03)}
.ac-drafts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
.ac-draft{background:#fff;border:1px solid var(--line);border-radius:18px;padding:14px}
.ac-draft h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:22px;margin:12px 0 2px}
.ac-d-thumb{display:block}
.ac-d-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;align-items:center}
.hm-btn.ac-dark{background:var(--ink);color:#fff !important}
.ac-addrs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:24px}
.ac-addr-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px}
.ac-addr-card[data-def=true]{border-color:var(--ink)}
.ac-addr-card p{margin:8px 0 0;color:var(--muted);font-size:14.5px;white-space:pre-wrap}
.ac-addr-top{display:flex;justify-content:space-between;align-items:center;gap:8px}
.ac-pill{font-size:12px;font-weight:700;background:var(--ink);color:#fff;border-radius:999px;padding:3px 9px}
.ac-addr-new{border:2px dashed var(--line);border-radius:16px;background:transparent;font:inherit;font-weight:700;color:var(--muted);cursor:pointer;min-height:150px}
.ac-addr-new span{display:block;font-size:30px}
.ac-addr-new:hover{border-color:var(--ink);color:var(--ink)}
.ac-form{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px;max-width:760px;margin-bottom:20px}
.ac-form .hm-btn{width:auto;justify-self:start;padding:0 26px}
.ac-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.ac-ta{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:10px;padding:12px 14px;font:inherit;font-size:16px;min-height:90px;resize:vertical}
.ac-check{display:flex !important;align-items:center;gap:10px;font-weight:500 !important}
.ac-check input{width:auto}
.au-form input:disabled{background:#F4F5F8;color:var(--muted)}
@media (max-width:1100px){.ac-badges{grid-template-columns:repeat(3,minmax(0,1fr))}.ac-drafts{grid-template-columns:repeat(3,minmax(0,1fr))}.ac-binder{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (max-width:900px){
  .ac-head{padding:34px 18px 14px}
  .ac-flash,.ac-verify{margin:0 18px 14px}
  .ac-wrap{grid-template-columns:1fr;padding:6px 18px 40px;gap:18px}
  .ac-tabs{position:static;flex-direction:row;overflow-x:auto;gap:6px;margin:0 -18px;padding:0 18px 4px;scrollbar-width:none}
  .ac-tabs button{white-space:nowrap;padding:9px 14px;background:rgba(255,255,255,.55)}
  .ac-out{margin:0 !important;border:0 !important;border-radius:10px !important}
  .ac-order{display:block;padding:14px}
  .ac-o-thumb{float:left;width:78px;margin:0 14px 8px 0}
  .ac-status,.ac-steps{clear:both}
  .ac-status{padding-top:8px}
  .ac-o-top h3{font-size:22px}
  .ac-steps span{font-size:10.5px}
  .ac-badges{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ac-binder{grid-template-columns:repeat(3,minmax(0,1fr));padding:12px;gap:8px}
  .ac-drafts,.ac-addrs{grid-template-columns:1fr 1fr}
  .ac-2{grid-template-columns:1fr}
  .ac-lvl{flex-direction:column;text-align:center;gap:16px}
}
`;
