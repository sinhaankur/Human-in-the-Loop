// MV3 service worker. Event-driven, no DOM, dies when idle. Anything we
// need to remember lives in chrome.storage.local — never in module scope.

import type { AuditRecord } from "@/types";
import { readState, writeState } from "../shared/storage";
import type { ExtMessage, ExtResponse } from "../shared/messages";

chrome.runtime.onInstalled.addListener(async () => {
  // Seed default state on install so the popup never sees an empty store.
  await writeState({});
});

chrome.runtime.onMessage.addListener(
  (msg: ExtMessage, _sender, sendResponse: (r: ExtResponse) => void) => {
    handle(msg)
      .then(sendResponse)
      .catch((e: unknown) =>
        sendResponse({ ok: false, error: e instanceof Error ? e.message : String(e) })
      );
    // Return true to keep the message channel open for the async response.
    return true;
  }
);

async function handle(msg: ExtMessage): Promise<ExtResponse> {
  switch (msg.kind) {
    case "state/get": {
      await readState();
      return { ok: true };
    }
    case "state/setEnabled": {
      await writeState({ enabled: msg.enabled });
      return { ok: true };
    }
    case "audit/record": {
      const current = await readState();
      const record: AuditRecord = {
        id: `dec-${Date.now()}`,
        itemId: msg.itemId,
        itemTitle: msg.itemTitle,
        vertical: "clinical",
        action: msg.action,
        reviewer: "extension-user",
        rationale: msg.rationale,
        timestamp: new Date().toISOString(),
      };
      await writeState({
        auditCount: current.auditCount + 1,
        lastAudit: record,
      });
      return { ok: true, record };
    }
  }
}
