import { Mail, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Register", to: "/register" },
  { label: "Student Home", to: "/student" },
  { label: "My Complaints", to: "/student", hash: "complaints" },
];

export function AppFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
        <div className="space-y-3">
          <div className="font-display text-2xl font-semibold tracking-tight text-foreground">
            ResolveR
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            Smart Complaint Management for Modern Campuses. Empowering institutions with
            transparency, efficiency, and accountability through digital complaint resolution.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Quick Links
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                hash={link.hash}
                className="block text-foreground/80 transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Contact</div>
            <div className="mt-4 space-y-2 text-sm text-foreground/80">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@resolver.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Salem, Tamil Nadu, India</span>
              </div>
            </div>
          </div>

          <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            © {new Date().getFullYear()} ResolveR. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
