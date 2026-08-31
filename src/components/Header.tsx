import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp, useCurrentSpecialist } from "../context/AppContext";
import { SpecialistAvatar } from "./SpecialistAvatar";
import {
  FileSpreadsheet,
  UserPlus,
  RotateCcw,
  Search,
  ListFilter,
  BarChart3,
  ShieldCheck,
  LogOut,
  Settings,
  Sun,
  Moon,
  Inbox,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { ReferredCasesModal } from "./ReferredCasesModal";
import { UserProfileModal } from "./UserProfileModal";
import { AdminPanelModal } from "./AdminPanelModal";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    logout,
    activeTab,
    setActiveTab,
    selectedCaller,
    setSelectedCaller,
    setIsNewCallerModalOpen,
    setIsExcelModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isAdminPanelOpen,
    setIsAdminPanelOpen,
    isDarkMode,
    toggleDarkMode,
    resetDatabase,
    getReferredRecordsForSpecialist,
  } = useApp();
  const currentSpecialist = useCurrentSpecialist();

  const [isReferredModalOpen, setIsReferredModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const myReferredCases = getReferredRecordsForSpecialist(currentSpecialist.id);
  const pendingReferredCount = myReferredCases.filter(
    (r) => (r.referredStatus || "OCZEKUJĄCA") === "OCZEKUJĄCA"
  ).length;

  const handleTabChange = (tab: "SEARCH" | "ALL_RECORDS" | "STATS") => {
    setSelectedCaller(null);
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    if (tab === "SEARCH") navigate("/search");
    else if (tab === "ALL_RECORDS") navigate("/records");
    else if (tab === "STATS") navigate("/stats");
  };

  const handleAdminClick = () => {
    setIsMobileMenuOpen(false);
    navigate("/admin");
  };

  // Close mobile menu on resize to full desktop (xl: >= 1280px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="bg-[#2D2A28] text-white shadow-md border-b border-[#3E3A37] sticky top-0 z-40">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-5 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* 1. Left: Branding */}
          <div
            onClick={() => handleTabChange("SEARCH")}
            className="flex items-center space-x-2 cursor-pointer shrink-0 select-none group"
          >
            <img
              src="/synapsis-mark.png"
              alt="Fundacja SYNAPSIS"
              className="w-8 h-8 shadow-sm group-hover:scale-105 transition-transform shrink-0"
            />
            <div>
              <span className="font-black text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
                Baza Porad
              </span>
            </div>
          </div>

          {/* 2. Center: Desktop Navigation Tabs (Visible on xl: >= 1280px) */}
          <nav className="hidden xl:flex items-center space-x-1 bg-[#242220] p-1 rounded-xl border border-[#3E3A37] shrink-0">
            <button
              type="button"
              onClick={() => handleTabChange("SEARCH")}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                location.pathname === "/search" || location.pathname === "/" || location.pathname.startsWith("/callers")
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-[#34302E]"
              }`}
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>Kartoteka i szukaj</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("ALL_RECORDS")}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                location.pathname === "/records"
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-[#34302E]"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 shrink-0" />
              <span>Wszystkie wpisy</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReferredModalOpen(true)}
              className={`relative flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                pendingReferredCount > 0
                  ? "bg-[#FFB200]/20 text-[#FFDF06] border border-[#FFB200]/50 shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-[#34302E]"
              }`}
              title="Sprawy przekazane do Twojej konsultacji (Handoff)"
            >
              <Inbox className="w-3.5 h-3.5 shrink-0 text-[#FFB200]" />
              <span>Przekazane</span>
              {myReferredCases.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5 ${
                    pendingReferredCount > 0
                      ? "bg-[#FFB200] text-[#2D2A28]"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {pendingReferredCount > 0 ? pendingReferredCount : myReferredCases.length}
                </span>
              )}
              {pendingReferredCount > 0 && (
                <span className="flex h-2 w-2 relative ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB200] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFB200]"></span>
                </span>
              )}
            </button>

            {currentSpecialist.isAdmin && (
              <button
                type="button"
                onClick={() => handleTabChange("STATS")}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  location.pathname === "/stats"
                    ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#34302E]"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                <span>Raporty PFRON</span>
              </button>
            )}
          </nav>

          {/* 3. Right: Desktop Actions & User Controls (Visible on xl: >= 1280px) */}
          <div className="hidden xl:flex items-center space-x-1.5 shrink-0">
            {/* New Caller Primary CTA */}
            <button
              type="button"
              onClick={() => setIsNewCallerModalOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
              title="Zarejestruj nowy kontakt"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Nowy kontakt</span>
            </button>

            {/* Excel Importer */}
            {currentSpecialist.isAdmin && (
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className="flex items-center space-x-1 px-2 py-1.5 rounded-xl text-xs font-semibold bg-[#242220] hover:bg-[#34302E] text-slate-200 border border-[#3E3A37] transition-colors cursor-pointer whitespace-nowrap"
                title="Migracja z pliku Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Import</span>
              </button>
            )}

            {/* Admin Panel Button */}
            {currentSpecialist.isAdmin && (
              <button
                type="button"
                onClick={handleAdminClick}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                  location.pathname.startsWith("/admin")
                    ? "bg-[#FFB200] text-[#2D2A28]"
                    : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50"
                }`}
                title="Panel Administratora: scalanie kontaktów, zarządzanie dyżurującymi, bazy danych"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </button>
            )}

            {/* Reset Demo Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Czy na pewno chcesz przywrócić początkową bazę danych demo?")) {
                  resetDatabase();
                }
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#34302E] border border-[#3E3A37] transition-colors cursor-pointer shrink-0"
              title="Przywróć dane demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Logged-in Specialist Profile */}
            <div className="border-l border-[#3E3A37] pl-2 ml-0.5 flex items-center space-x-1.5">
              <div className="flex items-center space-x-2 bg-[#242220] py-1 px-2.5 rounded-xl border border-[#3E3A37]">
                <div className="relative shrink-0">
                  <SpecialistAvatar
                    name={currentSpecialist.name}
                    avatarBg={currentSpecialist.avatarBg}
                    avatarUrl={currentSpecialist.avatarUrl}
                    className="w-7 h-7 rounded-lg text-[10px] font-black"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-[#242220]"></span>
                  </span>
                </div>
                <div className="text-left select-none">
                  <div className="text-[9px] font-bold leading-none text-slate-300">
                    {currentSpecialist.isAdmin ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Administrator
                      </span>
                    ) : (
                      <span className="text-slate-300">Dyżurujący</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white whitespace-nowrap">
                    {currentSpecialist.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Wyloguj się"
                  aria-label="Wyloguj się"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#34302E] transition-colors cursor-pointer shrink-0 ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Edit Profile Button (for everyone) */}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="p-1.5 bg-[#242220] hover:bg-[#34302E] text-slate-300 hover:text-white rounded-xl border border-[#3E3A37] transition-colors cursor-pointer shrink-0"
                title="Edytuj swój profil i adres e-mail do powiadomień"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* Dark Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-1.5 bg-[#242220] hover:bg-[#34302E] text-slate-300 hover:text-white rounded-xl border border-[#3E3A37] transition-all cursor-pointer shrink-0 flex items-center justify-center"
                title={isDarkMode ? "Przełącz na tryb jasny" : "Przełącz na tryb ciemny"}
              >
                {isDarkMode ? (
                  <Sun className="w-3.5 h-3.5 text-[#FFB200]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* 4. Responsive Bar (Visible on < xl: phones, tablets, small laptops) */}
          <div className="flex xl:hidden items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Quick New Contact */}
            <button
              type="button"
              onClick={() => setIsNewCallerModalOpen(true)}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] shadow-xs cursor-pointer"
              title="Zarejestruj nową osobę"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nowy kontakt</span>
            </button>

            {/* Quick Handoff Button (if has cases) */}
            <button
              type="button"
              onClick={() => setIsReferredModalOpen(true)}
              className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-colors relative cursor-pointer ${
                pendingReferredCount > 0
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-[#242220] text-slate-300 border-[#3E3A37]"
              }`}
              title="Przekazane sprawy (Handoff)"
            >
              <Inbox className="w-3.5 h-3.5 text-[#FFB200]" />
              <span className="hidden md:inline text-xs font-bold">Przekazane</span>
              {myReferredCases.length > 0 && (
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5 ${
                    pendingReferredCount > 0
                      ? "bg-[#FFB200] text-[#2D2A28]"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {pendingReferredCount > 0 ? pendingReferredCount : myReferredCases.length}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-1.5 bg-[#242220] hover:bg-[#34302E] text-slate-300 hover:text-white rounded-xl border border-[#3E3A37] transition-all cursor-pointer flex items-center justify-center"
              title={isDarkMode ? "Tryb jasny" : "Tryb ciemny"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-[#FFB200]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* User Avatar Compact Badge */}
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-1.5 bg-[#242220] border border-[#3E3A37] hover:border-[#FFB200] py-1 px-1.5 rounded-xl cursor-pointer transition-colors"
              title={`Zalogowano: ${currentSpecialist.name} (kliknij, aby edytować profil)`}
            >
              <SpecialistAvatar
                name={currentSpecialist.name}
                avatarBg={currentSpecialist.avatarBg}
                avatarUrl={currentSpecialist.avatarUrl}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-[10px] font-black shrink-0"
              />
              <span className="hidden md:inline text-xs font-bold text-white max-w-[160px] truncate pr-1">
                {currentSpecialist.name}
              </span>
            </div>

            {/* Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Otwórz menu nawigacji"
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isMobileMenuOpen
                  ? "bg-[#FFB200] text-[#2D2A28] border-[#FFB200]"
                  : "bg-[#242220] text-slate-200 border-[#3E3A37] hover:bg-[#34302E]"
              }`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Mobile & Tablet Menu Drawer (Shown when isMobileMenuOpen is true) */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#242220] border-t border-[#3E3A37] px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          {/* User Profile Card in Mobile Menu */}
          <div className="bg-[#1A1918] border border-[#3E3A37] rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <SpecialistAvatar
                name={currentSpecialist.name}
                avatarBg={currentSpecialist.avatarBg}
                avatarUrl={currentSpecialist.avatarUrl}
                className="w-9 h-9 rounded-xl text-xs font-black shrink-0 shadow-xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs truncate">{currentSpecialist.name}</span>
                  {currentSpecialist.isAdmin && (
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-bold">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#FFB200] truncate font-medium">{currentSpecialist.role}</div>
                <div className="text-[10px] text-slate-300 font-mono truncate">{currentSpecialist.email}</div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="p-2 bg-[#2D2A28] hover:bg-[#383431] text-slate-300 hover:text-white rounded-xl border border-[#3E3A37] transition-colors cursor-pointer"
                title="Edytuj profil"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl border border-rose-800/50 transition-colors cursor-pointer"
                title="Wyloguj się"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-2 mb-1">
              Nawigacja
            </div>

            <button
              type="button"
              onClick={() => handleTabChange("SEARCH")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "SEARCH" && !selectedCaller
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-200 hover:bg-[#2D2A28]"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Search className="w-4 h-4" />
                <span>Baza historii kontaktów</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("ALL_RECORDS")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ALL_RECORDS" && !selectedCaller
                  ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                  : "text-slate-200 hover:bg-[#2D2A28]"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ListFilter className="w-4 h-4" />
                <span>Wszystkie wpisy rejestru porad</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            {/* Przekazane sprawy */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsReferredModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-[#2D2A28] transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Inbox className="w-4 h-4 text-[#FFB200]" />
                <span>Przekazane sprawy (Handoff)</span>
              </div>
              {pendingReferredCount > 0 ? (
                <span className="bg-[#FFB200] text-[#2D2A28] text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                  {pendingReferredCount} nowe
                </span>
              ) : (
                <span className="text-[10px] text-slate-300 font-mono">
                  {myReferredCases.length}
                </span>
              )}
            </button>

            {currentSpecialist.isAdmin && (
              <button
                type="button"
                onClick={() => handleTabChange("STATS")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "STATS" && !selectedCaller
                    ? "bg-[#FFB200] text-[#2D2A28] shadow-xs"
                    : "text-slate-200 hover:bg-[#2D2A28]"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>Raporty PFRON i analityka</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )}
          </div>

          {/* Quick Actions in Mobile Menu */}
          <div className="space-y-1 pt-2 border-t border-[#3E3A37]">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-2 mb-1">
              Akcje i narzędzia
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsNewCallerModalOpen(true);
              }}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Zarejestruj nową osobę</span>
            </button>

            {currentSpecialist.isAdmin && (
              <>
                <button
                  type="button"
                  onClick={handleAdminClick}
                  className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Panel Administratora (Dashboard, Bazy, Scalanie)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsExcelModalOpen(true);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 bg-[#1E1C1A] hover:bg-[#2D2A28] text-slate-200 border border-[#3E3A37] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Importuj bazę z pliku Excel</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (window.confirm("Czy na pewno chcesz przywrócić początkową bazę danych demo?")) {
                  resetDatabase();
                }
              }}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer pt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Przywróć bazę demo</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals rendered conditionally */}
      <ReferredCasesModal isOpen={isReferredModalOpen} onClose={() => setIsReferredModalOpen(false)} />
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <AdminPanelModal isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
    </header>
  );
};
