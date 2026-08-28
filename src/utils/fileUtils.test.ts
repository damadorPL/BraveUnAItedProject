import { describe, it, expect } from "vitest";
import {
  detectAttachmentType,
  formatFileSize,
  validateAvatarFile,
  AVATAR_MAX_FILE_SIZE,
} from "./fileUtils";

describe("File Utilities", () => {
  describe("detectAttachmentType", () => {
    it("should detect PDF files by extension or mime type", () => {
      expect(detectAttachmentType("orzeczenie_wzon.pdf")).toBe("pdf");
      expect(detectAttachmentType("skan_dokumentu.PDF")).toBe("pdf");
      expect(detectAttachmentType("plik_bez_rozszerzenia", "application/pdf")).toBe("pdf");
    });

    it("should detect Image files", () => {
      expect(detectAttachmentType("zdjecie.jpg")).toBe("image");
      expect(detectAttachmentType("skan.png")).toBe("image");
      expect(detectAttachmentType("fotografia.webp")).toBe("image");
      expect(detectAttachmentType("plik", "image/jpeg")).toBe("image");
    });

    it("should detect Excel and spreadsheet files", () => {
      expect(detectAttachmentType("baza_porad.xlsx")).toBe("excel");
      expect(detectAttachmentType("arkusz.xls")).toBe("excel");
      expect(detectAttachmentType("dane.csv")).toBe("excel");
      expect(detectAttachmentType("raport.ods")).toBe("excel");
      expect(detectAttachmentType("dane", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).toBe("excel");
    });

    it("should detect text and Word documents", () => {
      expect(detectAttachmentType("notatka.txt")).toBe("text");
      expect(detectAttachmentType("pismo_odwolawcze.docx")).toBe("text");
      expect(detectAttachmentType("wniosek.doc")).toBe("text");
      expect(detectAttachmentType("instrukcja.md")).toBe("text");
      expect(detectAttachmentType("dokument", "application/msword")).toBe("text");
    });

    it("should fallback to other for unknown types", () => {
      expect(detectAttachmentType("archiwum.zip")).toBe("other");
      expect(detectAttachmentType("program.exe")).toBe("other");
    });
  });

  describe("formatFileSize", () => {
    it("should return 0 B for 0 or falsy values", () => {
      expect(formatFileSize(0)).toBe("0 B");
    });

    it("should format bytes correctly", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });

    it("should format kilobytes correctly", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(2048)).toBe("2 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });

    it("should format megabytes correctly", () => {
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.5 MB");
    });

    it("should format gigabytes correctly", () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    });
  });

  describe("validateAvatarFile", () => {
    it("should accept image files within the size limit", () => {
      expect(validateAvatarFile({ type: "image/jpeg", size: 500 * 1024 })).toBeNull();
      expect(validateAvatarFile({ type: "image/png", size: AVATAR_MAX_FILE_SIZE })).toBeNull();
      expect(validateAvatarFile({ type: "IMAGE/WEBP", size: 1024 })).toBeNull();
    });

    it("should reject non-image files", () => {
      expect(validateAvatarFile({ type: "application/pdf", size: 1024 })).toMatch(
        /nie jest obrazem/
      );
      expect(validateAvatarFile({ type: "", size: 1024 })).toMatch(/nie jest obrazem/);
    });

    it("should reject images above the size limit", () => {
      expect(validateAvatarFile({ type: "image/jpeg", size: AVATAR_MAX_FILE_SIZE + 1 })).toMatch(
        /za duży/
      );
    });
  });
});
