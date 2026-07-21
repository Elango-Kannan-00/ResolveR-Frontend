import type { LucideIcon } from "lucide-react";
import { ChevronRight, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/auth";
import { clearSession } from "@/lib/auth";
import { toast } from "sonner";

export interface DashboardSidebarItem {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export function DashboardSidebar({
  session,
  title,
  description,
  items,
  activeHref,
  onSelect,
}: {
  session: Session;
  title: string;
  description: string;
  items: DashboardSidebarItem[];
  activeHref: string;
  onSelect: (href: string) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href: string) => {
    const current = location.pathname + location.hash;
    if (href.startsWith("#")) return activeHref === href || location.hash === href;
    return current === href || location.pathname === href;
  };

  return (
    <aside className="lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:h-screen lg:w-[232px]">
      <div className="flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground shadow-[0_18px_50px_rgba(10,20,55,0.25)] lg:border-r lg:border-white/10">
        <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-4">
          <BrandLogo
            className="h-10 w-10 rounded-full bg-white p-1 shadow-sm"
            imgClassName="h-full w-full object-contain"
          />
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold tracking-tight text-white">
              ResolveR
            </div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/55">
              Complaint portal
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 px-3 py-4">
          <nav className="space-y-2">
            {items.map(({ icon: Icon, label, href }) => {
              const active = isActive(href);
              return (
                <Button
                  key={href}
                  variant="ghost"
                  className={cn(
                    "sidebar-pill h-auto w-full justify-start gap-2.5 rounded-xl px-2.5 py-2 text-left hover:!text-accent",
                    active
                      ? "sidebar-pill-active text-white hover:bg-white/8"
                      : "text-white/90 hover:bg-white/10",
                  )}
                  onClick={() => {
                    if (href.startsWith("#")) {
                      onSelect(href);
                      return;
                    }
                    navigate({ to: href });
                  }}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                      active ? "bg-white/12" : "bg-white/8",
                    )}
                  >
                    <Icon className="h-4 w-4 text-current" />
                  </span>
                  <span className="min-w-0 flex-1 text-left text-xs font-medium">{label}</span>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform",
                      active && "translate-x-0.5",
                    )}
                  />
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-3">
          <div className="border-b border-white/10 px-3 pb-3">
            <div className="text-xs uppercase tracking-[0.22em] text-white/55 transition-colors hover:text-accent">
              {session.userName}
            </div>
          </div>
          <Button
            variant="ghost"
            className="group sidebar-pill h-auto w-full justify-start gap-2.5 rounded-xl px-2.5 py-2 text-white/95 hover:bg-white/10"
            onClick={() => {
              clearSession();
              toast.success("Signed out");
              navigate({ to: "/" });
            }}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/8">
              <LogOut className="h-4 w-4 transition-colors group-hover:text-destructive" />
            </span>
            <span className="text-xs font-medium transition-colors group-hover:text-accent">
              Logout
            </span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
