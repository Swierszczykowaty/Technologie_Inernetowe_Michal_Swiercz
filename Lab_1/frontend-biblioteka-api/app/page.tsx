import { Book } from '@/types';
import BorrowButton from '@/components/BorrowButton';

async function getBooks(): Promise<Book[]> {
  try {
    const res = await fetch('http://localhost:3000/api/books', {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Nie udało się pobrać książek z API');
    }
    const data: Book[] = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HomePage() {
  const books = await getBooks();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">
        Katalog Książek
        <span className="text-accent">.</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="border border-gray-200 rounded-lg p-6 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-2">{book.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Autor: {book.author}</p>

            <div className="flex justify-between items-center">
              <span
                className={`font-bold ${book.available > 0 ? 'text-green-600' : 'text-red-500'}`}
              >
                Dostępne: {book.available} / {book.copies}
              </span>

              <BorrowButton bookId={book.id} isAvailable={book.available > 0} />
            </div>
          </div>
        ))}

        {books.length === 0 && (
          <p className="text-gray-500">Nie znaleziono żadnych książek. Dodaj je w API.</p>
        )}
      </div>
    </div>
  );
}