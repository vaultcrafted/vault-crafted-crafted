import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FONTS_HREF } from "@/components/vault/CardEditor";
import { HoloCard } from "@/components/vault/home/HoloCard";
import { CardZoom, SiteShell } from "@/components/vault/home/Site";
import { CUSTODIE, SPEDIZIONE } from "@/lib/vaultShop";

const SCHEMA_PRODUCT_REGALO = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Carta da Collezione Personalizzata — Regalo Originale",
  "description": "Una carta da collezione personalizzata con la foto di chi la riceve, come regalo originale. Per compleanni, lauree, anniversari, Natale, matrimoni. Stampata e numerata, spedizione in tutta Italia.",
  "brand": { "@type": "Brand", "name": "Vault Crafted" },
  "image": "https://vaultcrafted.com/og-image.jpg",
  "url": "https://vaultcrafted.com/regalo",
  "category": "Regalo personalizzato",
  "keywords": "regalo originale, regalo personalizzato, carta pokemon regalo, regalo compleanno unico, regalo laurea, regalo anniversario",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "EUR",
    "lowPrice": "20",
    "highPrice": "34",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "Vault Crafted" },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": { "@type": "MonetaryAmount", "value": "4.99", "currency": "EUR" },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 5, "unitCode": "DAY" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 5, "unitCode": "DAY" }
      },
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "IT" }
    }
  },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Personalizzazione", "value": "Nome, attacchi, elemento, foto, frase" },
    { "@type": "PropertyValue", "name": "Tiratura", "value": "Numerata" },
        { "@type": "PropertyValue", "name": "Consegna", "value": "7-10 giorni lavorativi in tutta Italia" }
  ]
};

const SCHEMA_GIFT_OCCASIONS = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Occasioni regalo — Carta personalizzata Vault Crafted",
  "description": "La carta personalizzata Vault Crafted è il regalo perfetto per ogni occasione speciale.",
  "url": "https://vaultcrafted.com/regalo",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Regalo Compleanno Originale" },
    { "@type": "ListItem", "position": 2, "name": "Regalo Anniversario Personalizzato" },
    { "@type": "ListItem", "position": 3, "name": "Regalo Laurea Unico" },
    { "@type": "ListItem", "position": 4, "name": "Regalo di Natale Originale" },
    { "@type": "ListItem", "position": 5, "name": "Regalo Matrimonio Personalizzato" },
    { "@type": "ListItem", "position": 6, "name": "Regalo per il Migliore Amico" },
    { "@type": "ListItem", "position": 7, "name": "Regalo per la Famiglia" },
    { "@type": "ListItem", "position": 8, "name": "Regalo per il proprio Animale Domestico" }
  ]
};

const SCHEMA_BREADCRUMB_REGALO = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vaultcrafted.com" },
    { "@type": "ListItem", "position": 2, "name": "Il regalo perfetto", "item": "https://vaultcrafted.com/regalo" }
  ]
};

export const Route = createFileRoute("/regalo")({
  component: RegaloPage,
  head: () => ({
    meta: [
      { title: "Il regalo perfetto e originale — Vault Crafted | Carta personalizzata" },
      { name: "description", content: "Cerca un regalo originale e unico? Una carta da collezione personalizzata Vault Crafted è il regalo perfetto per compleanni, lauree, anniversari, Natale e molto altro. Stampata e numerata, da €20." },
      { name: "keywords", content: "regalo originale, regalo personalizzato, regalo compleanno unico, carta pokemon regalo, regalo laurea originale, regalo anniversario, regalo natale originale, regalo migliore amico" },
      { name: "robots", content: "index, follow" },
      { property: "og:url", content: "https://vaultcrafted.com/regalo" },
      { property: "og:title", content: "Il regalo perfetto — Vault Crafted | Carta personalizzata unica" },
      { property: "og:description", content: "Smetti di regalare cose che finiscono nel cassetto. Una carta Vault ha sopra la sua foto e il suo numero. Il regalo originale che nessuno dimentica." },
      { property: "og:image", content: "https://vaultcrafted.com/og-image.jpg" },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Il regalo perfetto — Vault Crafted" },
      { name: "twitter:description", content: "Smetti di regalare cose che finiscono nel cassetto. Una carta Vault ha sopra la sua foto e il suo numero." },
      { name: "twitter:image", content: "https://vaultcrafted.com/og-image.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: FONTS_HREF },
      { rel: "canonical", href: "https://vaultcrafted.com/regalo" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_PRODUCT_REGALO) },
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_GIFT_OCCASIONS) },
      { type: "application/ld+json", children: JSON.stringify(SCHEMA_BREADCRUMB_REGALO) },
    ],
  }),
});

