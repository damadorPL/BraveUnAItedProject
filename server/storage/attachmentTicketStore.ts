import crypto from "crypto";

export interface AttachmentTicket {
  nonce: string;
  attachmentId: string;
  userId?: string;
  expiresAt: number;
}

// In-memory store for single-use attachment download tickets (nonces)
const tickets = new Map<string, AttachmentTicket>();

// Default ticket time-to-live: 60 seconds
export const DEFAULT_TICKET_TTL_SECONDS = 60;

/**
 * Creates a cryptographically secure single-use ticket (nonce)
 * valid for downloading a specific attachment.
 */
export function createAttachmentTicket(
  attachmentId: string,
  userId?: string,
  ttlSeconds: number = DEFAULT_TICKET_TTL_SECONDS
): { ticket: string; expiresIn: number; expiresAt: number } {
  cleanupExpiredTickets();

  const nonce = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + ttlSeconds * 1000;

  tickets.set(nonce, {
    nonce,
    attachmentId,
    userId,
    expiresAt,
  });

  return {
    ticket: nonce,
    expiresIn: ttlSeconds,
    expiresAt,
  };
}

/**
 * Validates and consumes a single-use ticket (nonce) for a given attachment.
 * If valid, the ticket is immediately deleted to prevent replay attacks.
 * Returns true if valid and consumed, false otherwise.
 */
export function consumeAttachmentTicket(nonce: string, attachmentId: string): boolean {
  if (!nonce || typeof nonce !== "string") {
    return false;
  }

  const record = tickets.get(nonce);
  if (!record) {
    return false;
  }

  // Remove the ticket immediately regardless of result to enforce single-use
  tickets.delete(nonce);

  // Check expiration
  if (Date.now() > record.expiresAt) {
    return false;
  }

  // Check attachment ID binding
  if (record.attachmentId !== attachmentId) {
    return false;
  }

  return true;
}

/**
 * Periodically cleans up expired tickets from memory.
 */
export function cleanupExpiredTickets(): void {
  const now = Date.now();
  for (const [nonce, record] of tickets.entries()) {
    if (now > record.expiresAt) {
      tickets.delete(nonce);
    }
  }
}

/**
 * Helper for test isolation to clear all stored tickets.
 */
export function _resetTicketStore(): void {
  tickets.clear();
}
