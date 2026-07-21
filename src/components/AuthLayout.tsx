import type { ReactNode } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

export function AuthLayout({
  badge,
  panelTitle,
  panelDescription,
  panelBullets,
  formTitle,
  formDescription,
  formFooter,
  children,
  panelImageClassName,
}: {
  badge: string;
  panelTitle: string;
  panelDescription: string;
  panelBullets: string[];
  formTitle: string;
  formDescription: string;
  formFooter: ReactNode;
  children: ReactNode;
  panelImageClassName?: string;
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_12%,rgba(34,67,148,0.08)_0%,transparent_30%),radial-gradient(circle_at_88%_18%,rgba(245,178,60,0.14)_0%,transparent_24%),linear-gradient(180deg,#f6f8fc_0%,#f4f7fc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_28px_100px_rgba(15,23,42,0.14)] backdrop-blur-sm">
          <div className="grid min-h-[760px] lg:grid-cols-[1.02fr_0.98fr]">
            <section
              className={cn(
                "relative overflow-hidden bg-[linear-gradient(180deg,#1e336f_0%,#13264f_55%,#0a1021_100%)] p-6 text-white sm:p-8 lg:p-10",
                panelImageClassName,
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(245,178,60,0.25),transparent_20%),radial-gradient(circle_at_50%_88%,rgba(0,0,0,0.35),transparent_28%)]" />
              <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-between rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 sm:p-7 lg:min-h-full">
                <div className="flex items-center gap-3">
                  <BrandLogo
                    className="h-11 w-11 rounded-2xl bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm"
                    imgClassName="h-full w-full object-contain"
                  />
                  <div>
                    <div className="font-display text-xl font-semibold tracking-tight">
                      ResolveR
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.32em] text-white/60">
                      Complaint portal
                    </div>
                  </div>
                </div>

                <div className="space-y-5 py-8 lg:py-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                    {badge}
                  </div>
                  <div className="space-y-3">
                    <h1 className="max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem]">
                      {panelTitle}
                    </h1>
                    <p className="max-w-md text-sm leading-7 text-white/76 sm:text-base">
                      {panelDescription}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 pt-8 text-sm text-white/88">
                  {panelBullets.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
              <div className="w-full max-w-lg">
                <div className="mb-8 text-center">
                  <BrandLogo
                    className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                    imgClassName="h-full w-full object-contain"
                  />
                  <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-[2.4rem]">
                    {formTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                    {formDescription}
                  </p>
                </div>

                {children}

                <div className="mt-8 rounded-2xl border border-border/70 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  {formFooter}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
