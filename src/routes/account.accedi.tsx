import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { FONTS_HREF } from "@/components/vault/CardEditor";
import { SiteShell } from "@/components/vault/home/Site";
import { AUTH_CSS, AuthForm } from "@/components/vault/account/AuthForm";
import { useMe } from "@/lib/accountClient";

export const Route = createFileRoute("/account/accedi")({
  component: Accedi,
  head: () => ({
    meta: [
      { title: "Accedi — Vault Crafted" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "stylesheet", href: FONTS_HREF }],
  }),
});

const safeNext = () => {
  if (typeof location === "undefined") return "/account";
  const n = new URLSearchParams(location.search).get("next") ?? "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/account";
};

function Accedi() {
  const { me } = useMe();
  const go = () => {
    location.href = safeNext();
  };
  useEffect(() => {
    if (me) go();
  }, [me]);
  const signup = typeof location !== "undefined" && new URLSearchParams(location.search).has("nuovo");
  return (
    <SiteShell>
      <style>{AUTH_CSS + LOGIN_CSS}</style>
      <section className="lg hm-fill">
        <div className="lg-txt">
          <h1>Il tuo Vault.</h1>
          <p>Un account per seguire le tue carte dall'ordine alla consegna.</p>
          <ul>
            <li>
              <b>I tuoi ordini</b> con lo stato, il pagamento e il tracking della spedizione
            </li>
            <li>
              <b>La tua collezione</b>, con livelli e traguardi da sbloccare
            </li>
            <li>
              <b>Bozze salvate</b>: inizi una carta oggi e la finisci domani
            </li>
            <li>
              <b>Indirizzi salvati</b> per ordinare e regalare più in fretta
            </li>
          </ul>
        </div>
        <div className="lg-box">
          {me === undefined ? null : <AuthForm initial={signup ? "signup" : "login"} onDone={go} />}
        </div>
      </section>
    </SiteShell>
  );
}

const LOGIN_CSS = `
.lg{max-width:1100px;margin:0 auto;padding:70px 28px 40px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,440px);gap:70px;align-items:start}
.lg-txt h1{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(50px,6vw,88px);line-height:.9;margin:0 0 16px}
.lg-txt p{color:var(--muted);font-size:19px;margin:0 0 26px;max-width:40ch}
.lg-txt ul{list-style:none;margin:0;padding:0;display:grid;gap:14px}
.lg-txt li{padding-left:18px;border-left:3px solid var(--line);color:var(--muted)}
.lg-txt li b{color:var(--ink)}
.lg-box{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:26px;box-shadow:0 30px 60px -40px rgba(20,26,58,.5)}
@media (max-width:900px){.lg{grid-template-columns:1fr;gap:28px;padding:34px 18px}.lg-box{padding:20px}}
`;
