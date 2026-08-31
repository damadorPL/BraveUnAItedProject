import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-16 h-16 bg-slate-100 dark:bg-[#252018] text-[#FFB200] rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-[#383431]">
        <HelpCircle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        404: Nie znaleziono strony
      </h1>

      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md">
        Adres URL, którego szukasz, nie istnieje w systemie Baza Porad lub został przeniesiony.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/search"
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Wróć do strony głównej</span>
        </Link>
      </div>
    </div>
  );
};
