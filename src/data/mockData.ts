import type {
  ActivityEvent,
  AuditRecord,
  ReviewItem,
  Vertical,
} from "@/types";

const NOW = new Date("2026-05-08T10:30:00Z");
const isoFromNow = (mins: number) =>
  new Date(NOW.getTime() + mins * 60_000).toISOString();

export const REVIEW_ITEMS: ReviewItem[] = [
  // ─── Clinical ───────────────────────────────────────────────────
  {
    id: "clin-2041",
    vertical: "clinical",
    title: "Chest CT — suspected pulmonary embolism",
    subtitle: "Triage AI flagged 3 findings · 1 with low confidence",
    subjectLabel: "MRN 4471-22 · 64F",
    modelName: "Aiden-Rad",
    modelVersion: "v3.2.1",
    risk: "critical",
    aggregateConfidence: 0.71,
    status: "pending",
    flags: ["low_confidence", "out_of_distribution"],
    ingestedAt: isoFromNow(-12),
    dueAt: isoFromNow(18),
    claims: [
      {
        id: "c1",
        category: "Primary finding",
        text: "Filling defect in right lower-lobe segmental pulmonary artery consistent with acute PE.",
        confidence: 0.94,
        band: "high",
        rationale: "Hyperdense thrombus visible across slices 42–48; vessel cutoff sign present.",
        alternatives: [
          { label: "Acute pulmonary embolism", probability: 0.94 },
          { label: "Beam-hardening artefact", probability: 0.04 },
          { label: "In-situ thrombus (chronic)", probability: 0.02 },
        ],
        evidence: [
          {
            id: "e1",
            source: "DICOM IM-0044",
            excerpt: "axial slice 44 · contrast phase",
            locator: "slice 44",
            reliability: "high",
          },
          {
            id: "e2",
            source: "DICOM IM-0046",
            excerpt: "axial slice 46 · vessel cutoff sign",
            locator: "slice 46",
            reliability: "high",
          },
        ],
        flags: [],
      },
      {
        id: "c2",
        category: "Secondary finding",
        text: "8 mm spiculated nodule in right upper lobe — recommend follow-up per Fleischner.",
        confidence: 0.62,
        band: "unsure",
        rationale:
          "Lesion margin ambiguous; could not confidently distinguish from post-inflammatory scarring.",
        alternatives: [
          { label: "Indeterminate nodule, follow-up", probability: 0.62 },
          { label: "Post-inflammatory scarring", probability: 0.27 },
          { label: "Vessel cross-section", probability: 0.11 },
        ],
        evidence: [
          {
            id: "e3",
            source: "DICOM IM-0021",
            excerpt: "axial slice 21 · RUL nodule",
            locator: "slice 21",
            reliability: "unsure",
          },
        ],
        flags: ["low_confidence"],
      },
      {
        id: "c3",
        category: "Incidental",
        text: "Cardiomegaly with mild pericardial effusion (~6 mm).",
        confidence: 0.41,
        band: "low",
        rationale:
          "Effusion measurement uses a non-standard window. Patient body-habitus is outside training distribution.",
        alternatives: [
          { label: "Mild pericardial effusion", probability: 0.41 },
          { label: "Pericardial fat pad", probability: 0.38 },
          { label: "No effusion", probability: 0.21 },
        ],
        evidence: [],
        flags: ["hallucination", "out_of_distribution"],
      },
    ],
  },
  {
    id: "clin-2039",
    vertical: "clinical",
    title: "Discharge summary — auto-generated medication list",
    subtitle: "LLM extracted 9 meds from EHR — 1 dose mismatch flagged",
    subjectLabel: "MRN 3318-09 · 71M",
    modelName: "ScribeMD",
    modelVersion: "v1.8",
    risk: "high",
    aggregateConfidence: 0.83,
    status: "in_review",
    assignee: "Dr. Priya Shah",
    flags: ["hallucination"],
    ingestedAt: isoFromNow(-46),
    dueAt: isoFromNow(180),
    claims: [
      {
        id: "c1",
        category: "Medication",
        text: "Apixaban 5 mg PO BID, continue indefinitely.",
        confidence: 0.97,
        band: "high",
        alternatives: [{ label: "Apixaban 5 mg BID", probability: 0.97 }],
        evidence: [
          {
            id: "e1",
            source: "EHR · cardiology consult 2026-05-06",
            excerpt:
              "Continue apixaban 5 mg twice daily indefinitely for atrial fibrillation.",
            reliability: "high",
          },
        ],
        flags: [],
      },
      {
        id: "c2",
        category: "Medication",
        text: "Metoprolol succinate 50 mg PO daily.",
        confidence: 0.55,
        band: "unsure",
        rationale:
          "Source notes mention metoprolol but do not specify formulation or dose; model defaulted to common dose.",
        alternatives: [
          { label: "Metoprolol succinate 50 mg daily", probability: 0.55 },
          { label: "Metoprolol tartrate 25 mg BID", probability: 0.31 },
          { label: "Dose unspecified", probability: 0.14 },
        ],
        evidence: [
          {
            id: "e2",
            source: "EHR · admission H&P",
            excerpt: "patient reports taking metoprolol",
            reliability: "low",
          },
        ],
        flags: ["hallucination"],
      },
    ],
  },
  {
    id: "clin-2034",
    vertical: "clinical",
    title: "Mammography screening — BI-RADS classification",
    subtitle: "Model returned BI-RADS 3 with high confidence",
    subjectLabel: "MRN 5512-77 · 52F",
    modelName: "Aiden-Rad",
    modelVersion: "v3.2.1",
    risk: "medium",
    aggregateConfidence: 0.91,
    status: "pending",
    flags: [],
    ingestedAt: isoFromNow(-90),
    dueAt: isoFromNow(720),
    claims: [
      {
        id: "c1",
        category: "Classification",
        text: "BI-RADS 3 — probably benign, short-interval follow-up recommended.",
        confidence: 0.91,
        band: "high",
        alternatives: [
          { label: "BI-RADS 3", probability: 0.91 },
          { label: "BI-RADS 2", probability: 0.07 },
          { label: "BI-RADS 4A", probability: 0.02 },
        ],
        evidence: [
          {
            id: "e1",
            source: "DICOM RCC",
            excerpt: "right CC view · stable mass 7 mm",
            reliability: "high",
          },
        ],
        flags: [],
      },
    ],
  },

  // ─── Legal ──────────────────────────────────────────────────────
  {
    id: "leg-7782",
    vertical: "legal",
    title: "Master Services Agreement — clause extraction",
    subtitle: "Indemnification clause: AI cited a section that does not exist",
    subjectLabel: "Acme Corp ↔ Northwind Ltd · MSA v4",
    modelName: "ClauseLens",
    modelVersion: "v2.4",
    risk: "high",
    aggregateConfidence: 0.78,
    status: "pending",
    flags: ["hallucination"],
    ingestedAt: isoFromNow(-22),
    dueAt: isoFromNow(240),
    claims: [
      {
        id: "c1",
        category: "Limitation of liability",
        text: "Liability is capped at 12 months of fees paid in the preceding period.",
        confidence: 0.96,
        band: "high",
        alternatives: [
          { label: "12-month fee cap", probability: 0.96 },
          { label: "24-month fee cap", probability: 0.03 },
          { label: "Uncapped", probability: 0.01 },
        ],
        evidence: [
          {
            id: "e1",
            source: "MSA §11.2",
            excerpt:
              "Each party's aggregate liability shall not exceed the fees paid by Customer in the twelve (12) months preceding the claim.",
            page: 14,
            reliability: "high",
          },
        ],
        flags: [],
      },
      {
        id: "c2",
        category: "Indemnification",
        text: "Vendor will indemnify Customer for third-party IP infringement claims pursuant to §4.7.",
        confidence: 0.68,
        band: "unsure",
        rationale:
          "Cited §4.7 does not appear in the document. Closest match is §4.6 which addresses warranty disclaimers.",
        alternatives: [
          { label: "IP indemnity per §4.7", probability: 0.68 },
          { label: "No IP indemnity present", probability: 0.22 },
          { label: "Mutual indemnity per §13", probability: 0.1 },
        ],
        evidence: [],
        flags: ["hallucination"],
      },
      {
        id: "c3",
        category: "Termination",
        text: "Either party may terminate for convenience with 90 days' written notice.",
        confidence: 0.88,
        band: "likely",
        alternatives: [
          { label: "90-day termination", probability: 0.88 },
          { label: "60-day termination", probability: 0.09 },
          { label: "Termination only for cause", probability: 0.03 },
        ],
        evidence: [
          {
            id: "e2",
            source: "MSA §16.1",
            excerpt:
              "Either party may terminate this Agreement for convenience upon ninety (90) days' prior written notice.",
            page: 21,
            reliability: "high",
          },
        ],
        flags: [],
      },
    ],
  },
  {
    id: "leg-7779",
    vertical: "legal",
    title: "Privilege log review — 3,418 documents",
    subtitle: "AI proposes 142 docs for privileged status",
    subjectLabel: "Hartwell v. Bridgemont (Disc. Phase 2)",
    modelName: "PrivilegeAI",
    modelVersion: "v1.6",
    risk: "critical",
    aggregateConfidence: 0.66,
    status: "pending",
    flags: ["low_confidence", "pii"],
    ingestedAt: isoFromNow(-6),
    dueAt: isoFromNow(60),
    claims: [
      {
        id: "c1",
        category: "Privileged",
        text: "Email thread between in-house counsel and CFO re: settlement strategy — attorney-client privileged.",
        confidence: 0.93,
        band: "high",
        alternatives: [
          { label: "Privileged (A-C)", probability: 0.93 },
          { label: "Work product", probability: 0.05 },
          { label: "Not privileged", probability: 0.02 },
        ],
        evidence: [
          {
            id: "e1",
            source: "DOC-2241 · email 2025-11-14",
            excerpt:
              "From: jane.morales@bridgemont.com (General Counsel) — Subject: Re: settlement parameters [PRIVILEGED]",
            reliability: "high",
          },
        ],
        flags: [],
      },
      {
        id: "c2",
        category: "Privileged",
        text: "Slack DM between two engineers discussing a litigation hold notice.",
        confidence: 0.49,
        band: "low",
        rationale:
          "Discussing a hold notice does not by itself confer privilege. Model frequently over-classifies internal mentions of litigation.",
        alternatives: [
          { label: "Privileged", probability: 0.49 },
          { label: "Not privileged", probability: 0.46 },
          { label: "Work product", probability: 0.05 },
        ],
        evidence: [
          {
            id: "e2",
            source: "DOC-2998 · Slack export",
            excerpt:
              "FYI — legal sent us a hold notice this morning, don't delete anything in #incident-aug",
            reliability: "unsure",
          },
        ],
        flags: ["low_confidence"],
      },
    ],
  },

  // ─── Finance ────────────────────────────────────────────────────
  {
    id: "fin-9921",
    vertical: "finance",
    title: "SAR draft — structuring pattern detected",
    subtitle: "AI drafted a 4-paragraph narrative + 11 supporting txns",
    subjectLabel: "Customer 88-44021 · SMB account",
    modelName: "Sentinel-AML",
    modelVersion: "v4.0",
    risk: "high",
    aggregateConfidence: 0.81,
    status: "pending",
    flags: ["hallucination"],
    ingestedAt: isoFromNow(-30),
    dueAt: isoFromNow(2880),
    claims: [
      {
        id: "c1",
        category: "Pattern",
        text: "11 cash deposits between $9,400 and $9,950 across 14 business days at 4 branches.",
        confidence: 0.99,
        band: "high",
        alternatives: [{ label: "Confirmed pattern", probability: 0.99 }],
        evidence: [
          {
            id: "e1",
            source: "Core txn ledger",
            excerpt: "11 deposits aggregated · range $9,400–$9,950 · 14 days",
            reliability: "high",
          },
        ],
        flags: [],
      },
      {
        id: "c2",
        category: "Narrative",
        text: "Customer's cash-intensive business (food truck) reported $14k average monthly revenue per their last loan application in 2024.",
        confidence: 0.58,
        band: "unsure",
        rationale:
          "No 2024 loan application is on file for this customer. Model may be conflating with a different customer record.",
        alternatives: [
          { label: "Cited 2024 loan app", probability: 0.58 },
          { label: "No supporting application", probability: 0.36 },
          { label: "2023 loan app cited", probability: 0.06 },
        ],
        evidence: [],
        flags: ["hallucination"],
      },
      {
        id: "c3",
        category: "Recommendation",
        text: "File SAR; recommend continued monitoring with 30-day re-review cadence.",
        confidence: 0.84,
        band: "likely",
        alternatives: [
          { label: "File SAR + monitor", probability: 0.84 },
          { label: "File SAR, close account", probability: 0.11 },
          { label: "Monitor only", probability: 0.05 },
        ],
        evidence: [
          {
            id: "e2",
            source: "BSA policy §3.4",
            excerpt:
              "Structuring patterns under $10k thresholds require SAR within 30 days of detection.",
            reliability: "high",
          },
        ],
        flags: [],
      },
    ],
  },
  {
    id: "fin-9918",
    vertical: "finance",
    title: "Card-not-present fraud — 2 disputed charges",
    subtitle: "Model recommends auto-decline; merchant is on watchlist",
    subjectLabel: "Customer 71-93120 · Premium",
    modelName: "Sentinel-Fraud",
    modelVersion: "v6.1",
    risk: "medium",
    aggregateConfidence: 0.86,
    status: "pending",
    flags: [],
    ingestedAt: isoFromNow(-3),
    dueAt: isoFromNow(45),
    claims: [
      {
        id: "c1",
        category: "Disposition",
        text: "Decline both charges and freeze card pending customer confirmation.",
        confidence: 0.86,
        band: "likely",
        alternatives: [
          { label: "Decline + freeze", probability: 0.86 },
          { label: "Decline only", probability: 0.11 },
          { label: "Allow + monitor", probability: 0.03 },
        ],
        evidence: [
          {
            id: "e1",
            source: "Risk model features",
            excerpt: "merchant_watchlist=true · ip_country_mismatch=true · velocity_24h=4",
            reliability: "high",
          },
        ],
        flags: [],
      },
    ],
  },
  {
    id: "fin-9905",
    vertical: "finance",
    title: "OFAC screening — name match review",
    subtitle: "Fuzzy match score 0.74 — borderline",
    subjectLabel: "Counterparty: Aleksandr V.",
    modelName: "Sentinel-Sanctions",
    modelVersion: "v2.2",
    risk: "low",
    aggregateConfidence: 0.51,
    status: "in_review",
    assignee: "Elena Marquez",
    flags: ["low_confidence"],
    ingestedAt: isoFromNow(-220),
    dueAt: isoFromNow(1440),
    claims: [
      {
        id: "c1",
        category: "Screening result",
        text: "Possible match against SDN list entry; recommend manual confirmation.",
        confidence: 0.51,
        band: "unsure",
        alternatives: [
          { label: "Possible match", probability: 0.51 },
          { label: "False positive", probability: 0.44 },
          { label: "Confirmed match", probability: 0.05 },
        ],
        evidence: [
          {
            id: "e1",
            source: "OFAC SDN feed",
            excerpt: "name token similarity 0.74 · DOB partial",
            reliability: "unsure",
          },
        ],
        flags: ["low_confidence"],
      },
    ],
  },
];

