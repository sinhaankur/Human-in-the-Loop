import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuditRecord, DecisionAction, Vertical } from "@/types";
import { REVIEW_ITEMS } from "@/data/mockData";
import { VERTICAL_META } from "@/lib/verticals";

export type ClaimVerdict = "pending" | "accepted" | "edited" | "rejected";

export interface ClaimDecision {
  verdict: ClaimVerdict;
  edited?: string;
}

interface SentinelState {
  /** Whether the inline oversight overlay is rendered around host AI output */
  enabled: boolean;
  toggle: () => void;
  /** Which host AI tool we're demonstrating against */
  scenario: Vertical;
  setScenario: (s: Vertical) => void;
  /** Per-claim verdicts for the current scenario */
  decisions: Record<string, ClaimDecision>;
  setDecision: (claimId: string, d: ClaimDecision) => void;
  resetDecisions: () => void;
  /** Audit entries — every reviewer decision lands here */
  audit: AuditRecord[];
  recordAudit: (action: DecisionAction, rationale?: string) => void;
  /** Audit drawer open state */
  drawerOpen: boolean;
  setDrawerOpen: (b: boolean) => void;
}

const SentinelCtx = createContext<SentinelState | null>(null);

export function SentinelProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [scenario, setScenarioRaw] = useState<Vertical>("clinical");
  const [decisions, setDecisions] = useState<Record<string, ClaimDecision>>({});
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const setScenario = useCallback((s: Vertical) => {
    setScenarioRaw(s);
    setDecisions({});
  }, []);

  const setDecision = useCallback((claimId: string, d: ClaimDecision) => {
    setDecisions((prev) => ({ ...prev, [claimId]: d }));
  }, []);

  const resetDecisions = useCallback(() => setDecisions({}), []);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  const recordAudit = useCallback(
    (action: DecisionAction, rationale?: string) => {
      const item = REVIEW_ITEMS.find((it) => it.vertical === scenario);
      if (!item) return;
      const meta = VERTICAL_META[scenario];
      const changedClaimIds = Object.entries(decisions)
        .filter(([, v]) => v.verdict === "edited" || v.verdict === "rejected")
        .map(([id]) => id);
      const record: AuditRecord = {
        id: `dec-${Date.now()}`,
        itemId: item.id,
        itemTitle: item.title,
        vertical: scenario,
        action,
        reviewer: meta.reviewer,
        rationale,
        changedClaimIds: changedClaimIds.length > 0 ? changedClaimIds : undefined,
        timestamp: new Date().toISOString(),
      };
      setAudit((prev) => [record, ...prev]);
      setDecisions({});
    },
    [scenario, decisions]
  );

  const value = useMemo<SentinelState>(
    () => ({
      enabled,
      toggle,
      scenario,
      setScenario,
      decisions,
      setDecision,
      resetDecisions,
      audit,
      recordAudit,
      drawerOpen,
      setDrawerOpen,
    }),
    [
      enabled,
      toggle,
      scenario,
      setScenario,
      decisions,
      setDecision,
      resetDecisions,
      audit,
      recordAudit,
      drawerOpen,
    ]
  );

  return <SentinelCtx.Provider value={value}>{children}</SentinelCtx.Provider>;
}

export function useSentinel() {
  const ctx = useContext(SentinelCtx);
  if (!ctx) throw new Error("useSentinel must be used within SentinelProvider");
  return ctx;
}

/** Convenience: the active scenario's primary review item from mock data */
export function useScenarioItem() {
  const { scenario } = useSentinel();
  return REVIEW_ITEMS.find((it) => it.vertical === scenario)!;
}
