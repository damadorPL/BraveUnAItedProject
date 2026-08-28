import React, { useState } from 'react';
import { ShieldCheck, DollarSign, Users, AlertTriangle, FileText, CheckCircle2, Search, Filter, ArrowUpRight, HelpCircle } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { CONSULTATION_TYPES } from '../data/mockData';

export const CoordinatorDashboard: React.FC = () => {
  const { slots, specialists, waitlist, refunds, questionnaires, coordinatorLogs, processRefund } = useBookingStore();

  const [activeTab, setActiveTab] = useState<'visits' | 'refunds' | 'questionnaires' | 'logs'>('visits');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string | null>(null);

  const handleProcessRefund = (refundId: string) => {
    processRefund(refundId);
    setRefundSuccessMsg('Zwrot został pomyślnie zrealizowany w bramce Stripe.');
    setTimeout(() => setRefundSuccessMsg(null), 4000);
  };

  const bookedSlots = slots.filter(s => s.status === 'booked');
  const lowCostBookingsCount = bookedSlots.filter(s => s.type === 'low_cost').length;
  const pendingRefunds = refunds.filter(r => r.status === 'pending');

  const filteredVisits = bookedSlots.filter(s => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const patient = s.bookedBy?.patientName.toLowerCase() || '';
      const spec = s.specialistName.toLowerCase();
      return patient.includes(q) || spec.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cobalt-light text-brand-cobalt text-xs font-mono font-semibold mb-1 border border-brand-cobalt-border">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CENTRUM DOWODZENIA KOORDYNATORA</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-text">
            Moderacja Wizyt & Rozliczenia Fundacji
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Kontrola limitów statutowych (10 wizyt / pacjent, max 4 / tydz. na specjalistę), zwroty Stripe i ankiety
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 bg-brand-green-light border border-brand-green-border px-3.5 py-2 rounded-2xl text-xs font-semibold text-emerald-950">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span>System spójny · Rejestr audytowy nienaruszony</span>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
          <span className="text-xs font-mono text-brand-muted uppercase block">Wizyty zarezerwowane</span>
          <span className="font-mono font-black text-2xl sm:text-3xl text-brand-cobalt mt-1 block">
            {bookedSlots.length}
          </span>
          <span className="text-[11px] text-brand-muted mt-1 block">Ze wszystkich 111 specjalistów</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
          <span className="text-xs font-mono text-brand-muted uppercase block">Wizyty niskopłatne (55 zł)</span>
          <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-700 mt-1 block">
            {lowCostBookingsCount}
          </span>
          <span className="text-[11px] text-emerald-800 font-medium mt-1 block">Zgodnie z limitem fundacji</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
          <span className="text-xs font-mono text-brand-muted uppercase block">Zwroty do wykonania</span>
          <span className="font-mono font-black text-2xl sm:text-3xl text-brand-error mt-1 block">
            {pendingRefunds.length}
          </span>
          <span className="text-[11px] text-brand-muted mt-1 block">Ręczna akceptacja w Stripe</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
          <span className="text-xs font-mono text-brand-muted uppercase block">Oczekujący w kolejce FIFO</span>
          <span className="font-mono font-black text-2xl sm:text-3xl text-purple-700 mt-1 block">
            {waitlist.filter(w => w.status === 'waiting').length}
          </span>
          <span className="text-[11px] text-brand-muted mt-1 block">Automatyczna kaskada</span>
        </div>
      </div>

      {refundSuccessMsg && (
        <div className="bg-brand-green-light border border-brand-green text-emerald-950 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-brand-green" />
          <span>{refundSuccessMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden">
        
        <div className="flex border-b border-brand-border bg-brand-bg px-4 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('visits')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'visits'
                ? 'bg-white text-brand-cobalt border-t-2 border-brand-cobalt shadow-sm'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            1. Wszystkie Wizyty ({bookedSlots.length})
          </button>

          <button
            onClick={() => setActiveTab('refunds')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'refunds'
                ? 'bg-white text-brand-cobalt border-t-2 border-brand-cobalt shadow-sm'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <span>2. Zwroty Stripe</span>
            {pendingRefunds.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-error text-white font-mono font-bold">
                {pendingRefunds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('questionnaires')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'questionnaires'
                ? 'bg-white text-brand-cobalt border-t-2 border-brand-cobalt shadow-sm'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            3. Ankiety 6 pytań ({questionnaires.length})
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-white text-brand-cobalt border-t-2 border-brand-cobalt shadow-sm'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            4. Dziennik Audytowy ({coordinatorLogs.length})
          </button>
        </div>

        {/* Tab 1: Visits Moderation */}
        {activeTab === 'visits' && (
          <div className="p-6 space-y-4">
            
            {/* Search & Filters */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Szukaj pacjenta lub specjalisty..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-cobalt outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-muted font-mono uppercase font-semibold">Typ:</span>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-brand-bg border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-cobalt outline-none cursor-pointer"
                >
                  <option value="all">Wszystkie typy</option>
                  {Object.values(CONSULTATION_TYPES).map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visits Table */}
            <div className="overflow-x-auto border border-brand-border rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-brand-bg border-b border-brand-border text-brand-muted font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Termin</th>
                    <th className="p-3.5">Pacjent</th>
                    <th className="p-3.5">Specjalista</th>
                    <th className="p-3.5">Typ / Cena</th>
                    <th className="p-3.5">Obecność</th>
                    <th className="p-3.5">Płatność</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredVisits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-brand-muted">
                        Brak wizyt spełniających kryteria wyszukiwania.
                      </td>
                    </tr>
                  ) : (
                    filteredVisits.map(slot => (
                      <tr key={slot.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold whitespace-nowrap text-brand-text">
                          {slot.date} {slot.time}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-brand-text">{slot.bookedBy?.patientName}</div>
                          <div className="text-[11px] text-brand-muted font-mono">{slot.bookedBy?.patientPhone}</div>
                        </td>
                        <td className="p-3.5 font-medium text-brand-text whitespace-nowrap">
                          {slot.specialistName}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${CONSULTATION_TYPES[slot.type]?.badgeColor}`}>
                            {slot.price} zł
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            slot.attendanceStatus === 'completed'
                              ? 'bg-brand-green-light text-emerald-900'
                              : slot.attendanceStatus === 'no_show'
                              ? 'bg-brand-error-light text-brand-error'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {slot.attendanceStatus === 'completed' ? 'Odbyta ✓' : slot.attendanceStatus === 'no_show' ? 'Nieobecność ✗' : 'Zaplanowana'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-brand-muted whitespace-nowrap">
                          {slot.bookedBy?.paymentMethod}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 2: Stripe Refunds */}
        {activeTab === 'refunds' && (
          <div className="p-6 space-y-4">
            <div className="bg-brand-cream border border-amber-300 p-4 rounded-2xl text-xs text-amber-950 leading-relaxed">
              <strong>Zasada Fundacji Niepodzielni:</strong> Zwroty po odwołaniu wizyty (&gt;24h) nie są wysyłane bezmyślnie automatem — system gromadzi je na liście „Do wykonania”, a koordynator zatwierdza zlecenie w panelu Stripe.
            </div>

            <div className="overflow-x-auto border border-brand-border rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-brand-bg border-b border-brand-border text-brand-muted font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">ID Zwrotu</th>
                    <th className="p-3.5">Pacjent</th>
                    <th className="p-3.5">Kwota</th>
                    <th className="p-3.5">Data odwołania</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Akcja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {refunds.map(ref => (
                    <tr key={ref.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3.5 font-mono text-xs font-bold text-brand-muted">
                        {ref.id}
                      </td>
                      <td className="p-3.5 font-semibold text-brand-text">
                        {ref.patientName} ({ref.patientPhone})
                      </td>
                      <td className="p-3.5 font-mono font-bold text-brand-error text-base">
                        {ref.amount} zł
                      </td>
                      <td className="p-3.5 text-xs text-brand-muted font-mono">
                        {ref.cancelledAt}
                      </td>
                      <td className="p-3.5">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          ref.status === 'pending'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-brand-green-light text-emerald-950 border-brand-green-border'
                        }`}>
                          {ref.status === 'pending' ? 'Oczekuje na zatwierdzenie' : 'Zrealizowany ✓'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {ref.status === 'pending' ? (
                          <button
                            onClick={() => handleProcessRefund(ref.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs transition-all shadow-sm active:scale-98"
                          >
                            Zatwierdź zwrot w Stripe
                          </button>
                        ) : (
                          <span className="text-xs text-brand-muted font-mono">
                            Zatwierdzono ({ref.completedAt?.split(' ')[0]})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Questionnaires (6 Pytań) */}
        {activeTab === 'questionnaires' && (
          <div className="p-6 space-y-4">
            <div className="bg-brand-cobalt-light border border-brand-cobalt-border p-4 rounded-2xl text-xs text-brand-cobalt leading-relaxed">
              <strong>Zgodność z RODO i standardem Fundacji:</strong> Ankieta pierwszego kontaktu zawiera dokładnie 6 pytań zamkniętych. Celowo brak pola opisowego oraz pytań o diagnozy lekarskie, aby nie przetwarzać niepotrzebnych danych wrażliwych.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questionnaires.map(q => (
                <div key={q.id} className="bg-brand-bg rounded-2xl p-5 border border-brand-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-sm text-brand-text">{q.patientName}</h3>
                      <p className="text-xs text-brand-muted font-mono">{q.patientPhone} · {q.patientEmail}</p>
                    </div>
                    <span className="text-[11px] font-mono text-brand-muted">{q.submittedAt}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-brand-text bg-white p-3.5 rounded-xl border border-brand-border">
                    <p><strong>1. Grupa wiekowa:</strong> {q.q1_ageGroup}</p>
                    <p><strong>2. Preferowany format:</strong> {q.q2_preferredFormat}</p>
                    <p><strong>3. Pilność zgłoszenia:</strong> {q.q3_urgency}</p>
                    <p><strong>4. Doświadczenie terapeutyczne:</strong> {q.q4_previousTherapy}</p>
                    <p><strong>5. Dostępność czasowa:</strong> {q.q5_preferredDays}</p>
                    <p><strong>6. Zgoda na przetwarzanie:</strong> {q.q6_consentData ? 'Tak (RODO ✓)' : 'Brak'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Append-Only Logs */}
        {activeTab === 'logs' && (
          <div className="p-6 space-y-4">
            <div className="divide-y divide-brand-border border border-brand-border rounded-2xl overflow-hidden bg-white">
              {coordinatorLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-cobalt-light text-brand-cobalt border border-brand-cobalt-border">
                        {log.action}
                      </span>
                      <span className="font-mono text-xs text-brand-muted">{log.timestamp}</span>
                      <span className="text-brand-muted">·</span>
                      <span className="text-xs text-brand-muted">Aktor: <strong>{log.actor}</strong></span>
                    </div>
                    <p className="text-brand-text font-medium">{log.details}</p>
                  </div>
                  <div className="text-right font-mono text-xs text-brand-muted shrink-0">
                    Slot: <span className="font-bold text-brand-text">{log.slotId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
