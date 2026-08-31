import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Caller, CallRecord, Specialist, FilterState, SyncMessage, Attachment, EmailNotification, RecordEditLog } from "../types";
import { AppContext } from "./context";

import {
  loadCallers,
  saveCallers,
  loadRecords,
  saveRecords,
  loadSpecialists,
  loadSessionSpecialistId,
  saveSessionSpecialistId,
  clearSession,
  saveSpecialists,
  resetToSampleData,
  clearDemoData,
  searchCallers,
  loadAsyncCachedData,
} from "../services/storage";
import { api, getStoredToken, setStoredToken } from "../services/api";
import { computeRecordChanges } from "../utils/auditLogger";

// Jedno źródło prawdy dla "czy ten wpis jest przekazany do tego specjalisty" —
// dopasowanie po referredSpecialistId, a gdy go brak (starsze/ręczne przekazania),
// fallback po nazwisku w polu referredTo. Używane zarówno przy pokazywaniu listy
// przekazanych spraw, jak i przy automatycznym oznaczaniu ich jako załatwione.
const isReferredToSpecialist = (
  rec: CallRecord,
  specialistId: string,
  specialistsList: Specialist[]
): boolean => {
  if (rec.referredSpecialistId === specialistId) return true;
  if (!rec.referredSpecialistId && rec.referredTo) {
    const spec = specialistsList.find((s) => s.id === specialistId);
    const specLastName = spec ? spec.name.split(" ").pop()?.toLowerCase() : null;
    if (specLastName) return rec.referredTo.toLowerCase().includes(specLastName);
  }
  return false;
};

