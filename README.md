# Baza Porad - Fundacja SYNAPSIS (UnAIted)

> **Centralny system rejestracji poradnictwa, kartotek kontaktów i sprawozdawczości PFRON dla dyżurujących specjalistów.**

Aplikacja stworzona dla zespołu konsultantów (psychologów, radców prawnych, doradców Parent-to-Parent i konsultantów społecznych) Fundacji SYNAPSIS, zapewniająca natychmiastowy dostęp do pełnego kontekstu wcześniejszych rozmów z beneficjentami, tras URL, dedykowanego panelu administratora, obsługi baz danych SQLite & PostgreSQL oraz autoryzacji JWT.

---

## 🌟 Główne możliwości

* **Błyskawiczny kontekst rozmowy (< 5 sekund)**: Inteligentna wyszukiwarka z tolerancją na literówki i brak polskich znaków oraz algorytm ujednoznaczniania tożsamości (*Disambiguation*).
* **Interdyscyplinarne przekazywanie spraw (*Handoff*)**: Płynne przekierowywanie spraw między psychologami, prawnikami i doradcami rodzicielskimi z powiadomieniami i automatycznym zamykaniem spraw po udzieleniu porady.
* **Sprawozdawczość grantowa PFRON**: Automatyczne wyliczanie wskaźników grantowych, liczby godzin, struktury wsparcia oraz rozkładu terytorialnego na 16 województw z eksportem do formatów XLSX i CSV.
* **Ochrona danych wrażliwych (art. 9 RODO)**: Automatyczna anonimizacja danych medycznych w raportach oraz ochrona przed atakami CSV formula injection.
* **Dedykowany panel administratora (`/admin`)**: Zarządzanie specjalistami (CRUD) i uprawnieniami, 1-kliknięciowe scalanie zduplikowanych kartotek (*Merge Tool*), dziennik audytowy (*Audit Logs*) oraz przełącznik silników bazodanowych.
* **Wydajny magazyn załączników na wolumenie**: Bezpośredni zapis plików na dysku/wolumenie (`/app/data/uploads/attachments`), streaming plików z autoryzacją JWT i zero obciążenia relacyjnej bazy danych.

> Szczegółowy opis techniczny i funkcjonalny wszystkich 10 modułów systemu znajduje się w dokumencie **[Szczegółowy opis modułów (`docs/FEATURES.md`)](./docs/FEATURES.md)**.

---

## 🛠️ Stos technologiczny

