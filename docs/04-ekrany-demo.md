# 4. Szczegółowy Zakres 3 Ekranów Demo

Zgodnie z zasadami hackathonu, demo składa się dokładnie z 3 spójnych ekranów realizujących jedną zwartą historię.

## Tabela Ekranów i Zakresu

| # | Nazwa Ekranu | Ścieżka / Widok | Kluczowe Funkcjonalności | Istotne Reguły Biznesowe |
|---|---|---|---|---|
| **1** | **Wyszukiwarka i Rezerwacja** | `/` | <ul><li>Filtrowanie: Typ konsultacji (niskopłatna 55 zł, ADHD 750 zł, bezpłatna), Specjalista</li><li>Karty dostępnych terminów</li><li>Pasek blokady terminu z odliczaniem na żywo (`10:00`)</li><li>Formularz rezerwacji: Imię, Telefon (bez konieczności logowania)</li><li>Przycisk *„Zapłać BLIK-iem”* $\rightarrow$ Natychmiastowe potwierdzenie</li></ul> | <ul><li>Blokada wyłączności na 10 minut</li><li>Brak konieczności tworzenia konta i hasła</li><li>Limit 10 wizyt niskopłatnych na pacjenta</li></ul> |
| **2** | **Zarządzanie Wizytą (Link z SMS)** | `/v/:token` | <ul><li>Dostęp bezpośredni przez unikalny token bezpieczeństwa</li><li>Szczegóły wizyty (data, godzina, specjalista)</li><li>**Przełącznik demonstracyjny (Demo Toggle)**:<br>• *Stan A: Wizyta za 3 dni ($>24\text{ h}$)*<br>• *Stan B: Wizyta za 6 godzin ($<24\text{ h}$)*</li><li>Dla $>24\text{ h}$: Przycisk *„Odwołaj wizytę”* z informacją o pełnym zwrocie środków</li><li>Dla $<24\text{ h}$: Blokada przycisków i wyświetlenie bezpośredniego kontaktu do specjalisty</li></ul> | <ul><li>Okno bezpłatnego odwołania: 24 godziny</li><li>Poniżej 24h przyciski znikają w celu ochrony czasu pracy specjalisty</li><li>Maksymalnie 2 przełożenia na wizytę</li></ul> |
| **3** | **Kaskada Listy Rezerwowej (Moment WOW)** | Komponent obok UI + `/w/:token` | <ul><li>**Komponent zablokowanego iPhone'a** renderowany obok aplikacji</li><li>Natychmiast po kliknięciu *„Odwołaj wizytę”* na Ekranie 2 na telefonie pojawia się animowane powiadomienie SMS</li><li>Dyskretna treść SMS bez wrażliwych słów</li><li>Kliknięcie w powiadomienie na telefonie otwiera stronę `/w/:token` z ofertą przejęcia terminu i przyciskiem potwierdzenia</li></ul> | <ul><li>Zwolniony termin nie przepada, lecz automatycznie trafia do pierwszej osoby z kolejki</li><li>Treść SMS zoptymalizowana pod kątem widoczności na zablokowanym ekranie przy osobach trzecich</li></ul> |

---

## Szczegóły Komponentu Powiadomienia SMS (Moment WOW)

Powiadomienie na ekranie blokady iPhone'a zostało zaprojektowane z zachowaniem pełnej dyskrecji:

```
┌───────────────────────────────────────────────┐
│  💬 WIADOMOŚCI                          teraz │
│  Rezerwacja: Termin 29.08 godz. 14:00         │
│  został zwolniony. Potwierdź do 10:15:        │
│  niepodzielni.pl/w/7f8a9                      │
└───────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Zasada Dyskrecji Fundacji**: W treści SMS-a celowo nie ma słów: *psycholog*, *terapia*, *ADHD*, *kryzys*, ani nazwy fundacji sugerującej problem zdrowotny, ponieważ powiadomienia wyświetlają się na zablokowanym ekranie w obecności osób postronnych.

---

## Podgląd Dziennika Koordynatora (Opcjonalny Panel Boczny)

Dla wzmocnienia wiarygodności systemu dla jury, w rogu ekranu dostępny jest kompaktowy, zwijany podgląd rejestru audytowego (*append-only log*):

```
[10:00:12] HOLD_CREATED: Slot #102 zablokowany na 10 min (Rezerwacja: Anna K.)
[10:02:45] BOOKING_CONFIRMED: Wizyta #102 opłacona BLIK (Anna K.)
[10:14:02] VISIT_CANCELLED: Wizyta #102 odwołana przez pacjenta (>24h). Kwota do zwrotu: 55 zł.
[10:14:03] WAITLIST_OFFER_SENT: Slot #102 zaoferowany pierwszej osobie z kolejki: Piotr W. (SMS wysłany).
```

## Powiązane Dokumenty
- [2. Proponowany Plan Działania](./02-plan-dzialania.md)
- [3. Architektura Techniczna i Model Danych](./03-architektura-i-dane.md)
