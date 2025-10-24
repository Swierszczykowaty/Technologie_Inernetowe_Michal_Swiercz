// Plik: types/index.ts

export interface Book {
  id: number;
  title: string;
  author: string;
  copies: number;
  available: number;
}

export interface Member {
  id: number;
  name: string;
  email: string;
}

export interface Loan {
  id: number;
  loan_date: string;
  due_date: string;
  return_date: string | null;

  member: {
    id: number;
    name: string;
    email: string;
  };
  book: {
    id: number;
    title: string;
  };
}