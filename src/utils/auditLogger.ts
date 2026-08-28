import { CallRecord, RecordEditLog, RecordFieldChange, Specialist } from "../types";

/**
 * Porównuje poprzedni i zaktualizowany wpis porady, wykrywając zmienione pola
 * i tworząc wpis w rejestrze audytu edycji.
 */
export function computeRecordChanges(
  prev: CallRecord,
  next: CallRecord,
  editor: Specialist | null
): RecordEditLog | null {
  const changes: RecordFieldChange[] = [];

  // 1. Rodzaj porady (opis zgłoszenia)
  const prevDesc = (prev.adviceDescription || "").trim();
  const nextDesc = (next.adviceDescription || "").trim();
  if (prevDesc !== nextDesc) {
    changes.push({
      field: "adviceDescription",
      label: "Opis zgłoszenia (rodzaj porady)",
      oldValue: prevDesc || "(brak opisu)",
      newValue: nextDesc || "(brak opisu)",
    });
  }

  // 2. Uwagi, pomoc i wskazówki
  const prevNotes = (prev.notes || "").trim();
  const nextNotes = (next.notes || "").trim();
  if (prevNotes !== nextNotes) {
    changes.push({
      field: "notes",
      label: "Uwagi i wskazówki",
      oldValue: prevNotes || "(brak uwag)",
      newValue: nextNotes || "(brak uwag)",
    });
  }

  // 3. Rodzaj poradnictwa
  if (prev.guidanceType !== next.guidanceType) {
    changes.push({
      field: "guidanceType",
      label: "Rodzaj poradnictwa",
      oldValue: prev.guidanceType || "(brak)",
      newValue: next.guidanceType || "(brak)",
    });
  }

  // 4. Obszary wsparcia
  const prevAreas = [...(prev.guidanceAreas || [])].sort().join(", ");
  const nextAreas = [...(next.guidanceAreas || [])].sort().join(", ");
  if (prevAreas !== nextAreas) {
    changes.push({
      field: "guidanceAreas",
      label: "Obszary wsparcia",
      oldValue: prevAreas || "(brak)",
      newValue: nextAreas || "(brak)",
    });
  }

  // 5. Forma kontaktu
  const prevContacts = [...(prev.contactTypes || [])].sort().join(", ");
  const nextContacts = [...(next.contactTypes || [])].sort().join(", ");
  if (prevContacts !== nextContacts) {
    changes.push({
      field: "contactTypes",
      label: "Forma kontaktu",
      oldValue: prevContacts || "(brak)",
      newValue: nextContacts || "(brak)",
    });
  }

  // 6. Kogo dotyczy porada
  const prevTargets = [...(prev.subjectTargets || [])].sort().join(", ");
  const nextTargets = [...(next.subjectTargets || [])].sort().join(", ");
  if (prevTargets !== nextTargets) {
    changes.push({
      field: "subjectTargets",
      label: "Kogo dotyczy porada",
      oldValue: prevTargets || "(brak)",
      newValue: nextTargets || "(brak)",
    });
  }

  // 7. Czas trwania
  if (prev.durationMinutes !== next.durationMinutes) {
    changes.push({
      field: "durationMinutes",
      label: "Czas trwania",
      oldValue: `${prev.durationMinutes || 0} min`,
      newValue: `${next.durationMinutes || 0} min`,
    });
  }

  // 8. Data porady
  if (prev.callDate !== next.callDate) {
    const prevDateStr = prev.callDate
      ? new Date(prev.callDate).toLocaleString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "(brak daty)";
    const nextDateStr = next.callDate
      ? new Date(next.callDate).toLocaleString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "(brak daty)";
    changes.push({
      field: "callDate",
      label: "Data i godzina porady",
      oldValue: prevDateStr,
      newValue: nextDateStr,
    });
  }

  // 9. Przypisany specjalista
  if (prev.specialistName !== next.specialistName) {
    changes.push({
      field: "specialistName",
      label: "Przypisany specjalista",
      oldValue: prev.specialistName || "(nieprzypisany)",
      newValue: next.specialistName || "(nieprzypisany)",
    });
  }

  // 10. Przekazanie do specjalisty
  const prevRef = (prev.referredTo || "").trim();
  const nextRef = (next.referredTo || "").trim();
  if (prevRef !== nextRef) {
    changes.push({
      field: "referredTo",
      label: "Przekazano do specjalisty",
      oldValue: prevRef || "(brak przekazania)",
      newValue: nextRef || "(brak przekazania)",
    });
  }

  // 11. Notatka przekazania
  const prevRefNote = (prev.referredNote || "").trim();
  const nextRefNote = (next.referredNote || "").trim();
  if (prevRefNote !== nextRefNote) {
    changes.push({
      field: "referredNote",
      label: "Notatka przekazania",
      oldValue: prevRefNote || "(brak notatki)",
      newValue: nextRefNote || "(brak notatki)",
    });
  }

  // 12. Status sprawy przekazanej
  if (prev.referredStatus !== next.referredStatus && (prev.referredStatus || next.referredStatus)) {
    changes.push({
      field: "referredStatus",
      label: "Status przekazania",
      oldValue: prev.referredStatus || "OCZEKUJĄCA",
      newValue: next.referredStatus || "OCZEKUJĄCA",
    });
  }

  // 13. Załączniki
  const prevAttCount = (prev.attachments || []).length;
  const nextAttCount = (next.attachments || []).length;
  if (prevAttCount !== nextAttCount) {
    changes.push({
      field: "attachments",
      label: "Liczba załączników",
      oldValue: `${prevAttCount} plik(ów)`,
      newValue: `${nextAttCount} plik(ów)`,
    });
  }

  if (changes.length === 0) {
    return null;
  }

  const now = new Date().toISOString();
  const summaryLabels = changes.map((c) => c.label).slice(0, 3).join(", ");
  const moreCount = changes.length > 3 ? ` (+${changes.length - 3} inne)` : "";

  return {
    id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    recordId: next.id,
    editedAt: now,
    editorId: editor?.id || "unknown",
    editorName: editor?.name || "Specjalista",
    editorRole: editor?.role || (editor?.isAdmin ? "Administrator" : "Konsultant"),
    summary: `Zmieniono: ${summaryLabels}${moreCount}`,
    changes,
  };
}
