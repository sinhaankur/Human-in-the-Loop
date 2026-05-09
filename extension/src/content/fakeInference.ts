// Generates plausible Sentinel-shaped metadata from raw AI output.
// This is the load-bearing "speculative concept" piece: real LLMs don't
// expose calibrated confidence or per-claim evidence to consumer UIs, so
// the extension fabricates the metadata in a UX-honest, deterministic way.
// Same input → same output, so reviewers see stable demos across reloads.

import type { AIClaim, ConfidenceBand, FlagKind, EvidenceSpan } from "@/types";

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

function bandFor(confidence: number): ConfidenceBand {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.7) return "likely";
  if (confidence >= 0.5) return "unsure";
  return "low";
}

function sniffEvidenceCues(text: string): boolean {
  // Crude heuristic: claims that name proper nouns or numbers tend to be
  // verifiable; pure opinion text doesn't anchor to evidence.
  return /\b(\d{4}|[A-Z][a-z]+ [A-Z][a-z]+|§|RFC|ISO|HIPAA|GDPR|SOC ?2)\b/.test(text);
}

const FAKE_SOURCES = [
  { source: "ChatGPT response history", reliability: "likely" as ConfidenceBand },
  { source: "Web — OpenAI documentation", reliability: "high" as ConfidenceBand },
  { source: "Web — Wikipedia", reliability: "likely" as ConfidenceBand },
  { source: "Web — vendor blog post", reliability: "unsure" as ConfidenceBand },
];

export function fakeClaimFor(text: string, index: number): AIClaim {
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

  const evidence: EvidenceSpan[] =
    sniffEvidenceCues(text) && r() > 0.2
      ? Array.from({ length: 1 + Math.floor(r() * 2) }, (_, i) => {
          const s = FAKE_SOURCES[Math.floor(r() * FAKE_SOURCES.length)];
          return {
            id: `${id}-ev-${i}`,
            source: s.source,
            excerpt: text.slice(0, Math.min(120, text.length)),
            reliability: s.reliability,
          };
        })
      : [];

  const alternatives =
    band === "high"
      ? [{ label: text.slice(0, 80), probability: confidence }]
      : [
          { label: text.slice(0, 80), probability: confidence },
          {
            label: "An alternative phrasing the model considered",
            probability: Math.max(0.02, (1 - confidence) * 0.7),
          },
          {
            label: "A second alternative",
            probability: Math.max(0.01, (1 - confidence) * 0.3),
          },
        ];

  return {
    id,
    text,
    confidence,
    band,
    alternatives,
    evidence,
    flags,
    rationale:
      band === "high"
        ? undefined
        : "Confidence reduced because the claim asserts a fact without anchoring to a retrievable source.",
    category: "assistant-output",
  };
}

export function paragraphsToClaims(paragraphs: string[]): AIClaim[] {
  return paragraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 12)
    .map((p, i) => fakeClaimFor(p, i));
}