export const SEED_AUDIT: AuditRecord[] = [
  {
    id: "a-1",
    itemId: "clin-2030",
    itemTitle: "Brain MRI — incidental Chiari I",
    vertical: "clinical",
    action: "accept",
    reviewer: "Dr. Priya Shah",
    timestamp: isoFromNow(-90),
  },
  {
    id: "a-2",
    itemId: "leg-7770",
    itemTitle: "NDA — confidentiality term length",
    vertical: "legal",
    action: "correct",
    reviewer: "Marcus Vance, Esq.",
    rationale: "Model said 5 years; document specifies 3 years. Corrected.",
    changedClaimIds: ["c2"],
    timestamp: isoFromNow(-180),
  },
  {
    id: "a-3",
    itemId: "fin-9890",
    itemTitle: "Wire transfer — sanctions screening",
    vertical: "finance",
    action: "escalate",
    reviewer: "Elena Marquez",
    rationale: "Borderline match; routed to senior compliance officer.",
    timestamp: isoFromNow(-260),
  },
  {
    id: "a-4",
    itemId: "clin-2025",
    itemTitle: "ECG interpretation — atrial flutter",
    vertical: "clinical",
    action: "correct",
    reviewer: "Dr. Priya Shah",
    rationale: "Model classified as A-fib; rhythm is A-flutter w/ 2:1 block.",
    changedClaimIds: ["c1"],
    timestamp: isoFromNow(-420),
  },
  {
    id: "a-5",
    itemId: "leg-7765",
    itemTitle: "Privilege log — DOC-1187",
    vertical: "legal",
    action: "reject",
    reviewer: "Marcus Vance, Esq.",
    rationale: "Not privileged. Marketing email mistakenly classified.",
    timestamp: isoFromNow(-700),
  },
  {
    id: "a-6",
    itemId: "fin-9882",
    itemTitle: "ACH return — duplicate detection",
    vertical: "finance",
    action: "accept",
    reviewer: "Elena Marquez",
    timestamp: isoFromNow(-820),
  },
];

