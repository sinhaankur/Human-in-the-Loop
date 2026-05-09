import { Activity, Scale, LineChart } from "lucide-react";
import type { Vertical } from "@/types";

/**
 * The library-safe portion of vertical metadata: name, theming, and icon.
 * Used by primitives like AuditEntry that need to render per-vertical chips.
 * Kept free of demo-only strings (tenant names, reviewer names, taglines)
 * so importing it doesn't pull demo data into a real host's bundle.
 */
export interface VerticalTheme {
  id: Vertical;
  name: string;
  accentText: string;
  accentSoft: string;
  accentRing: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const VERTICAL_THEME: Record<Vertical, VerticalTheme> = {
  clinical: {
    id: "clinical",
    name: "Clinical",
    accentText: "text-clinical",
    accentSoft: "bg-clinical-soft",
    accentRing: "ring-clinical/40",
    Icon: Activity,
  },
  legal: {
    id: "legal",
    name: "Legal",
    accentText: "text-legal",
    accentSoft: "bg-legal-soft",
    accentRing: "ring-legal/40",
    Icon: Scale,
  },
  finance: {
    id: "finance",
    name: "Finance",
    accentText: "text-finance",
    accentSoft: "bg-finance-soft",
    accentRing: "ring-finance/40",
    Icon: LineChart,
  },
};

/**
 * Demo-only extension: tenant brand, reviewer persona, copy. Lives next to
 * the theme so the demo stays one import away, but is intentionally not
 * imported from any library-exported component.
 */
export interface VerticalMeta extends VerticalTheme {
  tenant: string;
  reviewer: string;
  tagline: string;
  subjectNoun: string;
}

export const VERTICAL_META: Record<Vertical, VerticalMeta> = {
  clinical: {
    ...VERTICAL_THEME.clinical,
    tenant: "Mercy Regional · Radiology AI",
    reviewer: "Dr. Priya Shah",
    tagline: "Radiology + clinical-note triage",
    subjectNoun: "patient",
  },
  legal: {
    ...VERTICAL_THEME.legal,
    tenant: "Holloway & Pierce LLP · Discovery AI",
    reviewer: "Marcus Vance, Esq.",
    tagline: "Contract & e-discovery review",
    subjectNoun: "matter",
  },
  finance: {
    ...VERTICAL_THEME.finance,
    tenant: "Ridgeline Bank · BSA/AML",
    reviewer: "Elena Marquez",
    tagline: "Fraud & compliance triage",
    subjectNoun: "case",
  },
};

export const VERTICAL_ORDER: Vertical[] = ["clinical", "legal", "finance"];
