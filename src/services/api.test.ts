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
});
