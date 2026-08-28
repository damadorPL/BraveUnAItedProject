import React, { useState, useRef } from "react";
import { Attachment } from "../types";
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  Download,
  Trash2,
  Paperclip,
  UploadCloud,
  Eye,
  X,
  File,
} from "lucide-react";
import { formatFileSize, createAttachmentFromFile } from "../utils/fileUtils";

interface Props {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  specialistName: string;
  title?: string;
  readOnly?: boolean;
}

export const AttachmentsManager: React.FC<Props> = ({
  attachments = [],
  onChange,
  specialistName,
  title = "Załączniki i dokumentacja",
  readOnly = false,
}) => {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const newAtts: Attachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const att = await createAttachmentFromFile(file, specialistName);
        newAtts.push(att);
      }
      onChange([...attachments, ...newAtts]);
    } catch (err) {
      console.error("Błąd podczas wgrywania pliku:", err);
      alert("Wystąpił błąd podczas odczytu pliku.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Czy na pewno chcesz usunąć ten załącznik?")) {
      onChange(attachments.filter((a) => a.id !== id));
    }
  };

  const handleDownload = (att: Attachment, e: React.MouseEvent) => {
    e.stopPropagation();
    if (att.dataUrl) {
      const link = document.createElement("a");
      link.href = att.dataUrl;
      link.download = att.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Podgląd pliku demonstracyjnego: " + att.name);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-600" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-emerald-600" />;
      case "excel":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-700" />;
      case "text":
        return <FileCode className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "image":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "excel":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "text":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-800 flex items-center gap-1.5">
          <Paperclip className="w-4 h-4 text-indigo-600" />
          <span>{title} ({attachments.length})</span>
        </label>

        {!readOnly && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Dodaj plik</span>
          </button>
        )}
      </div>

      {/* Upload Drag & Drop Area */}
      {!readOnly && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/70 scale-[0.99]"
              : "border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.xlsx,.xls,.csv,.doc,.docx,.txt"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-1">
            <UploadCloud className="w-6 h-6 text-indigo-500" />
            <p className="font-semibold text-slate-700">
              {isUploading ? "Wgrywanie pliku..." : "Przeciągnij pliki tutaj lub kliknij, aby wybrać"}
            </p>
            <p className="text-[11px] text-slate-400">
              Obsługiwane formaty: <strong>PDF</strong>, <strong>Obrazy (JPG, PNG)</strong>, <strong>Excel / CSV</strong>, <strong>Dokumenty tekstowe (DOCX, TXT)</strong>
            </p>
          </div>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {attachments.map((att) => (
            <div
              key={att.id}
              onClick={() => setPreviewAttachment(att)}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3 shadow-xs hover:shadow-sm transition-all flex items-start justify-between gap-2.5 cursor-pointer group"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                <div className="p-2 bg-slate-50 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  {getFileIcon(att.type)}
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors text-xs" title={att.name}>
                    {att.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                    <span className={`px-1.5 py-0.2 rounded font-bold border ${getBadgeColor(att.type)}`}>
                      {att.type.toUpperCase()}
                    </span>
                    <span>{formatFileSize(att.size)}</span>
                    {att.uploadedBySpecialistName && (
                      <>
                        <span>&bull;</span>
                        <span className="truncate max-w-[100px]">{att.uploadedBySpecialistName}</span>
                      </>
                    )}
                  </div>
                  {att.description && (
                    <div className="text-[10px] text-slate-600 italic line-clamp-1 mt-1">
                      {att.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewAttachment(att);
                  }}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="Podgląd załącznika"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDownload(att, e)}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="Pobierz plik"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => handleRemove(att.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Usuń załącznik"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 truncate pr-2">
                {getFileIcon(previewAttachment.type)}
                <div className="truncate">
                  <h3 className="font-bold text-sm truncate">{previewAttachment.name}</h3>
                  <div className="text-[11px] text-slate-400">
                    {formatFileSize(previewAttachment.size)} &bull; Dodano: {new Date(previewAttachment.uploadedAt).toLocaleDateString("pl-PL")}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleDownload(previewAttachment, e)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pobierz</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex items-center justify-center bg-slate-100/50 min-h-[250px]">
              {previewAttachment.type === "image" && previewAttachment.dataUrl ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow"
                />
              ) : previewAttachment.type === "pdf" && previewAttachment.dataUrl ? (
                <iframe
                  src={previewAttachment.dataUrl}
                  title={previewAttachment.name}
                  className="w-full h-[60vh] rounded-xl border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-md shadow-xs">
                  <div className="p-4 bg-indigo-50 rounded-2xl inline-block mb-3">
                    {getFileIcon(previewAttachment.type)}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{previewAttachment.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    {previewAttachment.description || "Plik dokumentacji załączony do kartoteki."}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => handleDownload(previewAttachment, e)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-colors inline-flex items-center space-x-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz plik ({formatFileSize(previewAttachment.size)})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
