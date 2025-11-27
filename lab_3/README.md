## Lab 3 – Blog z moderacją komentarzy

Aplikacja Next.js prezentująca prosty blog z panelem dodawania postów, sekcją komentarzy oraz panelem moderatora do zatwierdzania wpisów użytkowników. Warstwa danych oparta jest na Prisma ORM oraz bazie SQLite.

### Stos technologiczny
- Next.js 16 (App Router) + React 19
- TypeScript, ESLint 9
- Prisma 6 + SQLite (`DATABASE_URL=file:./dev.db` domyślnie)
- Tailwind CSS 4 (tryb eksperymentalny)

## Uruchomienie lokalne
1. **Zależności**:
	```bash
	npm install
	```
2. **Konfiguracja środowiska**: utwórz plik `.env` w katalogu `lab_3` i ustaw źródło bazy, np. `DATABASE_URL=file:./dev.db`.
3. **Migracje**:
	```bash
	npx prisma migrate dev
	```
	Komenda utworzy plik `dev.db` i wygeneruje klienta Prisma.
4. **Tryb developerski**:
	```bash
	npm run dev
	```
	Aplikacja nasłuchuje pod `http://localhost:3000`.

## Funkcjonalności
- Dodawanie postów z poziomu strony głównej (`app/page.tsx`).
- Podgląd listy postów z linkami do widoku szczegółowego (`/post/[id]`).
- Formularz dodawania komentarzy do posta (komentarze startowo mają `approved=false`).
- Panel moderatora (`/admin`) z listą oczekujących komentarzy i możliwością ich zatwierdzania.
- API REST oparte na `app/api/*`.

### Kluczowe endpointy API
| Metoda | Ścieżka | Opis |
|--------|--------|------|
| GET | `/api/posts` | Lista postów (sortowanie malejąco po dacie). |
| POST | `/api/posts` | Dodanie nowego posta (`title`, `body`). |
| GET | `/api/posts/[postId]` | Szczegóły jednego posta. |
| GET | `/api/posts/[postId]/comments` | Zatwierdzone komentarze danego posta. |
| POST | `/api/posts/[postId]/comments` | Utworzenie komentarza (domyślnie oczekujący). |
| GET | `/api/comments/pending` | Komentarze oczekujące na akceptację (dla panelu admina). |
| POST | `/api/comments/[commentId]/approve` | Zatwierdzenie komentarza. |

## Struktura katalogów
```
lab_3/
├─ app/
│  ├─ page.tsx           # Strona główna z listą postów
│  ├─ post/[id]/page.tsx # Widok pojedynczego posta + komentarze
│  └─ admin/page.tsx     # Panel moderatora
├─ app/api/              # Routing API (posty, komentarze)
├─ components/           # Formularze i widoki list
├─ context/              # Konteksty (powiadomienia)
├─ lib/prisma.ts         # Klient Prisma
└─ prisma/               # Schemat oraz migracje
```

## Typowy przepływ
1. Użytkownik tworzy post → zapis w `Post`.
2. Czytelnik dodaje komentarz → rekord `Comment` z `approved=false`.
3. Moderator odwiedza `/admin` → widzi listę oczekujących z endpointu `/api/comments/pending`.
4. Po zatwierdzeniu komentarza (`POST /api/comments/:id/approve`) wpis staje się widoczny przy poście.
