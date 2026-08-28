import React from "react";
import { useApp } from "../context/AppContext";
import {
  BarChart3,
  PhoneCall,
  Users,
  Clock,
  ShieldCheck,
  Scale,
  Brain,
  GraduationCap,
  MapPin,
  Award,
  HeartHandshake,
} from "lucide-react";

export const StatsBar: React.FC = () => {
  const { records, callers } = useApp();

  const totalMinutes = records.reduce((acc, r) => acc + (r.durationMinutes || 30), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const legalCount = records.filter((r) => r.guidanceType === "prawno-obywatelskie").length;
  const psychCount = records.filter((r) => r.guidanceType === "w zakresie psychologii i rehabilitacji społecznej").length;
  const p2pCount = records.filter((r) => r.guidanceType === "Parent to Parent").length;
  const socCount = records.filter((r) => r.guidanceType === "społeczne").length;

  const voivodeshipCounts: { [key: string]: number } = {};
  callers.forEach((c) => {
    voivodeshipCounts[c.voivodeship] = (voivodeshipCounts[c.voivodeship] || 0) + 1;
  });

  const topVoivodeships = Object.entries(voivodeshipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const certCount = callers.filter((c) => c.hasDisabilityCertificate === "tak").length;

  return (
    <div className="space-y-6 text-xs animate-in fade-in">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-[11px]">
              Udzielone porady
            </span>
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{records.length}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Zarejestrowane porady telefoniczne i mailowe
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-[11px]">
              Kartoteki dzwoniących
            </span>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{callers.length}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Unikalni beneficjenci w bazie
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-[11px]">
              Posiadający orzeczenie OzN
            </span>
            <div className="bg-purple-50 text-purple-600 p-2.5 rounded-2xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {certCount} <span className="text-sm font-normal text-slate-400">({callers.length > 0 ? Math.round((certCount / callers.length) * 100) : 0}%)</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Osoby ze zdiagnozowanym stopniem / orzeczeniem
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-[11px]">
              Godziny dyżurów
            </span>
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalHours} godz.</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Łączny czas udzielonego wsparcia
          </div>
        </div>
      </div>

      {/* Breakdown by Guidance Type and Top Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guidance Types Chart Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Struktura rodzajów poradnictwa</span>
          </h3>

          <div className="space-y-3.5">
            {/* Psychologia */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-purple-600" /> W zakresie psychologii i rehabilitacji społecznej
                </span>
                <span>
                  {psychCount} ({records.length > 0 ? Math.round((psychCount / records.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: records.length > 0 ? (psychCount / records.length) * 100 + "%" : "0%" }}
                />
              </div>
            </div>

            {/* Prawno-obywatelskie */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-600" /> Prawno-obywatelskie (WZON, szkoła, ZUS, prawo)
                </span>
                <span>
                  {legalCount} ({records.length > 0 ? Math.round((legalCount / records.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: records.length > 0 ? (legalCount / records.length) * 100 + "%" : "0%" }}
                />
              </div>
            </div>

            {/* Parent to Parent */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" /> Parent to Parent (doradztwo rodzicielskie)
                </span>
                <span>
                  {p2pCount} ({records.length > 0 ? Math.round((p2pCount / records.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: records.length > 0 ? (p2pCount / records.length) * 100 + "%" : "0%" }}
                />
              </div>
            </div>

            {/* Społeczne */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> Społeczne (diagnostyka, wsparcie terapeutyczne)
                </span>
                <span>
                  {socCount} ({records.length > 0 ? Math.round((socCount / records.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: records.length > 0 ? (socCount / records.length) * 100 + "%" : "0%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Regions Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Zasięg geograficzny (województwa)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {topVoivodeships.map(([vName, count]) => (
              <div key={vName} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <div className="text-[10px] text-slate-400 font-semibold">Województwo</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{vName}</div>
                <div className="text-xs text-indigo-600 font-semibold mt-1">
                  {count} {count === 1 ? "kartoteka" : "kartotek"}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Linia poradnicza obsługuje zgłoszenia ze wszystkich 16 województw w ramach umowy z PFRON.
          </div>
        </div>
      </div>
    </div>
  );
};
