import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ActivityEvent,
  AuditRecord,
  DecisionAction,
  ReviewItem,
} from "@/types";
import {
  ACTIVITY_SEED,
  ACTIVITY_TEMPLATES,
  REVIEW_ITEMS,
  SEED_AUDIT,
} from "@/data/mockData";

interface SubmitDecisionArgs {
  itemId: string;
  action: DecisionAction;
  reviewer: string;
  rationale?: string;
  changedClaimIds?: string[];
}

interface ReviewStoreState {
  items: ReviewItem[];
  audit: AuditRecord[];
  activity: ActivityEvent[];
  itemById: (id: string) => ReviewItem | undefined;
  submitDecision: (args: SubmitDecisionArgs) => void;
  pauseFeed: boolean;
  setPauseFeed: (p: boolean) => void;
}

const ReviewStoreCtx = createContext<ReviewStoreState | null>(null);

const ACTION_TO_STATUS: Record<
  DecisionAction,
  ReviewItem["status"]
> = {
  accept: "accepted",
  correct: "corrected",
  escalate: "escalated",
  reject: "corrected",
};

export function ReviewStoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ReviewItem[]>(REVIEW_ITEMS);
  const [audit, setAudit] = useState<AuditRecord[]>(SEED_AUDIT);
  const [activity, setActivity] = useState<ActivityEvent[]>(ACTIVITY_SEED);
  const [pauseFeed, setPauseFeed] = useState(false);
  const tickRef = useRef(0);

  // Live activity feed — emits a new event on a slow cadence to make the
  // dashboard feel "alive" without being noisy. Pauses on demand.
  useEffect(() => {
    if (pauseFeed) return;
    const id = window.setInterval(() => {
      const tpl =
        ACTIVITY_TEMPLATES[tickRef.current % ACTIVITY_TEMPLATES.length];
      tickRef.current += 1;
      const ev: ActivityEvent = {
        ...tpl,
        id: `live-${Date.now()}-${tickRef.current}`,
        timestamp: new Date().toISOString(),
      };
      setActivity((prev) => [ev, ...prev].slice(0, 30));
    }, 6500);
    return () => window.clearInterval(id);
  }, [pauseFeed]);

  const itemById = useCallback(
    (id: string) => items.find((it) => it.id === id),
    [items]
  );

  const submitDecision = useCallback((args: SubmitDecisionArgs) => {
    const { itemId, action, reviewer, rationale, changedClaimIds } = args;
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, status: ACTION_TO_STATUS[action], assignee: reviewer }
          : it
      )
    );
    const item = REVIEW_ITEMS.find((it) => it.id === itemId);
    const record: AuditRecord = {
      id: `a-live-${Date.now()}`,
      itemId,
      itemTitle: item?.title ?? itemId,
      vertical: item?.vertical ?? "clinical",
      action,
      reviewer,
      rationale,
      changedClaimIds,
      timestamp: new Date().toISOString(),
    };
    setAudit((prev) => [record, ...prev]);
    setActivity((prev) => [
      {
        id: `feed-${record.id}`,
        vertical: record.vertical,
        kind: action === "escalate" ? "escalated" : "resolved",
        summary: `${reviewer} ${action}ed ${item?.title ?? itemId}`,
        timestamp: record.timestamp,
      },
      ...prev,
    ]);
  }, []);

  const value = useMemo<ReviewStoreState>(
    () => ({
      items,
      audit,
      activity,
      itemById,
      submitDecision,
      pauseFeed,
      setPauseFeed,
    }),
    [items, audit, activity, itemById, submitDecision, pauseFeed]
  );

  return (
    <ReviewStoreCtx.Provider value={value}>{children}</ReviewStoreCtx.Provider>
  );
}

export function useReviewStore() {
  const ctx = useContext(ReviewStoreCtx);
  if (!ctx) throw new Error("useReviewStore must be used within ReviewStoreProvider");
  return ctx;
}
