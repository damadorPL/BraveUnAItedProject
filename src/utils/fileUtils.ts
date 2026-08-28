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
