import { Attachment, AttachmentType } from "../types/index";

export function detectAttachmentType(fileName: string, mimeType?: string): AttachmentType {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const mime = (mimeType || "").toLowerCase();

  if (mime.includes("pdf") || ext === "pdf") return "pdf";
  if (
    mime.includes("image") ||
    ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext)
  ) {
    return "image";
  }
  if (
    mime.includes("sheet") ||
    mime.includes("excel") ||
    mime.includes("csv") ||
    ["xlsx", "xls", "csv", "ods"].includes(ext)
  ) {
    return "excel";
  }
  if (
    mime.includes("text") ||
    mime.includes("word") ||
    mime.includes("document") ||
    ["txt", "doc", "docx", "rtf", "odt", "md"].includes(ext)
  ) {
    return "text";
  }
  return "other";
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const AVATAR_DIMENSION = 256;

// Returns an error message or null if file is valid for an avatar.
export function validateAvatarFile(file: { type: string; size: number }): string | null {
  if (!file.type.toLowerCase().startsWith("image/")) {
    return "Wybrany plik nie jest obrazem. Dozwolone formaty: JPG, PNG, WEBP.";
  }
  if (file.size > AVATAR_MAX_FILE_SIZE) {
    return `Plik jest za duży (maksymalnie ${formatFileSize(AVATAR_MAX_FILE_SIZE)}).`;
  }
  return null;
}

// Crops the image to a center square and scales it to AVATAR_DIMENSION,
// returning a JPEG data URL — compact enough to fit in localStorage.
export function processAvatarImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      if (!side) {
        reject(new Error("Obraz ma zerowe wymiary"));
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_DIMENSION;
      canvas.height = AVATAR_DIMENSION;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D jest niedostępny w tej przeglądarce"));
        return;
      }
      // JPEG does not support transparency — use white background for PNG with alpha.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, AVATAR_DIMENSION, AVATAR_DIMENSION);
      ctx.drawImage(
        img,
        (img.naturalWidth - side) / 2,
        (img.naturalHeight - side) / 2,
        side,
        side,
        0,
        0,
        AVATAR_DIMENSION,
        AVATAR_DIMENSION
      );
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Nie udało się wczytać obrazu"));
    };
    img.src = objectUrl;
  });
}

export async function createAttachmentFromFile(
  file: File,
  specialistName: string,
  description?: string
): Promise<Attachment> {
  const dataUrl = await readFileAsDataUrl(file);
  const type = detectAttachmentType(file.name, file.type);

  return {
    id: "att-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    name: file.name,
    size: file.size,
    type,
    mimeType: file.type || "application/octet-stream",
    dataUrl,
    uploadedAt: new Date().toISOString(),
    uploadedBySpecialistName: specialistName,
    description: description || "",
  };
}
