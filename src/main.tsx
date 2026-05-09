import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { SentinelProvider } from "./state/sentinel";
import { REVIEW_ITEMS } from "./data/mockData";
import { VERTICAL_META } from "./lib/verticals";
import "./index.css";

// The demo wires its mock data and per-vertical reviewer names into the
// provider here. The library itself ships with no built-in data — a real
// host app would do the same wiring against its own review items and
// authenticated user.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SentinelProvider
      items={REVIEW_ITEMS}
      reviewerFor={(v) => VERTICAL_META[v].reviewer}
    >
      <App />
    </SentinelProvider>
  </StrictMode>
);
