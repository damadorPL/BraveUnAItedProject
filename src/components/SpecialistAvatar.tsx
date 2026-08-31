import React, { useState, useEffect } from "react";
import { getSpecialistInitials } from "../services/auth";

interface SpecialistAvatarProps {
  name: string;
  avatarBg?: string;
  avatarUrl?: string;
  // Size, shape, and typography classes for initials, e.g. "w-7 h-7 rounded-lg text-[10px] font-black"
  className: string;
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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt=""
        aria-hidden="true"
        onError={() => setHasError(true)}
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
