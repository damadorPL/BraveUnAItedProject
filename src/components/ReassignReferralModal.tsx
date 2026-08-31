import React, { useState } from "react";
import { CallRecord, Caller } from "../types";
import { useApp } from "../context/AppContext";
import { UserCheck, X } from "lucide-react";
import { SpecialistAvatar } from "./SpecialistAvatar";

interface Props {
  isOpen: boolean;
  record: CallRecord | null;
  onClose: () => void;
  onSuccess?: (updatedRecord: CallRecord) => void;
}

const ReassignModalForm: React.FC<{
  record: CallRecord;
  onClose: () => void;
  onSuccess?: (updatedRecord: CallRecord) => void;
}> = ({ record, onClose, onSuccess }) => {
  const { specialists, callers, updateRecord } = useApp();

  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>(() => {
    return (
      record.referredSpecialistId ||
      specialists.find(
        (s) =>
          record.referredTo &&
          s.name.toLowerCase().includes(record.referredTo.toLowerCase())
      )?.id ||
      specialists[0]?.id ||
      ""
    );
  });

  const [note, setNote] = useState<string>(() => record.referredNote || "");
  const [isSaving, setIsSaving] = useState(false);

  const caller: Caller | undefined = callers.find((c) => c.id === record.callerId);
  const targetSpecialist = specialists.find((s) => s.id === selectedSpecialistId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSpecialist) return;

    setIsSaving(true);
    try {
      const updated: CallRecord = {
        ...record,
        referredTo: targetSpecialist.name,
        referredSpecialistId: targetSpecialist.id,
        referredStatus: "OCZEKUJĄCA",
        referredNote: note.trim(),
      };

      updateRecord(updated);
      onSuccess?.(updated);
      onClose();
    } catch (err) {
      console.error("Error reassigning referral:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-lg overflow-hidden flex flex-col my-6">
        {/* Header */}
        <div className="bg-[#2D2A28] text-white p-5 flex items-center justify-between border-b border-[#3E3A37] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#FFB200]/20 text-[#FFB200] rounded-2xl border border-[#FFB200]/40">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white">Przepisz sprawę</h3>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                  Tryb administratora
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Zmień dyżurującego specjalistę przypisanego do tej konsultacji
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Beneficiary Card Summary */}
          <div className="bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#383431] rounded-2xl p-3.5 space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Dotyczy beneficjenta:
            </div>
            <div className="font-black text-sm text-slate-900 dark:text-white">
              {caller ? `${caller.firstName} ${caller.lastName}` : "Kontakt z bazy"}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {caller?.phoneNumber || "Brak nr"} • {caller?.city || "—"} ({caller?.voivodeship})
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-[#282522]">
              Pierwotnie przekazał/a: <strong className="text-slate-800 dark:text-slate-200">{record.specialistName}</strong> (data: {new Date(record.callDate || record.createdAt).toLocaleDateString("pl-PL")})
            </div>
          </div>

          {/* Current Referral Info */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-3 text-amber-950 dark:text-amber-200 space-y-1">
            <div className="font-bold text-[11px] text-amber-900 dark:text-[#FFB200]">
              Aktualnie przypisano do:
            </div>
            <div className="font-extrabold text-xs">
              {record.referredTo || "Nie określono"}
            </div>
          </div>

          {/* New Specialist Selection */}
          <div className="space-y-1.5">
            <label htmlFor="reassign-specialist" className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
              Nowy przypisany specjalista (Docelowy):
            </label>
            <select
              id="reassign-specialist"
              value={selectedSpecialistId}
              onChange={(e) => setSelectedSpecialistId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#383431] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#FFB200] cursor-pointer"
            >
              <option value="" disabled>
                -- Wybierz specjalistę --
              </option>
              {specialists.map((spec) => (
                <option key={spec.id} value={spec.id} className="dark:bg-[#1E1C1A]">
                  {spec.name} - {spec.title} ({spec.guidanceType})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Specialist Preview */}
          {targetSpecialist && (
            <div className="flex items-center space-x-3 p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl animate-in fade-in">
              <SpecialistAvatar name={targetSpecialist.name} className="w-8 h-8 rounded-xl text-xs font-black" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-emerald-950 dark:text-emerald-200 truncate">
                  {targetSpecialist.name}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
                  {targetSpecialist.title} • {targetSpecialist.guidanceType}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {targetSpecialist.email}
                </div>
              </div>
            </div>
          )}

          {/* Referral Note & Instructions */}
          <div className="space-y-1.5">
            <label htmlFor="reassign-note" className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
              Wytyczne / notatka przekazania dla nowego specjalisty:
            </label>
            <textarea
              id="reassign-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Podaj instrukcje, powód przekazania lub termin planowanego kontaktu..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#141312] border border-slate-300 dark:border-[#383431] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#FFB200]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#383431] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-[#282522] hover:bg-slate-200 dark:hover:bg-[#34302E] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Anuluj
            </button>

            <button
              type="submit"
              disabled={isSaving || !selectedSpecialistId}
              className="px-5 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-xs hover:shadow transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isSaving ? "Zapisywanie..." : "Zapisz i przepisz sprawę"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ReassignReferralModal: React.FC<Props> = ({
  isOpen,
  record,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !record) return null;

  return (
    <ReassignModalForm
      key={record.id}
      record={record}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};
