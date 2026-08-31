# Strategia testowania jakości

Dokument opisuje architekturę testów, narzędzia oraz procedury weryfikacji jakości kodu w projekcie **Baza Porad**.

---

## 🧪 1. Poziomy testów w projekcie

Projekt realizuje pełną piramidę testów:

```text
       / \
      / E2E \       --> Playwright (9 testów funkcjonalnych E2E w Chromium)
     /-------\
    /  Integ  \     --> Supertest + Vitest (API, Baza Danych, Upload Plików)
   /-----------\
  / Jednostkowe \   --> Vitest (Fuzzy match, PFRON stats, Referrals, RODO)
 /---------------\
```

---

## 🚀 2. Testy jednostkowe i integracyjne (Vitest i Supertest)

* **Polecenie**: `npm test`
* **Liczba testów**: **155 testów w 24 plikach** (100% pass, czas wykonania: ~1.1s).

### Zakres pokrycia:
1. **Autoryzacja i sesje JWT (`server/server.test.ts`, `src/services/auth.test.ts`)**:
   * Podpisywanie tokenów HMAC-SHA256, weryfikacja uprawnień `requireAdmin`, obsługa wygasłych tokenów i kodów 401/403.
2. **Magazyn załączników (`server/attachments.test.ts`)**:
   * Upload `multipart/form-data`, bezpieczny streaming plików, kontrola typów MIME i fizyczne usuwanie z dysku.
3. **Bazy danych i adaptery (`server/postgresAdapter.test.ts`, `server/drizzle.test.ts`, `server/zod.test.ts`)**:
   * Zgodność schematów SQLite i PostgreSQL, transakcje bazodanowe, walidacja Zod.
4. **Logika biznesowa i raportowanie PFRON (`src/utils/reportStats.test.ts`, `src/services/exportService.test.ts`)**:
   * Liczenie wskaźników grantowych, agregacja unikalnych beneficjentów, podział na 16 województw, anonimizacja RODO (art. 9) oraz ochrona przed CSV injection.
5. **Przekazywanie spraw (*Handoff*) i scalanie duplikatów (`src/services/referrals.test.ts`, `src/services/adminService.test.ts`)**:
   * Przepływ przekierowań między konsultantami oraz algorytm łączenia powtórzonych kartotek.

---

## 🎭 3. Testy funkcjonalne End-to-End w przeglądarce (Playwright)

* **Polecenie**: `npm run test:e2e`
* **Silnik**: Headless Chromium
* **Czas wykonania**: ~5.9s

### Scenariusze E2E (`e2e/`):
* **`e2e/auth.spec.ts`**: Formularz logowania, blokada przy błędnym haśle, pomyślne logowanie administratora i wylogowanie z powrotem do `/login`.
* **`e2e/search-and-caller.spec.ts`**: Wyszukiwanie z literówkami i bez polskich znaków (*fuzzy search*), ujednoznacznianie osób o tym samym nazwisku, nawigacja do profilu i weryfikacja załadowania osi czasu porad (*Timeline*).
* **`e2e/records-and-admin.spec.ts`**: Dostęp do centralnego rejestru `/records`, otwieranie okna eksportu danych, nawigacja po zakładkach panelu `/admin` oraz weryfikacja automatycznego blokowania nieuprawnionych konsultantów.

---

## 🔍 4. Statyczna analiza kodu i linter

* **Linter**: `npm run lint` (OxLint: ultraszybki linter Rust sprawdzający reguły ESLint / React / TypeScript).
* **Kompilator TypeScript**: `npm run build` (`tsc -b` dla frontendu oraz `tsc -p tsconfig.server.json` dla serwera).

---

## 📋 Podsumowanie poleceń

| Polecenie | Cel |
| :--- | :--- |
| `npm test` | Uruchomienie wszystkich 155 testów jednostkowych i integracyjnych Vitest |
| `npm run test:e2e` | Uruchomienie testów funkcjonalnych E2E w przeglądarce Playwright |
| `npm run lint` | Weryfikacja jakości kodu za pomocą OxLint |
| `npm run build` | Kompilacja produkcyjna frontendu i backendu |
