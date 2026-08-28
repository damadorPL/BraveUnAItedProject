# Baza Porad – Fundacja SYNAPSIS (UnAIted)

> **Centralny system rejestracji poradnictwa, kartotek kontaktów i sprawozdawczości PFRON dla dyżurujących specjalistów.**

Aplikacja dedykowana dla zespołu konsultantów (psychologów, radców prawnych, doradców Parent-to-Parent i konsultantów społecznych) Fundacji SYNAPSIS, zapewniająca natychmiastowy (poniżej 5 sekund) dostęp do pełnego kontekstu wcześniejszych rozmów z beneficjentami oraz ujednoliconą sprawozdawczość.

---

## 🌟 Kluczowe Funkcjonalności

### 1. 🔍 Błyskawiczne Wyszukiwanie & Rozstrzyganie Kontaktów (Disambiguation)
- **Tolerancja na brak znaków diakrytycznych**: wpisanie `zolc`, `krakow`, `mrozek` bezbłędnie odnajduje odpowiednie osoby.
- **Wyszukiwanie wielokryterialne**: po imieniu, nazwisku, odwróconej kolejności (*Nazwisko Imię*), numerze telefonu (z ignorowaniem spacji i formatowania) oraz miejscowości/województwie.
- **Karty ujednoznaczniania**: w przypadku wielu osób o tym samym nazwisku system wyświetla czytelne karty rozróżniające z liczbą odbytych porad.

### 2. 📋 Kartoteka Kontaktu i Oś Czasu Porad (Timeline)
- Pełna historia konsultacji z podziałem na:
  - **Rodzaj kontaktu**: telefon, e-mail, kontakt osobisty, inne.
  - **Beneficjent**: rodzic, opiekun, osoba dorosła w spektrum, inne.
  - **Orzeczenie o niepełnosprawności**: status posiadania oraz stopień niepełnosprawności.
  - **Kategorie i obszary poradnictwa**: prawno-obywatelskie, psychologiczne, Parent to Parent, społeczne.
  - **Zarządzanie załącznikami**: dodawanie i podgląd dokumentów (PDF, skany orzeczeń, tabele Excel, obrazy, pliki tekstowe).

### 3. 🔄 Przekazywanie Spraw & Powiadomienia E-mail (Referral System)
- **Dynamiczny wybór konsultanta (Autocomplete)**: wyszukiwarka dyżurujących specjalistów w trakcie pisania.
- **Automatyczne powiadomienia e-mail**: podgląd i wysyłka powiadomień ze szczegółami i notatką/wytycznymi na adres dyżurującego specjalisty.
- **Kolejka spraw przekazanych**: widok spraw oczekujących na konsultację, przyjętych i zakończonych.

### 4. 🛡️ Panel Administratora & Zarządzanie Kartotekami
- **Wykrywanie i scalanie duplikatów (Merge Contacts)**: inteligentna analiza podobieństw numerów telefonów i nazwisk z bezpiecznym przeniesieniem całej historii porad i załączników.
- **Edycja kartoteki kontaktu**: dedykowany formularz modyfikacji danych teleadresowych i orzeczeń oraz uprawnienie do usuwania kartotek przez administratora.
- **Zarządzanie konsultantami**: dodawanie nowych specjalistów, edycja specjalizacji, ról i uprawnień.
- **Edycja profilu użytkownika**: każdy konsultant ma możliwość edycji swoich danych oraz adresu e-mail.

### 5. 📊 Raporty PFRON & Eksport Danych
- **Eksport XLSX (Excel)**: arkusz z rejestrem porad oraz dedykowany arkusz *Podsumowanie* z metrykami grantowymi (struktura rodzajów poradnictwa, rozkład geograficzny 16 województw, liczba unikalnych beneficjentów, godziny dyżurów).
- **Eksport CSV & Ochrona Danych (RODO)**: tryby eksportu pełnego, zanonimizowanego oraz pseudonimizowanego.
- **Wskaźniki KPI w czasie rzeczywistym**: filtr zakresu dat z gotowymi skrótami kwartalnymi PFRON (Q1–Q4).

### 6. 📥 Inteligentny Migrator Bazy z Excela
- Import plików `.xlsx` i `.xls` z historycznymi danymi.
- **Fuzzy matching**: automatyczne dopasowywanie i normalizacja województw, typów poradnictwa i ról dyżurujących.
- Rozwiązywanie konfliktów i podgląd zmian przed zatwierdzeniem.

### 7. 🎨 Stylistyka Fundacji SYNAPSIS & Dark Mode
- Nowoczesna paleta barw zgodna z identyfikacją wizualną Fundacji SYNAPSIS (grafit `#2D2A28`, złoto `#FFB200`, turkus `#296B6E`).
- Pełne wsparcie dla trybu ciemnego (**Dark Mode**) z przełącznikiem i zapamiętywaniem preferencji w `localStorage`.

