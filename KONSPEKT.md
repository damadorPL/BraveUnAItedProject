# BRAVE UnAIted — Fundacja Niepodzielni

Konspekt planu na hackathon (1 dzień). Pełny plan: https://czechowski.eu/plan.html

## Cel
Zmienić klikalną makietę w działający system rezerwacji wizyt psychologicznych.
Narracja: "Rano była makieta, o 17:00 za nią działa prawdziwy system" — jeden mocny efekt, nie lista funkcji.

## Funkcjonalności (3 ekrany)

1. **Wyszukiwarka i rezerwacja** — filtr typu konsultacji (55 zł), wybór terminu z timerem blokady (10 min), płatność jednym przyciskiem „Zapłać BLIK-iem", bez symulacji błędów.
2. **Zarządzanie wizytą** — odwołanie >24h przed (łatwe, z kwotą zwrotu), <24h (brak przycisków, kontakt do specjalisty), dostęp przez link z SMS-a.
3. **Kaskada listy rezerwowej** — zwolniony termin automatycznie oferowany pierwszej osobie z kolejki FIFO. Maszyna stanów: wolny → zarezerwowany → (po odwołaniu) → zaoferowany. SMS na zablokowany ekran (dyskretny, bez nazwy usługi), okno potwierdzenia → mock BLIK → booked.

**Moment WOW**: dwie karty przeglądarki obok siebie — pacjent A odwołuje, pacjent B widzi ofertę SMS w czasie rzeczywistym (przez event `storage`).

## Reguły biznesowe
| Reguła | Wartość |
|---|---|
| Blokada terminu | 10 minut wyłączności |
| Bezpłatne odwołanie | >24h; <24h brak przycisków |
| Przełożenia | max 2 na wizytę |
| Wizyty niskopłatne | limit 10/pacjent, 4/tydzień/specjalista |
| SMS-y | bez nazwy usługi, bez słowa "zdrowie" |
| Ankieta | dokładnie 6 zamkniętych pytań |
| Dziennik koordynatora | append-only |
| Zwroty | ręcznie przez koordynatora |

## Stack techniczny
- **Frontend**: Vite + React + TypeScript + Tailwind + shadcn/ui
- **Ikony**: lucide-react
- **Toasty**: sonner
- **"Backend"**: mock store w TS na localStorage
- **Dane**: 111 specjalistów, ~10 rezerwacji, dane polskie
- **Deploy**: Vercel z GitHuba
- **Komunikacja między kartami**: `storage` event (emulacja push/SMS)
- **Video**: OBS Studio do nagrania pitchu

## Model danych (mock store)
Cztery "tabele": `Slot` (free/held/booked), `Hold`, `Waitlist` (FIFO po `createdAt`), `Offer` (token, expiresAt, status).
Cała kaskada w jednej funkcji `onCancel(slotId)`. Link `/w/:token` pokazuje termin z odliczaniem.

## Harmonogram (1 dzień)
- **9:00–9:45** Kickoff — kapitan + pitch, wybór 3 ekranów, repo+Vercel podpięte
- **9:45–10:15** Mockup Sprint — jedna osoba odtwarza 3 ekrany
- **10:15–13:00** Build I — Builder A: ekran 1; Builder B: logika reguł; UX: dane PL. Push co 30 min, deploy ~10:30
- **13:00–13:45** Checkpoint — pełne przejście demo, co nie działa wypada z zakresu
- **14:00–14:45** Obiad (praca trwa) — Claude Code przechodzi demo, PROGRESS.md
- **14:45–15:45** Build II — dopracowanie animacji, ewentualnie ankieta/panel koordynatora, zero nowych funkcji
- **15:45–16:15** Feature Freeze — deploy, realistyczne dane, testy, tylko poprawki błędów
- **16:15–17:00** Pitch Sprint — nagranie OBS, skrypt 60s, dwie próby

## Role
- **Kapitan/Product** — pilnuje wizji i zegara, decyduje co wypada, nie koduje
- **Builderzy (1–2)** — moduły + Claude Code, push co 30 min
- **UX i Dane Demo** — ekrany wiernie z makiety, dane PL
- **Pitch i Research** — do 15:00 screeny, od 15:00 skrypt/próby/nagranie

## Pitch (60s)
- 0:00–0:10 Problem (111 specjalistów, ręczne umawianie, makieta → system)
- 0:10–0:35 Demo (wybór, blokada 10 min, BLIK, SMS)
- 0:35–0:50 WOW (kaskada listy rezerwowej)
- 0:50–1:00 Zamknięcie (reguły fundacji w kodzie, gotowe do wdrożenia)

## Świadomie wycinamy
Panel koordynatora (max statyczny), ankieta (tylko jeśli czas), logowanie, realne płatności, panel admina, edge case'y, dopasowanie preferencji godzinowych, powiadomienia o kolejce, realne timery w tle.

## Trzy błędy do uniknięcia
1. Pięć różnych apek — mockup robi jedna osoba
2. Zmiana cudzego pliku bez konsultacji
3. Wielkie scalanie o 16:30 — push co 30 min, pull przed pracą

## Zasady
- Dyskusja >10 min → decyduje kapitan
- Feature freeze 15:45, zero nowych funkcji
- Jury ocenia prostotę i jeden efekt, nie listę funkcji
