import React, { useState } from 'react';
import { Calendar, Clock, UserCheck, XCircle, AlertCircle, Plus, CheckCircle2, UserX, Phone, Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { CONSULTATION_TYPES } from '../data/mockData';
import { AttendanceStatus, ConsultationType } from '../types';

export const SpecialistDashboard: React.FC = () => {
  const { 
    specialists, 
    activeSpecialistId, 
    setActiveSpecialistId, 
    slots, 
    updateAttendance, 
    rescheduleSlot, 
    cancelSlotBySpecialist,
    addNewSlot 
  } = useBookingStore();

  const [rescheduleModalSlotId, setRescheduleModalSlotId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('2026-09-03');
  const [newTime, setNewTime] = useState('14:00');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Add new slot modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addSlotDate, setAddSlotDate] = useState('2026-09-03');
  const [addSlotTime, setAddSlotTime] = useState('11:00');
  const [addSlotType, setAddSlotType] = useState<ConsultationType>('low_cost');

  const currentSpecialist = specialists.find(s => s.id === activeSpecialistId) || specialists[0];
  const specialistSlots = slots.filter(s => s.specialistId === currentSpecialist.id);

  const handleRescheduleSubmit = () => {
    if (!rescheduleModalSlotId) return;
    const res = rescheduleSlot(rescheduleModalSlotId, newDate, newTime);
    setActionMessage(res.message);
    setRescheduleModalSlotId(null);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleCancelBySpec = (slotId: string) => {
    const res = cancelSlotBySpecialist(slotId, 'Niedyspozycja specjalisty / pilna zmiana grafiku');
    setActionMessage(res.message);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config = CONSULTATION_TYPES[addSlotType] || CONSULTATION_TYPES.low_cost;
    addNewSlot(currentSpecialist.id, addSlotDate, addSlotTime, addSlotType, config.price);
    setIsAddModalOpen(false);
    setActionMessage(`Dodano nowy termin: ${addSlotDate} ${addSlotTime}.`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header with Specialist Switcher */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentSpecialist.avatar}
            alt={currentSpecialist.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-cobalt/20 shadow-sm"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cobalt-light text-brand-cobalt text-xs font-mono font-semibold mb-1 border border-brand-cobalt-border">
              <span>PANEL SPECJALISTY · KONTROLA WIZYT</span>
            </div>
            <h1 className="font-display font-black text-2xl text-brand-text">
              {currentSpecialist.name}
            </h1>
            <p className="text-xs text-brand-muted">
              {currentSpecialist.role} · Tel: {currentSpecialist.phone}
            </p>
          </div>
        </div>

        {/* Switch Specialist & Add Slot */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-brand-muted mb-1">
              Zmień specjalistę (Profil demo):
            </label>
            <select
              value={activeSpecialistId}
              onChange={e => setActiveSpecialistId(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold bg-brand-bg border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-cobalt outline-none cursor-pointer"
            >
              {specialists.map(sp => (
                <option key={sp.id} value={sp.id}>
                  {sp.name} ({sp.role.split(',')[0]})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 sm:mt-0 px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Dodaj termin</span>
          </button>
        </div>
      </div>

      {/* Alert toast */}
      {actionMessage && (
        <div className="bg-brand-green-light border border-brand-green text-emerald-950 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-brand-green" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Quick Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
          <span className="text-xs font-mono text-brand-muted uppercase block">Wszystkie terminy</span>
          <span className="font-mono font-black text-2xl text-brand-text">{specialistSlots.length}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
          <span className="text-xs font-mono text-brand-muted uppercase block">Zarezerwowane</span>
          <span className="font-mono font-black text-2xl text-brand-cobalt">
            {specialistSlots.filter(s => s.status === 'booked').length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
          <span className="text-xs font-mono text-brand-muted uppercase block">Wolne sloty</span>
          <span className="font-mono font-black text-2xl text-brand-green">
            {specialistSlots.filter(s => s.status === 'free').length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
          <span className="text-xs font-mono text-brand-muted uppercase block">Wizyty niskopłatne (55 zł)</span>
          <span className="font-mono font-black text-2xl text-amber-700">
            {currentSpecialist.weeklyLowCostCount}/4 tyg.
          </span>
        </div>
      </div>

      {/* Slots & Visits Management Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-5 bg-brand-bg border-b border-brand-border flex justify-between items-center">
          <h2 className="font-display font-bold text-base text-brand-text flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-cobalt" />
            Grafik i lista pacjentów ({specialistSlots.length})
          </h2>
          <span className="text-xs text-brand-muted">
            Oznaczaj obecność lub zmieniaj terminy wizyt
          </span>
        </div>

        <div className="divide-y divide-brand-border">
          {specialistSlots.length === 0 ? (
            <div className="p-8 text-center text-brand-muted text-sm">
              Brak zdefiniowanych terminów w grafiku tego specjalisty.
            </div>
          ) : (
            specialistSlots.map(slot => {
              const isBooked = slot.status === 'booked';
              const isFree = slot.status === 'free';
              const isOffered = slot.status === 'offered';

              return (
                <div key={slot.id} className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Slot & Patient Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-brand-text">
                        {slot.date} · {slot.time}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                        CONSULTATION_TYPES[slot.type]?.badgeColor || 'bg-gray-100 text-gray-700'
                      }`}>
                        {CONSULTATION_TYPES[slot.type]?.label} ({slot.price} zł)
                      </span>
                      {slot.rescheduleCount && slot.rescheduleCount > 0 ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                          Przełożona {slot.rescheduleCount}/2
                        </span>
                      ) : null}
                    </div>

                    {isBooked && slot.bookedBy ? (
                      <div className="text-xs text-brand-muted flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-brand-text flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-brand-cobalt" />
                          {slot.bookedBy.patientName}
                        </span>
                        <span className="font-mono">{slot.bookedBy.patientPhone}</span>
                        <span>·</span>
                        <span>Opłacono: {slot.bookedBy.paymentMethod}</span>
                      </div>
                    ) : isFree ? (
                      <span className="text-xs text-brand-green font-semibold">
                        ● Wolny termin – gotowy do rezerwacji
                      </span>
                    ) : isOffered ? (
                      <span className="text-xs text-purple-700 font-semibold animate-pulse">
                        ⚡ Zaoferowany osobie z listy rezerwowej ({slot.offer?.offeredToName})
                      </span>
                    ) : null}
                  </div>

                  {/* Right: Actions & Attendance Status */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    
                    {/* Attendance Pills (if booked) */}
                    {isBooked && (
                      <div className="flex items-center bg-brand-bg p-1 rounded-xl border border-brand-border">
                        <button
                          onClick={() => updateAttendance(slot.id, 'completed')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            slot.attendanceStatus === 'completed'
                              ? 'bg-brand-green text-white shadow-sm'
                              : 'text-brand-muted hover:text-brand-text'
                          }`}
                          title="Oznacz wizytę jako odbytą"
                        >
                          Odbyta ✓
                        </button>
                        <button
                          onClick={() => updateAttendance(slot.id, 'no_show')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            slot.attendanceStatus === 'no_show'
                              ? 'bg-brand-error text-white shadow-sm'
                              : 'text-brand-muted hover:text-brand-text'
                          }`}
                          title="Nieobecność pacjenta"
                        >
                          Nieobecność ✗
                        </button>
                      </div>
                    )}

                    {/* Reschedule Button */}
                    {isBooked && (
                      <button
                        onClick={() => {
                          setRescheduleModalSlotId(slot.id);
                          setNewDate(slot.date);
                          setNewTime(slot.time);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-brand-text text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Zmień termin wizyty"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Przełóż</span>
                      </button>
                    )}

                    {/* Cancel by Specialist Button */}
                    {isBooked && (
                      <button
                        onClick={() => handleCancelBySpec(slot.id)}
                        className="px-3 py-1.5 rounded-xl bg-brand-error-light hover:bg-brand-error/20 text-brand-error border border-brand-error-border text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Odwołaj wizytę i zwolnij termin dla kolejki"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Odwołaj (Kaskada)</span>
                      </button>
                    )}

                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalSlotId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-brand-border shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-brand-text">
              Przełóż termin wizyty pacjenta
            </h3>
            <p className="text-xs text-brand-muted">
              Pacjent natychmiast otrzyma powiadomienie SMS i E-mail o nowym terminie.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Nowa data:</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full p-2.5 text-sm border border-brand-border rounded-xl font-mono focus:ring-2 focus:ring-brand-cobalt outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Nowa godzina:</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full p-2.5 text-sm border border-brand-border rounded-xl font-mono focus:ring-2 focus:ring-brand-cobalt outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setRescheduleModalSlotId(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-text rounded-xl text-xs font-semibold"
              >
                Anuluj
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-4 py-2 bg-brand-cobalt hover:bg-brand-cobalt-dark text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Zapisz i powiadom pacjenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={handleAddSlotSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 border border-brand-border shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-brand-text">
              Dodaj wolny termin do grafiku
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Data:</label>
                <input
                  type="date"
                  value={addSlotDate}
                  onChange={e => setAddSlotDate(e.target.value)}
                  className="w-full p-2.5 text-sm border border-brand-border rounded-xl font-mono focus:ring-2 focus:ring-brand-cobalt outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Godzina:</label>
                <input
                  type="time"
                  value={addSlotTime}
                  onChange={e => setAddSlotTime(e.target.value)}
                  className="w-full p-2.5 text-sm border border-brand-border rounded-xl font-mono focus:ring-2 focus:ring-brand-cobalt outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Rodzaj konsultacji:</label>
                <select
                  value={addSlotType}
                  onChange={e => setAddSlotType(e.target.value as ConsultationType)}
                  className="w-full p-2.5 text-sm border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-cobalt outline-none cursor-pointer"
                >
                  {Object.values(CONSULTATION_TYPES).map(ct => (
                    <option key={ct.id} value={ct.id}>
                      {ct.label} ({ct.price} zł)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-text rounded-xl text-xs font-semibold"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Dodaj termin do bazy
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
