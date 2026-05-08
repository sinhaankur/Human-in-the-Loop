import type { ReactNode } from "react";
import { ArrowRight, Bell, Settings, User } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  /** Host AI tool brand name (Aiden-Rad, ClauseLens, etc.) */
  brand: string;
  /** Brand iconography */
  BrandIcon: React.ComponentType<{ className?: string }>;
  /** Tailwind text color for brand accent (NOT a Sentinel accent — this is the host's brand) */
  brandAccent: string;
  /** Subject under review banner */
  subjectLabel: string;
  /** Brief context line under the subject */
  contextLine: string;
  /** The pretend reviewer name in the host tool's chrome */
  reviewerName: string;
  children: ReactNode;
  /** Right-rail content (optional — e.g. fake DICOM viewer, document preview) */
  rightRail?: ReactNode;
}

/**
 * Renders host AI tool chrome — top bar, subject banner, main content area —
 * to make it visually obvious the user is *inside someone else's product*.
 * Sentinel wraps claims rendered into `children`.
 */
export function HostChrome({
  brand,
  BrandIcon,
  brandAccent,
  subjectLabel,
  contextLine,
  reviewerName,
  children,
  rightRail,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 shadow-2xl shadow-black/40 overflow-hidden">
      {/* Host top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-md bg-canvas", brandAccent)}>
            <BrandIcon className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className={cn("text-xs font-semibold", brandAccent)}>{brand}</div>
            <div className="text-[9px] uppercase tracking-wider text-fg-subtle">
              host AI tool
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-fg-subtle">
          <Bell className="h-3.5 w-3.5" />
          <Settings className="h-3.5 w-3.5" />
          <div className="ml-1 flex items-center gap-1.5 rounded-md border border-border bg-surface-1 px-2 py-1 text-[10px] text-fg-muted">
            <User className="h-3 w-3" />
            {reviewerName}
          </div>
        </div>
      </div>

      {/* Subject banner */}
      <div className="border-b border-border bg-surface-1 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-fg-subtle">{contextLine}</div>
          <div className="text-sm font-semibold text-fg">{subjectLabel}</div>
        </div>
        <button className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-fg-muted hover:bg-surface-3">
          Next item <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Main content + optional right rail */}
      <div className={cn("grid", rightRail ? "grid-cols-[1fr_320px]" : "grid-cols-1")}>
        <div className="px-6 py-5 min-h-[480px]">{children}</div>
        {rightRail && (
          <div className="border-l border-border bg-canvas/40 px-4 py-5">
            {rightRail}
          </div>
        )}
      </div>
    </div>
  );
}
