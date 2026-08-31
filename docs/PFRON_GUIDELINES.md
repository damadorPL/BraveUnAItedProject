# Wytyczne sprawozdawczości PFRON i ochrony danych

Dokument opisuje standardy gromadzenia danych, wskaźniki projektowe oraz procedury sprawozdawcze w ramach realizacji zadań zlecanych przez **Państwowy Fundusz Rehabilitacji Osób Niepełnosprawnych (PFRON)**.

---

## 🎯 1. Cel i zakres sprawozdawczości

System Baza Porad rejestruje działania w ramach ogólnopolskiej linii wsparcia dla osób w spektrum autyzmu i ich rodzin. Dane zbierane w systemie służą do:
1. Rozliczania godzin i liczby konsultacji w sprawozdaniach okresowych i końcowych dla PFRON.
2. Monitorowania wskaźników rezultatu i produktu określonych w umowie grantowej.
3. Analizy dostępności wsparcia w poszczególnych województwach.

---

## 📊 2. Kluczowe wskaźniki projektowe (KPI)

| Wskaźnik | Opis | Źródło w systemie |
| :--- | :--- | :--- |
| **Liczba udzielonych porad** | Całkowita liczba przeprowadzonych konsultacji telefonicznych, mailowych i bezpośrednich. | Suma wierszy w rejestrze porad (`CallRecords`). |
| **Liczba beneficjentów ostatecznych** | Unikalna liczba osób/rodzin objętych wsparciem. | Liczba unikalnych kartotek (`Callers`). |
| **Beneficjenci z orzeczeniem** | Odsetek osób posiadających aktualne orzeczenie o niepełnosprawności lub stopniu niepełnosprawności. | Pole `hasDisabilityCertificate` w profilu kontaktu. |
| **Czas trwania wsparcia** | Suma zarejestrowanych godzin pracy specjalistów. | Suma pola `durationMinutes` przeliczona na godziny. |
| **Rozkład terytorialny** | Liczba porad i beneficjentów w podziale na 16 województw. | Pole `voivodeship` w profilu kontaktu. |

---

## 🏷️ 3. Struktura poradnictwa i obszary merytoryczne

System kategoryzuje porady według czterech głównych filarów:

### A. Poradnictwo prawno-obywatelskie
* Orzecznictwo o niepełnosprawności (WZON, PZON, procedury odwoławcze).
* Świadczenie wspierające i punkty potrzeby wsparcia.
* Prawo oświatowe (kształcenie specjalne, WOPFU, IPET, asystenci w szkołach).
* Świadczenia opiekuńcze (świadczenie pielęgnacyjne, zasiłki).
* Sprawy opiekuńcze i ubezwłasnowolnienie.

### B. Poradnictwo psychologiczne i rehabilitacja społeczna
* Wsparcie kryzysowe dla rodziców po diagnozie dziecka.
* Strategie radzenia sobie ze stresem i wypaleniem opiekuńczym.
* Trudne zachowania i komunikacja alternatywna.
* Samorzecznictwo dorosłych osób w spektrum autyzmu.

### C. Poradnictwo Parent to Parent (P2P)
* Wsparcie rówieśnicze udzielane przez doświadczonych rodziców.
* Dzielenie się doświadczeniami edukacyjnymi i terapeutycznymi.

### D. Poradnictwo społeczne i informacyjne
* Baza placówek terapeutycznych, warsztatów terapii zajęciowej (WTZ) i środowiskowych domów samopomocy (ŚDS).
* Dostęp do dofinansowań ze środków PFRON (np. programy Aktywny Samorząd).

---

## 🔐 4. Standardy ochrony danych osobowych (RODO)

Informacje o spektrum autyzmu oraz orzeczeniach o niepełnosprawności stanowią **dane szczególnych kategorii (dane medyczne i zdrowotne)** w rozumieniu art. 9 RODO:

1. **Zasada minimalizacji danych**: W notatkach z porad nie zapisujemy zbędnych danych identyfikacyjnych (np. numerów dowodów, szczegółowych adresów zamieszkania).
2. **Automatyczna anonimizacja w eksportach**:
   * Generowane raporty dla PFRON automatycznie usuwają imiona, nazwiska, numery telefonów oraz adresy e-mail.
   * Każdy beneficjent otrzymuje deterministyczny identyfikator anonimowy (np. `DZWON-1A2B3C`).
   * Treść opisów porad jest czyszczona z przypadkowo wpisanych numerów PESEL, telefonów czy nazwisk.
3. **Dostęp oparty na uprawnieniach**: Eksport pełnej bazy jest zarezerwowany wyłącznie dla wyznaczonych administratorów projektu.
