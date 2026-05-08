import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TenantProvider } from "./state/tenant";
import { ReviewStoreProvider } from "./state/reviewStore";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <ReviewStoreProvider>
          <App />
        </ReviewStoreProvider>
      </TenantProvider>
    </BrowserRouter>
  </StrictMode>
);
