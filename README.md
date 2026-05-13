# Sentinel — inline AI oversight plugin

An **embeddable oversight layer** for AI tools in high-stakes domains. Sentinel doesn't replace the host AI tool — it wraps the AI's output *in place* so the human expert can validate, correct, and audit without leaving their workflow.

> Ships four ways: a React component library, a Docker demo, a Chrome extension that overlays on real ChatGPT, and a VS Code extension that wraps Copilot Chat responses.
> React + TypeScript + Tailwind v4 · simulated host AI tools across radiology, legal, finance.

**[Live demo →](https://sinhaankur.github.io/Human-in-the-Loop/)** &nbsp;·&nbsp; **[How it works (code walkthrough) →](docs/HOW_IT_WORKS.md)**

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

## Four delivery shapes

The same Sentinel framing ships four ways. Each shape exists to test the "embedded oversight layer" thesis against a different integration constraint — and a different boundary the host AI tool owns.

| Shape | What it is | Who it's for |
|---|---|---|
| **React library** ([`sentinel-react`](#as-a-react-component-library)) | npm package: `<SentinelClaim>`, `<VerdictRail>`, `<AuditDrawer>`, primitives, types. ESM + CJS + `.d.ts` + a single CSS file. | AI-tool teams who control their own React UI and want to drop oversight in. |
| **Chrome extension** ([`extension/`](#as-a-chrome-extension)) | MV3 extension that overlays Sentinel on real ChatGPT responses via a content script + Shadow DOM. Plus a packaged sandbox demo that always works. | End users wanting oversight on AI tools they don't own. Proof the framing isn't React-specific. |
| **VS Code extension** ([`vscode/`](#as-a-vs-code-extension)) | `@sentinel` chat participant. Type `@sentinel <question>` in Copilot Chat; Sentinel calls a model via `vscode.lm`, wraps each paragraph as a confidence/evidence/flag block in the chat panel. | Developers who already live in Copilot Chat and want oversight on its answers without leaving the editor. |
| **Docker demo** ([`Dockerfile`](Dockerfile)) | Multi-stage build — `dev` (Vite + HMR) and `prod` (nginx static). One command, no Node setup. | Portfolio reviewers, demo machines, anyone evaluating the prototype without installing dependencies. |

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

## Get it running

### The demo (local Vite)

```bash
npm install
npm run dev
```

Open http://localhost:5173. No backend — all data is mocked in [src/data/mockData.ts](src/data/mockData.ts).

```bash
npm run build      # typecheck + production build
npm run preview    # preview the built app
```

### The demo (Docker)

One command, no Node version juggling:

```bash
docker compose up prod    # nginx-served static demo  →  http://localhost:8080
docker compose up dev     # Vite + HMR on the bind-mounted source  →  http://localhost:5173
```

Multi-stage [Dockerfile](Dockerfile) handles install + build + serve. The prod image is `nginx:alpine` with SPA fallback and immutable caching for hashed assets ([docker/nginx.conf](docker/nginx.conf)).

### As a React component library

```bash
npm run build:lib    # emits dist-lib/{sentinel.mjs, sentinel.cjs, styles.css, *.d.ts}
npm run pack:lib     # produces sentinel-react-0.1.0.tgz
```

Then in any React host:

```tsx
import { SentinelProvider, SentinelClaim, VerdictRail, AuditDrawer } from "sentinel-react";
import "sentinel-react/styles.css";

<SentinelProvider>
  <SentinelClaim claim={hostClaim} />
  <VerdictRail />
  <AuditDrawer />
</SentinelProvider>
```

React/ReactDOM are peer deps; Radix, Lucide, Tailwind utilities are bundled. Build config: [vite.lib.config.ts](vite.lib.config.ts).

### As a Chrome extension

```bash
npm run build:ext    # emits extension/dist/ — a loadable MV3 unpacked extension
```

Then: Chrome → `chrome://extensions` → enable Developer mode → **Load unpacked** → select `extension/dist`.

- **Toolbar popup**: pause/resume oversight, see audit count, launch the bundled sandbox demo.
- **Live overlay**: open `chatgpt.com`, ask anything; ~1.5s after the response settles, a Sentinel badge appears below the message. Click to expand into the verdict UI.
- **Sandbox**: opens from the popup as a packaged tab — works offline, immune to ChatGPT redesigns.

The content script renders into a Shadow DOM next to each assistant message, so host CSS and Sentinel CSS can't bleed into each other ([extension/src/content/index.tsx](extension/src/content/index.tsx)). Confidence and evidence are deterministically fabricated from the response text — see [the speculative-concept caveat](#the-speculative-concept-caveat) below.

#### What the confidence numbers mean

AI vendors don't surface calibrated per-claim confidence or evidence anchors yet — the model internals exist, but the consumer UIs don't expose them. So the extension fabricates this metadata deterministically from the response text (same input → same numbers, so the demo is stable). Treat Sentinel-on-ChatGPT as a **proposition for vendors**: this is what oversight UI should look like when they expose what their models already know. The overlay says so plainly to anyone who clicks in.

### As a VS Code extension

```bash
npm run build:vsc       # compile vscode/src → vscode/dist
npm run package:vsc     # produces vscode/sentinel-vscode-0.1.0.vsix
```

Install the `.vsix` in VS Code: **Extensions** view → **…** menu → **Install from VSIX…** → select the file. Reload, then open **Copilot Chat** (requires GitHub Copilot installed and signed in).

Type `@sentinel <question>` — Sentinel calls a Copilot-provided model via `vscode.lm`, parses the response into per-paragraph claims, and renders each one as a GitHub-style alert block (NOTE / TIP / IMPORTANT / WARNING) annotated with confidence, evidence, alternatives, and flags. The `/review` subcommand wraps a previously-generated response you paste in — useful for auditing answers from elsewhere.

#### Why a chat participant rather than an overlay

VS Code's extension model sandboxes webviews — one extension cannot inject DOM into another extension's chat panel the way a browser content script can. The chat-participant API is the actual analogue: Sentinel registers itself as a first-class chat addressee (`@sentinel`) and renders inside the Copilot Chat panel because Copilot Chat is doing the rendering, not us.

The fabricated-metadata caveat from the Chrome extension applies the same way here, and the extension states it in the chat footer.

---

## Architecture

```
src/                        ← React library source (sentinel-react)
  components/
    primitives/   ← the load-bearing UX primitives
    plugin/       ← SentinelClaim, SentinelToggle, VerdictRail, AuditDrawer
    demo/         ← the demo harness — Radiology / Contract / Fraud hosts
    ui/           ← Button, Card, Tooltip
  state/sentinel.tsx        ← context: enabled, scenario, decisions, audit
  data/mockData.ts          ← claims, alternatives, evidence per scenario
  lib/                      ← verticals, format, cn
  types.ts
  lib-entry.ts              ← public npm-package surface

extension/                  ← MV3 Chrome extension
  manifest.json             ← MV3 manifest (chatgpt.com host permissions)
  vite.config.ts            ← @crxjs/vite-plugin build
  src/
    background/             ← service worker (chrome.storage + message bus)
    content/                ← MutationObserver, Shadow DOM, ChatGPT adapter,
                              fakeInference (deterministic metadata)
    popup/                  ← toolbar popup
    sandbox/                ← packaged DemoFrame (always-works fallback)
    shared/                 ← storage + typed message contract
  icons/

vscode/                     ← VS Code extension (Copilot Chat participant)
  package.json              ← contributes.chatParticipants → @sentinel
  src/
    extension.ts            ← activate(): registers the participant
    sentinel-participant.ts ← chat handler: lm.sendRequest → claims → markdown
    fakeInference.ts        ← deterministic metadata (mirrors the Chrome ext)
    formatters.ts           ← markdown formatters (GitHub alerts per band)
  icons/                    ← shared with the Chrome extension

Dockerfile                  ← multi-stage: deps → dev → build → prod (nginx)
docker-compose.yml          ← `dev` + `prod` services
docker/nginx.conf           ← SPA fallback + asset caching
vite.config.ts              ← demo app build
vite.lib.config.ts          ← npm library build (ESM + CJS + dts + styles.css)
```

### Stack

- **Vite** + **React 19** + **TypeScript** (strict)
- **Tailwind v4** with `@theme` design tokens (OKLCH-based palette, dark default + light mode)
- **Radix UI** primitives for tooltip, dropdown, switch, dialog
- **Lucide** icons

---

## Why this exists

A UX portfolio piece exploring **AI Trust & Safety as an embedded layer**. The premise: as AI takes on higher-stakes work, oversight becomes infrastructure — something every AI tool needs, almost nobody designs well, and ideally a single layer solves for everyone. Sentinel is one shape that layer could take.

## Companion piece — Recourse

Sentinel is oversight *of* AI by experts. Its sibling project, **[Recourse](https://github.com/sinhaankur/Recourse)** ([live demo](https://sinhaankur.github.io/Recourse/)), is oversight of *institutions* by AI on behalf of the person they're squeezing — consumer-side trust-and-safety for insurance denials, surprise medical bills, and parity violations. Same primitives (calibrated confidence, evidence anchors, cross-hatch pattern for fabricated content), inverted reader.

Together they're a deliberate pair: AI Trust & Safety at both ends of the asymmetry — the expert reviewing the AI, and the citizen the AI is reviewing for.
