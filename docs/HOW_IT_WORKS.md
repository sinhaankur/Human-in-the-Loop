# How Sentinel works

A code-level walkthrough of the human-in-the-loop flow. Pairs with the [live demo](https://sinhaankur.github.io/Human-in-the-Loop/) and the [README](../README.md).

---

## The thesis in one paragraph

Every AI tool today reinvents oversight badly — some show a confidence number, some highlight "low confidence" rows, almost none distinguish hallucination from low confidence or capture the reviewer's correction in a way that closes the loop. Sentinel is one oversight layer that any AI tool can drop in — same primitives, same intervention model, same audit shape — whether the host AI is a radiology workstation, a contract review tool, or a fraud case manager.

---

## The unit: one `AIClaim`

Everything is anchored on a single shape, defined in [src/types.ts](../src/types.ts):

```ts
interface AIClaim {
  id: string;
  text: string;                     // the natural-language claim
  confidence: number;               // 0..1
  band: "high" | "likely" | "unsure" | "low";
  alternatives: { label, probability }[];   // top-k the model considered
  evidence: EvidenceSpan[];                 // empty → ungrounded → hallucination risk
  flags: FlagKind[];
  rationale?: string;
  category: string;
}
```

A host AI tool hands Sentinel an array of claims. Sentinel handles the rest.

---

## The state machine

[`src/state/sentinel.tsx`](../src/state/sentinel.tsx) is the brain. One context provider holds the whole oversight session:

| Key | Type | What it does |
|---|---|---|
| `enabled` | `boolean` | The kill-switch behind the demo toggle. When off, claims render as plain text — what AI tools ship today. |
| `scenario` | `Vertical` | Which host is active. Switching scenarios **clears decisions** so verdicts never bleed across cases. |
| `decisions` | `Record<claimId, ClaimDecision>` | Per-claim verdicts: `pending`, `accepted`, `edited`, `rejected`. The `edited` verdict carries the corrected text alongside the verdict. |
| `audit` | `AuditRecord[]` | Immutable log. Each entry binds reviewer + action + rationale + the specific claims they changed. |

The library ships with no built-in data. The demo's `main.tsx` wires `REVIEW_ITEMS` and a `reviewerFor` resolver into the provider. A real host would wire its own review items and signed-in user.

---

## The five surfaces

### 1. `SentinelClaim` — the intervention surface

[`src/components/plugin/SentinelClaim.tsx`](../src/components/plugin/SentinelClaim.tsx)

Renders the claim two ways:

- **Sentinel off** — plain text, no badges. Deliberately ugly so the contrast against "on" reads instantly.
- **Sentinel on** — confidence badge, hallucination chip, evidence links (or an `UngroundedTag` when `evidence.length === 0`), an alternatives bar that only appears when `band !== "high"` (progressive disclosure), and a three-button verdict bar.

Edit is in-place: clicking **Edit** swaps the `<p>` for a `<textarea>` and stores the corrected text on the decision itself. The original claim is preserved alongside — corrections aren't destructive.

### 2. `ConfidenceBadge` & `ConfidenceDistribution` — uncertainty without overwhelming

Calibrated language over raw percentages. Reviewers see `Likely`, `Unsure`, `Low` — bands that match how clinicians, lawyers, and analysts already speak. The `73%` is one hover away. Three depths of detail, surfaced progressively: badge → stacked alternatives bar → full distribution + rationale on hover.

### 3. `HallucinationChip` & `EvidenceLink` — hallucination ≠ low confidence

The most important visual decision in the system. Both look "concerning" but they demand different responses:

- **Hallucination** → diagonal cross-hatch (pattern, not just color — works for color-vision-deficient reviewers).
- **Low confidence** → soft pulse on the dot.
- **Out-of-distribution** → its own iconography.

Provenance is the antidote. Every claim either anchors to evidence (source quote on hover) or renders `No source cited` with the same hatch pattern. There is no neutral state.

### 4. `VerdictRail` — the submit gate

[`src/components/plugin/VerdictRail.tsx`](../src/components/plugin/VerdictRail.tsx)

Sticky bottom bar. Three mechanics designed against rubber-stamping:

- Counts verdicts in real time (`accepted` / `edited` / `rejected` / `pending`).
- **"Accept all" is disabled until every claim has a verdict** — you cannot blanket-approve without engaging with each claim.
- The primary action morphs: `hasCorrections ? "Submit with corrections" : "Accept all"`, and the audit verb becomes `"correct"` vs `"accept"`.
- **Escape hatches stay open.** Escalate and Reject-output are always enabled, so a reviewer can always opt out of approving the whole batch.

### 5. `AuditDrawer` — the accountability sink

[`src/components/plugin/AuditDrawer.tsx`](../src/components/plugin/AuditDrawer.tsx)

Slide-out panel showing every reviewer decision the session has logged. Each row carries:

```
reviewer · action verb · rationale · changedClaimIds[] · timestamp
```

`changedClaimIds` is computed at audit time by filtering `decisions` for `edited|rejected` verdicts — so the row knows exactly which claims the human overrode. The drawer's copy is explicit: this surface is persisted **out of band**; the host AI tool never sees it.

---

## The full loop, end to end

```
host renders AIClaim
       ↓
SentinelClaim wraps it (or passes through, if disabled)
       ↓
reviewer clicks Accept / Edit / Reject  →  setDecision(claimId, …)
       ↓
VerdictRail re-counts; primary button enabled iff all decided; label morphs
       ↓
reviewer hits Submit / Escalate / Reject-output  →  recordAudit(action, rationale)
       ↓
AuditRecord prepended to audit[]; decisions cleared for the next case
       ↓
AuditDrawer shows the new row — paired with reviewer, rationale, changed claims
```

---

## Where Sentinel sits in a real platform

If you imagine the canonical "enterprise human-in-the-loop platform" architecture (data on top, models on the left, humans on the right, with tiles for Automation / Interface Agent / Quality Control / Audit / Platform / Support), Sentinel is the **embedded interface agent + quality control + part of the audit tile** — fused into one component layer that lives *inside* whichever host AI tool a reviewer already uses.

Out of scope for this prototype (would live in a backend): versioning, gold tasks, inter-rater agreement, model tracking, lineage, SSO/RBAC. Sentinel is the surface humans touch. The accountability data it produces (audit records with diff counts and rationales) is the input those backend systems would ingest.

---

## Where to go next

- [Live demo](https://sinhaankur.github.io/Human-in-the-Loop/) — toggle Sentinel off, edit a claim, watch the rail morph.
- [README](../README.md) — the four delivery shapes (React library, Docker, Chrome extension, VS Code extension) and how to run each.
- [src/types.ts](../src/types.ts) — every shape Sentinel cares about, in ~80 lines.
