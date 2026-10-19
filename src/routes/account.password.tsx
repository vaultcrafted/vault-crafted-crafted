import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FONTS_HREF } from "@/components/vault/CardEditor";
import { SiteShell } from "@/components/vault/home/Site";
import { AUTH_CSS } from "@/components/vault/account/AuthForm";
import { acc } from "@/lib/accountClient";

export const Route = createFileRoute("/account/password")({
  component: NuovaPassword,
  head: () => ({
    meta: [{ title: "Nuova password — Vault Crafted" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "stylesheet", href: FONTS_HREF }],
  }),
});

function NuovaPassword() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const t = new URLSearchParams(location.search).get("t") ?? "";
      await acc("password", { method: "PUT", json: { token: t, password: pw } });
      location.href = "/account?password=ok";
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <SiteShell>
      <style>{AUTH_CSS}</style>
      <section className="hm-fill" style={{ maxWidth: 480, margin: "0 auto", padding: "70px 18px 40px" }}>
        <div className="au" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 20, padding: 26 }}>
          <h1 className="au-title">Scegli una nuova password</h1>
          <form className="au-form" onSubmit={submit}>
            <label>
              <span>Nuova password</span>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} autoComplete="new-password" required />
              <em>Almeno 8 caratteri.</em>
            </label>
            {err && <p className="au-err">{err}</p>}
            <button className="hm-btn" type="submit" disabled={busy}>
              {busy ? "Un attimo…" : "Salva e accedi"}
            </button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
