// Public API for the Sentinel React plugin.
// Importing this entry pulls in the compiled stylesheet as a side effect;
// consumers can also import "sentinel-react/styles.css" explicitly.
import "./index.css";

export { SentinelProvider, useSentinel, useScenarioItem } from "./state/sentinel";
export type { ClaimVerdict, ClaimDecision } from "./state/sentinel";

export { SentinelClaim } from "./components/plugin/SentinelClaim";
export { SentinelToggle } from "./components/plugin/SentinelToggle";
export { VerdictRail } from "./components/plugin/VerdictRail";
export { AuditDrawer } from "./components/plugin/AuditDrawer";

export { ConfidenceBadge } from "./components/primitives/ConfidenceBadge";
export { ConfidenceDistribution } from "./components/primitives/ConfidenceDistribution";
export { HallucinationChip } from "./components/primitives/HallucinationChip";
export { EvidenceLink, UngroundedTag } from "./components/primitives/EvidenceLink";
export { RiskMeter } from "./components/primitives/RiskMeter";
export { AuditEntry } from "./components/primitives/AuditEntry";

export type {
  Vertical,
  ConfidenceBand,
  RiskBand,
  ReviewStatus,
  FlagKind,
  ConfidenceAlternative,
  EvidenceSpan,
  AIClaim,
  ReviewItem,
  DecisionAction,
  AuditRecord,
  ActivityEvent,
} from "./types";
