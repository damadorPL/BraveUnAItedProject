# Baza Porad – Fundacja SYNAPSIS (UnAIted)

> **Centralny system rejestracji poradnictwa, kartotek kontaktów i sprawozdawczości PFRON dla dyżurujących specjalistów.**

Aplikacja dedykowana dla zespołu konsultantów (psychologów, radców prawnych, doradców Parent-to-Parent i konsultantów społecznych) Fundacji SYNAPSIS, zapewniająca natychmiastowy dostęp do pełnego kontekstu wcześniejszych rozmów z beneficjentami, tras URL, dedykowanego panelu administratora, obsługi baz danych SQLite & PostgreSQL oraz autoryzacji JWT.

---

## 🌟 Kluczowe Funkcjonalności

### 1. 🌐 Trasy URL (URL Routes & Deep Linking)
- **Klient-side Routing (`react-router-dom`)**:
  - `/login`: ekran logowania ze wsparciem autoryzacji JWT i kontami demo.
  - `/search` lub `/`: szybka wyszukiwarka kontaktów, ujednoznacznianie i baner przekazań Handoff.
  - `/callers/:id`: bezpośredni link do profilu kontaktu i osi czasu porad (Timeline).
  - `/records`: centralny rejestr wszystkich udzielonych porad z zaawansowanymi filtrami.
  - `/stats`: pulpit statystyk i raportów PFRON.
  - `/admin/*`: dedykowany, pełnoekranowy panel administratora chroniony strażnikiem uprawnień (`AdminRoute`).
  - `/unauthorized`: strona błędu 403 w przypadku braku uprawnień administratora.

### 2. 🛡️ Dedykowany Panel Administratora (`/admin`)
- **Pulpit Główny (Overview)**: wskaźniki KPI bazy, stan silnika bazy danych, status połączenia oraz szybkie skróty.
- **Specjaliści i Uprawnienia**: pełne zarządzanie kontami specjalistów (CRUD), nadawanie ról, przypisywanie obszarów poradnictwa, przełączanie flagi administratora i generator resetu haseł.
- **Wykrywanie i Scalanie Duplikatów (Merge Tool)**: algorytm wyszukiwania powtórzonych kartotek z porównaniem pól i automatycznym przeniesieniem całej historii konsultacji i załączników.
- **Centralny Dziennik Zmian (Audit Logs)**: pełny rejestr modyfikacji porad z podglądem różnic (diff przed/po).
- **Zarządzanie Bazami Danych (DB Manager)**: przełączanie silnika bazy danych, testowanie połączeń, migracje schematu oraz przywracanie bazy demonstracyjnej.

### 3. 🗄️ Obsługa Baz Danych (PostgreSQL & SQLite)
- **Modułowa warstwa dostępu do danych (`DatabaseAdapter`)**:
  - **SQLite**: lokalna, bezkonfiguracyjna baza plikowa (`data/synapsis.sqlite`) z automatycznym tworzeniem tabel i indeksów.
  - **PostgreSQL**: obsługa produkcyjnego serwera bazy danych z pulą połączeń (`pg.Pool`), transakcjami i indeksami JSONB.
- **Dynamiczne przełączanie silnika**: możliwość zmiany silnika w locie z poziomu panelu administratora lub zmiennych środowiskowych (`DATABASE_ENGINE`, `DATABASE_URL`).
- **Automatyczne zasilanie (Auto-seeding)**: automatyczne inicjowanie bazy zestawem 71 porad i kartotek przy pierwszym uruchomieniu.

### 4. 🔐 Autoryzacja i Ochrona Tras z JWT
- **JSON Web Token (HMAC-SHA256)**: tokeny sesyjne z 24-godzinną ważnością, zawierające identyfikator specjalisty, rolę oraz uprawnienia `isAdmin`.
- **Backend Middleware**: `authenticateJWT` oraz `requireAdmin` chroniące wrażliwe punkty końcowe API (`/api/admin/*`, usuwanie kartotek i porad).
- **Frontend Route Guards**: `<ProtectedRoute>` oraz `<AdminRoute>` zabezpieczające nawigację po stronach.

### 5. 🔍 Błyskawiczne Wyszukiwanie & Rozstrzyganie Kontaktów (Disambiguation)
- **Tolerancja na brak znaków diakrytycznych**: wpisanie `zolc`, `krakow`, `mrozek` bezbłędnie odnajduje odpowiednie osoby.
- **Wyszukiwanie wielokryterialne**: po imieniu, nazwisku, odwróconej kolejności (*Nazwisko Imię*), numerze telefonu oraz miejscowości/województwie.

### 6. 📋 Kartoteka Kontaktu i Oś Czasu Porad (Timeline)
- Pełna historia konsultacji z podziałem na rodzaj kontaktu, beneficjenta, orzeczenie o niepełnosprawności, kategorie poradnictwa oraz zarządzanie załącznikami (PDF, skany, obrazy).

### 7. 🔄 System Przekazywania Spraw & Handoff (Referral System)
- Ekran powitalny z oczekującymi sprawami, dynamiczny wybór konsultanta, powiadomienia e-mail i automatyczne oznaczanie spraw jako zakończone po udzieleniu porady.

