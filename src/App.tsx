import React, { Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";

import { Header } from "./components/Header";
import { LoginScreen } from "./components/LoginScreen";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { NewCallRecordModal } from "./components/NewCallRecordModal";
import { EditCallRecordModal } from "./components/EditCallRecordModal";
import { EditCallerModal } from "./components/EditCallerModal";
import { EmailNotificationModal } from "./components/EmailNotificationModal";
import { NewCallerModal } from "./components/NewCallerModal";
import { LiveSyncBanner } from "./components/LiveSyncBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ShieldCheck } from "lucide-react";

// Lazy-loaded routes and heavy modals (Rule 2.4 / 1.6: Dynamic Imports & Suspense Boundaries)
const SearchPage = React.lazy(() =>
  import("./pages/SearchPage").then((m) => ({ default: m.SearchPage }))
);
const CallerDetailPage = React.lazy(() =>
  import("./pages/CallerDetailPage").then((m) => ({ default: m.CallerDetailPage }))
);
const RecordsPage = React.lazy(() =>
  import("./pages/RecordsPage").then((m) => ({ default: m.RecordsPage }))
);
const StatsPage = React.lazy(() =>
  import("./pages/StatsPage").then((m) => ({ default: m.StatsPage }))
);
const AdminDashboard = React.lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const UnauthorizedPage = React.lazy(() =>
  import("./pages/UnauthorizedPage").then((m) => ({ default: m.UnauthorizedPage }))
);
const NotFoundPage = React.lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);
const ExcelMigratorModal = React.lazy(() =>
  import("./components/ExcelMigratorModal").then((m) => ({ default: m.ExcelMigratorModal }))
);
const ExportModal = React.lazy(() =>
  import("./components/ExportModal").then((m) => ({ default: m.ExportModal }))
);

const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[320px] py-12 text-slate-500 dark:text-slate-400">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-[#FFB200] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold">Ładowanie widoku...</span>
    </div>
  </div>
);

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#141312] text-[#2D2A28] dark:text-slate-100 flex flex-col selection:bg-[#FFB200]/30 selection:text-[#2D2A28] transition-colors duration-150">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full grow">
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <NewCallRecordModal />
      <EditCallRecordModal />
      <NewCallerModal />
      <EditCallerModal />
      <Suspense fallback={null}>
        <ExcelMigratorModal />
        <ExportModal />
      </Suspense>
      <LiveSyncBanner />
      <EmailNotificationModal />

      <footer className="mt-auto py-6 border-t border-slate-200 dark:border-[#2C2927] bg-white dark:bg-[#1A1817] text-center text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            UnAIted &bull; <strong>Wspólna baza historii rozmów dla dyżurujących specjalistów</strong>
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Szyfrowanie zgodne z art. 9 RODO (dane medyczne) &bull; Linia PFRON &bull; JWT Secured
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/search" replace />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/callers/:id" element={<CallerDetailPage />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
    </ErrorBoundary>
  );
}

