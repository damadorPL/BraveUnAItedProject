# BRAVE UnAIted — system rezerwacji wizyt (Fundacja Niepodzielni)

Hackathon 1-dniowy: zmiana klikalnej makiety w działający system rezerwacji wizyt psychologicznych.

Pełny konspekt planu: [KONSPEKT.md](./KONSPEKT.md)
Log postępu buildu: [PROGRESS.md](./PROGRESS.md)

## Stack
Vite + React + TypeScript + Tailwind + shadcn/ui, mock store (localStorage), deploy Vercel.

## Struktura
```
src/
  screens/       # 3 ekrany makiety: Search, ManageAppointment, WaitlistCascade
  lib/
    mockStore.ts # Slot / Hold / Waitlist / Offer + logika kaskady
  components/    # komponenty shadcn/ui i wspólne
data/
  specialists.json  # dane demo (PL)
```

## Uruchomienie
```
npm install
npm run dev
```