const SYNC_CHANNEL_NAME = "unaited_call_history_sync_v1";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [callers, setCallers] = useState<Caller[]>(() => loadCallers());
  const [records, setRecords] = useState<CallRecord[]>(() => loadRecords());
  const [specialists, setSpecialists] = useState<Specialist[]>(() => loadSpecialists());
  const [currentSpecialist, setCurrentSpecialist] = useState<Specialist | null>(() => {
    const sessionId = loadSessionSpecialistId();
    const token = getStoredToken();
    if (!sessionId || !token) return null;
    const allSpecs = loadSpecialists();
    return allSpecs.find((s) => s.id === sessionId) ?? null;
  });

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

  const [sentEmails] = useState<EmailNotification[]>([]);
  const [activeEmailModal, setActiveEmailModal] = useState<EmailNotification | null>(null);

  const [editingRecord, setEditingRecord] = useState<CallRecord | null>(null);
  const [editingCaller, setEditingCaller] = useState<Caller | null>(null);

  const [isNewCallerModalOpen, setIsNewCallerModalOpen] = useState(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("brave_theme_mode");
      if (saved) return saved === "dark";
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("brave_theme_mode", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("brave_theme_mode", "light");
      }
    } catch {}
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const [showDemoFeatures, setShowDemoFeaturesState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("brave_show_demo_features");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const setShowDemoFeatures = useCallback((show: boolean) => {
    setShowDemoFeaturesState(show);
    try {
      localStorage.setItem("brave_show_demo_features", show ? "true" : "false");
    } catch {}
  }, []);

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
      const me = currentSpecialistRef.current;
      if (channelRef.current && me) {
        const fullMsg: SyncMessage = {
          ...msg,
          senderId: me.id,
          senderName: me.name,
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
        if (!msg || msg.senderId === currentSpecialistRef.current?.id) return;

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
        } catch {}
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

  const syncData = useCallback(async (hasAuthToken = false) => {
    try {
      const token = getStoredToken();
      const isAuthenticated = hasAuthToken || Boolean(token);

      if (isAuthenticated) {
        const [fetchedSpecs, fetchedCallers, fetchedRecords] = await Promise.all([
          api.specialists.getAll().catch(() => null),
          api.callers.getAll().catch(() => null),
          api.records.getAll().catch(() => null),
        ]);
        if (fetchedSpecs && fetchedSpecs.length > 0) setSpecialists(fetchedSpecs);
        if (fetchedCallers) setCallers(fetchedCallers);
        if (fetchedRecords) setRecords(fetchedRecords);
      } else {
        const fetchedSpecs = await api.specialists.getAll().catch(() => null);
        if (fetchedSpecs && fetchedSpecs.length > 0) setSpecialists(fetchedSpecs);
      }
    } catch (err) {
      console.warn("Backend sync warning, fallback to storage:", err);
    }
  }, []);

  // Initial load from backend API if available, with IndexedDB fast cache hydration
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      try {
        // Hydrate from async IndexedDB cache if it contains more/newer records
        loadAsyncCachedData()
          .then((cached) => {
            if (isMounted) {
              if (cached.callers && cached.callers.length > 0) setCallers((prev) => (cached.callers!.length > prev.length ? cached.callers! : prev));
              if (cached.records && cached.records.length > 0) setRecords((prev) => (cached.records!.length > prev.length ? cached.records! : prev));
              if (cached.specialists && cached.specialists.length > 0) setSpecialists((prev) => (cached.specialists!.length > prev.length ? cached.specialists! : prev));
            }
          })
          .catch(() => {});

        const token = getStoredToken();
        const sessionId = loadSessionSpecialistId();
        let authenticated = Boolean(token && sessionId);
        if (token) {
          try {
            const me = await api.auth.me();
            if (me?.user && isMounted) {
              setCurrentSpecialist(me.user);
              saveSessionSpecialistId(me.user.id);
              authenticated = true;
            } else if (me === null) {
              // Explicit 401/403: token expired or invalid
              setStoredToken(null);
              clearSession();
              authenticated = false;
              if (isMounted) setCurrentSpecialist(null);
            }
          } catch (err) {
            // Network error / server offline: keep cached session if valid
            console.warn("Backend unavailable for auth check, maintaining cached session:", err);
            if (sessionId && isMounted) {
              const allSpecs = loadSpecialists();
              const spec = allSpecs.find((s) => s.id === sessionId);
              if (spec) {
                setCurrentSpecialist(spec);
                authenticated = true;
              }
            }
          }
        } else {
          clearSession();
          if (isMounted) setCurrentSpecialist(null);
        }
        await syncData(authenticated);
      } catch (err) {
        console.warn("Backend sync failed on init, using local storage:", err);
      }
    }
    initData();
    return () => {
      isMounted = false;
    };
  }, [syncData]);

  const dismissNotification = useCallback(() => {
    setLiveNotification(null);
  }, []);

  const login = useCallback(
    (specialist: Specialist) => {
      setCurrentSpecialist(specialist);
      saveSessionSpecialistId(specialist.id);
      syncData(true);
    },
    [syncData]
  );

  const logout = useCallback(() => {
    api.auth.logout();
    setCurrentSpecialist(null);
    clearSession();
    setSelectedCaller(null);
    setSearchQuery("");
    setActiveTab("SEARCH");
  }, []);

  const filteredCallers = useMemo(() => {
    return searchCallers(searchQuery, callers);
  }, [searchQuery, callers]);

  // High-performance O(1) lookup Map for caller records pre-sorted by date
  const recordsByCallerId = useMemo(() => {
    const map = new Map<string, CallRecord[]>();
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      if (!rec.callerId) continue;
      const list = map.get(rec.callerId);
      if (list) {
        list.push(rec);
      } else {
        map.set(rec.callerId, [rec]);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(b.callDate || 0).getTime() - new Date(a.callDate || 0).getTime());
    }
    return map;
  }, [records]);

  // High-performance lookup Map for pending referrals by specialist (O(S + R) instead of O(S * R))
  const referredRecordsBySpecialist = useMemo(() => {
    const map = new Map<string, CallRecord[]>();
    for (let s = 0; s < specialists.length; s++) {
      map.set(specialists[s].id, []);
    }
    for (let r = 0; r < records.length; r++) {
      const rec = records[r];
      if (rec.referredSpecialistId && map.has(rec.referredSpecialistId)) {
        map.get(rec.referredSpecialistId)!.push(rec);
      } else if (!rec.referredSpecialistId && rec.referredTo) {
        for (let s = 0; s < specialists.length; s++) {
          const spec = specialists[s];
          const specLastName = spec.name.split(" ").pop()?.toLowerCase();
          if (specLastName && rec.referredTo.toLowerCase().includes(specLastName)) {
            map.get(spec.id)!.push(rec);
            break;
          }
        }
      }
    }
    return map;
  }, [records, specialists]);

  const getCallerRecords = useCallback(
    (callerId: string) => {
      if (!callerId) return [];
      return recordsByCallerId.get(callerId) || [];
    },
    [recordsByCallerId]
  );

  const getReferredRecordsForSpecialist = useCallback(
    (specialistId: string) => {
      if (!specialistId) return [];
      return (
        referredRecordsBySpecialist.get(specialistId) ||
        records.filter((r) => isReferredToSpecialist(r, specialistId, specialists))
      );
    },
    [referredRecordsBySpecialist, records, specialists]
  );

  const markReferralStatus = useCallback(
    (recordId: string, status: "OCZEKUJĄCA" | "PRZYJĘTA" | "ZAKOŃCZONA") => {
      setRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === recordId) {
            const updated = { ...r, referredStatus: status };
            api.records.update(updated).catch((err) => {
              console.warn("Failed to persist referral status to backend:", err);
            });
            return updated;
          }
          return r;
        });
        saveRecords(next);
        return next;
      });
    },
    []
  );

  const canEditRecord = useCallback(
    (record: CallRecord) => {
      if (!record || !currentSpecialist) return false;
      if (
        Boolean(currentSpecialist.isAdmin) ||
        currentSpecialist.id === "spec-admin" ||
        (currentSpecialist.role && currentSpecialist.role.toLowerCase().includes("admin"))
      ) {
        return true;
      }
      return record.specialistId === currentSpecialist.id;
    },
    [currentSpecialist]
  );

  const canEditCaller = useCallback(
    (caller: Caller) => {
      if (!caller) return false;
      return true; // Everyone can edit caller tags/details, Admin has full delete rights
    },
    []
  );

  const updateRecord = useCallback(
    (updated: CallRecord) => {
      const now = new Date().toISOString();
      const existing = records.find((r) => r.id === updated.id);
      let editLogs = existing?.editLogs ? [...existing.editLogs] : [];

      let changeLog: RecordEditLog | undefined;
      if (existing) {
        changeLog = computeRecordChanges(existing, updated, currentSpecialist) || undefined;
        if (changeLog) {
          editLogs = [changeLog, ...editLogs];
        }
      }

      const updatedRecord = { ...updated, updatedAt: now, editLogs };
      const nextRecords = records.map((r) =>
        r.id === updated.id ? updatedRecord : r
      );
      setRecords(nextRecords);
      saveRecords(nextRecords);

      api.records.update(updatedRecord, changeLog).catch((err) => {
        console.warn("Failed to persist record update to backend:", err);
      });

      broadcast({
        type: "RECORD_UPDATED",
        payload: { recordId: updated.id, callerId: updated.callerId },
      });
    },
    [records, currentSpecialist, broadcast]
  );

  const deleteRecord = useCallback(
    (recordId: string) => {
      const nextRecords = records.filter((r) => r.id !== recordId);
      setRecords(nextRecords);
      saveRecords(nextRecords);

      api.records.delete(recordId).catch((err) => {
        console.warn("Failed to persist record deletion to backend:", err);
      });
    },
    [records]
  );

  const deleteCaller = useCallback(
    (callerId: string) => {
      const nextCallers = callers.filter((c) => c.id !== callerId);
      const nextRecords = records.filter((r) => r.callerId !== callerId);
      setCallers(nextCallers);
      saveCallers(nextCallers);
      setRecords(nextRecords);
      saveRecords(nextRecords);
      if (selectedCallerRef.current?.id === callerId) {
        setSelectedCaller(null);
      }

      api.callers.delete(callerId).catch((err) => {
        console.warn("Failed to persist caller deletion to backend:", err);
      });
    },
    [callers, records]
  );

  const addCallerAttachment = useCallback(
    (callerId: string, attachment: Attachment) => {
      const now = new Date().toISOString();
      setCallers((prev) => {
        const next = prev.map((c) => {
          if (c.id === callerId) {
            const atts = c.attachments ? [...c.attachments, attachment] : [attachment];
            const updated = { ...c, attachments: atts, updatedAt: now };
            api.callers.update(updated).catch(() => {});
            return updated;
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
            const updated = { ...c, attachments: c.attachments.filter((a) => a.id !== attachmentId), updatedAt: now };
            api.callers.update(updated).catch(() => {});
            return updated;
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
            const updated = { ...r, attachments: atts };
            api.records.update(updated).catch(() => {});
            return updated;
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
            const updated = { ...r, attachments: r.attachments.filter((a) => a.id !== attachmentId) };
            api.records.update(updated).catch(() => {});
            return updated;
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

      api.callers.create(newCaller).catch((err) => {
        console.warn("Failed to persist new caller to backend:", err);
      });

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

      if (data.referredSpecialistId && !data.referredStatus) {
        newRec.referredStatus = "OCZEKUJĄCA";
      }

      // If this specialist is consulting a caller who had an outstanding referral for them, mark it resolved
      const updatedRecords = [
        newRec,
        ...records.map((r) => {
          if (
            r.callerId === data.callerId &&
            (r.referredStatus === "OCZEKUJĄCA" || !r.referredStatus) &&
            isReferredToSpecialist(r, data.specialistId, specialists)
          ) {
            const resolved = { ...r, referredStatus: "ZAKOŃCZONA" as const };
            api.records.update(resolved).catch(() => {});
            return resolved;
          }
          return r;
        }),
      ];
      setRecords(updatedRecords);
      saveRecords(updatedRecords);

      setCallers((prev) => {
        const next = prev.map((c) => (c.id === data.callerId ? { ...c, updatedAt: now } : c));
        saveCallers(next);
        return next;
      });

      api.records.create(newRec).catch((err) => {
        console.warn("Failed to persist new record to backend:", err);
      });

      broadcast({
        type: "RECORD_ADDED",
        payload: { recordId: newRec.id, callerId: data.callerId },
      });

      return newRec;
    },
    [records, specialists, broadcast]
  );

  const updateCaller = useCallback(
    (caller: Caller) => {
      const updatedCaller = { ...caller, updatedAt: new Date().toISOString() };
      const updated = callers.map((c) => (c.id === caller.id ? updatedCaller : c));
      setCallers(updated);
      saveCallers(updated);
      if (selectedCaller?.id === caller.id) {
        setSelectedCaller(updatedCaller);
      }

      api.callers.update(updatedCaller).catch((err) => {
        console.warn("Failed to persist updated caller to backend:", err);
      });
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

  const addSpecialist = useCallback(
    (data: Omit<Specialist, "id"> | Specialist) => {
      const newSpec: Specialist = {
        ...data,
        id: ("id" in data && data.id) ? data.id : "spec-" + Date.now(),
      };
      setSpecialists((prev) => {
        const next = [...prev.filter((s) => s.id !== newSpec.id), newSpec];
        saveSpecialists(next);
        return next;
      });
      if (!("id" in data && data.id)) {
        api.admin.createSpecialist(newSpec).catch(() => {});
      }
      broadcast({ type: "SPECIALISTS_UPDATED", payload: { specialist: newSpec } });
      return newSpec;
    },
    [broadcast]
  );

  const updateSpecialist = useCallback(
    (updated: Specialist) => {
      setSpecialists((prev) => {
        const next = prev.map((s) => (s.id === updated.id ? updated : s));
        saveSpecialists(next);
        return next;
      });
      if (currentSpecialistRef.current?.id === updated.id) {
        setCurrentSpecialist(updated);
      }
      api.admin.updateSpecialist(updated.id, updated).catch(() => {});
      broadcast({ type: "SPECIALISTS_UPDATED", payload: { specialist: updated } });
    },
    [broadcast]
  );

  const deleteSpecialist = useCallback(
    (specialistId: string) => {
      setSpecialists((prev) => {
        const next = prev.filter((s) => s.id !== specialistId);
        saveSpecialists(next);
        return next;
      });
      api.admin.deleteSpecialist(specialistId).catch(() => {});
      broadcast({ type: "SPECIALISTS_UPDATED", payload: { deletedId: specialistId } });
    },
    [broadcast]
  );

  const mergeCallers = useCallback(
    (sourceCallerId: string, targetCallerId: string, customMergedData?: Partial<Caller>) => {
      const source = callers.find((c) => c.id === sourceCallerId);
      const target = callers.find((c) => c.id === targetCallerId);
      if (!source || !target) return;

      const now = new Date().toISOString();

      // 1. Combine attachments
      const combinedAttachments = [
        ...(target.attachments || []),
        ...(source.attachments || []).filter(
          (sa) => !(target.attachments || []).some((ta) => ta.id === sa.id || ta.name === sa.name)
        ),
      ];

      // 2. Combine tags
      const combinedTags = Array.from(new Set([...(target.tags || []), ...(source.tags || [])]));

      // 3. Combine beneficiary types
      const combinedBeneficiaries = Array.from(
        new Set([...(target.beneficiaryTypes || []), ...(source.beneficiaryTypes || [])])
      );

      const mergedTarget: Caller = {
        ...target,
        ...customMergedData,
        tags: combinedTags,
        beneficiaryTypes: combinedBeneficiaries,
        attachments: combinedAttachments,
        updatedAt: now,
      };

      // 4. Update callers list
      const nextCallers = callers
        .map((c) => (c.id === targetCallerId ? mergedTarget : c))
        .filter((c) => c.id !== sourceCallerId);
      setCallers(nextCallers);
      saveCallers(nextCallers);

      // 5. Update records
      const nextRecords = records.map((r) =>
        r.callerId === sourceCallerId ? { ...r, callerId: targetCallerId, updatedAt: now } : r
      );
      setRecords(nextRecords);
      saveRecords(nextRecords);

      // 6. Update selectedCaller if relevant
      if (selectedCallerRef.current?.id === sourceCallerId || selectedCallerRef.current?.id === targetCallerId) {
        setSelectedCaller(mergedTarget);
      }

      api.admin.mergeCallers(sourceCallerId, targetCallerId, customMergedData).catch(() => {});

      broadcast({
        type: "CALLER_MERGED",
        payload: { sourceCallerId, targetCallerId, mergedTarget },
      });
    },
    [callers, records, broadcast]
  );

  const resetDatabase = useCallback(() => {
    const res = resetToSampleData();
    setCallers(res.callers);
    setRecords(res.records);
    setSelectedCaller(null);
    setSearchQuery("");
    api.admin.resetDb().catch(() => {});
  }, []);

  const clearDatabase = useCallback((keepSpecialists: boolean = false) => {
    const res = clearDemoData(keepSpecialists);
    setCallers(res.callers);
    setRecords(res.records);
    setSpecialists(res.specialists);
    setSelectedCaller(null);
    setSearchQuery("");
    api.admin.clearDb(keepSpecialists).catch(() => {});
  }, []);

  return (
    <AppContext.Provider
      value={{
        callers,
        records,
        specialists,
        currentSpecialist,
        login,
        logout,
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
        isProfileModalOpen,
        setIsProfileModalOpen,
        isAdminPanelOpen,
        setIsAdminPanelOpen,
        isDarkMode,
        toggleDarkMode,
        showDemoFeatures,
        setShowDemoFeatures,
        sentEmails,
        activeEmailModal,
        setActiveEmailModal,
        getReferredRecordsForSpecialist,
        markReferralStatus,
        editingRecord,
        setEditingRecord,
        editingCaller,
        setEditingCaller,
        updateRecord,
        deleteRecord,
        deleteCaller,
        canEditRecord,
        canEditCaller,
        addSpecialist,
        updateSpecialist,
        deleteSpecialist,
        mergeCallers,
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
        clearDatabase,
        livePresenceSpecialist,
        liveNotification,
        dismissNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
