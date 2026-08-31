import React, { createContext, useContext } from "react";
import { Caller, CallRecord, Specialist, FilterState, Attachment, EmailNotification } from "../types";

export interface AppContextType {
  callers: Caller[];
  records: CallRecord[];
  specialists: Specialist[];
  currentSpecialist: Specialist | null;
  login: (specialist: Specialist) => void;
  logout: () => void;
  selectedCaller: Caller | null;
  setSelectedCaller: (c: Caller | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredCallers: Caller[];
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  activeTab: "SEARCH" | "ALL_RECORDS" | "STATS";
  setActiveTab: (tab: "SEARCH" | "ALL_RECORDS" | "STATS") => void;

  isNewCallerModalOpen: boolean;
  setIsNewCallerModalOpen: (open: boolean) => void;
  isNewRecordModalOpen: boolean;
  setIsNewRecordModalOpen: (open: boolean) => void;
  isExcelModalOpen: boolean;
  setIsExcelModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isAdminPanelOpen: boolean;
  setIsAdminPanelOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  showDemoFeatures: boolean;
  setShowDemoFeatures: (show: boolean) => void;

  sentEmails: EmailNotification[];
  activeEmailModal: EmailNotification | null;
  setActiveEmailModal: (email: EmailNotification | null) => void;
  getReferredRecordsForSpecialist: (specialistId: string) => CallRecord[];
  markReferralStatus: (recordId: string, status: "OCZEKUJĄCA" | "PRZYJĘTA" | "ZAKOŃCZONA") => void;

  editingRecord: CallRecord | null;
  setEditingRecord: (rec: CallRecord | null) => void;
  editingCaller: Caller | null;
  setEditingCaller: (caller: Caller | null) => void;
  updateRecord: (record: CallRecord) => void;
  deleteRecord: (recordId: string) => void;
  deleteCaller: (callerId: string) => void;
  canEditRecord: (record: CallRecord) => boolean;
  canEditCaller: (caller: Caller) => boolean;

  addSpecialist: (data: Omit<Specialist, "id"> | Specialist) => Specialist;
  updateSpecialist: (spec: Specialist) => void;
  deleteSpecialist: (specialistId: string) => void;
  mergeCallers: (sourceCallerId: string, targetCallerId: string, customMergedData?: Partial<Caller>) => void;

  addCallerAttachment: (callerId: string, attachment: Attachment) => void;
  removeCallerAttachment: (callerId: string, attachmentId: string) => void;
  addRecordAttachment: (recordId: string, attachment: Attachment) => void;
  removeRecordAttachment: (recordId: string, attachmentId: string) => void;
  addNewCaller: (data: Omit<Caller, "id" | "createdAt" | "updatedAt">) => Caller;
  addNewRecord: (data: Omit<CallRecord, "id" | "createdAt">) => CallRecord;
  updateCaller: (caller: Caller) => void;
  getCallerRecords: (callerId: string) => CallRecord[];
  applyBulkImport: (newCallers: Caller[], newRecords: CallRecord[]) => void;
  resetDatabase: () => void;
  clearDatabase: (keepSpecialists?: boolean) => void;

  livePresenceSpecialist: string | null;
  liveNotification: string | null;
  dismissNotification: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

// For components rendered exclusively behind authentication (AuthGate in App.tsx).
export const useCurrentSpecialist = (): Specialist => {
  const { currentSpecialist } = useApp();
  if (!currentSpecialist) {
    throw new Error("useCurrentSpecialist requires an authenticated specialist (behind AuthGate)");
  }
  return currentSpecialist;
};
