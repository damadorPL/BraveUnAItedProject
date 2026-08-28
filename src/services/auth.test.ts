import { describe, it, expect } from "vitest";
import {
  findSpecialistByEmail,
  verifyDemoPassword,
  getSpecialistInitials,
  DEMO_PASSWORD,
} from "./auth";
import { Specialist } from "../types";

const SPECIALISTS: Specialist[] = [
  {
    id: "spec-admin",
    name: "dr Michał Adamczyk (Admin)",
    role: "Administrator Systemu / Koordynator",
    title: "Administrator",
    guidanceType: "prawno-obywatelskie",
    avatarBg: "bg-rose-600",
    email: "admin@fundacja-spektrum.pl",
    isAdmin: true,
  },
  {
    id: "spec-2",
    name: "mec. Anna Nowak",
    role: "Radca Prawny",
    title: "Prawnik",
    guidanceType: "prawno-obywatelskie",
    avatarBg: "bg-blue-600",
    email: "a.nowak@fundacja-spektrum.pl",
    isAdmin: false,
  },
];

describe("findSpecialistByEmail", () => {
  it("znajduje konto po dokładnym adresie e-mail", () => {
    const found = findSpecialistByEmail(SPECIALISTS, "a.nowak@fundacja-spektrum.pl");
    expect(found?.id).toBe("spec-2");
  });

  it("ignoruje wielkość liter i spacje wokół adresu", () => {
    const found = findSpecialistByEmail(SPECIALISTS, "  Admin@Fundacja-Spektrum.PL ");
    expect(found?.id).toBe("spec-admin");
    expect(found?.isAdmin).toBe(true);
  });

  it("zwraca null dla nieznanego adresu i pustego inputu", () => {
    expect(findSpecialistByEmail(SPECIALISTS, "nieznany@example.com")).toBeNull();
    expect(findSpecialistByEmail(SPECIALISTS, "")).toBeNull();
    expect(findSpecialistByEmail(SPECIALISTS, "   ")).toBeNull();
  });
});

describe("verifyDemoPassword", () => {
  it("akceptuje tylko hasło demo", () => {
    expect(verifyDemoPassword(DEMO_PASSWORD)).toBe(true);
    expect(verifyDemoPassword("zlehaslo")).toBe(false);
    expect(verifyDemoPassword("")).toBe(false);
  });
});

describe("getSpecialistInitials", () => {
  it("pomija tytuły zawodowe i dopiski w nawiasach", () => {
    expect(getSpecialistInitials("dr Michał Adamczyk (Admin)")).toBe("MA");
    expect(getSpecialistInitials("mec. Anna Nowak")).toBe("AN");
    expect(getSpecialistInitials("mgr Joanna Mrożek")).toBe("JM");
  });
});
