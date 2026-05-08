import { AlertTriangle, ShieldOff, FileWarning, Lock } from "lucide-react";
import type { FlagKind } from "@/types";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/cn";

interface Props {
  kind: FlagKind;
  size?: "sm" | "md";
  className?: string;
}

const FLAG_META: Record<
  FlagKind,
  { label: string; tooltip: string; Icon: React.ComponentType<{ className?: string }>; cls: string }
> = {
  hallucination: {
    label: "Hallucination",
    tooltip:
      "Claim is not grounded in any source evidence. Verify before accepting — the model may have fabricated this.",
    Icon: AlertTriangle,
    cls: "text-hallucination border-hallucination/45 bg-hatch-hallucination",
  },
  low_confidence: {
    label: "Low confidence",
    tooltip: "Model uncertainty exceeds the policy threshold for this category.",
    Icon: FileWarning,
    cls: "text-confidence-low border-confidence-low/40 bg-confidence-low/8",
  },
  out_of_distribution: {
    label: "Out of distribution",
    tooltip: "Input differs meaningfully from the model's training data.",
    Icon: ShieldOff,
    cls: "text-confidence-medium border-confidence-medium/40 bg-confidence-medium/8",
  },
  policy: {
    label: "Policy review",
    tooltip: "Output triggered a policy rule that requires human review.",
    Icon: ShieldOff,
    cls: "text-info border-info/40 bg-info/8",
  },
  pii: {
    label: "PII present",
    tooltip: "Output contains personally identifiable information — handle accordingly.",
    Icon: Lock,
    cls: "text-info border-info/40 bg-info/8",
  },
};

/**
 * A flag chip — visually distinct *per kind*. Hallucination uses a diagonal
 * cross-hatch so it never reads as just "another low-confidence warning".
 * Low confidence ≠ hallucination ≠ out-of-distribution; the design language
 * has to carry that distinction.
 */
export function HallucinationChip({ kind, size = "md", className }: Props) {
  const meta = FLAG_META[kind];
  const { Icon } = meta;
  return (
    <Tooltip content={<span className="block max-w-[18rem]">{meta.tooltip}</span>}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border font-medium uppercase tracking-wide",
          size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
          meta.cls,
          className
        )}
      >
        <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        {meta.label}
      </span>
    </Tooltip>
  );
}
