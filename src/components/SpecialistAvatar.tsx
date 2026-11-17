import React, { useState } from "react";
import { getSpecialistInitials } from "../services/auth";

interface SpecialistAvatarProps {
  name: string;
  avatarBg?: string;
  avatarUrl?: string;
  // Size, shape, and typography classes for initials, e.g. "w-7 h-7 rounded-lg text-[10px] font-black"
  className: string;
}

function sanitizeAvatarUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,[a-zA-Z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
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
