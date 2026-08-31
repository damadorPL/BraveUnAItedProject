import { describe, it, expect } from "vitest";
import {
  loginSchema,
  callerSchema,
  callRecordSchema,
  specialistSchema,
  mergeCallersSchema,
  dbConfigSchema,
} from "./db/schema/zod.js";

describe("Zod Validation Schemas Suite", () => {
  it("loginSchema should validate correct emails and reject invalid", () => {
    const valid = loginSchema.safeParse({
      email: "admin@synapsis.org.pl",
      password: "somePassword123",
    });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({
      email: "not-an-email",
      password: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("callerSchema should validate caller payload and provide defaults", () => {
    const parsed = callerSchema.safeParse({
      firstName: "Anna",
      lastName: "Kowalska",
      phoneNumber: "601 234 567",
      voivodeship: "mazowieckie",
      city: "Warszawa",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.hasDisabilityCertificate).toBe("nie");
      expect(parsed.data.beneficiaryTypes).toEqual(["rodzic"]);
    }
  });

  it("specialistSchema should reject emails not ending with @synapsis.org.pl", () => {
    const valid = specialistSchema.safeParse({
      name: "mgr Jan Kowalski",
      email: "j.kowalski@synapsis.org.pl",
      role: "Konsultant",
      title: "Psycholog",
      guidanceType: "prawno-obywatelskie",
    });
    expect(valid.success).toBe(true);

    const invalid = specialistSchema.safeParse({
      name: "mgr Jan Kowalski",
      email: "jan@gmail.com",
    });
    expect(invalid.success).toBe(false);
  });

  it("mergeCallersSchema should validate merge requests", () => {
    const valid = mergeCallersSchema.safeParse({
      sourceCallerId: "c-1",
      targetCallerId: "c-2",
    });
    expect(valid.success).toBe(true);

    const invalid = mergeCallersSchema.safeParse({});
    expect(invalid.success).toBe(false);
  });

  it("dbConfigSchema should only accept sqlite or postgres", () => {
    expect(dbConfigSchema.safeParse({ engine: "sqlite" }).success).toBe(true);
    expect(dbConfigSchema.safeParse({ engine: "postgres" }).success).toBe(true);
    expect(dbConfigSchema.safeParse({ engine: "mysql" }).success).toBe(false);
  });
});