const OCCASIONI: [string, string][] = [
  ["Compleanno", "Il suo nome, la sua foto, una frase che solo voi capite."],
  ["Anniversario", "La vostra foto preferita, la data e le parole che contano."],
  ["Laurea", "Il titolo come nome della carta e la dedica come frase finale."],
  ["Natale", "Un regalo piccolo da incartare e che non finisce nel cassetto."],
  ["Matrimonio", "Gli sposi su una carta, da esporre accanto alle foto del giorno."],
  ["Animale di casa", "Il cane, il gatto, il coniglio: anche loro hanno le loro mosse."],
  ["Migliore amico", "Soprannomi, mosse speciali e quella foto che ha fatto ridere tutti."],
  ["Famiglia", "Per papà, mamma, nonni, fratelli: una carta per ognuno."],
  ["Per te", "Perché no. Una carta con te sopra, numerata, da tenere."],
];

const IDEE: { t: string; card: string; idea: string; frase: string }[] = [
  {
    t: "Anniversario",
    card: "laura-massei",
    idea: "La vostra foto preferita e due attacchi che solo voi due capite.",
    frase: "«Sopportazione moglie: 3»",
  },
  {
    t: "Compleanno",
    card: "azzurra",
    idea: "Il suo nome in alto, i punti vita pari agli anni che compie.",
    frase: "«Fashion Stella, 150 di stile»",
  },
  {
    t: "Animale di casa",
    card: "lincio",
    idea: "Il cane, il gatto, il coniglio: anche loro hanno le loro mosse.",
    frase: "«Alzata di orecchie»",
  },
  {
    t: "Amici",
    card: "riccardo-salomoni",
    idea: "Una foto insieme e il ricordo di quella volta che ancora vi fa ridere.",
    frase: "«Quando Fummo Andrò»",
  },
  {
    t: "Per lei, per lui",
    card: "poppi",
    idea: "Un difetto adorabile trasformato in un attacco da 150 danni.",
    frase: "«Russare Tonante»",
  },
  {
    t: "Per chi ha stile",
    card: "mattak",
    idea: "La foto più iconica che ha, il suo motto come frase finale.",
    frase: "«Precisione Verbale»",
  },
];
const ALTRE = ["Laurea", "Natale", "San Valentino", "Matrimonio", "Festa del papà", "Festa della mamma", "Addio al celibato", "Pensione", "Per i nonni", "Per la squadra"];

const FAQ_REGALO: [string, string][] = [
  [
    "Posso spedirla direttamente a chi la riceve?",
    "Sì. Nell'ordine metti il suo nome e il suo indirizzo: la carta arriva direttamente a lei o a lui.",
  ],
  [
    "Posso aggiungere una dedica?",
    "Sì, scrivila nelle note dell'ordine e ci mettiamo d'accordo su come inserirla.",
  ],
  [
    "Arriva in tempo per una data precisa?",
    "Di solito servono 3–4 giorni lavorativi per controllo e stampa dopo il pagamento, più 5–7 di corriere. Se hai una scadenza stretta scrivici su WhatsApp prima di ordinare.",
  ],
  [
    "E se la foto non è perfetta?",
    "Serve una foto nitida e con buona luce, almeno 1000×1000 pixel. Prima di stampare la controlliamo: se non va bene ti scriviamo.",
  ],
];

