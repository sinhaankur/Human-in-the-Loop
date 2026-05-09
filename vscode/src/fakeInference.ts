// Deterministic claim metadata generator. Same input → same output, so the
// chat output is stable across re-asks. Mirrors extension/src/content/
// fakeInference.ts so both extensions agree on what "Likely 78%" means.
//
// The framing: AI vendors don't surface calibrated per-claim confidence or
// evidence anchors yet. This file fabricates them honestly — deterministic,
// plainly disclosed in the chat footer — to demonstrate the oversight UI
// shape that should exist when vendors do expose model internals.

export type ConfidenceBand = "high" | "likely" | "unsure" | "low";
export type FlagKind = "hallucination" | "low_confidence" | "ungrounded";

export interface FakeEvidence {
  source: string;
  reliability: ConfidenceBand;
}

export interface FakeAlternative {
  label: string;
  probability: number;
}

export interface FakeClaim {
  id: string;
  text: string;
  confidence: number;
  band: ConfidenceBand;
  flags: FlagKind[];
  evidence: FakeEvidence[];
  alternatives: FakeAlternative[];
  rationale?: string;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function bandFor(c: number): ConfidenceBand {
  if (c >= 0.85) return "high";
  if (c >= 0.7) return "likely";
  if (c >= 0.5) return "unsure";
  return "low";
}

function sniffEvidenceCues(text: string): boolean {
  return /\b(\d{4}|[A-Z][a-z]+ [A-Z][a-z]+|§|RFC|ISO|HIPAA|GDPR|SOC ?2)\b/.test(text);
}

const FAKE_SOURCES: FakeEvidence[] = [
  { source: "Web — official documentation", reliability: "high" },
  { source: "Web — Wikipedia", reliability: "likely" },
  { source: "Web — vendor blog post", reliability: "unsure" },
  { source: "Conversation history (this session)", reliability: "likely" },
];

export function fakeClaim(text: string, index: number): FakeClaim {
  const id = `claim-${hash(text + index).toString(36)}`;
  const r = rand(hash(text));
  const confidence = 0.55 + r() * 0.4;
  const band = bandFor(confidence);

  const flags: FlagKind[] = [];
  if (band === "low") flags.push("hallucination");
  if (band === "unsure" && r() < 0.4) flags.push("low_confidence");
  if (/\bI think|\bperhaps|\bmaybe|\bmight\b/i.test(text) && r() < 0.5) {
    flags.push("low_confidence");
  }

  const grounded = sniffEvidenceCues(text) && r() > 0.2;
  const evidence: FakeEvidence[] = grounded
    ? Array.from({ length: 1 + Math.floor(r() * 2) }, () => {
        const i = Math.floor(r() * FAKE_SOURCES.length);
        return FAKE_SOURCES[i];
      })
    : [];
  if (!grounded) flags.push("ungrounded");

  const alternatives: FakeAlternative[] =
    band === "high"
      ? []
      : [
          { label: "An alternative phrasing the model considered", probability: Math.max(0.02, (1 - confidence) * 0.7) },
          { label: "A second alternative", probability: Math.max(0.01, (1 - confidence) * 0.3) },
        ];

  return {
    id,
    text,
    confidence,
    band,
    flags,
    evidence,
    alternatives,
    rationale:
      band === "high"
        ? undefined
        : "Confidence reduced because the claim asserts a fact without anchoring to a retrievable source.",
  };
}

/**
 * Split a model response into individual claims. We treat each non-trivial
 * paragraph (or list item) as a claim — same heuristic as the Chrome
 * extension. Code blocks, headings, and very short fragments are skipped.
 */
export function paragraphsToClaims(text: string): FakeClaim[] {
  const paragraphs: string[] = [];
  let inCode = false;
  for (const raw of text.split(/\n/)) {
    const line = raw.trim();
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (!line || line.startsWith("#")) continue;
    paragraphs.push(line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""));
  }
  return paragraphs
    .filter((p) => p.length > 24)
    .map((p, i) => fakeClaim(p, i));
}
