import { describe, it, expect } from "vitest";
import {
  loginSchema,
  resetPasswordSchema,
  securePasswordSchema,
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

  it("callRecordSchema should validate call record payload", () => {
    const parsed = callRecordSchema.safeParse({
      callerId: "c-1",
      guidanceType: "prawno-obywatelskie",
      adviceDescription: "Opis porady prawnej",
      durationMinutes: 30,
    });
    expect(parsed.success).toBe(true);
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

  it("securePasswordSchema should accept strong passwords and reject weak ones", () => {
    expect(securePasswordSchema.safeParse("SilneHaslo123!").success).toBe(true);
    expect(securePasswordSchema.safeParse("krotkie1!").success).toBe(false); // < 10
    expect(securePasswordSchema.safeParse("bez_wielkiej_1!").success).toBe(false); // no uppercase
    expect(securePasswordSchema.safeParse("BEZ_MALEJ_1!").success).toBe(false); // no lowercase
    expect(securePasswordSchema.safeParse("BezCyfryWKodzie!").success).toBe(false); // no number
    expect(securePasswordSchema.safeParse("BezZnakuSpecjalnego123").success).toBe(false); // no special
    expect(securePasswordSchema.safeParse("HasloSynapsis123!").success).toBe(false); // contains synapsis
  });

  it("resetPasswordSchema should require valid email, secure password and reset code", () => {
    const valid = resetPasswordSchema.safeParse({
      email: "spec@synapsis.org.pl",
      newPassword: "SilneHaslo2026!",
      resetCode: "123456",
    });
    expect(valid.success).toBe(true);

    const weak = resetPasswordSchema.safeParse({
      email: "spec@synapsis.org.pl",
      newPassword: "synapsis2026",
      resetCode: "123456",
    });
    expect(weak.success).toBe(false);
  });

  it("specialistSchema should validate initialPassword if provided", () => {
    const withValidPwd = specialistSchema.safeParse({
      name: "mgr Jan Kowalski",
      email: "j.kowalski@synapsis.org.pl",
      initialPassword: "SilneHaslo2026!",
    });
    expect(withValidPwd.success).toBe(true);

    const withWeakPwd = specialistSchema.safeParse({
      name: "mgr Jan Kowalski",
      email: "j.kowalski@synapsis.org.pl",
      initialPassword: "weak",
    });
    expect(withWeakPwd.success).toBe(false);
  });
});
