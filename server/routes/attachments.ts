import { Router, Response } from "express";
import multer from "multer";
import {
  authenticateJWT,
  verifyJWT,
  AuthenticatedRequest,
} from "../middleware/auth.js";
import {
  saveAttachmentFile,
  getAttachmentFilePath,
  deleteAttachmentFile,
} from "../storage/attachmentStorage.js";

export const attachmentsRouter = Router();

// Configure multer (memory storage with 50MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

// POST /api/attachments/upload
attachmentsRouter.post(
  "/upload",
  authenticateJWT,
  upload.single("file"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Brak pliku do przesłania" });
        return;
      }

      const specialistName =
        req.user?.name || (req.body.specialistName as string) || "Specjalista";
      const description = (req.body.description as string) || "";

      const attachment = await saveAttachmentFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        specialistName,
        description
      );

      res.status(201).json({
        success: true,
        attachment,
      });
    } catch (err: any) {
      console.error("Error uploading attachment:", err);
      res.status(500).json({ error: err.message || "Błąd zapisu pliku na serwerze" });
    }
  }
);

// GET /api/attachments/:id
attachmentsRouter.get("/:id", (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // Check auth from Header or Query Token
    let token = "";
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7).trim();
    } else if (typeof req.query.token === "string") {
      token = req.query.token;
    }

    if (!token || !verifyJWT(token)) {
      res.status(401).json({ error: "Wymagana autoryzacja do pobrania załącznika" });
      return;
    }

    const fileInfo = getAttachmentFilePath(id);
    if (!fileInfo) {
      res.status(404).json({ error: "ZałŅcznik nie został znaleziony" });
      return;
    }

    const isDownload = req.query.download === "1" || req.query.download === "true";
    if (isDownload) {
      const filename = (req.query.filename as string) || fileInfo.storageFilename;
      res.download(fileInfo.filePath, filename);
    } else {
      res.sendFile(fileInfo.filePath);
    }
  } catch (err: any) {
    console.error("Error serving attachment:", err);
    res.status(500).json({ error: err.message || "Błąd odczytu pliku" });
  }
});

// DELETE /api/attachments/:id
attachmentsRouter.delete("/:id", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await deleteAttachmentFile(id);
    res.json({ success: true, deleted });
  } catch (err: any) {
    console.error("Error deleting attachment:", err);
    res.status(500).json({ error: err.message || "Błąd usuwania pliku" });
  }
});
