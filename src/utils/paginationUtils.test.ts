import { describe, it, expect } from "vitest";
import { getPaginationRange } from "./paginationUtils";

describe("paginationUtils", () => {
  it("returns simple range for totalPages <= 7", () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getPaginationRange(1, 1)).toEqual([1]);
    expect(getPaginationRange(1, 0)).toEqual([1]);
  });

  it("returns right dots when on first few pages", () => {
    expect(getPaginationRange(1, 20, 1)).toEqual([1, 2, 3, 4, 5, "...", 20]);
    expect(getPaginationRange(2, 20, 1)).toEqual([1, 2, 3, 4, 5, "...", 20]);
  });

  it("returns left dots when on last few pages", () => {
    expect(getPaginationRange(20, 20, 1)).toEqual([1, "...", 16, 17, 18, 19, 20]);
    expect(getPaginationRange(19, 20, 1)).toEqual([1, "...", 16, 17, 18, 19, 20]);
  });

  it("returns both left and right dots when in middle", () => {
    expect(getPaginationRange(10, 20, 1)).toEqual([1, "...", 9, 10, 11, "...", 20]);
    expect(getPaginationRange(8, 20, 2)).toEqual([1, "...", 6, 7, 8, 9, 10, "...", 20]);
  });
});
