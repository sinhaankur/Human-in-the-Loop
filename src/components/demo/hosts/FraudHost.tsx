import { LineChart, FileText, ArrowDownToLine } from "lucide-react";
import { HostChrome } from "../HostChrome";
import { SentinelClaim } from "@/components/plugin/SentinelClaim";
import { useScenarioItem } from "@/state/sentinel";

/** Watchtower-AML — a fictional BSA/AML compliance AI. */
export function FraudHost() {
  const item = useScenarioItem();
  if (!item) return null;

  return (
    <HostChrome
      brand="Watchtower-AML"
      BrandIcon={LineChart}
      brandAccent="text-finance"
      subjectLabel={item.subjectLabel}
      contextLine={`SAR draft · ${item.modelName} ${item.modelVersion}`}
      reviewerName="Elena Marquez, BSA Officer"
      rightRail={<TransactionList />}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <FileText className="h-3.5 w-3.5 text-fg-subtle" />
            <span className="text-fg-muted font-medium">SAR draft sections</span>
            <span className="text-fg-subtle">· auto-drafted from txn ledger + KYC profile</span>
          </div>
          <button className="inline-flex items-center gap-1 text-[11px] text-fg-muted hover:text-fg">
            <ArrowDownToLine className="h-3 w-3" />
            Export FinCEN PDF
          </button>
        </div>

        <div className="space-y-3">
          {item.claims.map((claim) => (
            <SentinelClaim
              key={claim.id}
              claim={claim}
              bareLabel={claim.category}
            />
          ))}
        </div>

        <div className="pt-2 border-t border-border text-[11px] text-fg-subtle">
          Watchtower-AML auto-saved · narrative will populate FinCEN Form 111 fields 32–35.
        </div>
      </div>
    </HostChrome>
  );
}

function TransactionList() {
  const txns = [
    { date: "Apr 14", amount: 9_840, branch: "Walnut St", flag: true },
    { date: "Apr 17", amount: 9_540, branch: "Walnut St", flag: true },
    { date: "Apr 19", amount: 9_950, branch: "Belmont", flag: true },
    { date: "Apr 22", amount: 9_400, branch: "Belmont", flag: true },
    { date: "Apr 24", amount: 9_710, branch: "Cedar Hills", flag: true },
    { date: "Apr 28", amount: 9_805, branch: "Walnut St", flag: true },
    { date: "May 02", amount: 9_450, branch: "Cedar Hills", flag: true },
    { date: "May 05", amount: 9_915, branch: "Pearson Park", flag: true },
    { date: "May 06", amount: 1_240, branch: "Walnut St", flag: false },
    { date: "May 07", amount: 9_510, branch: "Belmont", flag: true },
  ];
  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle">
        Recent cash deposits
      </div>
      <div className="rounded-md border border-border bg-surface-1 max-h-[420px] overflow-y-auto">
        <table className="w-full font-mono text-[10px]">
          <thead className="sticky top-0 bg-surface-2">
            <tr className="text-fg-subtle">
              <th className="px-2.5 py-1.5 text-left font-medium">Date</th>
              <th className="px-2.5 py-1.5 text-right font-medium">Amount</th>
              <th className="px-2.5 py-1.5 text-left font-medium">Branch</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t, i) => (
              <tr
                key={i}
                className={
                  t.flag
                    ? "border-t border-border bg-confidence-low/[0.05]"
                    : "border-t border-border"
                }
              >
                <td className="px-2.5 py-1.5 text-fg-muted">{t.date}</td>
                <td
                  className={`px-2.5 py-1.5 text-right tabular-nums ${
                    t.flag ? "text-confidence-low" : "text-fg-muted"
                  }`}
                >
                  ${t.amount.toLocaleString()}
                </td>
                <td className="px-2.5 py-1.5 text-fg-muted">{t.branch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-md border border-border bg-surface-2 p-2.5 text-[10px] text-fg-muted">
        <div className="font-medium text-fg mb-1">Customer profile</div>
        Customer 88-44021 · SMB DDA opened 2023-11<br />
        Stated business: cash-intensive food service
      </div>
    </div>
  );
}
