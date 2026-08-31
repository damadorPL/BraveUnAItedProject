# Dokumentacja projektu - Baza Porad Synapsis (UnAIted)

Witaj w oficjalnej dokumentacji systemu **Baza Porad** stworzonego dla Fundacji Synapsis. Znajdziesz tutaj szczegółowe opisy architektury, instrukcje wdrożeniowe, podręcznik użytkownika oraz wytyczne sprawozdawcze PFRON.

---

## 📚 Spis dokumentacji

| Dokument | Opis |
| :--- | :--- |
| **[1. Architektura systemu (`ARCHITECTURE.md`)](./ARCHITECTURE.md)** | Szczegółowy opis stosu technologicznego (React 19, Express, Drizzle ORM), warstwy baz danych (SQLite / PostgreSQL), magazynu załączników oraz modelu bezpieczeństwa JWT. |
| **[2. Podręcznik użytkownika (`USER_GUIDE.md`)](./USER_GUIDE.md)** | Instrukcja krok po kroku dla dyżurujących specjalistów: wyszukiwanie kontaktów, rejestracja porad, przekazywanie spraw (*Handoff*), obsługa załączników i panel administratora. |
| **[3. Wytyczne sprawozdawczości PFRON (`PFRON_GUIDELINES.md`)](./PFRON_GUIDELINES.md)** | Standardy zbierania danych wg wymogów grantowych PFRON, kategorie poradnictwa, wskaźniki sprawozdawcze i procedury anonimizacji RODO (art. 9). |
| **[4. Wdrożenie i DevOps (`DEPLOYMENT.md`)](./DEPLOYMENT.md)** | Instrukcja uruchamiania w Dockerze, konfiguracja środowiska produkcyjnego Coolify, zarządzanie wolumenami trwałymi (`/app/data`) oraz zmienne środowiskowe. |
| **[5. Strategia testowania (`TESTING.md`)](./TESTING.md)** | Opis testów jednostkowych i integracyjnych (Vitest + Supertest) oraz testów funkcjonalnych End-to-End w przeglądarce (Playwright). |

---

## 📂 Pliki pomocnicze

* **[Przykładowy arkusz danych (`przyklad.xlsx`)](./przyklad.xlsx)** - Wzorcowy arkusz danych z przykładowymi poradami i strukturą pól zgodną ze wzorcem Fundacji Synapsis i PFRON.
