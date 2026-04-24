import { Facebook, Instagram } from "lucide-react";
import { Link } from "@tanstack/react-router";

const TIKTOK_URL = "https://www.tiktok.com/@vault_crftd";
const socials = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61570154034763",
    Icon: Facebook,
  },
  { name: "Instagram", href: "https://www.instagram.com/vault_crafted", Icon: Instagram },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.43a8.16 8.16 0 0 0 4.77 1.52V6.5a4.85 4.85 0 0 1-1.84-.81z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-10 border-t border-border/60 pt-12 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <div className="font-display text-2xl tracking-[0.3em] text-gold">VAULT</div>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Crafted · Italy
            </p>
          </div>
          <div className="flex items-center gap-3">
            {socials.map(({ name, href, Icon }) => (
              
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all hover:border-gold hover:text-gold hover:shadow-[0_0_20px_-5px_var(--gold)]"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            ))}
            
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all hover:border-gold hover:text-gold hover:shadow-[0_0_20px_-5px_var(--gold)]"
            >
              <TikTokIcon className="h-4 w-4" />
            </a>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              © {new Date().getFullYear()} Vault Crafted
              <br />
              Tutti i diritti riservati
            </p>
            <Link
              to="/termini"
              className="mt-3 block text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold"
            >
              Termini e Condizioni
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
