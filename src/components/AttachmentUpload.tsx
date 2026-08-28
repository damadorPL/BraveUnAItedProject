import React, { useRef } from "react";
import { Attachment } from "../types";
import { Paperclip, X, FileText, Image } from "lucide-react";

const ACCEPTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ACCEPT_ATTR = ".pdf,.jpg,.jpeg,.png";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const formatSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? (bytes / (1024 * 1024)).toFixed(1) + " MB"
    : Math.max(1, Math.round(bytes / 1024)) + " KB";

interface AttachmentUploadProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  attachments,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const rejected: string[] = [];
    const accepted: Attachment[] = [];

    Array.from(files).forEach((file) => {
      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        rejected.push(`${file.name} (dozwolone: PDF, JPG, PNG)`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejected.push(`${file.name} (max 5 MB)`);
        return;
      }
      accepted.push({
        id: "att-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    });

    if (accepted.length > 0) onChange([...attachments, ...accepted]);
    if (rejected.length > 0) {
      alert("Pominięto pliki:\n" + rejected.join("\n"));
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    const target = attachments.find((a) => a.id === id);
    if (target?.url) URL.revokeObjectURL(target.url);
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div>
      <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
        <Paperclip className="w-3.5 h-3.5 text-slate-500" />
        Załączniki (pdf/jpg):
      </label>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        aria-label="Dodaj załączniki PDF lub JPG"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-xl p-2.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors text-left"
      >
        + Dodaj pliki (PDF, JPG, PNG — max 5 MB)
      </button>

      {attachments.length > 0 && (
        <ul className="mt-2 space-y-1">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
            >
              <span className="flex items-center gap-1.5 text-slate-700 truncate">
                {att.type === "application/pdf" ? (
                  <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                ) : (
                  <Image className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                )}
                <span className="truncate font-medium">{att.name}</span>
                <span className="text-slate-400 shrink-0">{formatSize(att.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                aria-label={`Usuń załącznik ${att.name}`}
                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
