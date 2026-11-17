import React, { useState } from "react";
import { getSpecialistInitials } from "../services/auth";

interface SpecialistAvatarProps {
  name: string;
  avatarBg?: string;
  avatarUrl?: string;
  // Size, shape, and typography classes for initials, e.g. "w-7 h-7 rounded-lg text-[10px] font-black"
  className: string;
}

const ALLOWED_DATA_MIME: Record<string, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

function escapeUrlMetaChars(value: string): string {
  return value.replace(
    /['<>`"]/g,
    (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function sanitizeAvatarUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Base64 data URLs for uploaded avatar images (only safe raster formats)
  const dataMatch = /^data:image\/(png|jpeg|jpg|gif|webp);base64,([a-zA-Z0-9+/=]+)$/i.exec(trimmed);
  if (dataMatch) {
    const mime = ALLOWED_DATA_MIME[dataMatch[1].toLowerCase()];
    if (!mime) return null;
    const cleanBase64 = dataMatch[2].replace(/[^a-zA-Z0-9+/=]/g, "");
    return `data:${mime};base64,${cleanBase64}`;
  }

  // Relative app-local paths (exclude protocol-relative "//..." and "/\...")
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    try {
      const parsed = new URL(trimmed, "https://placeholder.invalid");
      if (parsed.origin !== "https://placeholder.invalid") return null;
      return escapeUrlMetaChars(`${parsed.pathname}${parsed.search}${parsed.hash}`);
    } catch {
      return null;
    }
  }

  // External HTTP(S) URLs
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return null;
      }
      return escapeUrlMetaChars(parsed.href);
    } catch {
      return null;
    }
  }

  return null;
}

// Specialist avatar: profile photo (avatarUrl), or fallback initials
// on colored avatarBg background. Rendered as <span>/<img> since it may be
// nested inside <button>, where <div> would be invalid HTML.
export const SpecialistAvatar: React.FC<SpecialistAvatarProps> = ({
  name,
  avatarBg,
  avatarUrl,
  className,
}) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const safeAvatarUrl = sanitizeAvatarUrl(avatarUrl);
  const hasError = Boolean(safeAvatarUrl && failedUrl === safeAvatarUrl);

  if (safeAvatarUrl && !hasError) {
    return (
      <img
        key={safeAvatarUrl}
        src={safeAvatarUrl}
        alt=""
        aria-hidden="true"
        onError={() => setFailedUrl(safeAvatarUrl)}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${avatarBg || "bg-blue-600"} flex items-center justify-center text-white select-none ${className}`}
    >
      {getSpecialistInitials(name)}
    </span>
  );
};
