import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { SentinelProvider } from "./state/sentinel";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SentinelProvider>
      <App />
    </SentinelProvider>
  </StrictMode>
);
