import path from "path";
import fs from "fs";
import crypto from "crypto";
import { DatabaseAdapter } from "../db/adapter.js";

export function getAttachmentsDir(): string {
  const customDir = process.env.ATTACHMENTS_DIR;
  if (customDir) {
    return path.resolve(customDir);
  }
  return path.resolve(process.cwd(), "data", "uploads", "attachments");
}

export function initAttachmentStorage(): string {
  const dir = getAttachmentsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export type AttachmentType = "pdf" | "image" | "excel" | "text" | "other";

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

export interface AttachmentMetadata {
  id: string;
  name: string;
  size: number;
  type: AttachmentType;
  mimeType: string;
  url: string;
  storageFilename: string;
  uploadedAt: string;
  uploadedBySpecialistName?: string;
  description?: string;
}

export async function saveAttachmentFile(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  specialistName?: string,
  description?: string
): Promise<AttachmentMetadata> {
  const dir = initAttachmentStorage();
  const id = "att-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex");
  
  const ext = path.extname(originalName).replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
  const storageFilename = `${id}${ext}`;
  const filePath = path.join(dir, storageFilename);

  await fs.promises.writeFile(filePath, fileBuffer);

  const type = detectAttachmentType(originalName, mimeType);

  return {
    id,
    name: originalName,
    size: fileBuffer.length,
    type,
    mimeType: mimeType || "application/octet-stream",
    url: `/api/attachments/${id}`,
    storageFilename,
    uploadedAt: new Date().toISOString(),
    uploadedBySpecialistName: specialistName,
    description: description || "",
  };
}

export function getAttachmentFilePath(id: string): { filePath: string; storageFilename: string } | null {
  if (!id || typeof id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return null;
  }

  const dir = initAttachmentStorage();
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir);
  const match = files.find((f) => f === id || f.startsWith(`${id}.`));

  if (!match) return null;

  const filePath = path.join(dir, match);
  if (!fs.existsSync(filePath)) return null;

  return { filePath, storageFilename: match };
}

export async function deleteAttachmentFile(id: string): Promise<boolean> {
  const info = getAttachmentFilePath(id);
  if (!info) return false;

  try {
    await fs.promises.unlink(info.filePath);
    return true;
  } catch (err) {
    console.error(`Failed to delete attachment ${id}:`, err);
    return false;
  }
}

export async function migrateLegacyBase64Attachments(adapter: DatabaseAdapter): Promise<{
  migratedCount: number;
  skippedCount: number;
}> {
  let migratedCount = 0;
  let skippedCount = 0;

  try {
    const dir = initAttachmentStorage();
    const callers = await adapter.getCallers();

    for (const caller of callers) {
      let modified = false;
      const updatedAttachments = [];

      for (const att of (caller.attachments || [])) {
        if (att.dataUrl && typeof att.dataUrl === "string" && att.dataUrl.startsWith("data:")) {
          try {
            const matches = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1] || att.mimeType || "application/octet-stream";
              const buffer = Buffer.from(matches[2], "base64");
              const ext = path.extname(att.name || "").replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
              const storageFilename = `${att.id}${ext}`;
              const filePath = path.join(dir, storageFilename);

              if (!fs.existsSync(filePath)) {
                await fs.promises.writeFile(filePath, buffer);
              }

              const { dataUrl: _discard, ...rest } = att;
              updatedAttachments.push({
                ...rest,
                url: `/api/attachments/${att.id}`,
                size: att.size || buffer.length,
                mimeType,
                type: att.type || detectAttachmentType(att.name || "", mimeType),
              });
              modified = true;
              migratedCount++;
              continue;
            }
          } catch (e) {
            console.warn(`Could not migrate caller attachment ${att.id}:`, e);
          }
        }
        updatedAttachments.push(att);
        skippedCount++;
      }

      if (modified) {
        await adapter.updateCaller({ ...caller, attachments: updatedAttachments });
      }
    }

    const records = await adapter.getRecords();
    for (const record of records) {
      let modified = false;
      const updatedAttachments = [];

      for (const att of (record.attachments || [])) {
        if (att.dataUrl && typeof att.dataUrl === "string" && att.dataUrl.startsWith("data:")) {
          try {
            const matches = att.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1] || att.mimeType || "application/octet-stream";
              const buffer = Buffer.from(matches[2], "base64");
              const ext = path.extname(att.name || "").replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
              const storageFilename = `${att.id}${ext}`;
              const filePath = path.join(dir, storageFilename);

              if (!fs.existsSync(filePath)) {
                await fs.promises.writeFile(filePath, buffer);
              }

              const { dataUrl: _discard, ...rest } = att;
              updatedAttachments.push({
                ...rest,
                url: `/api/attachments/${att.id}`,
                size: att.size || buffer.length,
                mimeType,
                type: att.type || detectAttachmentType(att.name || "", mimeType),
              });
              modified = true;
              migratedCount++;
              continue;
            }
          } catch (e) {
            console.warn(`Could not migrate record attachment ${att.id}:`, e);
          }
        }
        updatedAttachments.push(att);
        skippedCount++;
      }

      if (modified) {
        await adapter.updateRecord({ ...record, attachments: updatedAttachments });
      }
    }
  } catch (err) {
    console.error("Error during legacy base64 migration:", err);
  }

  return { migratedCount, skippedCount };
}