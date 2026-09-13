import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { api, getStoredToken, setStoredToken } from "./api";

describe("Frontend API Client & Token Management", () => {
  let mockStorage: Record<string, string> = {};

  beforeAll(() => {
    // Setup localStorage mock in Node env
    const localStorageMock = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };
    global.localStorage = localStorageMock as any;
  });

  beforeEach(() => {
    mockStorage = {};
    vi.restoreAllMocks();
  });

  it("should store and retrieve JWT token from localStorage", () => {
    expect(getStoredToken()).toBeNull();
    setStoredToken("test-jwt-token-12345");
    expect(getStoredToken()).toBe("test-jwt-token-12345");
    setStoredToken(null);
    expect(getStoredToken()).toBeNull();
  });

  it("api.auth.logout should clear stored JWT token", () => {
    setStoredToken("mock-token");
    expect(getStoredToken()).toBe("mock-token");
    api.auth.logout();
    expect(getStoredToken()).toBeNull();
  });

  it("api.auth.login should fall back to demo login offline if fetch fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network offline"));

    const res = await api.auth.login("admin@synapsis.org.pl", "synapsis2026");
    expect(res.token).toBeDefined();
    expect(res.user.email).toBe("admin@synapsis.org.pl");
    expect(getStoredToken()).toBe(res.token);
  });

  it("api.attachments.createDownloadTicket requests ticket from backend and returns nonce", async () => {
    setStoredToken("test-jwt-token");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, ticket: "mock-nonce-abc-123", downloadUrl: "/api/attachments/att-1?ticket=mock-nonce-abc-123" }),
    });

    const ticket = await api.attachments.createDownloadTicket("att-1");
    expect(ticket).toBe("mock-nonce-abc-123");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/attachments/att-1/ticket",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-jwt-token",
        }),
      })
    );
  });

  it("api.attachments.getDownloadUrl produces URL with single-use nonce ticket", async () => {
    setStoredToken("test-jwt-token");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, ticket: "safe-nonce-xyz" }),
    });

    const mockAttachment = {
      id: "att-42",
      name: "dokument.pdf",
      size: 1024,
      type: "pdf" as const,
      uploadedAt: "2026-09-13T20:00:00Z",
      uploadedBy: "Admin",
      url: "/api/attachments/att-42",
    };

    const downloadUrl = await api.attachments.getDownloadUrl(mockAttachment);
    expect(downloadUrl).toContain("ticket=safe-nonce-xyz");
    expect(downloadUrl).toContain("download=1");
    expect(downloadUrl).toContain("filename=dokument.pdf");
    expect(downloadUrl).not.toContain("test-jwt-token"); // Ensure session JWT is NEVER exposed in the URL
  });
});
