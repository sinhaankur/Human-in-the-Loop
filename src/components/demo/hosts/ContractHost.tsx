import { Scale, FileText, Download } from "lucide-react";
import { HostChrome } from "../HostChrome";
import { SentinelClaim } from "@/components/plugin/SentinelClaim";
import { useScenarioItem } from "@/state/sentinel";

/** ClauseLens — a fictional contract review AI. */
export function ContractHost() {
  const item = useScenarioItem();
  if (!item) return null;

  return (
    <HostChrome
      brand="ClauseLens"
      BrandIcon={Scale}
      brandAccent="text-legal"
      subjectLabel={item.subjectLabel}
      contextLine={`Master Services Agreement · ${item.modelName} ${item.modelVersion}`}
      reviewerName="Marcus Vance, Esq."
      rightRail={<DocumentPreview />}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <FileText className="h-3.5 w-3.5 text-fg-subtle" />
            <span className="text-fg-muted font-medium">Extracted clauses</span>
            <span className="text-fg-subtle">· {item.claims.length} clauses identified</span>
          </div>
          <button className="inline-flex items-center gap-1 text-[11px] text-fg-muted hover:text-fg">
            <Download className="h-3 w-3" />
            Export to CLM
          </button>
        </div>

        <div className="space-y-3">
          {item.claims.map((claim, i) => (
            <SentinelClaim
              key={claim.id}
              claim={claim}
              bareLabel={`Clause ${i + 1} · ${claim.category}`}
            />
          ))}
        </div>

        <div className="pt-2 border-t border-border text-[11px] text-fg-subtle">
          ClauseLens auto-saved · 14 redlines suggested · 0 unresolved counterparty comments.
        </div>
      </div>
    </HostChrome>
  );
}

function DocumentPreview() {
  const lines = [
    { type: "h", text: "MASTER SERVICES AGREEMENT" },
    { type: "p", text: "This Master Services Agreement (\"Agreement\") is made..." },
    { type: "h2", text: "11. LIMITATION OF LIABILITY" },
    {
      type: "p",
      text: "11.2  Each party's aggregate liability shall not exceed the fees paid by Customer in the twelve (12) months preceding the claim.",
      highlight: true,
    },
    { type: "h2", text: "16. TERMINATION" },
    {
      type: "p",
      text: "16.1  Either party may terminate this Agreement for convenience upon ninety (90) days' prior written notice.",
      highlight: true,
    },
  ];
  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle">Document preview</div>
      <div className="rounded-md border border-border bg-surface-1 p-3 max-h-[420px] overflow-y-auto font-mono text-[10px] leading-relaxed">
        {lines.map((l, i) => (
          <p
            key={i}
            className={
              l.type === "h"
                ? "text-center font-bold text-fg pb-2"
                : l.type === "h2"
                  ? "mt-3 font-semibold text-fg"
                  : l.highlight
                    ? "my-1 rounded bg-legal-soft/40 px-1 py-0.5 text-fg"
                    : "text-fg-muted"
            }
          >
            {l.text}
          </p>
        ))}
      </div>
      <div className="rounded-md border border-border bg-surface-2 p-2.5 text-[10px] text-fg-muted">
        <div className="font-medium text-fg mb-1">Counterparty</div>
        Northwind Ltd. · UK Limited Company<br />
        Last redline: 2025-12-19
      </div>
    </div>
  );
}
