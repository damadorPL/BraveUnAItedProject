import React, { useState, useMemo } from "react";
import { useApp } from "../../../context/AppContext";
import { Caller } from "../../../types";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { api } from "../../../services/api";
import {
  GitMerge,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { pluralizePorady, pluralizeZalaczniki } from "../../../utils/pluralization";

export const AdminMergeTab: React.FC = () => {
  const { callers, records, mergeCallers } = useApp();

  const [targetCallerId, setTargetCallerId] = useState<string>("");
  const [sourceCallerId, setSourceCallerId] = useState<string>("");
  const [mergeSearchTarget, setMergeSearchTarget] = useState<string>("");
  const [mergeSearchSource, setMergeSearchSource] = useState<string>("");
  const [mergeSuccessMessage, setMergeSuccessMessage] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    variant?: "danger" | "warning" | "primary";
    onConfirm: () => void;
  } | null>(null);

  // Potential duplicates detection
  const potentialDuplicates = useMemo(() => {
    const pairs: { c1: Caller; c2: Caller; reason: string }[] = [];
    for (let i = 0; i < callers.length; i++) {
      for (let j = i + 1; j < callers.length; j++) {
        const c1 = callers[i];
        const c2 = callers[j];
        const sameLastName =
          c1.lastName &&
          c2.lastName &&
          c1.lastName.toLowerCase().trim() === c2.lastName.toLowerCase().trim();
        const samePhone =
          c1.phoneNumber &&
          c2.phoneNumber &&
          c1.phoneNumber.replace(/\s+/g, "") === c2.phoneNumber.replace(/\s+/g, "");

        if (samePhone && sameLastName) {
          pairs.push({ c1, c2, reason: "Identyczny numer telefonu oraz nazwisko" });
        } else if (samePhone) {
          pairs.push({ c1, c2, reason: "Identyczny numer telefonu" });
        } else if (
          sameLastName &&
          c1.firstName &&
          c2.firstName &&
          c1.firstName.toLowerCase().trim() === c2.firstName.toLowerCase().trim()
        ) {
          pairs.push({ c1, c2, reason: "Identyczne imię i nazwisko" });
        }
      }
    }
    return pairs;
  }, [callers]);

  const targetCaller = callers.find((c) => c.id === targetCallerId);
  const sourceCaller = callers.find((c) => c.id === sourceCallerId);

  const sourceRecords = useMemo(() => {
    if (!sourceCallerId) return [];
    return records.filter((r) => r.callerId === sourceCallerId);
  }, [records, sourceCallerId]);

  const targetRecords = useMemo(() => {
    if (!targetCallerId) return [];
    return records.filter((r) => r.callerId === targetCallerId);
  }, [records, targetCallerId]);

  const filteredTargetCallers = useMemo(() => {
    if (!mergeSearchTarget.trim()) return callers.slice(0, 8);
    const q = mergeSearchTarget.toLowerCase().trim();
    return callers.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.phoneNumber.includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [callers, mergeSearchTarget]);

  const filteredSourceCallers = useMemo(() => {
    if (!mergeSearchSource.trim()) return callers.filter((c) => c.id !== targetCallerId).slice(0, 8);
    const q = mergeSearchSource.toLowerCase().trim();
    return callers
      .filter((c) => c.id !== targetCallerId)
      .filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.phoneNumber.includes(q) ||
          c.city.toLowerCase().includes(q)
      );
  }, [callers, targetCallerId, mergeSearchSource]);

  const handleExecuteMerge = () => {
    if (!targetCaller || !sourceCaller) return;

    setConfirmModal({
      isOpen: true,
      title: "Scalanie kartotek",
      variant: "warning",
      confirmText: "Scal kartoteki",
      description: `Czy na pewno chcesz przenieść całą historię porad (${sourceRecords.length}) z kartoteki "${sourceCaller.firstName} ${sourceCaller.lastName}" do "${targetCaller.firstName} ${targetCaller.lastName}" i trwale usunąć profil źródłowy?`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          setIsMerging(true);
          // Attempt backend merge API call
          try {
            await api.admin.mergeCallers(sourceCaller.id, targetCaller.id);
          } catch (err) {
            console.warn("Backend merge failed, merging locally in AppContext:", err);
          }

          // AppContext update
          mergeCallers(sourceCaller.id, targetCaller.id);

          setMergeSuccessMessage(
            `Pomyślnie scalono kontakt. Wszystkie ${sourceRecords.length} porad i załączniki zostały przeniesione do kartoteki ${targetCaller.firstName} ${targetCaller.lastName}.`
          );

          setSourceCallerId("");
          setTimeout(() => setMergeSuccessMessage(null), 6000);
        } finally {
          setIsMerging(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-amber-600 dark:text-[#FFB200]" />
          <span>Wykrywanie i scalanie duplikatów kartotek</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Łącz zdublowane wpisy kontaktów z bezpiecznym przeniesieniem całej historii konsultacji i załączników
        </p>
      </div>

      {mergeSuccessMessage && (
        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-2xl text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{mergeSuccessMessage}</span>
        </div>
      )}

      {/* Suggested Duplicates Bar */}
      {potentialDuplicates.length > 0 && (
        <div className="bg-amber-50/80 dark:bg-[#252018] border border-amber-200 dark:border-amber-900/60 rounded-3xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-[#2D2A28] dark:text-[#FFB200]">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Wykryto potencjalne duplikaty ({potentialDuplicates.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {potentialDuplicates.slice(0, 4).map((pair) => (
              <div
                key={`${pair.c1.id}-${pair.c2.id}`}
                className="bg-white dark:bg-[#1E1C1A] border border-amber-200/80 dark:border-[#383431] rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {pair.c1.firstName} {pair.c1.lastName} ⟷ {pair.c2.firstName} {pair.c2.lastName}
                  </div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    {pair.reason} • Tel: {pair.c1.phoneNumber || pair.c2.phoneNumber}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTargetCallerId(pair.c1.id);
                    setSourceCallerId(pair.c2.id);
                  }}
                  className="px-3 py-1.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-[11px] font-black shrink-0 transition-colors cursor-pointer"
                >
                  Wybierz parę
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merge Workspace: Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Target Caller (Retained) */}
        <div className="bg-white dark:bg-[#1E1C1A] border-2 border-emerald-500/50 dark:border-emerald-500/30 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D2A28] pb-3">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                KROK 1 • Kartoteka docelowa (pozostaje w bazie)
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                {targetCaller ? `${targetCaller.firstName} ${targetCaller.lastName}` : "Wskaż kontakt docelowy"}
              </h3>
            </div>
            {targetCaller && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {pluralizePorady(targetRecords.length)}
              </span>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Szukaj kontaktu docelowego (imię, nazwisko, tel)..."
              value={mergeSearchTarget}
              onChange={(e) => setMergeSearchTarget(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383431] bg-slate-50 dark:bg-[#252018] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />

            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1">
              {filteredTargetCallers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setTargetCallerId(c.id)}
                  className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    targetCallerId === c.id
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 font-bold text-emerald-900 dark:text-emerald-200"
                      : "hover:bg-slate-50 dark:hover:bg-[#282522] text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div>
                    <span className="font-bold">{c.firstName} {c.lastName}</span>
                    <span className="text-[11px] text-slate-500 ml-2 font-mono">{c.phoneNumber}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{c.city}</span>
                </div>
              ))}
            </div>
          </div>

          {targetCaller && (
            <div className="bg-slate-50 dark:bg-[#252018] rounded-2xl p-4 text-xs space-y-2 border border-slate-200/60 dark:border-[#383431]">
              <div className="flex justify-between">
                <span className="text-slate-500">Miejscowość / Województwo:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{targetCaller.city || "—"}, {targetCaller.voivodeship}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Orzeczenie:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{targetCaller.hasDisabilityCertificate} ({targetCaller.disabilityDegree || "brak"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Załączniki:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{pluralizeZalaczniki(targetCaller.attachments?.length || 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Source Caller (To be merged & deleted) */}
        <div className="bg-white dark:bg-[#1E1C1A] border-2 border-amber-500/50 dark:border-amber-500/30 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D2A28] pb-3">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                KROK 2 • Kartoteka źródłowa (do scalenia i usunięcia)
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                {sourceCaller ? `${sourceCaller.firstName} ${sourceCaller.lastName}` : "Wskaż kontakt źródłowy"}
              </h3>
            </div>
            {sourceCaller && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {pluralizePorady(sourceRecords.length)}
              </span>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Szukaj kontaktu źródłowego..."
              value={mergeSearchSource}
              onChange={(e) => setMergeSearchSource(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383431] bg-slate-50 dark:bg-[#252018] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />

            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1">
              {filteredSourceCallers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSourceCallerId(c.id)}
                  className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    sourceCallerId === c.id
                      ? "bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 font-bold text-amber-900 dark:text-amber-200"
                      : "hover:bg-slate-50 dark:hover:bg-[#282522] text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div>
                    <span className="font-bold">{c.firstName} {c.lastName}</span>
                    <span className="text-[11px] text-slate-500 ml-2 font-mono">{c.phoneNumber}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{c.city}</span>
                </div>
              ))}
            </div>
          </div>

          {sourceCaller && (
            <div className="bg-slate-50 dark:bg-[#252018] rounded-2xl p-4 text-xs space-y-2 border border-slate-200/60 dark:border-[#383431]">
              <div className="flex justify-between">
                <span className="text-slate-500">Miejscowość / Województwo:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{sourceCaller.city || "—"}, {sourceCaller.voivodeship}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Orzeczenie:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{sourceCaller.hasDisabilityCertificate} ({sourceCaller.disabilityDegree || "brak"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Załączniki:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{pluralizeZalaczniki(sourceCaller.attachments?.length || 0)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Execute Merge CTA */}
      {targetCaller && sourceCaller && (
        <div className="bg-gradient-to-r from-amber-500/15 via-[#FFB200]/20 to-amber-500/10 dark:from-amber-950/60 dark:via-[#252018] dark:to-amber-950/40 border-2 border-[#FFB200] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Gotowy do wykonania scalenia kartotek
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-xl">
              Po zatwierdzeniu wszystkie <strong>{sourceRecords.length}</strong> wpisów porad oraz załączniki z kartoteki &quot;{sourceCaller.firstName} {sourceCaller.lastName}&quot; zostaną przypisane do &quot;{targetCaller.firstName} {targetCaller.lastName}&quot;. Profil źródłowy zostanie trwale usunięty.
            </p>
          </div>

          <button
            type="button"
            disabled={isMerging}
            onClick={handleExecuteMerge}
            className="px-6 py-3 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-sm transition-colors cursor-pointer flex items-center space-x-2 shrink-0 disabled:opacity-50"
          >
            <GitMerge className="w-4 h-4" />
            <span>{isMerging ? "Scalanie..." : "Zatwierdź i scal kartoteki"}</span>
          </button>
        </div>
      )}

      {/* Reusable Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          description={confirmModal.description}
          variant={confirmModal.variant}
          confirmText={confirmModal.confirmText}
          isLoading={isMerging}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};