---

## 🛠️ Stos Technologiczny

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Style**: [Tailwind CSS](https://tailwindcss.com/)
- **Ikony**: [Lucide React](https://lucide.dev/)
- **Arkusze i Eksport**: [XLSX (SheetJS)](https://sheetjs.com/)
- **Efekty**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Testy**: [Vitest](https://vitest.dev/)

---

## 📁 Struktura Projektu

```text
src/
├── components/            # Komponenty interfejsu użytkownika
│   ├── AdminPanelModal.tsx       # Panel administratora (scalanie, konsultanci)
│   ├── AttachmentsManager.tsx    # Menedżer i podgląd załączników (PDF/obrazy/arkusze)
│   ├── CallerDisambiguation.tsx  # Rozstrzyganie osób o tym samym nazwisku
│   ├── CallerHistoryView.tsx     # Widok kartoteki i osi czasu porad
│   ├── CallRecordsFilter.tsx     # Filtrowanie rejestru (województwa, daty, typy)
│   ├── CallRecordsTable.tsx      # Tabela centralnego rejestru porad
│   ├── DateRangePicker.tsx       # Wybór zakresu dat z kalendarzem
│   ├── EditCallerModal.tsx       # Modal edycji danych kontaktu (Admin/Specjalista)
│   ├── EditCallRecordModal.tsx   # Modal edycji wpisu porady
│   ├── EmailNotificationModal.tsx# Podgląd powiadomień e-mail
│   ├── ExcelMigratorModal.tsx    # Kreator importu bazy z plików Excel
│   ├── ExportModal.tsx           # Kreator eksportu XLSX / CSV z RODO
│   ├── Header.tsx                # Nagłówek z przełącznikiem dyżurującego i Dark Mode
│   ├── NewCallerModal.tsx        # Rejestracja nowego kontaktu i pierwszej porady
│   ├── NewCallRecordModal.tsx    # Formularz dodania nowej porady
│   ├── ReferralSelector.tsx      # Autocomplete wyboru konsultanta do przekazania
│   ├── ReferredCasesModal.tsx    # Kolejka spraw przekazanych
│   ├── SearchBar.tsx             # Pasek szybkiego wyszukiwania kontaktów
│   ├── StatsBar.tsx              # Pulpit statystyk i wykresów PFRON
│   └── UserProfileModal.tsx      # Modal edycji profilu konsultanta
├── context/
│   └── AppContext.tsx            # Globalny stan aplikacji i synchronizacja Live
├── data/
│   ├── sampleData.ts             # Początkowa baza 71 porad i kartotek
│   └── sampleData.test.ts        # Testy spójności danych początkowych
├── services/                     # Logika biznesowa i integracje
│   ├── adminService.test.ts      # Testy operacji administratora
│   ├── callDate.ts / .test.ts    # Narzędzia formatowania i walidacji dat
│   ├── excelMigrator.ts / .test  # Silnik parsowania i scalania Excela
│   ├── exportService.ts          # Generator raportów XLSX i CSV
│   ├── fuzzyMatch.ts / .test.ts  # Algorytmy dopasowania rozmytego i Levenshteina
│   ├── notificationService.ts    # Generowanie szablonów e-mail
│   └── storage.ts / .test.ts     # Pamięć lokalna i wyszukiwarka kontaktów
├── types/
│   └── index.ts                  # Typy TypeScript (Caller, CallRecord, Specialist itp.)
└── utils/
    ├── fileUtils.ts / .test.ts   # Obsługa formatów plików i rozmiarów
    ├── recordFilters.ts          # Filtry danych rejestru
    └── reportStats.ts            # Agregacja statystyk dla PFRON
```

---

## 🚀 Uruchomienie i Rozwój

### Wymagania wstępne
- [Node.js](https://nodejs.org/) (wersja 18 lub nowsza)
- Menedżer pakietów `npm`

### Instalacja zależności
```bash
npm install
```

### Uruchomienie serwera deweloperskiego
```bash
npm run dev
```
Aplikacja będzie dostępna pod adresem: `http://localhost:5173/`

### Uruchomienie testów jednostkowych
```bash
npm test
```

### Budowanie wersji produkcyjnej
```bash
npm run build
```
Skompilowane pliki produkcyjne znajdą się w katalogu `./dist`.

---

## 🔒 Bezpieczeństwo i RODO
Aplikacja przetwarza dane w zgodzie z art. 9 RODO (dane dotyczące zdrowia i niepełnosprawności):
- Możliwość natychmiastowej anonimizacji danych osobowych w raportach.
- Bezpieczne przechowywanie danych w pamięci lokalnej przeglądarki.
- Pełna separacja ról administratora i dyżurujących specjalistów.
