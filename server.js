const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// --- NOVA LÓGICA DE AUTENTICAÇÃO ---
let auth;
if (process.env.GOOGLE_CLIENT_EMAIL) {
  // Se estiver na Vercel, usa as variáveis secretas
  auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      // O replace garante que a Vercel leia as quebras de linha da chave corretamente
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
} else {
  // Se estiver no seu computador local, lê o arquivo json
  auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

const SPREADSHEET_ID = '13TsKik-69RCEoZE_GpvUFUEydvWXQHckJpNg0XRN0w4';

app.get('/', (req, res) => {
  res.render('index'); 
});

app.get('/api/planilha', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Página1',
    });
    
    res.json(response.data.values);
  } catch (error) {
    console.error('Erro ao acessar planilha:', error);
    res.status(500).json({ error: 'Erro ao buscar dados da planilha' });
  }
});

// Exporta o app para a Vercel conseguir entender o Express
module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Dashboard rodando! Acesse: http://localhost:${PORT}`);
});