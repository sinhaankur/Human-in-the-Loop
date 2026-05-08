import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/shell/AppShell";
import { OverviewPage } from "@/pages/OverviewPage";
import { QueuePage } from "@/pages/QueuePage";
import { ReviewPage } from "@/pages/ReviewPage";
import { AuditPage } from "@/pages/AuditPage";
import { PolicyPage } from "@/pages/PolicyPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/review/:itemId" element={<ReviewPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/policy" element={<PolicyPage />} />
      </Routes>
    </AppShell>
  );
}
