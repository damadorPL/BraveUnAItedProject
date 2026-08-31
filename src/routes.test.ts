import { describe, it, expect } from "vitest";
import { generateJWT, verifyJWT } from "../server/middleware/auth";

describe("JWT Protection and Claims Verification", () => {
  it("should generate and verify valid JWT token for regular specialist", () => {
    const payload = {
      id: "spec-1",
      email: "j.mrozek@synapsis.org.pl",
      name: "mgr Joanna Mrożek",
      role: "Psycholog",
      isAdmin: false,
    };

    const token = generateJWT(payload);
    expect(token).toBeTypeOf("string");

    const verified = verifyJWT(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe("spec-1");
    expect(verified?.email).toBe("j.mrozek@synapsis.org.pl");
    expect(verified?.isAdmin).toBe(false);
  });

  it("should generate and verify valid JWT token for administrator", () => {
    const payload = {
      id: "spec-admin",
      email: "admin@synapsis.org.pl",
      name: "dr Michał Adamczyk (Admin)",
      role: "Administrator",
      isAdmin: true,
    };

    const token = generateJWT(payload);
    const verified = verifyJWT(token);
    expect(verified?.isAdmin).toBe(true);
  });

  it("should return null for tampered or invalid token", () => {
    const result = verifyJWT("invalid.tampered.token");
    expect(result).toBeNull();
  });
});
