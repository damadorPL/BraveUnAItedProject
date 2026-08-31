# Podręcznik użytkownika - Baza Porad Synapsis

Podręcznik przeznaczony dla dyżurujących specjalistów (psychologów, radców prawnych, doradców P2P, konsultantów społecznych) oraz administratorów systemu.

---

## 🔑 1. Logowanie do systemu

1. Otwórz aplikację w przeglądarce pod adresem domeny (lub `http://localhost:5173`).
2. Wpisz swój służbowy adres e-mail (np. `j.mrozek@synapsis.org.pl`) oraz hasło.
3. Kliknij **Zaloguj się**.
4. W przypadku włączonego trybu demonstracyjnego (*Demo Mode*), u dołu formularza dostępna jest lista szybkich profili testowych.
5. **Zapomniane hasło**: Kliknij link *„Nie pamiętasz hasła?”*, aby wygenerować formularz zmiany hasła przy pomocy administratora.

---

## 🔍 2. Wyszukiwanie kontaktów i ujednoznacznianie

Wyszukiwarka na stronie głównej (`/search`) pozwala odnaleźć historię osoby w mniej niż 5 sekund:

* **Tolerancja na brak polskich znaków i spacje**: Możesz wpisać `zolc`, `dabrowska`, `600100200` lub `Nowak Anna` - system bez problemu rozpozna kontakt.
* **Rozstrzyganie osób o tym samym nazwisku (*Disambiguation*)**:
  * Jeśli w bazie znajduje się kilka osób o zbliżonych danych (np. dwie Anny Kowalskie), system wyświetli żółty panel ostrzegawczy z prośbą o dopytanie o miejscowość lub województwo.
  * Zapobiega to przypadkowemu połączeniu historii medycznej dwóch różnych rodzin.

---

## 📋 3. Kartoteka kontaktu i oś czasu porad (Timeline)

Po kliknięciu w kontakt przechodzisz do strony `/callers/:id`:

1. **Nagłówek profilu**: Dane teleadresowe, województwo, relacja (rodzic, opiekun, osoba w spektrum), status orzeczenia o niepełnosprawności i tagi.
2. **Oś czasu konsultacji (*Timeline*)**:
   * Każda porada wyświetla datę, dyżurującego specjalistę, rodzaj kontaktu (telefon, e-mail, stacjonarnie), czas trwania oraz opis udzielonego wsparcia.
   * Możliwość rozwijania szczegółów i historii edycji porady (*Audit Log*).
3. **Zarządzanie załącznikami**:
   * Przeciągnij i upuść pliki (PDF, skany orzeczeń WZON, zdjęcia, dokumenty) bezpośrednio do sekcji załączników.
   * Bezpośredni podgląd w przeglądarce i bezpieczne pobieranie.

---

## ✍️ 4. Rejestracja nowej porady

Aby zarejestrować konsultację:

1. W profilu kontaktu kliknij przycisk **+ Nowa porada** (lub przycisk *Konsultuj* na liście wyszukiwania).
2. Wypełnij formularz zgodny ze wzorcem PFRON:
   * **Data i godzina konsultacji**: domyślnie bieżący czas.
   * **Kogo dotyczyła porada**: dziecko, osoba dorosła, cała rodzina itp.
   * **Forma kontaktu**: telefon, e-mail, wideorozmowa, spotkanie osobiste.
   * **Struktura poradnictwa PFRON**:
     * *Prawno-obywatelskie* (np. orzecznictwo WZON, świadczenia wspierające, prawo oświatowe).
     * *W zakresie psychologii i rehabilitacji społecznej*.
     * *Parent to Parent* (wsparcie rówieśnicze rodzin).
     * *Społeczne / Inne*.
   * **Czas trwania**: w minutach (wpływa na oficjalne sprawozdania grantowe).
   * **Opis porady i zalecenia**: zwięzły opis ustaleń i przekazanych informacji.
   * **Opcjonalne przekazanie sprawy (*Referral*)**: jeśli sprawa wymaga konsultacji innego specjalisty (np. radcy prawnego).
3. Kliknij **Zapisz poradę**.

---

## 🔄 5. System przekazywania spraw (*Handoff*)

* Jeśli podczas dyżuru psychologicznego rodzic potrzebuje wsparcia prawnego, konsultant zaznacza w poradzie opcję **Przekaż sprawę** i wybiera specjalistę (np. mec. Anna Nowak).
* Po zalogowaniu się mec. Anna Nowak widzi na górze ekranu baner z powiadomieniem o oczekującej sprawie.
* Po skontaktowaniu się z rodzicem i zarejestrowaniu porady prawnej, sprawa zostaje **automatycznie oznaczona jako zrealizowana**.

---

## 🛡️ 6. Panel administratora (`/admin`)

Dostępny wyłącznie dla użytkowników z uprawnieniem `isAdmin`:

1. **Pulpit główny**: Przegląd łącznej liczby porad, aktywnych konsultantów, wskaźników grantowych i stanu silnika bazy danych.
2. **Specjaliści i uprawnienia**:
   * Dodawanie nowych członków zespołu, edycja danych, nadawanie uprawnień administratora.
   * **Potwierdzenie uprawnień**: Przyznanie lub odebranie praw administratora wymaga potwierdzenia w oknie modalnym `ConfirmModal`.
3. **Scalanie duplikatów (*Merge Tool*)**:
   * Wykrywanie zdublowanych kartotek.
   * 1-kliknięciem scala dwie kartoteki w jedną, przepisując całą historię porad i załączników.
4. **Dziennik zmian (*Audit Logs*)**:
   * Pełny rejestr edycji rekordów z porównaniem zmian (*przed vs po*).
5. **Zarządzanie bazą danych**:
   * Przełączanie silnika SQLite / PostgreSQL, testowanie połączenia, czyszczenie lub zasilanie bazy danymi demonstracyjnymi.

---

## 📊 7. Raporty i eksport danych

* Administrator ma dostęp do eksportu danych w formatach **XLSX (Excel)** oraz **CSV**.
* **Tryb anonimizowany (RODO)**: Domyślnie usuwa dane osobowe beneficjentów, generując oficjalny raport do rozliczenia z PFRON wraz z arkuszem podsumowania wskaźników i rozkładu geograficznego.
