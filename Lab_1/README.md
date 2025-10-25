# Biblioteka (backend + frontend)

Prosty projekt biblioteki: backend (Express + Prisma + SQLite) i frontend (Next.js).

## Uruchomienie

# Backend
cd .\Lab_1
npm install
node index.js

# Frontend
w nowej konsoli:
cd .\Lab_1\frontend-biblioteka-api
npm install
npm run dev

# Oczekiwany wynik końcowy
http://localhost:3000 - działanie backendu
http://localhost:3001 - działanie frontendu

## Uwagi
- Odpowiedzi API oraz kody statusu (np. 200, 400) wyświetlane są jako powiadomienie na dashboardzie.
- W prawym górnym rogu strony znajduje się selektor użytkownika (UserSelector) — wybór jest zapisywany w `localStorage` i wpływa na operacje wypożyczania.

---