// aggiunge n giorni lavorativi (lun–ven) a una data
function addWorkdays(d: Date, n: number) {
  const r = new Date(d);
  while (n > 0) {
    r.setDate(r.getDate() + 1);
    const g = r.getDay();
    if (g !== 0 && g !== 6) n--;
  }
  return r;
}
const fmt = (d: Date) => d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "long" });

/** Stima della consegna calcolata sul giorno di oggi (solo nel browser). */
function Consegna() {
  const [txt, setTxt] = useState<[string, string] | null>(null);
  useEffect(() => {
    const now = new Date();
    setTxt([fmt(addWorkdays(now, 8)), fmt(addWorkdays(now, 12))]);
  }, []);
  return (
    <div className="rg-eta">
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="7" cy="17.5" r="1.8" fill="currentColor" />
        <circle cx="17" cy="17.5" r="1.8" fill="currentColor" />
      </svg>
      <span>
        Se ordini e paghi oggi arriva indicativamente
        <b>{txt ? ` tra ${txt[0]} e ${txt[1]}` : " in 8–12 giorni lavorativi"}</b>
      </span>
    </div>
  );
}

function RegaloPage() {
  const [zoom, setZoom] = useState<string | null>(null);
  const caseFrom = Math.min(...CUSTODIE.filter((c) => c.price > 0).map((c) => c.price));
  const eur = (n: number) => `€${n.toFixed(2).replace(".", ",")}`;
  return (
    <SiteShell>
      <style>{RG_CSS}</style>
      <header className="rg-hero">
        <div className="rg-hero-txt">
          <span className="rg-kicker up" style={{ ["--d" as string]: "0s" }}>
            Regalo personalizzato
          </span>
          <h1 className="up" style={{ ["--d" as string]: ".08s" }}>
            Un regalo con la sua storia sopra.
          </h1>
          <p className="up" style={{ ["--d" as string]: ".2s" }}>
            Una carta da collezione con la sua foto, il suo nome e le vostre frasi. La componi in
            pochi minuti, noi la stampiamo numerata e la spediamo dove vuoi. Da €20.
          </p>
          <div className="hm-cta up" style={{ ["--d" as string]: ".32s" }}>
            <Link to="/crea" className="hm-btn hm-btn-shine">
              Crea la carta regalo
            </Link>
            <a href="#idee" className="hm-link">
              Trova un'idea
            </a>
          </div>
          <div className="up" style={{ ["--d" as string]: ".44s" }}>
            <Consegna />
          </div>
        </div>
        <div className="rg-stage" aria-hidden>
          <div className="rg-c rg-c1">
            <HoloCard src="/carte/lincio.webp" alt="" foil={0.5} />
          </div>
          <div className="rg-c rg-c2">
            <HoloCard src="/carte/laura-massei.webp" alt="" foil={0.7} />
          </div>
          <span className="rg-tag">
            per te <i>♥</i>
          </span>
        </div>
      </header>

      <section className="hm-sec" id="idee">
        <div className="rg-head rv">
          <h2>Un'idea per ogni occasione</h2>
          <p>Carte vere che abbiamo stampato. Tocca una carta per vederla da vicino.</p>
        </div>
        <div className="rg-ideas">
          {IDEE.map((x, i) => (
            <article className="rg-idea rv" key={x.t} style={{ ["--d" as string]: `${(i % 3) * 0.1}s` }}>
              <button type="button" onClick={() => setZoom(`/carte/${x.card}.webp`)} aria-label={`Ingrandisci la carta di esempio: ${x.t}`}>
                <img src={`/carte/${x.card}.webp`} alt="" loading="lazy" />
              </button>
              <div>
                <h3>{x.t}</h3>
                <p>{x.idea}</p>
                <span className="rg-frase">{x.frase}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="rg-chips rv">
          <span>Anche per:</span>
          {ALTRE.map((a) => (
            <em key={a}>{a}</em>
          ))}
        </div>
      </section>

      <section className="hm-sec">
        <h2 className="rv">Pensata per chi regala</h2>
        <div className="rg-perks">
          <div className="rv">
            <svg viewBox="0 0 24 24" aria-hidden><path d="M12 21s-7-5.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 11-7 11z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            <h3>Spedita a chi la riceve</h3>
            <p>Metti il suo indirizzo e la carta arriva direttamente a lei o a lui, in tutta Italia a {eur(SPEDIZIONE)}.</p>
          </div>
          <div className="rv" style={{ ["--d" as string]: ".1s" }}>
            <svg viewBox="0 0 24 24" aria-hidden><path d="M4 5h16v11H8l-4 4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            <h3>Con una dedica</h3>
            <p>Scrivila nelle note dell'ordine e ci accordiamo su come inserirla.</p>
          </div>
          <div className="rv" style={{ ["--d" as string]: ".2s" }}>
            <svg viewBox="0 0 24 24" aria-hidden><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><rect x="8" y="6" width="8" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
            <h3>In custodia rigida</h3>
            <p>Protetta e pronta da esporre su una mensola. Custodie da {eur(caseFrom)}.</p>
          </div>
          <div className="rv" style={{ ["--d" as string]: ".3s" }}>
            <svg viewBox="0 0 24 24" aria-hidden><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
            <h3>La vedi prima</h3>
            <p>Mentre la componi vedi la carta finita: sai già cosa riceverà.</p>
          </div>
        </div>
      </section>

      <section className="hm-sec">
        <h2 className="rv">Come si fa</h2>
        <ol className="rg-steps">
          <li className="rv">
            <b>1</b>
            <h3>Componi la carta</h3>
            <p>Nel configuratore scegli categoria, frasi e attacchi e carichi la sua foto.</p>
          </li>
          <li className="rv" style={{ ["--d" as string]: ".12s" }}>
            <b>2</b>
            <h3>Paghi e la stampiamo</h3>
            <p>La controlliamo, ti mandiamo il riepilogo per pagare e la stampiamo numerata.</p>
          </li>
          <li className="rv" style={{ ["--d" as string]: ".24s" }}>
            <b>3</b>
            <h3>Arriva a destinazione</h3>
            <p>Spedizione tracciata all'indirizzo che hai scelto, tuo o di chi la riceve.</p>
          </li>
        </ol>
      </section>

      <section className="hm-sec hm-faq">
        <h2 className="rv">Domande sul regalo</h2>
        {FAQ_REGALO.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <section className="hm-final rv">
        <h2>Hai già in mente a chi regalarla?</h2>
        <Link to="/crea" className="hm-btn hm-btn-shine">
          Crea la carta regalo
        </Link>
      </section>
      <CardZoom src={zoom} onClose={() => setZoom(null)} />
    </SiteShell>
  );
}

const RG_CSS = `
.rg-hero{max-width:1240px;margin:0 auto;padding:40px 28px 0;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:40px;align-items:center;min-height:min(760px,calc(100svh - 64px))}
.rg-hero .up{animation:hmrise .9s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d)}
.rg-kicker{display:inline-block;font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--red);margin-bottom:14px}
.rg-hero h1{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(50px,6.4vw,96px);line-height:.9;margin:0 0 20px;max-width:12ch}
.rg-hero p{font-size:clamp(17px,1.4vw,20px);color:var(--muted);max-width:46ch;margin:0 0 28px}
.rg-eta{display:inline-flex;align-items:center;gap:12px;margin-top:30px;padding:12px 16px;border-radius:14px;background:var(--panel);border:1px solid var(--line);font-size:15px;color:var(--muted);max-width:460px}
.rg-eta svg{width:26px;height:26px;flex:none;color:var(--ink)}
.rg-eta b{color:var(--ink)}
.rg-stage{position:relative;height:min(620px,72svh);animation:hmfade 1.2s .2s both}
.rg-c{position:absolute;width:min(56%,320px)}
.rg-c1{left:6%;top:4%;transform:rotate(-9deg);animation:rgfloat 7s ease-in-out infinite}
.rg-c2{right:6%;bottom:2%;transform:rotate(6deg);animation:rgfloat2 8s ease-in-out infinite;z-index:2}
.rg-c .hx-holo-in{box-shadow:0 40px 70px -30px rgba(20,26,58,.6)}
@keyframes rgfloat{50%{transform:rotate(-7deg) translateY(-14px)}}
@keyframes rgfloat2{50%{transform:rotate(4deg) translateY(-18px)}}
.rg-tag{position:absolute;z-index:3;right:2%;top:16%;padding:10px 18px 10px 26px;background:#fff;border-radius:6px 14px 14px 6px;transform:rotate(8deg);
  font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:26px;box-shadow:0 18px 30px -16px rgba(20,26,58,.5);animation:rgfloat2 6s ease-in-out infinite}
.rg-tag::before{content:"";position:absolute;left:9px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:var(--bg);box-shadow:inset 0 1px 2px rgba(0,0,0,.3)}
.rg-tag i{font-style:normal;color:var(--red)}
.rg-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 30px;margin-bottom:28px}
.rg-head h2{margin:0}
.rg-head p{margin:0;color:var(--muted)}
.rg-ideas{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.rg-idea{display:grid;grid-template-columns:120px minmax(0,1fr);gap:18px;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:14px 18px 14px 14px;
  transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s,border-color .35s}
.rg-idea:hover{transform:translateY(-4px);box-shadow:0 24px 40px -26px rgba(20,26,58,.5);border-color:#C3C7D3}
.rg-idea button{padding:0;border:0;background:none;cursor:zoom-in;border-radius:4.5% / 3.2%;overflow:hidden;transform:rotate(-3deg);transition:transform .4s cubic-bezier(.2,.8,.2,1);box-shadow:0 12px 22px -12px rgba(20,26,58,.6)}
.rg-idea:hover button{transform:rotate(0) scale(1.06)}
.rg-idea img{display:block;width:100%;height:auto}
.rg-idea h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:27px;margin:0 0 4px}
.rg-idea p{margin:0 0 10px;color:var(--muted);font-size:15px}
.rg-frase{display:inline-block;font-size:13px;font-weight:700;color:var(--ink);background:var(--bg);border-radius:8px;padding:5px 9px}
.rg-chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:22px}
.rg-chips span{color:var(--muted);font-size:15px;margin-right:4px}
.rg-chips em{font-style:normal;font-size:14px;font-weight:600;padding:7px 13px;border-radius:999px;border:1px solid var(--line);background:#fff}
.rg-perks{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px}
.rg-perks>div{padding:22px 0 0;border-top:2px solid var(--ink)}
.rg-perks svg{width:30px;height:30px;color:var(--ink)}
.rg-perks h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:26px;margin:10px 0 6px}
.rg-perks p{margin:0;color:var(--muted);font-size:15px}
.rg-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;position:relative}
.rg-steps li{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:22px 24px}
.rg-steps b{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--ink);color:#fff;font-family:'Saira Condensed',sans-serif;font-size:24px;margin-bottom:14px}
.rg-steps h3{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:28px;margin:0 0 6px}
.rg-steps p{margin:0;color:var(--muted)}
@media (max-width:1100px){.rg-ideas{grid-template-columns:repeat(2,minmax(0,1fr))}.rg-perks{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){
  .rg-hero{grid-template-columns:1fr;padding:34px 18px 0;min-height:0;gap:10px}
  .rg-stage{height:400px;max-width:420px;width:100%;margin:0 auto}
  .rg-ideas,.rg-steps{grid-template-columns:1fr}
  .rg-idea{grid-template-columns:96px minmax(0,1fr)}
  .rg-perks{grid-template-columns:1fr 1fr;gap:26px 18px}
  .rg-eta{font-size:14px}
}
`;
