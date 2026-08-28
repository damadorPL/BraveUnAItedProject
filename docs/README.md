# Dokumentacja Projektu: System Rezerwacji Wizyt (Fundacja Niepodzielni)

Niniejszy folder zawiera kompletną specyfikację, architekturę i plan realizacji systemu rezerwacji wizyt psychologicznych dla Fundacji Niepodzielni w oparciu o wyzwanie z hackathonu BRAVE UnAIted.

## Struktura Dokumentacji

1. [2. Proponowany Plan Działania](./02-plan-dzialania.md)
   - Harmonogram dnia, podział na fazy Build I i Build II, diagram sekwencji procesu.
2. [3. Architektura Techniczna i Model Danych](./03-architektura-i-dane.md)
   - Maszyna stanów terminu (`Slot State Machine`), interfejsy TypeScript, reguły `Hold` i kolejka FIFO.
3. [4. Szczegółowy Zakres 3 Ekranów Demo](./04-ekrany-demo.md)
   - Specyfikacja 3 ekranów (Wyszukiwarka, Zarządzanie z linku tokena, Kaskada listy rezerwowej z podglądem SMS).

## Kluczowe Wartości i Reguły Biznesowe

- **Blokada terminu**: 10 minut wyłączności podczas procesu rezerwacji.
- **Okno 24h**: Bezpłatne odwołanie i zwrot $>24\text{ h}$; poniżej 24h przyciski znikają, pojawia się bezpośredni kontakt do specjalisty.
- **Kaskada listy rezerwowej**: Automatyczna propozycja zwolnionego terminu dla kolejnej osoby w kolejce FIFO.
- **Dyskrecja SMS**: Całkowity brak słów o zdrowiu psychicznym na zablokowanym ekranie telefonu.
- **Dziennik koordynatora**: Rejestr audytowy *append-only* (tylko dopisywanie).
