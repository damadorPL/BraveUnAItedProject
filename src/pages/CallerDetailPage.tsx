import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ContactHistoryView } from "../components/ContactHistoryView";
import { ArrowLeft, UserX } from "lucide-react";

export const CallerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { callers, selectedCaller, setSelectedCaller } = useApp();
  const navigate = useNavigate();

  const caller = callers.find((c) => c.id === id);

  useEffect(() => {
    if (caller && (!selectedCaller || selectedCaller.id !== caller.id)) {
      setSelectedCaller(caller);
    }
  }, [caller, selectedCaller, setSelectedCaller]);

  if (!caller) {
    return (
      <div className="bg-white dark:bg-[#242220] rounded-3xl border border-slate-200 dark:border-[#3E3A37] p-8 text-center shadow-xs space-y-4 max-w-lg mx-auto mt-10">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <UserX className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Nie znaleziono kartoteki kontaktu
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Kartoteka o identyfikatorze <code>{id}</code> mogła zostać usunięta lub scalona z innym kontaktem.
        </p>
        <button
          type="button"
          onClick={() => navigate("/search")}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Wróć do bazy kontaktów</span>
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in">
      <ContactHistoryView caller={caller} />
    </div>
  );
};