### 8. 📊 Raporty PFRON & Eksport Danych
- Eksport XLSX (Excel) z rejestrem i arkuszem podsumowania wskaźników grantowych, eksport CSV z anonimizacją RODO.

---

## 🛠️ Stos Technologiczny

- **Frontend**: [React 19](https://react.dev/), [React Router](https://reactrouter.com/), [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **ORM & Walidacja**: [Drizzle ORM](https://orm.drizzle.team/), [Zod](https://zod.dev/), [Drizzle Zod](https://orm.drizzle.team/docs/zod)
- **Bazy Danych**: [SQLite (better-sqlite3)](https://github.com/WiseLibs/better-sqlite3), [PostgreSQL (pg)](https://node-postgres.com/)
- **Bezpieczeństwo**: [JSON Web Token (JWT)](https://jwt.io/), [SHA-256 / Crypto]
- **Style**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Ikony**: [Lucide React](https://lucide.dev/) (wersja `^1.38.0`)
- **Testy**: [Vitest](https://vitest.dev/), [Supertest](https://github.com/ladjs/supertest) (21 plików testowych, 132 testy, 100% passed)

---

## 📁 Struktura Projektu

```text
├── server/                     # Backend TypeScript API & Baza Danych
│   ├── db/
│   │   ├── adapter.ts          # Interfejs DatabaseAdapter
│   │   ├── index.ts            # Manager bazy i przełącznik silników
│   │   ├── postgresAdapter.ts  # Adapter bazy danych PostgreSQL
│   │   └── sqliteAdapter.ts    # Adapter bazy danych SQLite
│   ├── middleware/
│   │   └── auth.ts             # Middleware JWT (authenticateJWT, requireAdmin)
│   ├── routes/
│   │   ├── admin.ts            # Punkty końcowe administratora (/api/admin/*)
│   │   ├── auth.ts             # Logowanie i sesje JWT (/api/auth/*)
│   │   ├── callers.ts          # Kartoteki kontaktów (/api/callers/*)
│   │   └── records.ts          # Rejestr porad (/api/records/*)
│   ├── index.ts                # Główny serwer Express
│   ├── server.test.ts          # Testy integracyjne backendu i JWT
│   └── types.ts                # Typy backendowe i JWT
├── src/
│   ├── components/             # Komponenty interfejsu użytkownika
│   │   ├── Header.tsx          # Główny nagłówek z nawigacją tras URL
│   │   ├── LoginScreen.tsx     # Ekran logowania z autoryzacją JWT
│   │   ├── ProtectedRoute.tsx  # Strażnik tras URL i uprawnień admina
│   │   ├── ContactHistoryView.tsx # Kartoteka kontaktu i oś czasu
│   │   └── ...                 # Modale i filtry
│   ├── pages/                  # Strony routingu
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx   # Panel Administratora
│   │   │   └── tabs/                # Zakładki panelu (Overview, Specialists, Merge, Audit, DB)
│   │   ├── CallerDetailPage.tsx     # /callers/:id
│   │   ├── NotFoundPage.tsx         # 404
│   │   ├── RecordsPage.tsx          # /records
│   │   ├── SearchPage.tsx           # /search
│   │   ├── StatsPage.tsx            # /stats
│   │   └── UnauthorizedPage.tsx     # 403
│   ├── context/
│   │   └── AppContext.tsx      # Globalny stan z synchronizacją z API i JWT
│   ├── services/
│   │   ├── api.ts              # Klient HTTP z tokenami JWT
│   │   ├── auth.ts             # Usługa autoryzacji
│   │   └── storage.ts          # Usługa magazynu lokalnego
│   └── types/
│       └── index.ts            # Współdzielone typy danych
├── package.json
└── vite.config.ts
```

---

## 🚀 Uruchomienie i Rozwój

### 1. Instalacja zależności
```bash
npm install
```

### 2. Uruchomienie serwera deweloperskiego (Backend + Frontend)
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173/`
- **Backend API**: `http://localhost:3001/`

Możesz także uruchamiać komponenty osobno:
```bash
npm run dev:backend   # Uruchamia serwer Express z tsx watch
npm run dev:frontend  # Uruchamia Vite dev server
```

### 3. Testy jednostkowe i integracyjne
```bash
npm test
```

### 4. Budowanie wersji produkcyjnej
```bash
npm run build
```
Kompiluje frontend (`dist/`) oraz backend (`dist-server/`).

---

## 🔑 Domyślne Dane Dostępowe (Konta Demo)

- **Administrator**: `admin@synapsis.org.pl` / hasło: `synapsis2026` (Dostęp do `/admin`)
- **Koordynatorka / Psycholog**: `j.mrozek@synapsis.org.pl` / hasło: `synapsis2026`
- **Radca Prawny**: `a.nowak@synapsis.org.pl` / hasło: `synapsis2026`
- **Doradca P2P**: `b.wisniewska@synapsis.org.pl` / hasło: `synapsis2026`
- **Konsultant Społeczny**: `k.zielinski@synapsis.org.pl` / hasło: `synapsis2026`
