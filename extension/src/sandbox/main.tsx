import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DemoFrame } from "@/components/demo/DemoFrame";
import { SentinelProvider } from "@/state/sentinel";
import "@/index.css";

// The sandbox boots the same DemoFrame the React app uses, packaged inside
// the extension. Reviewers can open it from the popup and always get a
// working demo, independent of whether ChatGPT's DOM has drifted today.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SentinelProvider>
      <DemoFrame />
    </SentinelProvider>
  </StrictMode>
);
