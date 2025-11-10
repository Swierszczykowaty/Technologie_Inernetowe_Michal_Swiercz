# Lab_2: Sklep

## 🚀 Główne Technologie

* **Framework:** Next.js (App Router)
* **Język:** TypeScript
* **Styling:** Tailwind CSS
* **Baza Danych (ORM):** Prisma
* **Baza Danych (Silnik):** SQLite
* **Sesja (Koszyk):** `iron-session` (szyfrowane ciasteczka po stronie klienta)

## ✨ Funkcjonalności

Aplikacja podzielona jest na trzy główne sekcje widoczne na stronie głównej:

### 1. Sklep i Koszyk

* **Lista Produktów:** Dynamicznie ładowana lista produktów dostępnych do zakupu.
* **Koszyk po stronie serwera:** Stan koszyka (dodawanie, zmiana ilości, usuwanie) jest zarządzany przez API i przechowywany w zaszyfrowanej sesji. Nie jest zapisywany w bazie danych aż do momentu zamówienia.
* **Finalizacja Zamówienia (Checkout):**
    * Pobiera koszyk z sesji.
    * Tworzy "snapshot" cen w momencie zakupu, aby przyszłe zmiany cen produktów nie wpłynęły na historię.
    * Zapisuje `Order` i `OrderItem` w bazie danych w ramach jednej transakcji.
* **Kupony Rabatowe:**
    * Możliwość wprowadzenia kodu rabatowego (np. `SALE20` lub `STUDENT10`).
    * Walidacja kodu po stronie klienta i serwera.
    * Poprawne obliczanie i zapisywanie `subTotal`, `discountAmount` i `finalTotal` w bazie.

### 2. Panel Administracyjny (CRUD Produktów)

* **Dodawanie produktów:** Formularz do dodawania nowych produktów do bazy.
* **Tabela produktów:** Pełna lista produktów z bazy danych.
* **Edycja (Update):** Możliwość edycji nazwy i ceny produktu "w miejscu" (inline).
* **Usuwanie (Delete):** Możliwość usunięcia produktu. (Logika `onDelete: SetNull` pozwala na usunięcie produktu, zachowując go jako `[Produkt usunięty]` w historii zamówień).

### 3. Historia Zamówień

* Lista wszystkich złożonych zamówień, pobierana z bazy danych (`/api/orders`).
* Wyświetla sumę końcową, datę oraz wszystkie pozycje z zamówienia (wraz ze snapshotem ceny).
* Odświeża się automatycznie po złożeniu nowego zamówienia.

---

## 🛠️ Uruchomienie Projektu

### Krok 1: Instalacja zależności

Po sklonowaniu repozytorium, zainstaluj wszystkie potrzebne pakiety:

```bash
npm install
```

### Krok 2: Konfiguracja pliku .env
Utwórz plik .env w głównym katalogu projektu. Musi on zawierać dwie kluczowe zmienne: (Na potrzeby studiów umieszczam plik publicznie)


DATABASE_URL=file:./dev.db
SESSION_PASSWORD="Xd9VLviD3TYdR6QE1sylY05O0OGYR5vA"

```bash
npx prisma migrate dev
```

Krok 4: Uruchomienie serwera deweloperskiego

```bash
npm run dev
```
Aplikacja będzie dostępna pod adresem http://localhost:3000.

(Opcjonalnie) Podgląd Bazy Danych
Aby zobaczyć dane (Produkty, Zamówienia) bezpośrednio w bazie, możesz użyć wbudowanego narzędzia Prisma Studio:

```bash
npx prisma studio
```

🧭 Kontrakt API (API Endpoints)
Projekt implementuje następujące punkty końcowe:

Produkty
GET /api/products - Zwraca listę wszystkich produktów.

POST /api/products - Tworzy nowy produkt.

PATCH /api/products/[productId] - Aktualizuje istniejący produkt.

DELETE /api/products/[productId] - Usuwa produkt.

Koszyk (Sesja)
GET /api/cart - Odczytuje zawartość koszyka z sesji.

POST /api/cart/add - Dodaje pozycję do koszyka.

PATCH /api/cart/item - Zmienia ilość pozycji w koszyku.

DELETE /api/cart/item/[productId] - Usuwa pozycję z koszyka.

Kupony
POST /api/coupons/validate - Waliduje kod kuponu i zwraca procent zniżki.

Zamówienia
POST /api/checkout - Przetwarza koszyk (z opcjonalnym kuponem), tworzy zamówienie w bazie i czyści sesję.

GET /api/orders - Zwraca historię wszystkich zamówień.