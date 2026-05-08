import { Github, ShieldCheck, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { SentinelToggle } from "@/components/plugin/SentinelToggle";
import { VerdictRail } from "@/components/plugin/VerdictRail";
import { AuditDrawer } from "@/components/plugin/AuditDrawer";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";
import { useSentinel } from "@/state/sentinel";
import { VERTICAL_META, VERTICAL_ORDER } from "@/lib/verticals";
import { RadiologyHost } from "./hosts/RadiologyHost";
import { ContractHost } from "./hosts/ContractHost";
import { FraudHost } from "./hosts/FraudHost";
import { cn } from "@/lib/cn";
import type { Vertical } from "@/types";

const HOST_BY_SCENARIO: Record<Vertical, () => React.ReactElement> = {
  clinical: () => <RadiologyHost />,
  legal: () => <ContractHost />,
  finance: () => <FraudHost />,
};

export function DemoFrame() {
  const { scenario, setScenario, enabled } = useSentinel();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const ActiveHost = HOST_BY_SCENARIO[scenario];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-canvas text-fg flex flex-col">
        {/* Demo top bar — outside the host chrome, identifies this as the Sentinel demo */}
        <header className="border-b border-border bg-canvas/95 backdrop-blur sticky top-0 z-20">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info/15 ring-1 ring-info/40">
                <ShieldCheck className="h-4 w-4 text-info" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-fg">Sentinel</div>
                <div className="text-[10px] uppercase tracking-wider text-fg-subtle">
                  AI oversight plugin · interactive demo
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SentinelToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <a
                href="https://github.com/sinhaankur/Human-in-the-Loop"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-1 px-2.5 py-2 text-[11px] text-fg-muted hover:bg-surface-2"
              >
                <Github className="h-3.5 w-3.5" />
                Source
              </a>
            </div>
          </div>
        </header>

        {/* Hero strip */}
        <section className="border-b border-border bg-canvas">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-info/40 bg-info/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-info mb-3">
                  Inline AI oversight
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold text-fg leading-tight">
                  Sentinel turns any AI tool's output into something a human expert can{" "}
                  <span className="text-info">validate, correct, and audit</span>{" "}
                  — without leaving the host product.
                </h1>
                <p className="mt-3 text-sm text-fg-muted leading-relaxed max-w-2xl">
                  Below is a simulated host AI tool. Toggle Sentinel above to see the same AI
                  output rendered with calibrated confidence, evidence anchors, hallucination
                  flags, and an in-place verdict workflow. Switch host scenarios to see the
                  plugin operate identically across radiology, legal, and finance.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">
                  Try it across hosts
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {VERTICAL_ORDER.map((v: Vertical) => {
                    const meta = VERTICAL_META[v];
                    const Icon = meta.Icon;
                    const active = v === scenario;
                    return (
                      <button
                        key={v}
                        onClick={() => setScenario(v)}
                        className={cn(
                          "rounded-md border p-3 text-left transition-colors",
                          active
                            ? cn("border-transparent ring-2", meta.accentRing, meta.accentSoft)
                            : "border-border bg-surface-1 hover:bg-surface-2"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 mb-2", meta.accentText)} />
                        <div className="text-xs font-semibold text-fg">{meta.name}</div>
                        <div className="mt-0.5 text-[10px] text-fg-muted leading-tight">
                          {meta.tagline}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div
                  className={cn(
                    "text-[11px] leading-relaxed transition-colors",
                    enabled ? "text-info" : "text-confidence-low"
                  )}
                >
                  {enabled
                    ? "Sentinel is on — every AI claim is wrapped with confidence, evidence, and a verdict bar. Try editing or rejecting one."
                    : "Sentinel is off — this is what host AI tools ship today: claims as plain text, no provenance, no intervention path."}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The host tool — wrapped in its own chrome to read as 'someone else's product' */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 py-8 space-y-3">
            <ActiveHost />
          </div>
        </main>

        <VerdictRail />
        <AuditDrawer />

        {/* Footer */}
        <footer className="border-t border-border px-6 py-4 text-center text-[11px] text-fg-subtle">
          Demo data is fictional. Visual prototype for a UX portfolio — no model is actually called.
        </footer>
      </div>
    </TooltipProvider>
  );
}
