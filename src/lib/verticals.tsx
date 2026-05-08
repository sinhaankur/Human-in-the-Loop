import { Activity, Scale, LineChart } from "lucide-react";
import type { Vertical } from "@/types";

export interface VerticalMeta {
  id: Vertical;
  name: string;
  tenant: string;
  reviewer: string;
  /** Tailwind text color class for the accent */
  accentText: string;
  /** Tailwind background-soft class */
  accentSoft: string;
  /** Tailwind ring class */
  accentRing: string;
  /** Short tagline */
  tagline: string;
  /** Subject noun ("patient", "matter", "case") */
  subjectNoun: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const VERTICAL_META: Record<Vertical, VerticalMeta> = {
  clinical: {
    id: "clinical",
    name: "Clinical",
    tenant: "Mercy Regional · Radiology AI",
    reviewer: "Dr. Priya Shah",
    accentText: "text-clinical",
    accentSoft: "bg-clinical-soft",
    accentRing: "ring-clinical/40",
    tagline: "Radiology + clinical-note triage",
    subjectNoun: "patient",
    Icon: Activity,
  },
  legal: {
    id: "legal",
    name: "Legal",
    tenant: "Holloway & Pierce LLP · Discovery AI",
    reviewer: "Marcus Vance, Esq.",
    accentText: "text-legal",
    accentSoft: "bg-legal-soft",
    accentRing: "ring-legal/40",
    tagline: "Contract & e-discovery review",
    subjectNoun: "matter",
    Icon: Scale,
  },
  finance: {
    id: "finance",
    name: "Finance",
    tenant: "Ridgeline Bank · BSA/AML",
    reviewer: "Elena Marquez",
    accentText: "text-finance",
    accentSoft: "bg-finance-soft",
    accentRing: "ring-finance/40",
    tagline: "Fraud & compliance triage",
    subjectNoun: "case",
    Icon: LineChart,
  },
};

export const VERTICAL_ORDER: Vertical[] = ["clinical", "legal", "finance"];
