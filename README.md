# Sentinel — inline AI oversight plugin

An **embeddable oversight layer** for AI tools in high-stakes domains. Sentinel doesn't replace the host AI tool — it wraps the AI's output *in place* so the human expert can validate, correct, and audit without leaving their workflow.

> Live demo · React + TypeScript + Tailwind v4 · simulated host AI tools across radiology, legal, finance.

---

## The thesis

Every AI tool today reinvents oversight badly. Some show a confidence number. Some highlight "low confidence" rows. Almost none distinguish hallucination from low confidence, surface evidence anchors, or capture the reviewer's correction in a way that closes the loop.

**Sentinel is a single oversight layer that any AI tool can drop in.** Same primitives, same intervention model, same audit shape — whether the host AI is a radiology workstation, a contract review tool, or a fraud case manager.

The user is whoever happens to be the human-in-the-loop in *their* AI tool. The plugin's job is to make that human's work fast, deliberate, and traceable — without forcing them into a separate dashboard.

---

## The demo

The prototype simulates three host AI tools:

| Host (simulated) | Domain | Reviewer |
|---|---|---|
| **Aiden-Rad** | radiology triage | Dr. Priya Shah |
| **ClauseLens** | contract review | Marcus Vance, Esq. |
| **Watchtower-AML** | BSA/AML compliance | Elena Marquez |

A **Sentinel toggle** in the demo top bar flips the plugin on or off. The wow moment is the toggle: you see exactly what the same AI output looks like with and without oversight wrapped around it.

The host chrome is intentionally rendered as if you're inside *someone else's product* — Sentinel is the embedded layer, not the destination.

---

## What's in the plugin

### Six load-bearing primitives

| Primitive | Job |
|---|---|
| `ConfidenceBadge` | Calibrated language ("Likely", "Unsure"), exact % on hover. Avoids percentage fatigue. |
| `ConfidenceDistribution` | Top-k alternatives the model considered. Makes "uncertainty *about what*" legible. |
| `HallucinationChip` | Diagonal cross-hatch — visually distinct from low confidence. They demand different responses. |
| `EvidenceLink` / `UngroundedTag` | Provenance is the antidote to hallucination. Ungrounded claims are surfaced as a first-class failure mode. |
| `RiskMeter` | confidence × business impact, scannable in peripheral vision. |
| `AuditEntry` | Reviewer + action + rationale + diff count, persisted to the audit drawer. |

### The intervention surfaces

| Surface | Role |
|---|---|
| **Inline `SentinelClaim`** | Wraps each AI claim — confidence, evidence, flags, in-place edit, three verdicts (Accept / Edit / Reject). |
| **Verdict rail** | Sticky bottom rail; counts decisions in real time; primary action morphs from "Accept all" to "Submit with corrections" the moment any claim is edited; "Accept all" is disabled until every claim has a verdict (prevents rubber-stamping). |
| **Audit drawer** | Slide-out panel with every reviewer decision Sentinel ever logged for this user — paired with rationale and changed-claim counts. |

---

## Design moves

### 1. Uncertainty without overwhelming

**Calibrated language over raw percentages.** Numbers create false precision and fatigue. Reviewer sees `Likely`, `Unsure`, `Low` — bands that match how clinicians, lawyers, and analysts already speak. The `73%` is one hover away.

**Progressive disclosure.** Confidence renders three ways at three depths: a small badge in the inline claim, a stacked alternatives bar when the band is below `high`, full distribution + rationale on hover. The reviewer pulls more detail only when something asks for it.

### 2. Hallucination ≠ low confidence

The most important visual decision in the system. Both look "concerning" but they demand different responses. So:

- **Hallucination** uses a diagonal cross-hatch — never reads as just another warning
- **Low confidence** uses a soft pulse on the dot
- **Out-of-distribution** has its own iconography
- The pattern (not just color) carries the distinction — works for color-vision-deficient reviewers too

**Provenance as the antidote.** Every claim either anchors to an `EvidenceLink` (with the source quote on hover) or renders `No source cited` with the same hatch pattern. There is no neutral state.

### 3. Designed against rubber-stamping

- "Accept all" is disabled until every claim has a verdict — *forces* engagement
- Reviewer can still escalate or reject the entire output in one click
- The submit button morphs to "Submit with corrections" the moment they edit anything
- Edits are kept in the audit trail alongside the original AI text — corrections aren't destructive, they're educational signal for the next model version

### 4. Host-agnostic by construction

The same `SentinelClaim` component renders against radiology findings, contract clauses, and SAR narratives. The host AI tool just hands Sentinel a claim object; Sentinel handles the rest. That's the platform-thinking proof: one design system, three regulated industries, identical interaction model.

### 5. Accountability as a first-class object

Every decision pairs reviewer name, action verb (`accepted` / `corrected` / `escalated` / `rejected`), rationale, and the count of claims they changed. The audit drawer is right there in the plugin — the reviewer sees their own track record, and a compliance officer can pull the same surface off the wire.

---

## The 90-second walkthrough

1. Land on the demo. **Sentinel is on by default.** The Aiden-Rad host is showing a chest CT with three AI-generated findings.
2. **Toggle Sentinel off** in the top bar. Watch the same findings collapse to plain text — that's what AI tools ship today.
3. **Toggle back on.** Confidence badges, evidence anchors, and the hallucination flag on finding #3 (no source cited) reappear.
4. **Click into finding #2** ("Unsure"). The alternatives the model considered expand. The reviewer can see the model was 62% on "spiculated nodule, follow-up" but 27% on "post-inflammatory scarring."
5. **Edit finding #2's text.** The verdict bar updates, primary action becomes "Submit with corrections."
6. **Reject finding #3** (the hallucinated one). The verdict bar shows `1 edited · 1 rejected`.
7. **Click Submit with corrections.** The audit drawer opens — your decision is logged with timestamp, reviewer, and changed-claim count.
8. **Switch host scenarios** (Contract → Fraud) using the buttons in the hero. Same plugin, identical interaction model, host chrome adapts.

---

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. No backend — all data is mocked in [src/data/mockData.ts](src/data/mockData.ts).

```bash
npm run build      # typecheck + production build
npm run preview    # preview the built app
```

---

## Architecture

```
src/
  components/
    primitives/   ← the load-bearing UX primitives (the product, in component form)
    plugin/       ← SentinelClaim, SentinelToggle, VerdictRail, AuditDrawer
    demo/         ← the demo harness
      hosts/      ← Radiology / Contract / Fraud — simulated host AI tool chrome
      DemoFrame.tsx
      HostChrome.tsx
    ui/           ← Button, Card, Tooltip — generic shadcn-style primitives
  state/
    sentinel.tsx  ← context: enabled, scenario, decisions, audit
  data/
    mockData.ts   ← claims, alternatives, evidence per host scenario
  lib/
    verticals.tsx ← per-host metadata (brand, accent, reviewer)
    format.ts, cn.ts
  types.ts
```

### Stack

- **Vite** + **React 19** + **TypeScript** (strict)
- **Tailwind v4** with `@theme` design tokens (OKLCH-based palette, dark default + light mode)
- **Radix UI** primitives for tooltip, dropdown, switch, dialog
- **Lucide** icons

---

## Why this exists

A UX portfolio piece exploring **AI Trust & Safety as an embedded layer**. The premise: as AI takes on higher-stakes work, oversight becomes infrastructure — something every AI tool needs, almost nobody designs well, and ideally a single layer solves for everyone. Sentinel is one shape that layer could take.
