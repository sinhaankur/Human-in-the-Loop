// Markdown formatters for Sentinel claim metadata. The Copilot Chat panel
// renders a constrained markdown subset — including GitHub-style alerts
// (> [!NOTE], > [!TIP], > [!WARNING]) — which we use to encode confidence
// bands without needing custom HTML or React.

import type { ConfidenceBand, FakeClaim, FakeEvidence, FlagKind } from "./fakeInference";

const BAND_LABEL: Record<ConfidenceBand, string> = {
  high: "Confident",
  likely: "Likely",
  unsure: "Unsure",
  low: "Low confidence",
};

// Map confidence band to a GitHub-flavored alert type. Copilot Chat
// renders these with distinct colors and icons, doing the visual work.
const BAND_ALERT: Record<ConfidenceBand, string> = {
  high: "NOTE",
  likely: "TIP",
  unsure: "IMPORTANT",
  low: "WARNING",
};

const FLAG_LABEL: Record<FlagKind, string> = {
  hallucination: "🟥 Hallucination risk",
  low_confidence: "🟧 Low confidence",
  ungrounded: "🟧 Ungrounded — no source cited",
};

function pct(c: number): string {
  return `${Math.round(c * 100)}%`;
}

function evidenceLine(evidence: FakeEvidence[]): string | null {
  if (evidence.length === 0) return null;
  const list = evidence.map((e) => `\`${e.source}\``).join(", ");
  return `**Evidence:** ${list}`;
}

function alternativesLine(c: FakeClaim): string | null {
  if (c.alternatives.length === 0) return null;
  const lines = [
    `   - **${pct(c.confidence)}** — ${truncate(c.text, 70)}`,
    ...c.alternatives.map(
      (a) => `   - ${pct(a.probability)} — ${truncate(a.label, 70)}`
    ),
  ];
  return `**Alternatives the model considered:**\n${lines.join("\n")}`;
}

function flagsLine(flags: FlagKind[]): string | null {
  if (flags.length === 0) return null;
  return flags.map((f) => FLAG_LABEL[f]).join(" · ");
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

export function formatClaim(c: FakeClaim): string {
  const alert = BAND_ALERT[c.band];
  const header = `**${BAND_LABEL[c.band]} (${pct(c.confidence)})** — ${c.text}`;

  const body: string[] = [];
  const flags = flagsLine(c.flags);
  if (flags) body.push(flags);
  const ev = evidenceLine(c.evidence);
  if (ev) body.push(ev);
  const alts = alternativesLine(c);
  if (alts) body.push(alts);
  if (c.rationale) body.push(`*Why this band:* ${c.rationale}`);

  // GitHub alert syntax: each body line must be prefixed with `>`.
  const quoted = [`[!${alert}]`, header, "", ...body]
    .join("\n")
    .split("\n")
    .map((line) => `> ${line}`.trimEnd())
    .join("\n");

  return quoted;
}

export function formatSummary(claims: FakeClaim[]): string {
  if (claims.length === 0) return "";
  const flagged = claims.filter((c) => c.band === "low" || c.band === "unsure").length;
  const ungrounded = claims.filter((c) => c.evidence.length === 0).length;
  const parts = [`${claims.length} claim${claims.length === 1 ? "" : "s"}`];
  if (flagged > 0) parts.push(`${flagged} flagged`);
  if (ungrounded > 0) parts.push(`${ungrounded} ungrounded`);
  return `**🛡️ Sentinel:** ${parts.join(" · ")}`;
}

export const FOOTER =
  "_AI vendors don't surface calibrated per-claim confidence or evidence anchors yet. " +
  "The numbers above are deterministic placeholders — same response → same numbers — " +
  "showing what oversight UI should look like when vendors expose what their models already know._";
