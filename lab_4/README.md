## Lab 4 – Baza i ranking filmów

Aplikacja Next.js prezentująca katalog filmów z formularzem dodawania pozycji, rankingiem opartym o średnie oceny oraz modułem filtrowania po roku produkcji. Interfejs reaguje na operacje API i wyświetla notyfikacje o statusie żądań.

### Stos technologiczny
- Next.js 16 (App Router) + React 19
- TypeScript, ESLint 9
- Prisma 6 + SQLite (`DATABASE_URL=file:./dev.db` domyślnie)
- Tailwind CSS 4 (tryb eksperymentalny)

## Uruchomienie lokalne
1. **Instalacja zależności**
	```bash
	npm install
	```
2. **Konfiguracja środowiska** – w katalogu `lab_4` utwórz plik `.env` z adresem bazy, np.:
	```
	DATABASE_URL=file:./dev.db
	```
3. **Migracje i klient Prisma**
	```bash
	npx prisma migrate dev
	```
	Polecenie utworzy bazę `prisma/dev.db` i wygeneruje klienta w `node_modules/@prisma/client`.
4. **Tryb developerski**
	```bash
	npm run dev
	```
	Aplikacja nasłuchuje pod `http://localhost:3000`.

## Funkcjonalności
- Formularz dodawania filmów (`AddMovieForm`) – waliduje obecność tytułu oraz roku.
- Ranking filmów (`MovieList`) sortowany malejąco po średniej ocenie; każdy film można ocenić w skali 1–5 gwiazdek.
- Powiadomienia o statusie ostatniego żądania (`NotificationContext` + `NotificationDisplay`).
- Filtrowanie filmów po roku produkcji (`MovieFilter`) – korzysta z parametru zapytania `year` w endpointzie `/api/movies`.

### Kluczowe endpointy API
| Metoda | Ścieżka | Opis |
|--------|--------|------|
| GET | `/api/movies` | Lista filmów z agregacją ocen; opcjonalnie `?year=YYYY` zawęża wyniki. |
| POST | `/api/movies` | Dodanie filmu (`title`, `year`). |
| POST | `/api/ratings` | Wystawienie oceny 1–5 dla filmu (`movie_id`, `score`). |

Każda odpowiedź API odkłada komunikat w prawym dolnym rogu (powiadomienia) – dzięki temu łatwo monitorować statusy operacji.
