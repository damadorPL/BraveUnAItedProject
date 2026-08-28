import React, { useState, useRef, useEffect } from "react";
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
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Table,
} from "lucide-react";
import { formatFileSize, createAttachmentFromFile } from "../utils/fileUtils";
import * as XLSX from "xlsx";

interface Props {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  specialistName: string;
  title?: string;
  readOnly?: boolean;
  compact?: boolean;
}

export const AttachmentsManager: React.FC<Props> = ({
  attachments = [],
  onChange,
  specialistName,
  title = "Załączniki i dokumentacja",
  readOnly = false,
  compact = false,
}) => {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [excelPreviewData, setExcelPreviewData] = useState<{ headers: string[]; rows: any[][] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When previewing an excel file, parse base64 or create preview
  useEffect(() => {
    if (previewAttachment?.type === "excel") {
      try {
        if (previewAttachment.dataUrl && previewAttachment.dataUrl.includes("base64,")) {
          const base64Data = previewAttachment.dataUrl.split("base64,")[1];
          const workbook = XLSX.read(base64Data, { type: "base64" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
          if (data.length > 0) {
            setExcelPreviewData({
              headers: data[0].map(String),
              rows: data.slice(1, 15),
            });
            return;
          }
        }
      } catch (err) {
        console.warn("Could not parse excel dataUrl:", err);
      }

      // Sample fallback spreadsheet preview for demo files
      setExcelPreviewData({
        headers: ["Lp.", "Kategoria wsparcia", "Punkty WZON", "Wysokość świadczenia (PLN)", "Status"],
        rows: [
          ["1", "Poziom potrzeby wsparcia - najwyższy", "95 - 100 pkt", "3 919 zł", "Przyznane"],
          ["2", "Poziom potrzeby wsparcia - znaczny", "85 - 94 pkt", "3 135 zł", "Przyznane"],
          ["3", "Poziom potrzeby wsparcia - umiarkowany", "78 - 84 pkt", "2 351 zł", "Odwołanie w toku"],
          ["4", "Poziom potrzeby wsparcia - podstawowy", "70 - 77 pkt", "1 568 zł", "Wnioskowane"],
        ],
      });
    } else {
      setExcelPreviewData(null);
    }
  }, [previewAttachment]);

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
      if (previewAttachment?.id === id) setPreviewAttachment(null);
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
      // Demo download simulation: create a downloadable text/blob
      const sampleContent = "Plik demonstracyjny dokumentacji ASD\nNazwa: " + att.name + "\nOpis: " + (att.description || "Załącznik do kartoteki.");
      const blob = new Blob([sampleContent], { type: "text/plain;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = att.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Paperclip className="w-4 h-4 text-[#296B6E] dark:text-[#FFB200]" />
          <span>{title} ({attachments.length})</span>
        </label>

        {!readOnly && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 text-[#2D2A28] dark:text-[#FFB200] bg-amber-50 dark:bg-[#1E1C1A] hover:bg-amber-100 dark:hover:bg-[#2A2724] border border-amber-200 dark:border-[#383431] px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer"
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
              ? "border-[#FFB200] bg-[#FFB200]/10 scale-[0.99]"
              : "border-slate-200 dark:border-[#383431] hover:border-[#FFB200] bg-slate-50/50 dark:bg-[#141312] hover:bg-[#FFB200]/5"
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
            <UploadCloud className="w-6 h-6 text-amber-600 dark:text-[#FFB200]" />
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {isUploading ? "Wgrywanie pliku..." : "Przeciągnij pliki tutaj lub kliknij, aby wybrać"}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
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
              className="bg-white dark:bg-[#1E1C1A] border border-slate-200 dark:border-[#383431] hover:border-[#FFB200] dark:hover:border-[#FFB200] rounded-2xl p-3 shadow-xs hover:shadow-sm transition-all flex items-start justify-between gap-2.5 cursor-pointer group"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                <div className="p-2 bg-slate-50 dark:bg-[#141312] rounded-xl shrink-0 group-hover:scale-105 transition-transform border border-slate-100 dark:border-[#2C2927]">
                  {getFileIcon(att.type)}
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate group-hover:text-[#FFB200] transition-colors text-xs" title={att.name}>
                    {att.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
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
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 italic line-clamp-1 mt-1">
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
                  className="p-1.5 text-slate-400 hover:text-[#FFB200] hover:bg-slate-100 dark:hover:bg-[#2A2724] rounded-lg transition-colors cursor-pointer"
                  title="Otwórz podgląd dokumentu"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDownload(att, e)}
                  className="p-1.5 text-slate-400 hover:text-[#FFB200] hover:bg-slate-100 dark:hover:bg-[#2A2724] rounded-lg transition-colors cursor-pointer"
                  title="Pobierz plik na dysk"
                >
                  <Download className="w-4 h-4" />
                </button>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => handleRemove(att.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Usuń załącznik"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Full Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#2D2A28] text-white p-4.5 flex items-center justify-between border-b border-[#3E3A37]">
              <div className="flex items-center space-x-3 truncate pr-3">
                <div className="p-2 bg-[#1E1C1A] rounded-xl border border-[#3E3A37]">
                  {getFileIcon(previewAttachment.type)}
                </div>
                <div className="truncate">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-white truncate">{previewAttachment.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getBadgeColor(previewAttachment.type)}`}>
                      {previewAttachment.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Rozmiar: <strong>{formatFileSize(previewAttachment.size)}</strong> &bull; Dodano: {new Date(previewAttachment.uploadedAt).toLocaleDateString("pl-PL")}
                    {previewAttachment.uploadedBySpecialistName && (
                      <span> przez <strong>{previewAttachment.uploadedBySpecialistName}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {previewAttachment.type === "image" && (
                  <div className="hidden sm:flex items-center space-x-1 bg-[#1E1C1A] p-1 rounded-xl border border-[#3E3A37] mr-1">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                      className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
                      title="Pomniejsz"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-300 font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                      className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
                      title="Powiększ"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => handleDownload(previewAttachment, e)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pobierz</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewAttachment(null);
                    setZoomLevel(1);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#3E3A37] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Interactive Viewer per type */}
            <div className="p-6 overflow-y-auto flex items-center justify-center bg-slate-100/70 dark:bg-[#141312] min-h-[350px] max-h-[70vh]">
              {/* 1. Image Viewer */}
              {previewAttachment.type === "image" && (
                <div className="w-full flex items-center justify-center overflow-auto p-2">
                  <img
                    src={previewAttachment.dataUrl || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"}
                    alt={previewAttachment.name}
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}
                    className="max-h-[58vh] max-w-full rounded-2xl object-contain shadow-lg transition-transform duration-150 border border-slate-200 dark:border-[#383431] bg-white dark:bg-[#1E1C1A]"
                  />
                </div>
              )}

              {/* 2. PDF Viewer */}
              {previewAttachment.type === "pdf" && (
                <div className="w-full h-full flex flex-col items-center">
                  {previewAttachment.dataUrl && previewAttachment.dataUrl.includes("application/pdf") ? (
                    <iframe
                      src={previewAttachment.dataUrl}
                      title={previewAttachment.name}
                      className="w-full h-[60vh] rounded-2xl border border-slate-200 dark:border-[#383431] shadow-sm bg-white dark:bg-[#1E1C1A]"
                    />
                  ) : (
                    <div className="w-full max-w-2xl bg-white dark:bg-[#1E1C1A] rounded-2xl border border-slate-200 dark:border-[#383431] p-6 shadow-sm space-y-4 text-slate-800 dark:text-slate-200">
                      <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-[#2C2927]">
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{previewAttachment.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Dokument PDF włączony do elektronicznej kartoteki</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#141312] p-4 rounded-xl text-xs space-y-2 border border-slate-200 dark:border-[#2C2927]">
                        <div className="font-bold text-slate-700 dark:text-slate-300">Podsumowanie treści dokumentu:</div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {previewAttachment.description || "Orzeczenie o potrzebie kształcenia specjalnego wydane z uwagi na autyzm (w tym Zespół Aspergera). Wskazano konieczność zapewnienia nauczyciela współorganizującego kształcenie oraz zajęć rewalidacyjnych."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400 dark:text-slate-500">Podgląd zintegrowany z czytnikiem dokumentów</span>
                        <button
                          type="button"
                          onClick={(e) => handleDownload(previewAttachment, e)}
                          className="px-4 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Pobierz pełny plik PDF ({formatFileSize(previewAttachment.size)})</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Excel Spreadsheet Viewer */}
              {previewAttachment.type === "excel" && (
                <div className="w-full max-w-3xl bg-white dark:bg-[#1E1C1A] rounded-2xl border border-slate-200 dark:border-[#383431] p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2C2927]">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl">
                        <Table className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">{previewAttachment.name}</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">Podgląd tabeli arkusza kalkulacyjnego</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                      Arkusz 1
                    </span>
                  </div>

                  {excelPreviewData && (
                    <div className="overflow-x-auto border border-slate-200 dark:border-[#383431] rounded-xl shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900 dark:bg-[#141312] text-white text-[11px] font-bold">
                            {excelPreviewData.headers.map((h, i) => (
                              <th key={i} className="py-2.5 px-3 border-r border-slate-800 dark:border-[#2C2927] last:border-r-0">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#2C2927] text-slate-700 dark:text-slate-300">
                          {excelPreviewData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-[#252220]">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="py-2 px-3 border-r border-slate-100 dark:border-[#2C2927] last:border-r-0">
                                  {String(cell || "—")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Text & Word Viewer */}
              {previewAttachment.type !== "image" && previewAttachment.type !== "pdf" && previewAttachment.type !== "excel" && (
                <div className="w-full max-w-2xl bg-white dark:bg-[#1E1C1A] rounded-2xl border border-slate-200 dark:border-[#383431] p-6 shadow-sm space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-[#2C2927]">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{previewAttachment.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Dokument tekstowy</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#141312] p-4 rounded-xl text-xs space-y-2 border border-slate-200 dark:border-[#2C2927]">
                    <div className="font-bold text-slate-700 dark:text-slate-300">Zawartość / opis dokumentu:</div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                      {previewAttachment.description || "Wzór pisma przygotowany dla osoby kontaktowej w celu złożenia odwołania od orzeczenia WZON lub wniosku do dyrekcji szkoły."}
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="button"
                      onClick={(e) => handleDownload(previewAttachment, e)}
                      className="px-4 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Pobierz plik ({formatFileSize(previewAttachment.size)})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
