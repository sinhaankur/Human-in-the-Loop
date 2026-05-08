export type Vertical = "clinical" | "legal" | "finance";

export type ConfidenceBand = "high" | "likely" | "unsure" | "low";
export type RiskBand = "critical" | "high" | "medium" | "low";
export type ReviewStatus = "pending" | "in_review" | "accepted" | "corrected" | "escalated";
export type FlagKind = "hallucination" | "low_confidence" | "out_of_distribution" | "policy" | "pii";

export interface ConfidenceAlternative {
  label: string;
  probability: number; // 0..1
}

export interface EvidenceSpan {
  id: string;
  source: string; // e.g. "DICOM IM-0042" or "Master Services Agreement §4.2"
  excerpt: string;
  page?: number;
  locator?: string;
  reliability: ConfidenceBand;
}

export interface AIClaim {
  id: string;
  /** The natural-language claim the model produced */
  text: string;
  confidence: number; // 0..1
  band: ConfidenceBand;
  /** Top-k alternatives the model considered */
  alternatives: ConfidenceAlternative[];
  /** Source spans the claim is anchored to. Empty == ungrounded == hallucination risk */
  evidence: EvidenceSpan[];
  flags: FlagKind[];
  /** Optional model rationale snippet */
  rationale?: string;
  /** A category for grouping claims in the review UI */
  category: string;
}

export interface ReviewItem {
  id: string;
  vertical: Vertical;
  title: string;
  subtitle: string;
  /** Subject under review — patient ID, contract counterparty, customer ID */
  subjectLabel: string;
  modelName: string;
  modelVersion: string;
  /** Composite risk band: confidence × business impact */
  risk: RiskBand;
  /** Aggregate model confidence across claims */
  aggregateConfidence: number;
  status: ReviewStatus;
  flags: FlagKind[];
  claims: AIClaim[];
  /** ISO timestamp the model produced output */
  ingestedAt: string;
  /** SLA deadline */
  dueAt: string;
  assignee?: string;
}

export type DecisionAction = "accept" | "correct" | "escalate" | "reject";

export interface AuditRecord {
  id: string;
  itemId: string;
  itemTitle: string;
  vertical: Vertical;
  action: DecisionAction;
  reviewer: string;
  rationale?: string;
  /** Specific claims the reviewer changed, if any */
  changedClaimIds?: string[];
  timestamp: string;
}

export interface ActivityEvent {
  id: string;
  vertical: Vertical;
  kind: "ingested" | "flagged" | "escalated" | "resolved";
  summary: string;
  timestamp: string;
}
