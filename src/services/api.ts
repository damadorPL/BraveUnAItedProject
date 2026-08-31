import {
  Caller,
  CallRecord,
  Specialist,
  RecordEditLog,
  Attachment,
} from "../types";
import {
  loadCallers as loadLocalCallers,
  saveCallers as saveLocalCallers,
  loadRecords as loadLocalRecords,
  saveRecords as saveLocalRecords,
  loadSpecialists as loadLocalSpecialists,
  saveSpecialists as saveLocalSpecialists,
  resetToSampleData as resetLocalData,
  clearDemoData as clearLocalData,
} from "./storage";

const JWT_STORAGE_KEY = "unaited_pfron_jwt_v1";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(JWT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(JWT_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(JWT_STORAGE_KEY);
    }
  } catch {}
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Błąd żądania (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) errorMsg = body.error;
    } catch {}
    const err: any = new Error(errorMsg);
    err.status = res.status;
    throw err;
  }

  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    async login(email: string, password: string): Promise<{ token: string; user: Specialist }> {
      try {
        const data = await request<{ token: string; user: Specialist }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setStoredToken(data.token);
        return data;
      } catch (err) {
        // Fallback for offline mode if backend is not started
        const specs = loadLocalSpecialists();
        const spec = specs.find((s) => s.email.trim().toLowerCase() === email.trim().toLowerCase());
        if (spec && password === "synapsis2026") {
          const fakeToken = "offline-mock-token-" + spec.id;
          setStoredToken(fakeToken);
          return { token: fakeToken, user: spec };
        }
        throw err;
      }
    },

    async me(): Promise<{ user: Specialist } | null> {
      try {
        return await request<{ user: Specialist }>("/auth/me");
      } catch (err: any) {
        if (err?.status === 401 || err?.status === 403) {
          return null; // Explicit invalid/expired token
        }
        throw err; // Network or other temporary server error
      }
    },

    async resetPassword(email: string, newPassword: string, resetCode: string): Promise<{ success: boolean; message: string }> {
      return request<{ success: boolean; message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, newPassword, resetCode }),
      });
    },

    logout(): void {
      setStoredToken(null);
    },
  },

  callers: {
    async getAll(): Promise<Caller[]> {
      if (!getStoredToken()) {
        return loadLocalCallers();
      }
      try {
        const callers = await request<Caller[]>("/callers");
        saveLocalCallers(callers);
        return callers;
      } catch (err) {
        console.warn("Falling back to local callers storage", err);
        return loadLocalCallers();
      }
    },

    async getById(id: string): Promise<Caller | null> {
      if (!getStoredToken()) {
        return loadLocalCallers().find((c) => c.id === id) || null;
      }
      try {
        return await request<Caller>(`/callers/${id}`);
      } catch {
        return loadLocalCallers().find((c) => c.id === id) || null;
      }
    },

    async create(data: Partial<Caller>): Promise<Caller> {
      try {
        return await request<Caller>("/callers", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn("Saving caller locally", err);
        const callers = loadLocalCallers();
        const newCaller = data as Caller;
        saveLocalCallers([newCaller, ...callers]);
        return newCaller;
      }
    },

    async update(caller: Caller): Promise<Caller> {
      try {
        return await request<Caller>(`/callers/${caller.id}`, {
          method: "PUT",
          body: JSON.stringify(caller),
        });
      } catch (err) {
        console.warn("Updating caller locally", err);
        const callers = loadLocalCallers().map((c) => (c.id === caller.id ? caller : c));
        saveLocalCallers(callers);
        return caller;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        await request<{ success: boolean }>(`/callers/${id}`, { method: "DELETE" });
        const callers = loadLocalCallers().filter((c) => c.id !== id);
        saveLocalCallers(callers);
        return true;
      } catch {
        const callers = loadLocalCallers().filter((c) => c.id !== id);
        saveLocalCallers(callers);
        return true;
      }
    },
  },

  records: {
    async getAll(callerId?: string): Promise<CallRecord[]> {
      if (!getStoredToken()) {
        const all = loadLocalRecords();
        return callerId ? all.filter((r) => r.callerId === callerId) : all;
      }
      try {
        const endpoint = callerId ? `/records?callerId=${callerId}` : "/records";
        const records = await request<CallRecord[]>(endpoint);
        saveLocalRecords(records);
        return records;
      } catch (err) {
        console.warn("Falling back to local records storage", err);
        const all = loadLocalRecords();
        return callerId ? all.filter((r) => r.callerId === callerId) : all;
      }
    },

    async create(data: Partial<CallRecord>): Promise<CallRecord> {
      try {
        return await request<CallRecord>("/records", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn("Saving record locally", err);
        const records = loadLocalRecords();
        const newRecord = data as CallRecord;
        saveLocalRecords([newRecord, ...records]);
        return newRecord;
      }
    },

    async update(record: CallRecord, newEditLog?: RecordEditLog): Promise<CallRecord> {
      try {
        return await request<CallRecord>(`/records/${record.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...record, newEditLog }),
        });
      } catch (err) {
        console.warn("Updating record locally", err);
        const records = loadLocalRecords().map((r) => (r.id === record.id ? record : r));
        saveLocalRecords(records);
        return record;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        await request<{ success: boolean }>(`/records/${id}`, { method: "DELETE" });
        const records = loadLocalRecords().filter((r) => r.id !== id);
        saveLocalRecords(records);
        return true;
      } catch {
        const records = loadLocalRecords().filter((r) => r.id !== id);
        saveLocalRecords(records);
        return true;
      }
    },
  },

  specialists: {
    async getAll(): Promise<Specialist[]> {
      try {
        const specs = await request<Specialist[]>("/auth/specialists");
        saveLocalSpecialists(specs);
        return specs;
      } catch {
        try {
          const specs = await request<Specialist[]>("/admin/specialists");
          saveLocalSpecialists(specs);
          return specs;
        } catch {
          return loadLocalSpecialists();
        }
      }
    },
  },

  admin: {
    async getOverview(): Promise<any> {
      return request<any>("/admin/overview");
    },

    async getSpecialists(): Promise<Specialist[]> {
      return request<Specialist[]>("/admin/specialists");
    },

    async createSpecialist(data: Partial<Specialist> & { initialPassword?: string }): Promise<Specialist> {
      return request<Specialist>("/admin/specialists", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async updateSpecialist(id: string, data: Partial<Specialist> & { newPassword?: string }): Promise<Specialist> {
      return request<Specialist>(`/admin/specialists/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async deleteSpecialist(id: string): Promise<boolean> {
      await request<{ success: boolean }>(`/admin/specialists/${id}`, { method: "DELETE" });
      return true;
    },

    async resetSpecialistPassword(id: string, newPassword?: string): Promise<{ success: boolean; temporaryPassword?: string }> {
      return request<{ success: boolean; temporaryPassword?: string }>(`/admin/specialists/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
    },

    async mergeCallers(
      sourceCallerId: string,
      targetCallerId: string,
      customMergedData?: Partial<Caller>
    ): Promise<{
      mergedCaller: Caller;
      migratedRecordCount: number;
      migratedAttachmentCount: number;
    }> {
      return request<any>("/admin/merge-callers", {
        method: "POST",
        body: JSON.stringify({ sourceCallerId, targetCallerId, customMergedData }),
      });
    },

    async getAuditLogs(limit: number = 100): Promise<RecordEditLog[]> {
      return request<RecordEditLog[]>(`/admin/audit-logs?limit=${limit}`);
    },

    async getDbConfig(): Promise<any> {
      return request<any>("/admin/db/config");
    },

    async switchDb(config: { engine: "sqlite" | "postgres"; sqlitePath?: string; postgresUrl?: string }): Promise<any> {
      return request<any>("/admin/db/config", {
        method: "POST",
        body: JSON.stringify(config),
      });
    },

    async testDb(config: { engine: "sqlite" | "postgres"; sqlitePath?: string; postgresUrl?: string }): Promise<{ success: boolean; message: string }> {
      return request<{ success: boolean; message: string }>("/admin/db/test", {
        method: "POST",
        body: JSON.stringify(config),
      });
    },

    async resetDb(): Promise<{ success: boolean; message: string }> {
      try {
        const res = await request<{ success: boolean; message: string }>("/admin/db/reset", {
          method: "POST",
        });
        resetLocalData();
        return res;
      } catch {
        resetLocalData();
        return { success: true, message: "Zresetowano lokalną bazę danych do danych demo." };
      }
    },

    async clearDb(keepSpecialists: boolean = false): Promise<{ success: boolean; message: string }> {
      try {
        const res = await request<{ success: boolean; message: string }>("/admin/db/clear", {
          method: "POST",
          body: JSON.stringify({ keepSpecialists }),
        });
        clearLocalData(keepSpecialists);
        return res;
      } catch {
        clearLocalData(keepSpecialists);
        return {
          success: true,
          message: keepSpecialists
            ? "Wyczyszczono lokalną bazę danych. Zachowano konta specjalistów i administratora."
            : "Wyczyszczono lokalne dane demonstracyjne. Zachowano konto Administratora.",
        };
      }
    },
  },

  attachments: {
    async upload(file: File, specialistName: string, description?: string): Promise<Attachment> {
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (specialistName) formData.append("specialistName", specialistName);
        if (description) formData.append("description", description);

        const token = getStoredToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("/api/attachments/upload", {
          method: "POST",
          headers,
          body: formData,
        });

        if (!res.ok) {
          let errorMsg = `Błąd przesyłania pliku (${res.status})`;
          try {
            const body = await res.json();
            if (body.error) errorMsg = body.error;
          } catch {}
          throw new Error(errorMsg);
        }

        const data = await res.json();
        return data.attachment;
      } catch (err) {
        // Fallback for offline mode if backend is not started
        console.warn("Backend attachment upload failed, falling back to local processing:", err);
        const { createAttachmentFromFile } = await import("../utils/fileUtils");
        return createAttachmentFromFile(file, specialistName, description);
      }
    },

    getViewUrl(attachment: Attachment): string {
      if (attachment.dataUrl) return attachment.dataUrl;
      const token = getStoredToken();
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
      return attachment.url ? `${attachment.url}${tokenQuery}` : `/api/attachments/${attachment.id}${tokenQuery}`;
    },

    getDownloadUrl(attachment: Attachment): string {
      if (attachment.dataUrl) return attachment.dataUrl;
      const token = getStoredToken();
      const params = new URLSearchParams();
      if (token) params.set("token", token);
      params.set("download", "1");
      if (attachment.name) params.set("filename", attachment.name);
      const base = attachment.url || `/api/attachments/${attachment.id}`;
      return `${base}?${params.toString()}`;
    },

    async delete(id: string): Promise<boolean> {
      try {
        const res = await request<{ success: boolean; deleted: boolean }>(`/attachments/${id}`, {
          method: "DELETE",
        });
        return res.deleted;
      } catch {
        return false;
      }
    },
  },
};
