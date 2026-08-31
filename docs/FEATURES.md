# Szczegółowy opis modułów i funkcjonalności

Dokument zawiera techniczny i funkcjonalny opis modułów systemu **Baza Porad**.

---

## 1. 🌐 Trasy URL (routing i deep linking)

* **Klient-side Routing (`react-router-dom`)**:
  * `/login`: Ekran logowania ze wsparciem autoryzacji JWT, obsługą błędów i opcjonalnym trybem demonstracyjnym (*Demo Mode*).
  * `/search` lub `/`: Szybka wyszukiwarka kontaktów, algorytm ujednoznaczniania tożsamości oraz baner spraw oczekujących (*Handoff*).
  * `/callers/:id`: Bezpośredni link do kartoteki kontaktu, historii konsultacji i osi czasu porad (*Timeline*).
  * `/records`: Centralny rejestr wszystkich udzielonych porad z zaawansowanymi filtrami wielowymiarowymi (daty, specjaliści, obszary poradnictwa) oraz eksportem dla administratorów.
  * `/stats`: Pulpit statystyk i wskaźników sprawozdawczych PFRON z podziałem geograficznym na 16 województw.
  * `/admin/*`: Dedykowany, pełnoekranowy panel administratora chroniony strażnikiem uprawnień (`AdminRoute`).
  * `/unauthorized`: Strona błędu 403 w przypadku próby nieuprawnionego dostępu.

---

## 2. 🛡️ Panel administratora (`/admin`)

* **Pulpit główny (Overview)**: Podsumowanie bazy (liczba porad, beneficjenci, aktywni specjaliści), stan połączenia i silnik bazy danych.
* **Specjaliści i uprawnienia**: Zarządzanie kontami użytkowników (CRUD), przypisywanie ról i obszarów specjalizacji, bezpieczne okno potwierdzenia (`ConfirmModal`) przy nadawaniu/odbieraniu uprawnień administratora oraz blokady programowe chroniące konto systemowe.
* **Wykrywanie i scalanie duplikatów (Merge Tool)**: Automatyczny algorytm wyszukiwania powtórzonych kartotek z porównaniem pól i 1-kliknięciem przepisujący wszystkie porady i załączniki do kartoteki głównej.
* **Centralny dziennik zmian (Audit Logs)**: Pełny rejestr audytowy modyfikacji porad z podglądem różnic pól (*diff przed vs po*).
* **Zarządzanie bazami danych (DB Manager)**: Przełączanie w locie między SQLite i PostgreSQL, testowanie połączeń, migracje schematu oraz przełącznik trybu demo.

---

## 3. 🗄️ Obsługa relacyjnych baz danych (PostgreSQL i SQLite)

* **Abstrakcja `DatabaseAdapter`**:
  * **SQLite (`better-sqlite3`)**: Lokalna, bezkonfiguracyjna baza plikowa (`data/synapsis.sqlite`) z trybem WAL (*Write-Ahead Logging*).
  * **PostgreSQL (`pg.Pool`)**: Produkcyjny silnik relacyjny z pulą połączeń, transakcjami i indeksami JSONB.
* **Dynamiczny przełącznik silnika**: Możliwość zmiany aktywnego silnika w locie z poziomu interfejsu panelu administratora lub przez zmienne środowiskowe (`DATABASE_ENGINE`, `DATABASE_URL`).
* **Automatyczne zasilanie (Auto-seeding)**: Automatyczna inicjalizacja bazy zestawem 71 konsultacji i kartotek przy pierwszym uruchomieniu.

---

## 4. 🔐 Autoryzacja i ochrona tras JWT

* **JSON Web Token (HMAC-SHA256)**: Tokeny sesyjne z 24-godzinną ważnością, zawierające identyfikator specjalisty, rolę oraz uprawnienia `isAdmin`.
* **Backend Middleware**: `authenticateJWT` oraz `requireAdmin` chroniące wrażliwe punkty końcowe API (`/api/admin/*`, usuwanie kartotek i porad).
* **Frontend Route Guards**: `<ProtectedRoute>` oraz `<AdminRoute>` zabezpieczające nawigację po stronach.

---

## 5. 🔍 Wyszukiwanie i ujednoznacznianie kontaktów

* **Tolerancja na brak znaków diakrytycznych i literówki**: Wpisanie `zolc`, `krakow`, `mrozek` bezbłędnie odnajduje odpowiednie osoby.
* **Wyszukiwanie wielokryterialne**: Po imieniu, nazwisku, odwróconej kolejności (*Nazwisko Imię*), numerze telefonu oraz miejscowości/województwie.
* **Procedura ujednoznaczniania tożsamości (*Disambiguation*)**: Wykrywanie osób o tym samym nazwisku i wyświetlanie ostrzeżenia z zaleceniem weryfikacji miejscowości, aby nie połączyć historii medycznej dwóch różnych rodzin.

---

## 6. 📋 Kartoteka kontaktu i oś czasu porad (Timeline)

* Pełna historia konsultacji z podziałem na rodzaj kontaktu, beneficjenta, status orzeczenia o niepełnosprawności, kategorie poradnictwa oraz zarządzanie załącznikami.
* Oś czasu z szybkim skrótem kontekstu dla dyżurującego specjalisty (mniej niż 5 sekund na zapoznanie się ze sprawą).

---

## 7. 📎 Magazyn załączników na dysku i wolumenie

* **Optymalizacja wydajności bazy**: Pliki załączników (PDF, skany orzeczeń WZON, zdjęcia, dokumenty medyczne) nie powiększają bazy danych, lecz są zapisywane bezpośrednio na dysku w katalogu `data/uploads/attachments/` (lub ścieżce `ATTACHMENTS_DIR`).
* **Punkty końcowe API (`/api/attachments`)**: Bezpieczny upload `multipart/form-data` do 50 MB, streaming plików, bezpośredni podgląd w przeglądarce i pobieranie z autoryzacją JWT.

---

## 8. 🔄 System przekazywania spraw i handoff

* Wsparcie dla interdyscyplinarnego zespołu konsultantów (np. przekierowanie rodzica od psychologa do radcy prawnego).
* Ekran powitalny z oczekującymi sprawami, dynamiczny wybór konsultanta, powiadomienia e-mail i automatyczne oznaczanie spraw jako zakończone po udzieleniu dedykowanej porady.

---

## 9. 📊 Raporty PFRON i eksport danych (dla administratorów)

* Eksport XLSX (Excel) z rejestrem i arkuszem podsumowania wskaźników grantowych, eksport CSV z anonimizacją RODO (art. 9).
* Funkcjonalność eksportu zabezpieczona na poziomie interfejsu oraz logiki serwerowej: dostępna wyłącznie dla zweryfikowanych administratorów systemu.

---

## 10. 🐳 Konteneryzacja Docker i wdrożenie Coolify

* **Wielostopniowy Dockerfile**: Optymalny obraz produkcyjny Node 22 Alpine.
* **Wspólny Persistent Storage**: Montowanie `/app/data` zabezpiecza i trwale przechowuje zarówno bazę SQLite (`synapsis.sqlite`), jak i wszystkie załączniki (`uploads/attachments`).
* **Gotowy szablon Coolify (`docker-compose.coolify.yml`)**: Bezproblemowy deploy w środowisku Coolify z nazwanym wolumenem.
