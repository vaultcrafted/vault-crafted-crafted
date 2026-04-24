import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/vault/Hero";
import { ValueProps } from "@/components/vault/ValueProps";
import { HowItWorks } from "@/components/vault/HowItWorks";
import { VideoSection } from "@/components/vault/VideoSection";
import { Gallery } from "@/components/vault/Gallery";
import { CardsCarousel } from "@/components/vault/CardsCarousel";
import { Faq } from "@/components/vault/Faq";
import { Newsletter } from "@/components/vault/Newsletter";
import { FinalCta } from "@/components/vault/FinalCta";
import { Footer } from "@/components/vault/Footer";
import { WhatsappButton } from "@/components/vault/WhatsappButton";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
  { title: "Vault Crafted — Carte da Collezione Personalizzate | Pezzi Unici" },
  {
    name: "description",
    content:
      "Crea la tua carta da collezione personalizzata con Vault Crafted. Design unico, zero template, packaging premium. Ideale come regalo originale per compleanni, lauree e anniversari. Ordina ora.",
  },
  { name: "keywords", content: "carte personalizzate, carte da collezione personalizzate, carta pokemon personalizzata, regalo originale, pezzo unico, vault crafted" },
  { name: "author", content: "Vault Crafted" },
  { name: "robots", content: "index, follow" },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://vaultcrafted.com" },
  { property: "og:title", content: "Vault Crafted — Carte da Collezione Personalizzate" },
  { property: "og:description", content: "Crea la tua carta da collezione personalizzata. Design unico, zero template, packaging premium. Il regalo originale che nessuno dimentica." },
  { property: "og:image", content: "https://vaultcrafted.com/og-image.jpg" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Vault Crafted — Carte da Collezione Personalizzate" },
  { name: "twitter:description", content: "Crea la tua carta da collezione personalizzata. Design unico, zero template, packaging premium." },
      { name: "google-site-verification", content: "5VVqv2Exmkc5JKarfDezAdgDTeJYbm_nPoCsGzfOYTo" },
],
  }),
});

function Index() {
  return (
    <main className="bg-background text-foreground">
      <Hero />
      <CardsCarousel />
      <ValueProps />
      <HowItWorks />
      <VideoSection />
      <Gallery />
      <Faq />
      <Newsletter />
      <FinalCta />
      <Footer />
      <WhatsappButton />
    </main>
  );
}
