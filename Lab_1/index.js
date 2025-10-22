const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// Middleware do parsowania JSON (potrzebne do POST/PUT)
app.use(express.json());

// --- Twój pierwszy endpoint (testowy) ---
app.get('/', (req, res) => {
  res.send('Witaj w API Wypożyczalni Książek!');
});

/*
 
TUTAJ BĘDZIESZ DODAWAC KOLEJNE ENDPOINTY
np. GET /api/members, POST /api/books itd.
*/


// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na http://localhost:${PORT}`);
});