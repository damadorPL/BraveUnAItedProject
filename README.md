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
- Pełna historia konsultacji z podziałem na rodzaj kontaktu, beneficjenta, orzeczenie o niepełnosprawności, kategorie poradnictwa oraz zarządzanie załącznikami.

### 7. 📎 Wydajny Magazyn Załączników na Dysku & Wolumenie
- **Optymalizacja bazy danych**: pliki załączników (PDF, skany, zdjęcia, arkusze Excel) nie są zapisywane jako ciężki Base64 w kolumnach JSON bazy, lecz bezpośrednio na dysku w katalogu `data/uploads/attachments/` (lub ścieżce `ATTACHMENTS_DIR`).
- **Endpointy API (`/api/attachments`)**: bezpieczny upload `multipart/form-data` do 50 MB, streaming plików, bezpośredni podgląd w przeglądarce i pobieranie z autoryzacją JWT.
- **Automatyczna migracja**: serwer automatycznie konwertuje starsze załączniki Base64 z bazy SQLite/PostgreSQL na fizyczne pliki na dysku przy starcie.

### 8. 🔄 System Przekazywania Spraw & Handoff (Referral System)
- Ekran powitalny z oczekującymi sprawami, dynamiczny wybór konsultanta, powiadomienia e-mail i automatyczne oznaczanie spraw jako zakończone po udzieleniu porady.

### 9. 📊 Raporty PFRON & Eksport Danych
- Eksport XLSX (Excel) z rejestrem i arkuszem podsumowania wskaźników grantowych, eksport CSV z anonimizacją RODO.

### 10. 🐳 Konteneryzacja Docker & Wdrożenie Coolify
- **Wielostopniowy Dockerfile**: optymalny obraz produkcyjny Node 22 Alpine.
- **Wspólny Persistent Storage**: montowanie `/app/data` zabezpiecza i trwale przechowuje **zarówno bazę SQLite (`synapsis.sqlite`), jak i wszystkie załączniki (`uploads/attachments`)**.
- **Gotowy szablon Coolify (`docker-compose.coolify.yml`)**: bezproblemowy deploy w środowisku Coolify z nazwanym wolumenem.

---

## 🛠️ Stos Technologiczny

- **Frontend**: [React 19](https://react.dev/), [React Router](https://reactrouter.com/), [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [Multer](https://github.com/expressjs/multer)
- **ORM & Walidacja**: [Drizzle ORM](https://orm.drizzle.team/), [Zod](https://zod.dev/), [Drizzle Zod](https://orm.drizzle.team/docs/zod)
- **Bazy Danych**: [SQLite (better-sqlite3)](https://github.com/WiseLibs/better-sqlite3), [PostgreSQL (pg)](https://node-postgres.com/)
- **Konteneryzacja & Hosting**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/), [Coolify](https://coolify.io/)
- **Bezpieczeństwo**: [JSON Web Token (JWT)](https://jwt.io/), [SHA-256 / Crypto]
- **Style**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Ikony**: [Lucide React](https://lucide.dev/) (wersja `^1.38.0`)
- **Testy**: [Vitest](https://vitest.dev/), [Supertest](https://github.com/ladjs/supertest) (24 pliki testowe, 156 testów, 100% passed)

---

## 📁 Struktura Projektu

```text
├── Dockerfile                  # Wielostopniowy obraz produkcyjny
├── docker-compose.yml          # Konfiguracja Docker Compose z wolumenem danych
├── docker-compose.coolify.yml  # Gotowy szablon dla wdrożenia w Coolify
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
│   │   ├── attachments.ts      # Obsługa plików i załączników (/api/attachments/*)
│   │   ├── auth.ts             # Logowanie i sesje JWT (/api/auth/*)
│   │   ├── callers.ts          # Kartoteki kontaktów (/api/callers/*)
│   │   └── records.ts          # Rejestr porad (/api/records/*)
│   ├── storage/
│   │   └── attachmentStorage.ts # Dyskowa obsługa załączników i migracja Base64
│   ├── attachments.test.ts     # Testy integracyjne załączników i magazynu dyskowego
│   ├── index.ts                # Główny serwer Express
│   ├── server.test.ts          # Testy integracyjne backendu i JWT
│   └── types.ts                # Typy backendowe i JWT
├── src/
│   ├── components/             # Komponenty interfejsu użytkownika
│   │   ├── AttachmentsManager.tsx # Menadżer załączników (upload, podgląd, pobieranie)
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
│   │   ├── api.ts              # Klient HTTP z tokenami JWT i uploadem załączników
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

## 🐳 Uruchomienie w Dockerze & Coolify

### 1. Docker Compose (Standalone)
Uruchomienie kompletnej aplikacji w kontenerze z trwałym montowaniem bazy SQLite i załączników (`./data:/app/data`):
```bash
docker compose up --build -d
```
Aplikacja będzie dostępna pod adresem `http://localhost:3001`.

### 2. Wdrożenie na platformie Coolify
1. W Coolify utwórz **New Resource -> Application** i połącz repozytorium.
2. Jako konfigurację wskaż **Docker Compose** (`docker-compose.coolify.yml`).
3. Coolify utworzy nazwany wolumen `synapsis_storage` montowany do `/app/data` (zapewniający brak utraty danych i plików przy restartach/redeployu).
4. Skonfiguruj zmienne środowiskowe (`JWT_SECRET`, `NODE_ENV=production`, `PORT=3001`).
5. Uruchom wdrożenie przyciskiem **Deploy**.

---

## 🔑 Domyślne Dane Dostępowe (Konta Demo)

- **Administrator**: `admin@synapsis.org.pl` / hasło: `synapsis2026` (Dostęp do `/admin`)
- **Koordynatorka / Psycholog**: `j.mrozek@synapsis.org.pl` / hasło: `synapsis2026`
- **Radca Prawny**: `a.nowak@synapsis.org.pl` / hasło: `synapsis2026`
- **Doradca P2P**: `b.wisniewska@synapsis.org.pl` / hasło: `synapsis2026`
- **Konsultant Społeczny**: `k.zielinski@synapsis.org.pl` / hasło: `synapsis2026`
