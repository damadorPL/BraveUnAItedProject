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
import {
  createAttachmentTicket,
  consumeAttachmentTicket,
} from "../storage/attachmentTicketStore.js";

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

// POST /api/attachments/:id/ticket (generate single-use download nonce ticket)
attachmentsRouter.post("/:id/ticket", authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const fileInfo = getAttachmentFilePath(id);
    if (!fileInfo) {
      res.status(404).json({ error: "Załącznik nie został znaleziony" });
      return;
    }

    const ticketData = createAttachmentTicket(id, req.user?.id);
    res.json({
      success: true,
      ticket: ticketData.ticket,
      expiresIn: ticketData.expiresIn,
      expiresAt: ticketData.expiresAt,
      downloadUrl: `/api/attachments/${id}?ticket=${encodeURIComponent(ticketData.ticket)}`,
    });
  } catch (err: any) {
    console.error("Error generating attachment ticket:", err);
    res.status(500).json({ error: err.message || "Błąd generowania biletu pobierania" });
  }
});

// GET /api/attachments/:id
attachmentsRouter.get("/:id", (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    // 1. Check for single-use nonce ticket
    const ticketParam = req.query.ticket || req.query.nonce;
    const ticket = typeof ticketParam === "string" ? ticketParam : undefined;

    let isAuthorized = false;

    if (ticket) {
      const isTicketValid = consumeAttachmentTicket(ticket, id);
      if (!isTicketValid) {
        res.status(401).json({ error: "Jednorazowy bilet pobierania wygasł lub został już wykorzystany" });
        return;
      }
      isAuthorized = true;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      // 2. Direct API call with Bearer header
      const token = req.headers.authorization.substring(7).trim();
      if (token && verifyJWT(token)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      res.status(401).json({ error: "Wymagana autoryzacja do pobrania załącznika" });
      return;
    }

    const fileInfo = getAttachmentFilePath(id);
    if (!fileInfo) {
      res.status(404).json({ error: "Załącznik nie został znaleziony" });
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
