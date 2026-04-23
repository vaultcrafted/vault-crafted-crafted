import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/vault/Hero";
import { ValueProps } from "@/components/vault/ValueProps";
import { HowItWorks } from "@/components/vault/HowItWorks";
import { VideoSection } from "@/components/vault/VideoSection";
import { Gallery } from "@/components/vault/Gallery";
import { Faq } from "@/components/vault/Faq";
import { Newsletter } from "@/components/vault/Newsletter";
import { FinalCta } from "@/components/vault/FinalCta";
import { Footer } from "@/components/vault/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Vault Crafted — Carte da collezione personalizzate, uniche" },
      {
        name: "description",
        content:
          "Vault Crafted crea carte da collezione personalizzate e numerate. Zero template, pezzi unici, packaging premium. Crea ora la tua carta.",
      },
      { property: "og:title", content: "Vault Crafted — Pezzi unici, mai template" },
      {
        property: "og:description",
        content: "Carte personalizzate, uniche, create per distinguersi.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="bg-background text-foreground">
      <Hero />
      <ValueProps />
      <HowItWorks />
      <VideoSection />
      <Gallery />
      <Faq />
      <Newsletter />
      <FinalCta />
      <Footer />
    </main>
  );
}