export const ACTIVITY_SEED: ActivityEvent[] = [
  {
    id: "ev-1",
    vertical: "clinical",
    kind: "ingested",
    summary: "Aiden-Rad ingested chest CT for MRN 4471-22",
    timestamp: isoFromNow(-12),
  },
  {
    id: "ev-2",
    vertical: "legal",
    kind: "flagged",
    summary: "ClauseLens flagged hallucinated section reference in MSA v4",
    timestamp: isoFromNow(-22),
  },
  {
    id: "ev-3",
    vertical: "finance",
    kind: "flagged",
    summary: "Sentinel-AML flagged unsupported revenue claim in SAR draft",
    timestamp: isoFromNow(-30),
  },
  {
    id: "ev-4",
    vertical: "clinical",
    kind: "resolved",
    summary: "Dr. Shah corrected ECG interpretation (A-fib → A-flutter)",
    timestamp: isoFromNow(-420),
  },
];

export const ACTIVITY_TEMPLATES: Array<Omit<ActivityEvent, "id" | "timestamp">> = [
  {
    vertical: "clinical",
    kind: "ingested",
    summary: "Aiden-Rad ingested abdominal CT for triage",
  },
  {
    vertical: "legal",
    kind: "flagged",
    summary: "ClauseLens flagged ungrounded indemnity citation",
  },
  {
    vertical: "finance",
    kind: "flagged",
    summary: "Sentinel-Fraud escalated card-not-present anomaly",
  },
  {
    vertical: "clinical",
    kind: "flagged",
    summary: "ScribeMD flagged dose mismatch in discharge summary",
  },
  {
    vertical: "legal",
    kind: "ingested",
    summary: "PrivilegeAI processed batch of 1,204 discovery docs",
  },
  {
    vertical: "finance",
    kind: "resolved",
    summary: "Marquez accepted SAR narrative after edits",
  },
  {
    vertical: "clinical",
    kind: "escalated",
    summary: "Aiden-Rad output escalated to senior radiologist",
  },
  {
    vertical: "legal",
    kind: "resolved",
    summary: "Vance corrected termination-clause extraction",
  },
];

export const REVIEWERS_BY_VERTICAL: Record<Vertical, string[]> = {
  clinical: ["Dr. Priya Shah", "Dr. Adesh Rao", "Dr. Lin Chen"],
  legal: ["Marcus Vance, Esq.", "Sara Okafor, Esq.", "Jin Park, Esq."],
  finance: ["Elena Marquez", "Hiroshi Tanaka", "Ahmed Bello"],
};
