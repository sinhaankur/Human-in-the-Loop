import { useEffect, useState } from "react";
import { ShieldCheck, ExternalLink, FileSearch, Power } from "lucide-react";
import { readState, writeState, subscribe, type SentinelExtState } from "../shared/storage";

export function Popup() {
  const [state, setState] = useState<SentinelExtState | null>(null);

  useEffect(() => {
    readState().then(setState);
    return subscribe(setState);
  }, []);

  if (!state) {
    return (
      <div className="w-[320px] p-4 bg-canvas text-fg-muted text-xs">Loading…</div>
    );
  }

  return (
    <div className="w-[320px] bg-canvas text-fg font-sans">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <ShieldCheck className="h-4 w-4 text-info" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Sentinel</div>
          <div className="text-[10px] text-fg-muted">Inline AI oversight</div>
        </div>
        <span
          className={
            "rounded-full px-2 py-0.5 text-[10px] font-medium " +
            (state.enabled
              ? "bg-confidence-high/15 text-confidence-high border border-confidence-high/30"
              : "bg-surface-2 text-fg-subtle border border-border")
          }
        >
          {state.enabled ? "active" : "paused"}
        </span>
      </header>

      <div className="px-4 py-3 space-y-3">
        <button
          onClick={() => writeState({ enabled: !state.enabled })}
          className="flex w-full items-center justify-between rounded-md border border-border bg-surface-1 px-3 py-2 text-left text-xs hover:bg-surface-2"
        >
          <span className="flex items-center gap-2">
            <Power className="h-3.5 w-3.5 text-fg-muted" />
            <span className="font-medium">
              {state.enabled ? "Pause oversight on this tab" : "Resume oversight"}
            </span>
          </span>
          <span className="text-[10px] text-fg-subtle">
            {state.enabled ? "ON" : "OFF"}
          </span>
        </button>

        <div className="rounded-md border border-border bg-surface-1 px-3 py-2.5">
          <div className="flex items-center gap-2 text-[11px] text-fg-muted">
            <FileSearch className="h-3.5 w-3.5 text-info" />
            <span>Decisions logged</span>
            <span className="ml-auto text-fg tabular-nums font-semibold">
              {state.auditCount}
            </span>
          </div>
          {state.lastAudit && (
            <div className="mt-1.5 text-[10px] text-fg-subtle leading-snug">
              Last: <span className="text-fg-muted">{state.lastAudit.action}</span>
              {" · "}
              <span className="text-fg-muted">{state.lastAudit.itemTitle}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            const url = chrome.runtime.getURL("src/sandbox/index.html");
            chrome.tabs.create({ url });
          }}
          className="flex w-full items-center justify-between rounded-md border border-info/40 bg-info/8 px-3 py-2 text-xs text-fg hover:bg-info/15"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-info" />
            <span className="font-medium">Open sandbox demo</span>
          </span>
          <span className="text-[10px] text-fg-subtle">always works</span>
        </button>

        <p className="text-[10px] text-fg-subtle leading-snug">
          Sentinel overlays on AI responses at chatgpt.com. Confidence and
          evidence are illustrative — a speculative concept for what oversight
          UI would look like if vendors exposed model internals.
        </p>
      </div>
    </div>
  );
}