* **Frontend**: [React 19](https://react.dev/), [React Router](https://reactrouter.com/), [TypeScript](https://www.typescriptlang.org/), [ErrorBoundary]
* **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [Multer](https://github.com/expressjs/multer)
* **ORM i walidacja**: [Drizzle ORM](https://orm.drizzle.team/), [Zod](https://zod.dev/), [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
* **Bazy danych**: [SQLite (better-sqlite3)](https://github.com/WiseLibs/better-sqlite3), [PostgreSQL (pg)](https://node-postgres.com/)
* **Arkusze i narzędzia**: [SheetJS (xlsx)](https://docs.sheetjs.com/), [date-fns](https://date-fns.org/)
* **Konteneryzacja i hosting**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/), [Coolify](https://coolify.io/)
* **Bezpieczeństwo**: [JSON Web Token (JWT)](https://jwt.io/), [SHA-256 / Crypto]
* **Style**: [Tailwind CSS 4](https://tailwindcss.com/)
* **Ikony**: [Lucide React](https://lucide.dev/)
* **Testy i jakość**: [Vitest](https://vitest.dev/) (24 pliki testowe, 155 testów jednostkowych i integracyjnych), [Playwright](https://playwright.dev/) (9 testów funkcjonalnych E2E w przeglądarce), [Supertest](https://github.com/ladjs/supertest), [OxLint](https://oxc.rs/docs/guide/usage/linter.html)

---

## 📁 Struktura projektu

```text
├── Dockerfile                  # Wielostopniowy obraz produkcyjny Node 22 Alpine
├── docker-compose.yml          # Konfiguracja Docker Compose z wolumenem danych
├── docker-compose.coolify.yml  # Gotowy szablon dla wdrożenia w Coolify
├── playwright.config.ts        # Konfiguracja testów funkcjonalnych E2E Playwright
├── docs/                       # Kompletna dokumentacja techniczna i użytkowa
│   ├── README.md               # Spis treści i indeks dokumentacji
│   ├── ARCHITECTURE.md         # Architektura systemu, warstwy i diagram Mermaid
│   ├── FEATURES.md             # Szczegółowy opis wszystkich modułów
│   ├── USER_GUIDE.md           # Podręcznik użytkownika dla dyżurujących specjalistów
│   ├── PFRON_GUIDELINES.md     # Standardy sprawozdawczości PFRON i RODO (art. 9)
│   ├── DEPLOYMENT.md           # Instrukcja wdrożenia produkcyjnego w Dockerze i Coolify
│   ├── TESTING.md              # Strategia testowania (Vitest, Supertest, Playwright)
│   └── przyklad.xlsx           # Wzorcowy arkusz danych z przykładowymi konsultacjami
├── e2e/                        # Testy funkcjonalne E2E w przeglądarce (Playwright)
│   ├── auth.spec.ts            # Testy uwierzytelniania i sesji JWT
│   ├── records-and-admin.spec.ts # Testy rejestru, eksportu i uprawnień admina
│   └── search-and-caller.spec.ts # Testy wyszukiwania i profilu kontaktu
├── server/                     # Backend TypeScript API i baza danych
│   ├── db/                     # Manager bazy, adaptery SQLite i PostgreSQL, schematy
│   ├── middleware/             # Middleware JWT (authenticateJWT, requireAdmin)
│   ├── routes/                 # Punkty końcowe REST API (/api/*)
│   ├── storage/                # Dyskowa obsługa załączników na wolumenie
│   └── index.ts                # Główny serwer Express
├── src/                        # Frontend React 19 SPA
│   ├── components/             # Komponenty UI (ErrorBoundary, ExportModal, Timeline)
│   ├── pages/                  # Widoki aplikacji i panel administratora (/admin/*)
│   ├── context/                # Globalny stan z useMemo i synchronizacją JWT
│   └── services/               # Klient API, usługi autoryzacji i raportowania
├── package.json
└── vite.config.ts
```

---

## 🚀 Uruchomienie i rozwój

### 1. Instalacja zależności
```bash
npm install
```

### 2. Uruchomienie serwera deweloperskiego (Backend + Frontend)
```bash
npm run dev
```
* **Frontend**: `http://localhost:5173/`
* **Backend API**: `http://localhost:3001/`

Możesz także uruchamiać komponenty osobno:
```bash
npm run dev:backend   # Uruchamia serwer Express z tsx watch
npm run dev:frontend  # Uruchamia Vite dev server
```

### 3. Testy jednostkowe i integracyjne (Vitest)
```bash
npm test
```

### 4. Testy funkcjonalne E2E w przeglądarce (Playwright)
```bash
npm run test:e2e
```

### 5. Budowanie wersji produkcyjnej
```bash
npm run build
```
Kompiluje frontend (`dist/`) oraz backend (`dist-server/`).

---

## 🐳 Uruchomienie w Dockerze i Coolify

### 1. Docker Compose (Standalone)
Uruchomienie kompletnej aplikacji w kontenerze z trwałym montowaniem bazy SQLite i załączników (`./data:/app/data`):
```bash
docker compose up --build -d
```
Aplikacja będzie dostępna pod adresem `http://localhost:3001`.

### 2. Wdrożenie na platformie Coolify
1. W Coolify utwórz **New Resource -> Application** i połącz repozytorium.
2. Jako konfigurację wskaż **Docker Compose** (`docker-compose.coolify.yml`).
3. Coolify utworzy nazwany wolumen `synapsis_storage` montowany do `/app/data` (zapewniający brak utraty danych i plików przy restartach i redeployu).
4. Skonfiguruj zmienne środowiskowe (`JWT_SECRET`, `NODE_ENV=production`, `PORT=3001`).
5. Uruchom wdrożenie przyciskiem **Deploy**.

---

## 🔑 Domyślne dane dostępowe (konta demo)

* **Administrator**: `admin@synapsis.org.pl` / hasło: `synapsis2026` (Dostęp do `/admin`)
* **Koordynatorka / Psycholog**: `j.mrozek@synapsis.org.pl` / hasło: `synapsis2026`
* **Radca Prawny**: `a.nowak@synapsis.org.pl` / hasło: `synapsis2026`
* **Doradca P2P**: `b.wisniewska@synapsis.org.pl` / hasło: `synapsis2026`
* **Konsultant Społeczny**: `k.zielinski@synapsis.org.pl` / hasło: `synapsis2026`

---

## 📚 Pełna dokumentacja projektowa w `/docs`

* **[Spis treści dokumentacji (`docs/README.md`)](./docs/README.md)**
* **[Architektura systemu (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md)**
* **[Szczegółowy opis modułów (`docs/FEATURES.md`)](./docs/FEATURES.md)**
* **[Podręcznik użytkownika (`docs/USER_GUIDE.md`)](./docs/USER_GUIDE.md)**
* **[Wytyczne sprawozdawczości PFRON (`docs/PFRON_GUIDELINES.md`)](./docs/PFRON_GUIDELINES.md)**
* **[Instrukcja wdrożenia i DevOps (`docs/DEPLOYMENT.md`)](./docs/DEPLOYMENT.md)**
* **[Strategia testowania (`docs/TESTING.md`)](./docs/TESTING.md)**
* **[Przykładowy arkusz danych (`docs/przyklad.xlsx`)](./docs/przyklad.xlsx)**
