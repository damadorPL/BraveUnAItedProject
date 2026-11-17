import { describe, expect, it } from "vitest";
import { sanitizeAvatarUrl } from "./SpecialistAvatar";

describe("sanitizeAvatarUrl", () => {
  it("allows valid https and http URLs and preserves query parameters", () => {
    const unsplash =
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
    expect(sanitizeAvatarUrl(unsplash)).toBe(unsplash);
    expect(sanitizeAvatarUrl("  http://example.com/avatar.png  ")).toBe(
      "http://example.com/avatar.png",
    );
  });

  it("percent-encodes HTML meta-characters in URLs", () => {
    const result = sanitizeAvatarUrl("https://example.com/avatar.png?q='test'<script>\"`");
    expect(result).not.toBeNull();
    expect(result).not.toMatch(/['<>`"]/);
    expect(result).toContain("%27");
    expect(result).toContain("%3Cscript%3E");
  });

  it("allows safe app-local relative paths and rejects protocol-relative paths", () => {
    expect(sanitizeAvatarUrl("/avatars/user.png?v=1")).toBe("/avatars/user.png?v=1");
    expect(sanitizeAvatarUrl("//evil.com/avatar.png")).toBeNull();
    expect(sanitizeAvatarUrl("/\\evil.com/avatar.png")).toBeNull();
  });

  it("allows safe base64 raster image data URLs and normalizes mime", () => {
    expect(sanitizeAvatarUrl("data:image/PNG;base64,iVBORw0KGgo=")).toBe(
      "data:image/png;base64,iVBORw0KGgo=",
    );
    expect(sanitizeAvatarUrl("data:image/webp;base64,UklGRh4AAABXRUJQ")).toBe(
      "data:image/webp;base64,UklGRh4AAABXRUJQ",
    );
  });

  it("rejects dangerous or unsupported schemes and payloads", () => {
    expect(sanitizeAvatarUrl(undefined)).toBeNull();
    expect(sanitizeAvatarUrl("")).toBeNull();
    expect(sanitizeAvatarUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeAvatarUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBeNull();
    expect(sanitizeAvatarUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(sanitizeAvatarUrl("https://")).toBeNull();
  });
});
