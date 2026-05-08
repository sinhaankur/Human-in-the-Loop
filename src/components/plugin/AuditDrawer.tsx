import * as Dialog from "@radix-ui/react-dialog";
import { X, FileSearch } from "lucide-react";
import { useSentinel } from "@/state/sentinel";
import { AuditEntry } from "@/components/primitives/AuditEntry";

export function AuditDrawer() {
  const { drawerOpen, setDrawerOpen, audit } = useSentinel();
  return (
    <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-canvas shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-info" />
              <Dialog.Title className="text-sm font-semibold text-fg">
                Decisions log
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-md p-1 text-fg-muted hover:bg-surface-2 hover:text-fg">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="px-5 pt-3 text-[11px] text-fg-muted leading-relaxed">
            Every reviewer decision Sentinel recorded — paired with the AI claim it overrode,
            evidence cited, and rationale. Persisted out-of-band; the host AI tool never sees
            this surface.
          </Dialog.Description>
          <div className="space-y-2 overflow-y-auto px-5 py-4 max-h-[calc(100vh-120px)]">
            {audit.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-surface-1 px-4 py-12 text-center text-xs text-fg-muted">
                No decisions yet.
                <br />
                Submit a verdict from the rail below to log one.
              </div>
            ) : (
              audit.map((r) => <AuditEntry key={r.id} record={r} />)
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
