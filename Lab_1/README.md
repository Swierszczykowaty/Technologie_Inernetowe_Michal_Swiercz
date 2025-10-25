# Biblioteka (backend + frontend)

Prosty projekt biblioteki: backend (Express + Prisma + SQLite) i frontend (Next.js).

## Uruchomienie

# Backend
cd .\Lab_1
npm install
npx prisma generate
npm run dev

# Frontend
cd .\frontend-biblioteka-api
npm install
npm run dev

## Uwagi
- Odpowiedzi API oraz kody statusu (np. 200, 400) wyświetlane są jako powiadomienie na dashboardzie.
- W prawym górnym rogu strony znajduje się selektor użytkownika (UserSelector) — wybór jest zapisywany w `localStorage` i wpływa na operacje wypożyczania.

---
