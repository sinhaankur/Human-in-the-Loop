// Typed message contract between content script, popup, and service worker.
// MV3 service workers idle out, so messages — not in-process state — are how
// content scripts notify the rest of the extension that something happened.

import type { DecisionAction, AuditRecord } from "@/types";

export type ExtMessage =
  | {
      kind: "audit/record";
      action: DecisionAction;
      itemTitle: string;
      itemId: string;
      rationale?: string;
    }
  | { kind: "state/get" }
  | { kind: "state/setEnabled"; enabled: boolean };

export type ExtResponse = { ok: true; record?: AuditRecord } | { ok: false; error: string };

export function send(msg: ExtMessage): Promise<ExtResponse> {
  return chrome.runtime.sendMessage(msg);
}
