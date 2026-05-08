# Sentinel — AI Trust & Safety

A multi-tenant dashboard for **human oversight of high-stakes AI** across healthcare, legal, and finance. The core UX problem isn't the model's output — it's how a human expert validates, corrects, and audits it without drowning in noise.

> Live prototype · React + TypeScript + Tailwind v4 · mock data · ~7.4 kLoC

---

## The problem

In regulated industries, the reviewer is the source of truth — not the model. They face three failure modes:

1. **Rubber-stamping** — accepting AI output they should have caught
2. **Drowning** — losing signal when "uncertainty" alarms blur together
3. **No paper trail** — being unable to defend a decision after the fact

Every UX decision in Sentinel is aimed at one of those three.

---

## The design moves

### 1. Uncertainty without overwhelming

**Calibrated language over raw percentages.** Numbers create false precision and fatigue. The reviewer sees `Likely`, `Unsure`, `Low` — bands that match how clinicians, lawyers, and analysts already speak. The exact `73%` is one hover away.

**Progressive disclosure across three depths.** The same model state is rendered differently as the reviewer drills in:

| Surface | Confidence rendering |
|---|---|
| Queue row | Single badge + tiny inline distribution sparkline |
| Review card header | Badge with value |
| Review card body | Full top-k stacked alternatives with labels |

Reviewer pulls more detail only when a row asks for it. They never get the firehose by default.

**Distribution, not just confidence.** A "94% confident" score hides whether the model was choosing between two near-identical alternatives or was genuinely sure. The stacked alternatives bar makes "uncertainty *about what*" legible — that's the part that matters for the reviewer's next action.

### 2. Hallucination ≠ low confidence

The most important visual decision in the system. Both look "concerning" — but a *low-confidence* model is asking for a closer look; a *hallucinating* model is fabricating. They demand different reviewer responses, so they get different visual languages:

- **Hallucination chips** use a diagonal cross-hatch — never reads as just another warning
- **Low-confidence chips** use a soft pulse on the dot
- **Out-of-distribution** has its own iconography
- The pattern (not just color) carries the distinction — works for color-vision-deficient reviewers too

**Provenance as the antidote.** Every claim either anchors to an `EvidenceLink` (with the source quote on hover) or renders `No source cited` with the same hatch pattern. There is no neutral state — the *absence* of grounding is surfaced as an explicit failure mode.

### 3. The intervention workflow — designed for deliberate engagement

Each claim has three verdicts: **Accept / Edit / Reject**. Edits happen in place but the original AI text is preserved in the audit trail (corrections aren't destructive — they're educational signal for the next model version).

Subtle but deliberate friction:

- **"Accept all" is disabled until every claim has a verdict** — forces engagement, prevents rubber-stamping. Reviewer can still *escalate* or *reject the whole output* in one click.
- **The submit button morphs**: "Accept all" → "Submit with corrections" the moment they edit anything.
- **Focus mode** collapses every claim that's already accepted or unflagged. A 9-claim review becomes a 2-claim review of just the parts that need attention.

### 4. Triage at scale

**Risk = confidence × business impact**, rendered as a 4-bar meter — scannable in peripheral vision so the reviewer can pattern-match a queue without reading. A 99%-confident routine call still ranks below a 70%-confident critical call.

**Items auto-sort by risk × uncertainty.** No "default sorting" debate — the riskiest, most uncertain things float up. The live activity feed gives ambient awareness without forcing attention.

### 5. Accountability is a person, not a system

Every decision carries: reviewer name, action verb, rationale, and the count of claims they changed. The audit log is filterable by action and tenant, and shows a **decision distribution chart** that lets a compliance officer spot reviewers who never correct (rubber-stamping) or always reject (over-correction). The chart is itself a UX intervention against drift.

### 6. The multi-tenant chassis

Same primitives, three accent palettes (clinical teal, legal indigo, finance amber), three subject nouns (`patient` / `matter` / `case`), three reviewer personas. The tenant switcher swaps everything contextual; the *interaction model* is identical.

This is the platform-thinking moment: one design system serves three regulated industries without bespoke screens. The same `ConfidenceBadge` works on a radiology finding, a contract clause, and a SAR narrative — because at the UX layer, the human task ("validate, correct, audit") is the same.

---

## The design system

Six load-bearing primitives drive every screen:

| Primitive | Job |
|---|---|
| `ConfidenceBadge` | Calibrated language, exact % on hover |
| `ConfidenceDistribution` | Top-k alternatives, inline or stacked |
| `HallucinationChip` | Distinct flag visual per failure mode |
| `EvidenceLink` / `UngroundedTag` | Source provenance — or its absence |
| `RiskMeter` | confidence × business impact, scannable |
| `AuditEntry` | Reviewer + action + rationale + diff count |

These compose into:

| Screen | Role |
|---|---|
| **Overview** | Command center · KPIs · top-risk items · cross-tenant signal · live feed |
| **Queue** | Triage table · risk-sorted · filter by flag, status, tenant |
| **Review** | The hero workspace · per-claim verdicts · uncertainty viz · evidence anchors |
| **Audit** | Decision history · filterable · distribution chart |
| **Policy** | Confidence thresholds · grounding rules · per-tenant tunable |

---

## The 90-second walkthrough

1. Land on **Overview** — see KPIs, top-risk items, live activity in the right rail.
2. Click the **tenant switcher** in the sidebar — accent and content swap; chassis stays.
3. Open the **Review queue** — every row shows risk, calibrated confidence, distribution sparkline, and flag chips.
4. Click into the **Review** screen — three columns: subject context, claim cards, decision rail. Try Focus mode.
5. Mark a couple of claims accepted, edit one, reject one. Submit with corrections.
6. Land on **Audit** — your decision is at the top with rationale and changed-claim count.

---

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. No backend needed — all data is mocked in [src/data/mockData.ts](src/data/mockData.ts).

```bash
npm run build      # typecheck + production build
npm run preview    # preview the built app
```

---

## Tech

- **Vite** + **React 19** + **TypeScript** (strict)
- **Tailwind v4** with `@theme` design tokens (OKLCH-based palette, dark default + light mode)
- **Radix UI** primitives for tooltip, dropdown, switch
- **React Router v7** for the screen flow
- **Lucide** icons

All design tokens live in [src/index.css](src/index.css). The primitives are in [src/components/primitives/](src/components/primitives/). Mock data per vertical is in [src/data/mockData.ts](src/data/mockData.ts).

---

## Why this exists

Sentinel is a portfolio piece exploring the UX of human-in-the-loop AI in regulated domains. The premise: as AI takes on higher-stakes work, the bottleneck stops being the model and starts being how a human expert can confidently validate it under time pressure. The visible interface becomes the trust contract.
