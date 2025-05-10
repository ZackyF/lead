const express = require('express');
const cors = require('cors');
const fs = require('fs');
const basicAuth = require('express-basic-auth');
const path = require('path');

const app = express();
const PORT = 3000;
const leadsFile = './leads.json';

app.use(cors());
app.use(express.json());

// Menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint untuk menambahkan lead
app.post('/leads', (req, res) => {
  const { name, email, phone, loanType } = req.body;
  if (!name || !email || !phone || !loanType) {
    return res.status(400).json({ error: 'Semua field wajib diisi.' });
  }

  const newLead = { name, email, phone, loanType, createdAt: new Date() };
  const leads = fs.existsSync(leadsFile)
    ? JSON.parse(fs.readFileSync(leadsFile))
    : [];

  leads.push(newLead);
  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
  res.status(201).json({ message: 'Lead disimpan!' });
});

// Autentikasi dasar untuk endpoint GET /leads
app.use('/leads', basicAuth({
  users: { 'admin': 'password123' },
  challenge: true,
  unauthorizedResponse: (req) => 'Akses ditolak. Silakan masukkan kredensial yang valid.'
}));

// Endpoint untuk mengambil semua lead
app.get('/leads', (req, res) => {
  const leads = fs.existsSync(leadsFile)
    ? JSON.parse(fs.readFileSync(leadsFile))
    : [];

  res.json(leads);
});

app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
