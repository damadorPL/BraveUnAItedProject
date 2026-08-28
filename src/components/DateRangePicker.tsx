import React, { useEffect, useRef, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  format,
  parseISO,
} from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  dateFrom: string;
  dateTo: string;
  onChange: (from: string, to: string) => void;
  label?: string;
}

const WEEKDAY_LABELS = ["p", "w", "ś", "c", "p", "s", "n"];

export const DateRangePicker: React.FC<Props> = ({ dateFrom, dateTo, onChange, label = "Zakres dat" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => (dateFrom ? parseISO(dateFrom) : new Date()));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const from = dateFrom ? parseISO(dateFrom) : null;
  const to = dateTo ? parseISO(dateTo) : null;

  const toIso = (d: Date) => format(d, "yyyy-MM-dd");

  const handleDayClick = (day: Date) => {
    if (!from || to) {
      // Start a fresh range on this day
      onChange(toIso(day), "");
    } else {
      // Completing the range — keep chronological order regardless of click order
      if (isBefore(day, from)) {
        onChange(toIso(day), toIso(from));
      } else {
        onChange(toIso(from), toIso(day));
      }
      setIsOpen(false);
    }
  };

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // While picking the end date, preview the range under the cursor
  const previewTo = !to && from && hoverDate ? hoverDate : to;
  const rangeStart = from && previewTo && isBefore(previewTo, from) ? previewTo : from;
  const rangeEnd = from && previewTo && isBefore(previewTo, from) ? from : previewTo;

  const displayLabel = from
    ? to
      ? `${format(from, "d MMM yyyy", { locale: pl })} – ${format(to, "d MMM yyyy", { locale: pl })}`
      : `${format(from, "d MMM yyyy", { locale: pl })} – wybierz koniec`
    : "Wybierz zakres dat";

  return (
    <div ref={containerRef} className="relative">
      <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1">
        <CalendarDays className="w-3 h-3 text-slate-400" />
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
      >
        <span className={`truncate text-left ${!from ? "text-slate-400" : ""}`}>{displayLabel}</span>
        {(from || to) && (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onChange("", "");
            }}
            aria-label="Wyczyść zakres dat"
            className="text-slate-400 hover:text-rose-600 ml-2 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 w-72" onMouseLeave={() => setHoverDate(null)}>
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              aria-label="Poprzedni miesiąc"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800 capitalize">
              {format(viewMonth, "LLLL yyyy", { locale: pl })}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              aria-label="Następny miesiąc"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7">
            {WEEKDAY_LABELS.map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-400 text-center pb-1">
                {d}
              </span>
            ))}

            {days.map((day) => {
              const inMonth = isSameMonth(day, viewMonth);
              const isStart = Boolean(from && isSameDay(day, from));
              const isEnd = Boolean(to && isSameDay(day, to));
              const inBand =
                inMonth &&
                rangeStart &&
                rangeEnd &&
                !isSameDay(rangeStart, rangeEnd) &&
                isWithinInterval(day, { start: rangeStart, end: rangeEnd });

              return (
                <div
                  key={day.toISOString()}
                  className={`h-7 flex items-center justify-center ${
                    inBand && !isStart ? "bg-indigo-50" : ""
                  } ${inBand && isSameDay(day, rangeStart!) ? "rounded-l-full" : ""} ${
                    inBand && isSameDay(day, rangeEnd!) ? "rounded-r-full" : ""
                  }`}
                >
                  <button
                    type="button"
                    disabled={!inMonth}
                    onMouseEnter={() => setHoverDate(day)}
                    onClick={() => handleDayClick(day)}
                    className={`h-7 w-7 text-[11px] rounded-full flex items-center justify-center transition-colors ${
                      !inMonth
                        ? "text-transparent pointer-events-none"
                        : isStart || isEnd
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-700 hover:bg-slate-200 cursor-pointer"
                    }`}
                  >
                    {format(day, "d")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
