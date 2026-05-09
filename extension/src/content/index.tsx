import { createRoot, type Root } from "react-dom/client";
import cssText from "@/index.css?inline";
import { paragraphsToClaims } from "./fakeInference";
import { Overlay } from "./Overlay";
import { readState, subscribe } from "../shared/storage";

// ChatGPT-DOM adapter. The selectors are deliberately defensive — assistant
// messages are identified by ARIA role, not class names, since OpenAI ships
// internal Tailwind class hashes that change between deploys.
const HOST_LABEL = "ChatGPT";
const ASSISTANT_SELECTOR = '[data-message-author-role="assistant"]';
const PROCESSED_ATTR = "data-sentinel-processed";
const SETTLE_MS = 1200;

let enabled = true;
let observer: MutationObserver | null = null;
const mounted = new WeakMap<Element, { host: HTMLElement; root: Root }>();
const settleTimers = new WeakMap<Element, number>();

bootstrap();

async function bootstrap() {
  const state = await readState();
  enabled = state.enabled;
  subscribe((s) => {
    enabled = s.enabled;
    if (!enabled) teardownAll();
    else scanExisting();
  });

  if (enabled) scanExisting();
  startObserver();
}

function startObserver() {
  observer?.disconnect();
  observer = new MutationObserver(() => {
    if (!enabled) return;
    scanExisting();
  });
  observer.observe(document.body, { subtree: true, childList: true });
}

function scanExisting() {
  document
    .querySelectorAll<HTMLElement>(`${ASSISTANT_SELECTOR}:not([${PROCESSED_ATTR}])`)
    .forEach(scheduleProcess);
}

/**
 * ChatGPT streams tokens; we wait for the message to stop changing for
 * SETTLE_MS before treating it as final and parsing claims out of it.
 */
function scheduleProcess(el: HTMLElement) {
  const existing = settleTimers.get(el);
  if (existing) window.clearTimeout(existing);
  const timer = window.setTimeout(() => process(el), SETTLE_MS);
  settleTimers.set(el, timer);

  // Watch this specific message for further mutations to keep extending the
  // settle window while tokens are still arriving.
  const inner = new MutationObserver(() => {
    const t = settleTimers.get(el);
    if (t) window.clearTimeout(t);
    const t2 = window.setTimeout(() => {
      process(el);
      inner.disconnect();
    }, SETTLE_MS);
    settleTimers.set(el, t2);
  });
  inner.observe(el, { subtree: true, childList: true, characterData: true });
}

function process(el: HTMLElement) {
  if (el.hasAttribute(PROCESSED_ATTR)) return;
  el.setAttribute(PROCESSED_ATTR, "true");

  const paragraphs = extractParagraphs(el);
  const claims = paragraphsToClaims(paragraphs);
  if (claims.length === 0) return;

  const host = document.createElement("div");
  host.dataset.sentinelHost = "true";
  host.style.all = "initial"; // shield from host page styles
  host.style.display = "block";
  host.style.fontFamily = "Inter, ui-sans-serif, system-ui, sans-serif";
  el.after(host);

  const shadow = host.attachShadow({ mode: "open" });
  const styleEl = document.createElement("style");
  styleEl.textContent = cssText;
  shadow.appendChild(styleEl);

  const mountPoint = document.createElement("div");
  mountPoint.className = "dark"; // theme token activator
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(<Overlay claims={claims} hostLabel={HOST_LABEL} />);
  mounted.set(el, { host, root });
}

function extractParagraphs(el: HTMLElement): string[] {
  // Prefer paragraph blocks; fall back to list items; ignore code blocks
  // (they're rarely natural-language claims and break sentence parsing).
  const blocks = el.querySelectorAll<HTMLElement>("p, li");
  const out: string[] = [];
  blocks.forEach((b) => {
    if (b.closest("pre, code")) return;
    const text = b.innerText.trim();
    if (text) out.push(text);
  });
  // If the message has no <p>/<li> (rare — short replies), use innerText.
  if (out.length === 0) {
    const text = el.innerText.trim();
    if (text) out.push(text);
  }
  return out;
}

function teardownAll() {
  document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach((el) => {
    const m = mounted.get(el);
    if (m) {
      m.root.unmount();
      m.host.remove();
      mounted.delete(el);
    }
    el.removeAttribute(PROCESSED_ATTR);
  });
}
