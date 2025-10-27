const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001' 
}));

app.post('/api/members', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Pola "name" i "email" są wymagane.' });
  }

  try {
    const newMember = await prisma.member.create({
      data: { name, email },
    });
    res.status(201).location(`/api/members/${newMember.id}`).json(newMember);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      res.status(409).json({ error: 'Użytkownik z tym adresem email już istnieje.' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Nie udało się dodać użytkownika.' });
    }
  }
});

app.get('/api/members', async (req, res) => {
  try {
    const members = await prisma.member.findMany();
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nie udało się pobrać listy użytkowników.' });
  }
});

app.post('/api/books', async (req, res) => {
  const { title, author, copies } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Pola "title" i "author" są wymagane.' });
  }

  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        copies: copies ?? 1, 
      },
    });
    res.status(201).location(`/api/books/${newBook.id}`).json(newBook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nie udało się dodać książki.' });
  }
});

app.get('/api/books', async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        _count: {
          select: {
            loans: { where: { return_date: null } },
          },
        },
      },
    });

    const booksWithAvailable = books.map(book => {
      const activeLoansCount = book._count.loans;
      const available = book.copies - activeLoansCount;
      
      const { _count, ...bookData } = book;
      
      return {
        ...bookData,
        available: available > 0 ? available : 0, 
      };
    });

    res.json(booksWithAvailable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nie udało się pobrać listy książek.' });
  }
});

app.get('/api/loans', async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        member: { select: { id: true, name: true, email: true } }, 
        book: { select: { id: true, title: true } },
      },
      orderBy: {
        loan_date: 'desc', 
      },
    });
    res.json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nie udało się pobrać wypożyczeń.' });
  }
});

app.post('/api/loans/borrow', async (req, res) => {
  const { member_id, book_id, days } = req.body;

  if (!member_id || !book_id) {
    return res.status(400).json({ error: 'Brakujące member_id lub book_id' });
  }
  
  const memberId = parseInt(member_id);
  const bookId = parseInt(book_id);

  try {
    const newLoan = await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new Error('BOOK_NOT_FOUND');
      }

      const activeLoansCount = await tx.loan.count({
        where: {
          book_id: bookId,
          return_date: null, 
        },
      });

      if (activeLoansCount >= book.copies) {
        throw new Error('NO_COPIES_AVAILABLE');
      }
      
      const memberExists = await tx.member.findUnique({ where: { id: memberId } });
      if (!memberExists) {
        throw new Error('MEMBER_NOT_FOUND');
      }

      const loanDate = new Date();
      const dueDate = new Date();
      const loanDuration = days ? parseInt(days) : 14; 
      dueDate.setDate(loanDate.getDate() + loanDuration);

      const createdLoan = await tx.loan.create({
        data: {
          member_id: memberId,
          book_id: bookId,
          loan_date: loanDate,
          due_date: dueDate,
          return_date: null,
        },
      });

      return createdLoan;
    });

    res.status(201).json(newLoan);

  } catch (error) {
    if (error.message === 'BOOK_NOT_FOUND') {
      return res.status(404).json({ error: 'Książka nie znaleziona.' });
    }
    if (error.message === 'MEMBER_NOT_FOUND') {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony.' });
    }
    if (error.message === 'NO_COPIES_AVAILABLE') {
      return res.status(409).json({ error: 'Brak dostępnych egzemplarzy tej książki.' });
    }

    console.error(error);
    res.status(500).json({ error: 'Wystąpił błąd podczas wypożyczania.' });
  }
});


app.post('/api/loans/return', async (req, res) => {
  const { loan_id } = req.body;

  if (!loan_id) {
    return res.status(400).json({ error: 'Brakujące loan_id' });
  }

  const loanId = parseInt(loan_id);

  try {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Wypożyczenie nie znalezione.' });
    }

    if (loan.return_date) {
      return res.status(409).json({ error: 'Ta książka została już zwrócona.' });
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        return_date: new Date(), 
      },
    });

    res.status(200).json(updatedLoan);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Wystąpił błąd podczas zwracania książki.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na http://localhost:${PORT}`);
});

// Raport zaległych wypożyczeń (overdue)

app.get('/api/reports/overdue', async (req, res) => {
  try {
    const finePerDay = req.query.finePerDay ? parseFloat(req.query.finePerDay) : 1;
    const now = new Date();

    const overdueLoans = await prisma.loan.findMany({
      where: {
        due_date: { lt: now },
        return_date: null,
      },
      include: {
        member: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true } },
      },
      orderBy: { due_date: 'asc' },
    });

    const result = overdueLoans.map(loan => {
      const due = new Date(loan.due_date);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysOverdue = Math.max(0, Math.floor((now - due) / msPerDay));
      const fine = +(daysOverdue * finePerDay).toFixed(2);
      return {
        loan_id: loan.id,
        member: loan.member,
        book: loan.book,
        loan_date: loan.loan_date,
        due_date: loan.due_date,
        days_overdue: daysOverdue,
        fine: fine,
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nie udało się wygenerować raportu zaległości.' });
  }
});