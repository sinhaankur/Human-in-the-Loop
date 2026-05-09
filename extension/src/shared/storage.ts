// Single source of truth for what the extension persists across sessions.
// Lives in chrome.storage.local because the MV3 service worker cannot keep
// in-memory state across its event-driven lifecycle.

import type { AuditRecord } from "@/types";

export interface SentinelExtState {
  enabled: boolean;
  auditCount: number;
  lastAudit: AuditRecord | null;
}

const DEFAULTS: SentinelExtState = {
  enabled: true,
  auditCount: 0,
  lastAudit: null,
};

const KEY = "sentinel:state";

export async function readState(): Promise<SentinelExtState> {
  const result = await chrome.storage.local.get(KEY);
  return { ...DEFAULTS, ...(result[KEY] as Partial<SentinelExtState> | undefined) };
}

export async function writeState(patch: Partial<SentinelExtState>): Promise<SentinelExtState> {
  const current = await readState();
  const next = { ...current, ...patch };
  await chrome.storage.local.set({ [KEY]: next });
  return next;
}

export function subscribe(listener: (state: SentinelExtState) => void): () => void {
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string
  ) => {
    if (areaName !== "local" || !(KEY in changes)) return;
    listener({ ...DEFAULTS, ...(changes[KEY].newValue as Partial<SentinelExtState>) });
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
