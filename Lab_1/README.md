## Biblioteka (backend + frontend)

Prosty projekt biblioteki: backend (Express + Prisma + SQLite) i frontend (Next.js).

# Uruchomienie z terminalu

## Backend
Otwórz terminal:
- *cd .\Lab_1*
- *npm install* -> instalacja potrzebnych bibliotek backendu
- Stwórz w tym folderze projektu plik .env i dodaj zmienną DATABASE_URL np. *DATABASE_URL="file:./dev.db"*
- *npx prisma migrate dev* -> generowanie bazy danych
- *node index.js* -> uruchomienie lokalnego serwera


## Frontend
w nowym termianlu:
- *cd .\Lab_1\frontend-biblioteka-api*
- *npm install* -> instalacja potrzebnych bibliotek frontend
- *npm run dev* -> uruchomienie lokalnego serwera web
- Naciśnij na stworzony serwer lokalny (http://localhost:3001) za pomocą [ctrl+klik]

# Oczekiwany wynik końcowy
- http://localhost:3000 - działanie backendu
- http://localhost:3001 - działanie frontendu

## Uwagi
- Odpowiedzi API oraz kody statusu (np. 200, 400) wyświetlane są jako powiadomienie na dashboardzie.
- W prawym górnym rogu strony znajduje się selektor użytkownika (UserSelector) — wybór jest zapisywany w `localStorage` i wpływa na operacje wypożyczania.

---
