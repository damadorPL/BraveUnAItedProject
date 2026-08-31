import { describe, it, expect, beforeEach } from "vitest";
import { idbGet, idbSet, idbRemove, idbClear } from "./indexedDbStorage";

describe("indexedDbStorage", () => {
  beforeEach(async () => {
    await idbClear();
  });

  it("stores and retrieves items correctly in memory fallback", async () => {
    await idbSet("test_key", { name: "Jan Kowalski", count: 42 });
    const result = await idbGet<{ name: string; count: number }>("test_key");
    expect(result).toEqual({ name: "Jan Kowalski", count: 42 });
  });

  it("returns null for non-existing keys", async () => {
    const result = await idbGet("non_existent_key");
    expect(result).toBeNull();
  });

  it("removes items properly", async () => {
    await idbSet("to_remove", "abc");
    expect(await idbGet("to_remove")).toBe("abc");
    await idbRemove("to_remove");
    expect(await idbGet("to_remove")).toBeNull();
  });
});
