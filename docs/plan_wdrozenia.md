# Plan i Propozycja Wdrożenia: Wspólna Baza Historii Rozmów dla Dyżurujących Specjalistów (Linia Poradnicza PFRON)

## 1. Kontekst Biznesowy i Diagnoza Problemu

* **Organizacja:** Fundacja wspierająca od ponad 35 lat osoby w spektrum autyzmu i ich rodziny (podmiot leczniczy, ok. 120 pracowników).
* **Usługa:** Bezpłatna, ogólnopolska linia poradnicza finansowana ze środków PFRON (~4000 porad rocznie, ok. 330 porad/miesiąc).
* **Użytkownicy:** Specjalistki na dyżurach telefonicznych (prawniczki, pedagożki, psycholożki) o różnym poziomie biegłości cyfrowej.
* **Główny problem operacyjny:** 
  * Obecny proces opiera się na wspólnym pliku Excel, który utrudnia równoległą pracę wielu osób (blokowanie arkusza, ryzyko nadpisywania wpisów).
  * W trakcie dzwonienia telefonu specjalistka musi w kilkanaście sekund ustalić: czy dzwoniący kontaktował się wcześniej, kto mu doradzał (prawnik, psycholog, pedagog), jakie były zalecenia i czy należy kontynuować kontakt z tym samym specjalistą.
  * Zjawisko „sprawdzania” (*forum shopping*) – dzwoniący ponawiają kontakt z nadzieją, że inny specjalista wyda odmienną opinię.
* **Główny cel wdrożenia:** Skrócenie czasu identyfikacji historii dzwoniącego do **poniżej 5 sekund**, pełna bezkonfliktowa praca współbieżna, ujednolicenie poradnictwa oraz automatyzacja sprawozdawczości dla PFRON.
* **Rygor bezpieczeństwa i RODO:** Dane dotyczące zdrowia i niepełnosprawności (art. 9 RODO, podmiot leczniczy) – bezwzględny wymóg pełnego szyfrowania, kontroli dostępu, nienaruszalnego rejestru audytu i prewencji przed błędnym scalaniem osób o podobnych danych.

---

## 2. Architektura Systemu i Rekomendowany Stack Technologiczny

System zaprojektowano jako lekką, responsywną aplikację webową (PWA), zoptymalizowaną pod szybkość działania, obsługę klawiaturą oraz intuicyjny interfejs.

```mermaid
flowchart TD
    subgraph Frontend ["Frontend (Panel Dyżurującego - PWA)"]
        UI["Interfejs Dyżurującego (React / TypeScript / Tailwind CSS)"]
        Search["Szybka Wyszukiwarka (Fuzzy Match + Skróty Klawiszowe)"]
        LiveSync["Real-time Sync (BroadcastChannel / WebSockets)"]
    end

    subgraph Backend ["Backend & Logika Biznesowa"]
        API["REST / tRPC API (Node.js TypeScript / Next.js Fastify)"]
        Auth["Auth & RBAC (2FA, SSO Google/MS365, Role: Prawnik/Psycholog/Pedagog)"]
        AuditService["Audit Log (Nienaruszalny Rejestr Czynności)"]
        PFRONGen["Generator Raportów PFRON (Anonimizacja + Agregacja)"]
        ExcelMigrator["Migrator Danych z Excela (Walidacja + Mapowanie)"]
    end

    subgraph Security_DB ["Baza Danych & Bezpieczeństwo"]
        DB[(PostgreSQL + Szyfrowanie Kolumnowe AES-256 / pgcrypto)]
        Storage["Szyfrowane Załączniki (S3-compatible / Azure Blob z SSE)"]
    end

    subgraph Telephony ["Integracja Telefoniczna (Faza Rozszerzeń)"]
        CTI["CTI / Webhook / Asystent Połączeń GSM"]
    end

    UI --> API
    LiveSync <--> API
    API --> DB
    API --> Storage
    API --> AuditService
    CTI -.-> UI
```

### Wybrane Technologie:
* **Frontend:** TypeScript, React, Tailwind CSS, Lucide Icons, SheetJS (`xlsx`), Canvas-Confetti.
* **Warstwa Danych & State:** PostgreSQL / IndexedDB / LocalStorage Cache + `BroadcastChannel` (wielodostęp w czasie rzeczywistym).
* **Bezpieczeństwo:** Szyfrowanie danych w spoczynku (*at rest*) i w tranzycie (*in transit* TLS 1.3), mechanizmy RBAC i Audit Logging.

---

## 3. Model Danych (Data Schema)

