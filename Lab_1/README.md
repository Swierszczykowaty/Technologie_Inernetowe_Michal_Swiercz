## Biblioteka (backend + frontend)

Prosty projekt na studia biblioteki: backend (Express + Prisma + SQLite) i frontend (Next.js).

# Uruchomienie z terminalu

## Backend
Otwórz terminal i wykonaj:
- *cd .\Lab_1*
- *npm install* -> instalacja potrzebnych bibliotek backendu
- *echo DATABASE_URL="file:./dev.db" > .env* -> stworzenie pliku .env ze zmienną: *DATABASE_URL="file:./dev.db"*
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

## Raporty

Projekt udostępnia prosty raport zaległych wypożyczeń (overdue). Możesz go pobrać z poziomu frontendu (przycisk "Pobierz CSV" obok nagłówka sekcji "Kary za przetrzymanie") lub wywołać bezpośrednio endpoint backendu.

- JSON (API):

	GET http://localhost:3000/api/reports/overdue

	Zwraca listę obiektów z polami: `loan_id`, `member` (id/name/email), `book` (id/title), `loan_date`, `due_date`, `days_overdue`.

## Sztuczne dane raportów

Dodałem ręcznie kilka sztucznych wypożyczeń (użyteczne do testowania raportu zaległości). Przykładowe polecenie PowerShell, które wykorzystałem, to:

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/loans/borrow' -Method Post -Body (@{ member_id = 1; book_id = 1; days = -30 } | ConvertTo-Json) -ContentType 'application/json'
```



