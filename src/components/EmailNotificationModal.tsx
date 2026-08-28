import React from "react";
import { useApp } from "../context/AppContext";
import { Mail, CheckCircle2, X, Clock, User, Phone, MapPin, Send } from "lucide-react";

export const EmailNotificationModal: React.FC = () => {
  const { activeEmailModal, setActiveEmailModal } = useApp();

  if (!activeEmailModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383431] w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Email Header */}
        <div className="bg-[#2D2A28] text-white p-4.5 flex items-center justify-between border-b border-[#3E3A37]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white">Automatyczne powiadomienie e-mail</h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Wysłano</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Powiadomienie o przekazaniu sprawy zostało wysłane do dyżurującego specjalisty.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveEmailModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#3E3A37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Envelope Details */}
        <div className="bg-slate-50 dark:bg-[#161514] border-b border-slate-200 dark:border-[#2C2927] p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Od:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{activeEmailModal.senderName} &lt;powiadomienia@synapsis.org.pl&gt;</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Do:</span>
            <span className="font-bold text-[#2D2A28] dark:text-[#FFB200] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/60 font-mono">
              {activeEmailModal.recipientName} &lt;{activeEmailModal.recipientEmail}&gt;
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Temat:</span>
            <span className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-md">{activeEmailModal.subject}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Wysłano:</span>
            <span>{new Date(activeEmailModal.sentAt).toLocaleString("pl-PL")}</span>
          </div>
        </div>

        {/* Email Content Body */}
        <div className="p-6 overflow-y-auto bg-white dark:bg-[#1E1C1A] flex-1">
          <div className="bg-slate-50 dark:bg-[#141312] border border-slate-200 dark:border-[#2C2927] rounded-2xl p-4 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {activeEmailModal.message}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-[#161514] p-4 border-t border-slate-200 dark:border-[#2C2927] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Sprawa trafiła również do zakładki &quot;Przekazane sprawy&quot; tego specjalisty.</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveEmailModal(null)}
            className="px-4 py-2 bg-[#FFB200] hover:bg-[#E5A000] text-[#2D2A28] rounded-xl text-xs font-black shadow transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
