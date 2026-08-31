import React from "react";
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
import { SearchPage } from "./pages/SearchPage";
import { CallerDetailPage } from "./pages/CallerDetailPage";
import { RecordsPage } from "./pages/RecordsPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { NewCallRecordModal } from "./components/NewCallRecordModal";
import { EditCallRecordModal } from "./components/EditCallRecordModal";
import { EditCallerModal } from "./components/EditCallerModal";
import { EmailNotificationModal } from "./components/EmailNotificationModal";
import { NewCallerModal } from "./components/NewCallerModal";
import { ExcelMigratorModal } from "./components/ExcelMigratorModal";
import { ExportModal } from "./components/ExportModal";
import { LiveSyncBanner } from "./components/LiveSyncBanner";
import { ShieldCheck } from "lucide-react";

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#141312] text-[#2D2A28] dark:text-slate-100 flex flex-col selection:bg-[#FFB200]/30 selection:text-[#2D2A28] transition-colors duration-150">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full grow">
        <Outlet />
      </main>

      <NewCallRecordModal />
      <EditCallRecordModal />
      <NewCallerModal />
      <EditCallerModal />
      <ExcelMigratorModal />
      <ExportModal />
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
    <AppProvider>
      <BrowserRouter>
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
            <Route path="/stats" element={<Navigate to="/admin" replace />} />
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
      </BrowserRouter>
    </AppProvider>
  );
}
