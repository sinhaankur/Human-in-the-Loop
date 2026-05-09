import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuditRecord, DecisionAction, ReviewItem, Vertical } from "@/types";

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

export interface SentinelProviderProps {
  children: ReactNode;
  /**
   * The review items the host wants Sentinel to oversee. Required for the
   * VerdictRail / AuditDrawer to function — they need an item to count
   * claims against and to attribute audit records to. Pass an empty array
   * (the default) when using SentinelClaim standalone, e.g. in the
   * extension overlay where each claim is independent.
   */
  items?: ReviewItem[];
  /**
   * How to attribute reviewer name on audit records, given the active
   * scenario. Defaults to "Reviewer" — hosts should pass the real signed-in
   * user (or a function looking it up from app session).
   */
  reviewerFor?: (vertical: Vertical) => string;
  /** Which scenario starts active. Defaults to the first item's vertical. */
  initialScenario?: Vertical;
}

export function SentinelProvider({
  children,
  items = [],
  reviewerFor,
  initialScenario,
}: SentinelProviderProps) {
  const [enabled, setEnabled] = useState(true);
  const [scenario, setScenarioRaw] = useState<Vertical>(
    initialScenario ?? items[0]?.vertical ?? "clinical"
  );
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
      const item = items.find((it) => it.vertical === scenario);
      if (!item) return;
      const changedClaimIds = Object.entries(decisions)
        .filter(([, v]) => v.verdict === "edited" || v.verdict === "rejected")
        .map(([id]) => id);
      const record: AuditRecord = {
        id: `dec-${Date.now()}`,
        itemId: item.id,
        itemTitle: item.title,
        vertical: scenario,
        action,
        reviewer: reviewerFor?.(scenario) ?? "Reviewer",
        rationale,
        changedClaimIds: changedClaimIds.length > 0 ? changedClaimIds : undefined,
        timestamp: new Date().toISOString(),
      };
      setAudit((prev) => [record, ...prev]);
      setDecisions({});
    },
    [scenario, decisions, items, reviewerFor]
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

  // Cache the items lookup so useScenarioItem doesn't trigger a context-wide
  // re-render when only the items array reference changes.
  const itemsRef = useMemo(() => items, [items]);
  return (
    <SentinelCtx.Provider value={value}>
      <ItemsCtx.Provider value={itemsRef}>{children}</ItemsCtx.Provider>
    </SentinelCtx.Provider>
  );
}

const ItemsCtx = createContext<ReviewItem[]>([]);

export function useSentinel() {
  const ctx = useContext(SentinelCtx);
  if (!ctx) throw new Error("useSentinel must be used within SentinelProvider");
  return ctx;
}

/**
 * The active scenario's review item, drawn from the items the provider was
 * configured with. Returns undefined when the provider has no items (e.g.
 * standalone SentinelClaim usage), so callers must handle the missing case
 * — VerdictRail and AuditDrawer no-op when there's no item.
 */
export function useScenarioItem(): ReviewItem | undefined {
  const { scenario } = useSentinel();
  const items = useContext(ItemsCtx);
  return items.find((it) => it.vertical === scenario);
}