```mermaid
erDiagram
    CALLER ||--o{ CALL_RECORD : "posiada historię"
    SPECIALIST ||--o{ CALL_RECORD : "przeprowadza poradę"
    CALL_RECORD ||--o{ ATTACHMENT : "zawiera załączniki"
    CALL_RECORD ||--o{ AUDIT_LOG : "rejestruje operacje"
    SPECIALIST ||--o{ AUDIT_LOG : "wykonuje akcję"

    CALLER {
        uuid id PK
        string first_name "Imię (zaszyfrowane)"
        string last_name "Nazwisko (zaszyfrowane)"
        string phone_number "Nr telefonu (indeksowany hashem)"
        string voivodeship "Województwo (16 województw)"
        string city "Miejscowość / Powiat"
        enum category "RODZIC_OPIEKUN | OSOBA_W_SPEKTRUM | NAUCZYCIEL_TERAPEUTA | INNA"
        string_array tags "Tagi problemu"
        timestamp created_at
        timestamp updated_at
    }

    CALL_RECORD {
        uuid id PK
        uuid caller_id FK
        uuid specialist_id FK
        timestamp call_date "Data i godzina konsultacji"
        enum advice_type "PRAWNA | PSYCHOLOGICZNA | PEDAGOGICZNA | INNA"
        text problem_description "Opis problemu (zaszyfrowany)"
        text advice_given "Udzielona pomoc i rekomendacje"
        text internal_notes "Wskazówka dla kolejnego dyżurującego"
        string pfron_category "Kategoria słownikowa PFRON"
        int duration_minutes "Czas trwania rozmowy"
        timestamp created_at
    }

    SPECIALIST {
        uuid id PK
        string name "Imię i Nazwisko"
        string role "Rola służbowa"
        string title "Tytuł zawodowy"
        enum advice_type "Główna dziedzina"
        string email "Login / Email służbowy"
    }

    ATTACHMENT {
        uuid id PK
        uuid call_record_id FK
        string file_name
        string file_type "PDF | JPG | PNG"
        int file_size
        string storage_path "Zaszyfrowana ścieżka w storage"
    }

    AUDIT_LOG {
        uuid id PK
        uuid specialist_id FK
        string action "VIEW | CREATE | EDIT | EXPORT"
        string entity_type "CALLER | RECORD"
        uuid entity_id
        timestamp timestamp
        string ip_address
    }
```

---

## 4. Przepływ Pracy Specjalistki na Dyżurze (User Journey)

1. **Identyfikacja w trakcie połączenia (0–5 sekund):**
   * Specjalistka wpisuje nazwisko lub numer telefonu dzwoniącego (skrót `/` lub `Ctrl + K`).
   * **Mechanizm anty-pomyłkowy (Disambiguation):** Jeśli w bazie istnieje kilka osób o tym samym nazwisku (np. *Katarzyna Kowalska z Warszawy* i *Katarzyna Kowalska z Katowic*), system wyświetla karty porównawcze z prośbą o weryfikację miejscowości/telefonu.
2. **Natychmiastowy kontekst (5–10 sekund):**
   * **Smart AI Briefing:** 2-zdaniowe podsumowanie dotychczasowej historii na szczycie kartoteki.
   * **Oś czasu porad:** Wyświetlenie chronologicznych wpisów wraz z żółtymi alertami wskazówek od poprzedników.
3. **Rejestracja porady podczas lub po rozmowie (Alt + N):**
   * Formularz z automatycznym przypisaniem daty i zalogowanej specjalistki.
   * Wybór typu: Prawna / Psychologiczna / Pedagogiczna, wpisanie problemu, zaleceń i notatki dla kolejnej dyżurującej.
4. **Współbieżność Live:**
   * Inne dyżurujące osoby widzą w czasie rzeczywistym wskaźnik obecności i natychmiastową aktualizację bazy bez odświeżania strony.

---

## 5. Harmonogram Realizacji i Roadmapa

| Etap | Zakres | Rezultat |
| :--- | :--- | :--- |
| **Dzień 1 (Rdzeń MVP / Hackathon Demo)** | • Błyskawiczna wyszukiwarka kartotek i historia porad<br>• Formularz rejestracji z synchronizacją współbieżną<br>• Filtrowanie i eksport do CSV (UTF-8 BOM)<br>• Migrator dotychczasowego pliku Excel | **Działająca aplikacja gotowa do testów i demonstracji** |
| **Faza 1 (Bezpieczeństwo & Pilotaż, Tyg. 1–2)** | • Wdrożenie autentykacji 2FA / SSO<br>• Szyfrowanie bazy danych (pgcrypto / AES-256)<br>• Moduł Audit Log zgodny z RODO i podmiotem leczniczym<br>• Testy użyteczności ze specjalistkami fundacji | Środowisko testowe / stagingowe fundacji |
| **Faza 2 (Raporty PFRON & Załączniki, Tyg. 3–4)** | • Generator zanonimizowanych zestawień PFRON<br>• Bezpieczne repozytorium dokumentów (orzeczenia, pisma w PDF/JPG)<br>• Rozszerzenie asystenta AI o kategoryzację zgłoszeń | Kompletny system sprawozdawczo-dokumentacyjny |
| **Faza 3 (Produkcja & Telefonia, Miesiąc 2)** | • Wdrożenie produkcyjne w chmurze / na serwerze fundacji<br>• Integracja z telefonią (asystent połączeń GSM / stacjonarny CTI)<br>• Szkolenia zespołu (120 pracowników) i stabilizacja | Pełne zastąpienie arkusza Excel na linii wsparcia |

---

## 6. Bezpieczeństwo Danych i Zgodność z Prawem (Podmiot Leczniczy)

1. **Art. 9 RODO (Dane szczególnych kategorii):** Informacje o zdrowiu i niepełnosprawności dzieci są chronione rygorystycznymi uprawnieniami.
2. **Pełne szyfrowanie:** Dane identyfikacyjne oraz opisy problemów są szyfrowane kluczem aplikacji.
3. **Automatyczna Anonimizacja Raportowa:** Eksporty dla grantodawcy (PFRON) generowane są bez imion, nazwisk i numerów telefonów (identyfikatory `DZWON-XXXXXX`).
4. **Niezaprzeczalny Rejestr Audytu:** Każde wyświetlenie lub edycja kartoteki zapisuje rekord z ID specjalistki i znacznikiem czasu.

---

## 7. Instrukcja Uruchomienia i Testów

Aplikacja zrealizowana w ramach Dnia 1 jest w pełni gotowa do uruchomienia lokalnego:

```powershell
npm run dev
```

Adres w przeglądarce: `http://localhost:5173`
