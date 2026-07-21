import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Sparkles } from "lucide-react";

import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearSession, useSession } from "@/lib/auth";
import { toast } from "sonner";

export function AppHeader() {
  const session = useSession();
  const navigate = useNavigate();
  const initials = session?.userName
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <BrandLogo className="h-10 w-10 rounded-2xl bg-white p-1 shadow-[var(--shadow-elegant)] transition-transform group-hover:scale-105" />
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-tight text-foreground">
              ResolveR
            </div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Complaint portal
            </div>
          </div>
        </Link>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 rounded-full border border-border/60 bg-card/80 px-3 hover:bg-card"
              >
                <Avatar className="h-8 w-8 border border-border/60">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight sm:block">
                  <div className="text-sm font-medium">{session.userName}</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {session.userRole}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm">{session.userName}</div>
                <div className="text-xs text-muted-foreground">{session.userEmail}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  clearSession();
                  toast.success("Signed out");
                  navigate({ to: "/" });
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" asChild className="rounded-full">
              <Link to="/">Sign in</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-[image:var(--gradient-hero)] text-white hover:opacity-95"
            >
              <Link to="/register">Create account</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
