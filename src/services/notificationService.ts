import { Specialist, Caller, EmailNotification } from "../types";

export function createReferralEmailNotification(params: {
  sender: Specialist;
  recipient: Specialist;
  caller: Caller;
  recordId: string;
  adviceDescription: string;
  notes?: string;
  referralNote?: string;
}): EmailNotification {
  const { sender, recipient, caller, recordId, adviceDescription, notes, referralNote } = params;

  const subject = `[Linia Poradnicza] Nowa sprawa przekazana: ${caller.firstName} ${caller.lastName} (${caller.city || caller.voivodeship})`;

  const message = `Dzień dobry ${recipient.name},

Specjalista ${sender.name} (${sender.role}) przekazał/a do Ciebie sprawę kontaktu z linii pomocowej:

PACJENT / KONTAKT:
- Imię i nazwisko: ${caller.firstName} ${caller.lastName}
- Telefon: ${caller.phoneNumber || "Brak"}
- Lokalizacja: ${caller.city || "—"}, woj. ${caller.voivodeship}
- Beneficjent: ${caller.beneficiaryTypes?.join(", ") || "Rodzic"}
- Orzeczenie: ${caller.hasDisabilityCertificate === "tak" ? "Posiada orzeczenie" : "Brak / w trakcie"}

PODSUMOWANIE UDZIELONEJ PORADY:
${adviceDescription}

${referralNote ? `NOTATKA DLA CIEBIE:
${referralNote}
` : ""}
${notes ? `DODATKOWE UWAGI:
${notes}
` : ""}

Szczegóły i załączniki są dostępne po zalogowaniu do systemu w zakładce "Przekazane sprawy".

Pozdrawiamy,
System Poradnictwa Specjalistycznego`;

  return {
    id: "email-" + Date.now(),
    recipientEmail: recipient.email,
    recipientName: recipient.name,
    senderName: sender.name,
    callerName: `${caller.firstName} ${caller.lastName}`,
    callerPhone: caller.phoneNumber,
    subject,
    message,
    sentAt: new Date().toISOString(),
    recordId,
    callerId: caller.id,
  };
}
