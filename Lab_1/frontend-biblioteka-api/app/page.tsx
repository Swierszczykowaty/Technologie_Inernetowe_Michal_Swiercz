// Plik: app/page.tsx

'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { Book, Loan, Member } from '@/types';
import BorrowButton from '@/components/BorrowButton';
import ReturnButton from '@/components/ReturnButton';
import OverdueReport from '@/components/OverdueReport';

async function fetcher(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Nie udało się pobrać danych');
  }
  return res.json();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pl-PL');
}

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<Member[]>([]); 
  const [lastResponse, setLastResponse] = useState<{ status: number; url: string; ok: boolean; message?: string } | null>(null);
  
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [columns, setColumns] = useState<number>(3);
  const [page, setPage] = useState<number>(1);
  const [loansPage, setLoansPage] = useState<number>(1);
  const loansPageSize = 5;
  const [membersPage, setMembersPage] = useState<number>(1);
  const membersPageSize = 5;

  const fetchAllData = useCallback(async () => {
    try {
      setLoadingError(null);
      const fetchWithStatus = async (url: string) => {
        const res = await fetch(url, { cache: 'no-store' });
        let data = null;
        try { data = await res.json(); } catch (e) { data = null; }
        return { data, status: res.status, ok: res.ok, url, error: !res.ok ? (data?.error ?? data?.message ?? String(data)) : undefined };
      };

      const [booksRes, loansRes, membersRes] = await Promise.all([
        fetchWithStatus('http://localhost:3000/api/books'),
        fetchWithStatus('http://localhost:3000/api/loans'),
        fetchWithStatus('http://localhost:3000/api/members')
      ]);

      const failing = [booksRes, loansRes, membersRes].find(r => !r.ok);
      if (failing) {
        setLastResponse({ status: failing.status, url: failing.url, ok: false, message: failing.error });
        throw new Error(failing.error ?? 'Błąd podczas pobierania danych');
      }

      setBooks(booksRes.data as Book[]);
      setLoans(loansRes.data as Loan[]);
      setMembers(membersRes.data as Member[]);
      setLastResponse({ status: 200, url: 'batch', ok: true, message: 'Pobrano dane' });
    } catch (err) {
      setLoadingError(err instanceof Error ? err.message : 'Nieznany błąd ładowania');
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const calcCols = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      if (w >= 1024) setColumns(3);
      else if (w >= 768) setColumns(2);
      else setColumns(1);
    };
    calcCols();
    window.addEventListener('resize', calcCols);
    return () => window.removeEventListener('resize', calcCols);
  }, []);

  const activeLoans = loans.filter(loan => !loan.return_date);

  const pageSize = 2 * columns;
  const totalPages = Math.max(1, Math.ceil(books.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);
  const loansTotalPages = Math.max(1, Math.ceil(activeLoans.length / loansPageSize));
  useEffect(() => {
    if (loansPage > loansTotalPages) setLoansPage(loansTotalPages);
    if (loansPage < 1) setLoansPage(1);
  }, [loansPage, loansTotalPages]);

  const membersTotalPages = Math.max(1, Math.ceil(members.length / membersPageSize));
  useEffect(() => {
    if (membersPage > membersTotalPages) setMembersPage(membersTotalPages);
    if (membersPage < 1) setMembersPage(1);
  }, [membersPage, membersTotalPages]);

  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookCopies, setBookCopies] = useState(1);
  const [bookFormError, setBookFormError] = useState<string | null>(null);
  const [bookFormSuccess, setBookFormSuccess] = useState<string | null>(null);

  const handleAddBook = async (e: FormEvent) => {
    e.preventDefault();
    setBookFormError(null);
    setBookFormSuccess(null);
    try {
      const res = await fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bookTitle, author: bookAuthor, copies: Number(bookCopies) }),
      });
      const data = await res.json();
  setLastResponse({ status: res.status, url: 'POST /api/books', ok: res.ok, message: data?.error ?? data?.title ?? undefined });
  if (!res.ok) throw new Error(data.error || 'Błąd serwera');
      
      setBookFormSuccess(`Dodano "${data.title}"!`);
      setBookTitle('');
      setBookAuthor('');
      setBookCopies(1);
      fetchAllData();
    } catch (err) {
      setBookFormError(err instanceof Error ? err.message : 'Wystąpił błąd');
    }
  };

  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberFormError, setMemberFormError] = useState<string | null>(null);
  const [memberFormSuccess, setMemberFormSuccess] = useState<string | null>(null);

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    setMemberFormError(null);
    setMemberFormSuccess(null);
    try {
      const res = await fetch('http://localhost:3000/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: memberName, email: memberEmail }),
      });
      const data = await res.json();
    setLastResponse({ status: res.status, url: 'POST /api/members', ok: res.ok, message: data?.error ?? data?.name ?? undefined });
    if (!res.ok) throw new Error(data.error || 'Błąd serwera');
      
      setMemberFormSuccess(`Dodano "${data.name}"!`);
      setMemberName('');
      setMemberEmail('');
      fetchAllData(); 
    } catch (err) {
      setMemberFormError(err instanceof Error ? err.message : 'Wystąpił błąd');
    }
  };

  const [overdueLoading, setOverdueLoading] = useState(false);
  const downloadOverdueCSV = async () => {
    setOverdueLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/reports/overdue');
      const payload = await res.json().catch(() => (null));
      setLastResponse({ status: res.status, url: '/api/reports/overdue', ok: res.ok, message: payload?.error ?? (res.ok ? 'Pobrano raport' : undefined) });
      if (!res.ok || !payload) throw new Error(payload?.error || `Błąd serwera (${res.status})`);
      const data = payload as Array<any>;
      if (!data || data.length === 0) {
        return;
      }
      const headers = ['loan_id','member_id','member_name','member_email','book_id','book_title','loan_date','due_date','days_overdue'];
      const rows = data.map(d => [
        d.loan_id,
        d.member?.id,
        '"' + (d.member?.name ?? '') + '"',
        d.member?.email,
        d.book?.id,
        '"' + (d.book?.title ?? '') + '"',
        d.loan_date,
        d.due_date,
        d.days_overdue,
      ].join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `overdue-report-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setOverdueLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {loadingError && (
        <div className="p-4 text-center text-red-700 bg-red-100 rounded-md">
          Błąd ładowania danych: {loadingError}
        </div>
      )}

      {lastResponse && (
        <div className={`fixed bottom-4 right-4 z-50 w-80 p-3 rounded-md shadow-lg ${lastResponse.ok ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm">Ostatnia odpowiedź: <strong>{lastResponse.url}</strong></div>
              <div className="text-xs">Status: {lastResponse.status} — {lastResponse.ok ? 'OK' : 'Błąd'}</div>
              {lastResponse.message && <div className="text-xs mt-1">Wiadomość: {lastResponse.message}</div>}
            </div>
            <button onClick={() => setLastResponse(null)} className="ml-3 text-sm font-bold px-2 py-1 rounded hover:bg-gray-700">×</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        <section>
          <h2 className="text-3xl font-bold mb-4">Dodaj Książkę<span className="text-accent">.</span></h2>
          <form onSubmit={handleAddBook} className="p-6 border border-gray-700 rounded-lg shadow-md space-y-4 bg-gray-800">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">Tytuł</label>
              <input id="title" type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="author" className="block text-sm font-medium mb-1">Autor</label>
              <input id="author" type="text" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="copies" className="block text-sm font-medium mb-1">Egzemplarze</label>
              <input id="copies" type="number" value={bookCopies} onChange={(e) => setBookCopies(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600" />
            </div>
            {bookFormSuccess && <p className="text-green-600 text-sm">{bookFormSuccess}</p>}
            <button type="submit" className="w-full px-4 py-2 rounded-md font-medium text-white  bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors">
              Dodaj Książkę
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4">Dodaj Czytelnika<span className="text-accent">.</span></h2>
          <form onSubmit={handleAddMember} className="p-6 border border-gray-700 rounded-lg shadow-md space-y-4 bg-gray-800">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Imię i Nazwisko</label>
              <input id="name" type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600" />
            </div>
            {memberFormSuccess && <p className="text-green-600 text-sm">{memberFormSuccess}</p>}
            <button type="submit" className="w-full px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 cursor-pointer font-medium text-white bg-accent hover:bg-accent-dark transition-colors">
              Dodaj Czytelnika
            </button>
          </form>
        </section>
      </div>

      <section>
        <h2 className="text-3xl font-bold mb-4">Katalog Książek<span className="text-accent">.</span></h2>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.length > 0 ? (
              books.slice((page - 1) * pageSize, page * pageSize).map((book) => (
                <div key={book.id} className="border border-gray-700 rounded-lg p-6 shadow-md bg-gray-800">
                  <h3 className="text-2xl font-semibold mb-2">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Autor: {book.author}</p>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold ${book.available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      Dostępne: {book.available} / {book.copies}
                    </span>
                    <BorrowButton
                      bookId={book.id}
                      isAvailable={book.available > 0}
                      onSuccess={fetchAllData}
                      onResponse={(info) => setLastResponse(info)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Brak książek w katalogu.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-4 space-x-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded-md border bg-gray-700 text-sm ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}>
                ← Poprzednia
              </button>
              <div className="text-sm">Strona {page} / {totalPages}</div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded-md border bg-gray-700 text-sm ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}>
                Następna →
              </button>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4">Aktywne Wypożyczenia<span className="text-accent">.</span></h2>
  <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Książka</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Czytelnik</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data Wyp.</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Termin Zwrotu</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Akcja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {activeLoans.length > 0 ? (
                activeLoans.slice((loansPage - 1) * loansPageSize, loansPage * loansPageSize).map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{loan.book.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{loan.member.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(loan.loan_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-red-500">{formatDate(loan.due_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ReturnButton loanId={loan.id} onSuccess={fetchAllData} onResponse={(info) => setLastResponse(info)} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Brak aktywnych wypożyczeń.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loansTotalPages > 1 && (
          <div className="flex items-center justify-center mt-3 space-x-3">
            <button
              onClick={() => setLoansPage((p) => Math.max(1, p - 1))}
              disabled={loansPage === 1}
              className={`px-3 py-1 rounded-md border bg-gray-700 text-sm ${loansPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}>
              ← Poprzednia
            </button>
            <div className="text-sm">Strona {loansPage} / {loansTotalPages}</div>
            <button
              onClick={() => setLoansPage((p) => Math.min(loansTotalPages, p + 1))}
              disabled={loansPage === loansTotalPages}
              className={`px-3 py-1 rounded-md border bg-gray-700 text-sm ${loansPage === loansTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}>
              Następna →
            </button>
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold">Kary za przetrzymanie<span className="text-accent">.</span></h2>
          <button onClick={downloadOverdueCSV} disabled={overdueLoading}
            className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">{overdueLoading ? 'Ładowanie...' : 'Pobierz CSV'}</button>
        </div>
        <OverdueReport />
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4">Użytkownicy<span className="text-accent">.</span></h2>
  <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Imię</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {members.length > 0 ? (
                members.slice((membersPage - 1) * membersPageSize, membersPage * membersPageSize).map((m) => (
                  <tr key={m.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{m.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{m.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Brak zarejestrowanych użytkowników.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {membersTotalPages > 1 && (
          <div className="flex items-center justify-center mt-3 space-x-3">
            <button
              onClick={() => setMembersPage((p) => Math.max(1, p - 1))}
              disabled={membersPage === 1}
              className={`px-3 py-1 rounded-md border bg-gray-700 text-sm ${membersPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}>
              ← Poprzednia
            </button>
            <div className="text-sm">Strona {membersPage} / {membersTotalPages}</div>
            <button
              onClick={() => setMembersPage((p) => Math.min(membersTotalPages, p + 1))}
              disabled={membersPage === membersTotalPages}
              className={`px-3 py-1 rounded-md border bg-gray-700 text-sm ${membersPage === membersTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}>
              Następna →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}