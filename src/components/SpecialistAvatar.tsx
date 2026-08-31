import React, { useState, useEffect } from "react";
import { getSpecialistInitials } from "../services/auth";

interface SpecialistAvatarProps {
  name: string;
  avatarBg?: string;
  avatarUrl?: string;
  // Klasy rozmiaru, kształtu i typografii inicjałów, np. "w-7 h-7 rounded-lg text-[10px] font-black"
  className: string;
}

// Awatar konsultanta: zdjęcie profilowe (avatarUrl), a gdy go brak — inicjały
// na kolorowym tle avatarBg. Renderowany jako <span>/<img>, bo bywa osadzany
// wewnątrz <button>, gdzie <div> byłby niepoprawnym HTML.
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
