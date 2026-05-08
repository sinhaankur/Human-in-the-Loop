import { Activity, Image as ImageIcon, FileText } from "lucide-react";
import { HostChrome } from "../HostChrome";
import { SentinelClaim } from "@/components/plugin/SentinelClaim";
import { useScenarioItem } from "@/state/sentinel";
import { cn } from "@/lib/cn";

/** Aiden-Rad — a fictional radiology triage AI workstation. */
export function RadiologyHost() {
  const item = useScenarioItem();

  return (
    <HostChrome
      brand="Aiden-Rad"
      BrandIcon={Activity}
      brandAccent="text-clinical"
      subjectLabel={item.subjectLabel}
      contextLine={`Chest CT · ordered 2026-05-08 · ${item.modelName} ${item.modelVersion}`}
      reviewerName="Dr. Priya Shah, Radiologist"
      rightRail={<DicomViewer />}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <FileText className="h-3.5 w-3.5 text-fg-subtle" />
          <span className="text-fg-muted font-medium">AI-generated findings</span>
          <span className="text-fg-subtle">
            · auto-drafted from contrast-phase series
          </span>
        </div>

        <div className="space-y-3">
          {item.claims.map((claim, i) => (
            <SentinelClaim
              key={claim.id}
              claim={claim}
              bareLabel={`${i + 1}. ${claim.category}`}
            />
          ))}
        </div>

        <div className="pt-2 border-t border-border text-[11px] text-fg-subtle">
          Recommend follow-up: see findings 1–3. Auto-draft saved 11:42 — sign to release report.
        </div>
      </div>
    </HostChrome>
  );
}

function DicomViewer() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-fg-subtle">
        <ImageIcon className="h-3 w-3" />
        DICOM viewer
      </div>
      {/* Faux scan tile */}
      <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-black">
        <div className="absolute inset-0 bg-gradient-radial from-fg-subtle/15 via-canvas to-black" />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 52% 58%, rgba(220,220,220,0.18) 0%, rgba(120,120,120,0.06) 30%, transparent 60%)",
          }}
        />
        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-full bg-confidence-low/30" />
          <div className="absolute h-full w-px bg-confidence-low/30" />
        </div>
        {/* Annotation */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-confidence-low border border-confidence-low/40">
          <span className="h-1 w-1 rounded-full bg-confidence-low animate-pulse-soft" />
          IM-44 · slice 44/96
        </div>
        <div className="absolute bottom-3 left-3 text-[9px] font-mono text-fg-muted">
          120 kVp · 230 mAs · 0.6 mm
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {["IM-21", "IM-44", "IM-46"].map((label, i) => (
          <div
            key={label}
            className={cn(
              "aspect-square rounded border bg-black/80 flex items-center justify-center text-[9px] font-mono text-fg-muted",
              i === 1 ? "border-confidence-low/50" : "border-border"
            )}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="rounded-md border border-border bg-surface-1 p-2.5 text-[10px] text-fg-muted">
        <div className="font-medium text-fg mb-1">Patient context</div>
        64F, hx of A-fib on apixaban. CC: pleuritic chest pain, 2-day onset.
        Labs: D-dimer 4.2 µg/mL.
      </div>
    </div>
  );
}
