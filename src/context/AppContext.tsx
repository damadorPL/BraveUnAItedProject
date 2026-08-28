import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Caller, CallRecord, Specialist, FilterState, SyncMessage, Attachment } from "../types";
import {
  loadCallers,
  saveCallers,
  loadRecords,
  saveRecords,
  loadSpecialists,
  resetToSampleData,
  searchCallers,
} from "../services/storage";

interface AppContextType {
  callers: Caller[];
  records: CallRecord[];
  specialists: Specialist[];
  currentSpecialist: Specialist;
  setCurrentSpecialist: (s: Specialist) => void;
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

  livePresenceSpecialist: string | null;
  liveNotification: string | null;
  dismissNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SYNC_CHANNEL_NAME = "unaited_call_history_sync_v1";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [callers, setCallers] = useState<Caller[]>(() => loadCallers());
  const [records, setRecords] = useState<CallRecord[]>(() => loadRecords());
  const [specialists] = useState<Specialist[]>(() => loadSpecialists());
  const [currentSpecialist, setCurrentSpecialist] = useState<Specialist>(() => specialists[0]);

  const [selectedCaller, setSelectedCaller] = useState<Caller | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"SEARCH" | "ALL_RECORDS" | "STATS">("SEARCH");

  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: "",
    voivodeship: "",
    guidanceType: "",
    guidanceArea: "",
    beneficiaryType: "",
    specialistId: "",
    dateFrom: "",
    dateTo: "",
  });

  const [isNewCallerModalOpen, setIsNewCallerModalOpen] = useState(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [livePresenceSpecialist, setLivePresenceSpecialist] = useState<string | null>(null);
  const [liveNotification, setLiveNotification] = useState<string | null>(null);

  // Use persistent Ref for BroadcastChannel to avoid lifecycle open/close races
  const channelRef = useRef<BroadcastChannel | null>(null);
  const currentSpecialistRef = useRef(currentSpecialist);
  const selectedCallerRef = useRef(selectedCaller);

  useEffect(() => {
    currentSpecialistRef.current = currentSpecialist;
  }, [currentSpecialist]);

  useEffect(() => {
    selectedCallerRef.current = selectedCaller;
  }, [selectedCaller]);

  // Safe Broadcast sender helper
  const broadcast = useCallback((msg: Omit<SyncMessage, "senderId" | "senderName" | "timestamp">) => {
    try {
      if (channelRef.current) {
        const fullMsg: SyncMessage = {
          ...msg,
          senderId: currentSpecialistRef.current.id,
          senderName: currentSpecialistRef.current.name,
          timestamp: Date.now(),
        };
        channelRef.current.postMessage(fullMsg);
      }
    } catch (err) {
      console.warn("BroadcastChannel error ignored:", err);
    }
  }, []);

  // Initialize BroadcastChannel once on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channelRef.current = bc;

      bc.onmessage = (event: MessageEvent<SyncMessage>) => {
        const msg = event.data;
        if (!msg || msg.senderId === currentSpecialistRef.current.id) return;

        if (msg.type === "RECORD_ADDED") {
          const freshRecords = loadRecords();
          setRecords(freshRecords);
          setLiveNotification((msg.senderName || "Inny dyżurujący") + " dodał/a nową poradę w systemie!");
        } else if (msg.type === "CALLER_ADDED") {
          const freshCallers = loadCallers();
          setCallers(freshCallers);
          setLiveNotification((msg.senderName || "Inny dyżurujący") + " zarejestrował/a nowy kontakt.");
        } else if (msg.type === "BULK_IMPORT") {
          setCallers(loadCallers());
          setRecords(loadRecords());
          setLiveNotification((msg.senderName || "Inny dyżurujący") + " zaimportował/a bazę z Excela.");
        } else if (msg.type === "PRESENCE_PING") {
          if (
            selectedCallerRef.current &&
            msg.payload &&
            msg.payload.callerId === selectedCallerRef.current.id
          ) {
            setLivePresenceSpecialist(msg.senderName || "Inny specjalista");
            setTimeout(() => setLivePresenceSpecialist(null), 8000);
          }
        }
      };

      return () => {
        try {
          bc.close();
        } catch (_) {}
        channelRef.current = null;
      };
    }
  }, []);

  // Broadcast presence ping when caller is selected
  useEffect(() => {
    if (selectedCaller) {
      broadcast({
        type: "PRESENCE_PING",
        payload: { callerId: selectedCaller.id },
      });
    }
  }, [selectedCaller, broadcast]);

  const dismissNotification = useCallback(() => {
    setLiveNotification(null);
  }, []);

  const filteredCallers = useMemo(() => {
    return searchCallers(searchQuery, callers);
  }, [searchQuery, callers]);

  const getCallerRecords = useCallback(
    (callerId: string) => {
      if (!callerId) return [];
      return records
        .filter((r) => r.callerId === callerId)
        .sort((a, b) => new Date(b.callDate || 0).getTime() - new Date(a.callDate || 0).getTime());
    },
    [records]
  );

  const addCallerAttachment = useCallback(
    (callerId: string, attachment: Attachment) => {
      const now = new Date().toISOString();
      setCallers((prev) => {
        const next = prev.map((c) => {
          if (c.id === callerId) {
            const atts = c.attachments ? [...c.attachments, attachment] : [attachment];
            return { ...c, attachments: atts, updatedAt: now };
          }
          return c;
        });
        saveCallers(next);
        return next;
      });

      if (selectedCallerRef.current?.id === callerId) {
        setSelectedCaller((prev) =>
          prev ? { ...prev, attachments: prev.attachments ? [...prev.attachments, attachment] : [attachment], updatedAt: now } : prev
        );
      }
    },
    []
  );

  const removeCallerAttachment = useCallback(
    (callerId: string, attachmentId: string) => {
      const now = new Date().toISOString();
      setCallers((prev) => {
        const next = prev.map((c) => {
          if (c.id === callerId && c.attachments) {
            return { ...c, attachments: c.attachments.filter((a) => a.id !== attachmentId), updatedAt: now };
          }
          return c;
        });
        saveCallers(next);
        return next;
      });

      if (selectedCallerRef.current?.id === callerId) {
        setSelectedCaller((prev) =>
          prev && prev.attachments
            ? { ...prev, attachments: prev.attachments.filter((a) => a.id !== attachmentId), updatedAt: now }
            : prev
        );
      }
    },
    []
  );

  const addRecordAttachment = useCallback(
    (recordId: string, attachment: Attachment) => {
      setRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === recordId) {
            const atts = r.attachments ? [...r.attachments, attachment] : [attachment];
            return { ...r, attachments: atts };
          }
          return r;
        });
        saveRecords(next);
        return next;
      });
    },
    []
  );

  const removeRecordAttachment = useCallback(
    (recordId: string, attachmentId: string) => {
      setRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === recordId && r.attachments) {
            return { ...r, attachments: r.attachments.filter((a) => a.id !== attachmentId) };
          }
          return r;
        });
        saveRecords(next);
        return next;
      });
    },
    []
  );

  const addNewCaller = useCallback(
    (data: Omit<Caller, "id" | "createdAt" | "updatedAt">): Caller => {
      const now = new Date().toISOString();
      const newCaller: Caller = {
        ...data,
        id: "caller-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        createdAt: now,
        updatedAt: now,
      };

      const updated = [newCaller, ...callers];
      setCallers(updated);
      saveCallers(updated);

      broadcast({
        type: "CALLER_ADDED",
        payload: { callerId: newCaller.id },
      });

      return newCaller;
    },
    [callers, broadcast]
  );

  const addNewRecord = useCallback(
    (data: Omit<CallRecord, "id" | "createdAt">): CallRecord => {
      const now = new Date().toISOString();
      const newRec: CallRecord = {
        ...data,
        id: "rec-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        createdAt: now,
      };

      const updatedRecords = [newRec, ...records];
      setRecords(updatedRecords);
      saveRecords(updatedRecords);

      setCallers((prev) => {
        const next = prev.map((c) => (c.id === data.callerId ? { ...c, updatedAt: now } : c));
        saveCallers(next);
        return next;
      });

      broadcast({
        type: "RECORD_ADDED",
        payload: { recordId: newRec.id, callerId: data.callerId },
      });

      return newRec;
    },
    [records, broadcast]
  );

  const updateCaller = useCallback(
    (caller: Caller) => {
      const updated = callers.map((c) => (c.id === caller.id ? { ...caller, updatedAt: new Date().toISOString() } : c));
      setCallers(updated);
      saveCallers(updated);
      if (selectedCaller?.id === caller.id) {
        setSelectedCaller(caller);
      }
    },
    [callers, selectedCaller]
  );

  const applyBulkImport = useCallback(
    (newCallers: Caller[], newRecords: CallRecord[]) => {
      setCallers(newCallers);
      saveCallers(newCallers);
      const combinedRecords = [...newRecords, ...records];
      setRecords(combinedRecords);
      saveRecords(combinedRecords);

      broadcast({
        type: "BULK_IMPORT",
      });
    },
    [records, broadcast]
  );

  const resetDatabase = useCallback(() => {
    const res = resetToSampleData();
    setCallers(res.callers);
    setRecords(res.records);
    setSelectedCaller(null);
    setSearchQuery("");
  }, []);

  return (
    <AppContext.Provider
      value={{
        callers,
        records,
        specialists,
        currentSpecialist,
        setCurrentSpecialist,
        selectedCaller,
        setSelectedCaller,
        searchQuery,
        setSearchQuery,
        filteredCallers,
        filterState,
        setFilterState,
        activeTab,
        setActiveTab,
        isNewCallerModalOpen,
        setIsNewCallerModalOpen,
        isNewRecordModalOpen,
        setIsNewRecordModalOpen,
        isExcelModalOpen,
        setIsExcelModalOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        addCallerAttachment,
        removeCallerAttachment,
        addRecordAttachment,
        removeRecordAttachment,
        addNewCaller,
        addNewRecord,
        updateCaller,
        getCallerRecords,
        applyBulkImport,
        resetDatabase,
        livePresenceSpecialist,
        liveNotification,
        dismissNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
