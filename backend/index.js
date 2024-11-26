const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { authenticateToken, checkRole } = require('./middlewares');

const app = express();
const port = 4000;

const secretKey = 'schave_secreta';

app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, 'data', 'users.txt');

// Inclui o consultas.js para lidar com médicos e consultas
const consultasRoutes = require('./consultas');
app.use(consultasRoutes);

// Serve os arquivos estáticos do build do React
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Serve o frontend do React para qualquer rota desconhecida
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Função para ler usuários do arquivo users.txt
const readUsersFromFile = () => {
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    return fileData.split('\n').filter(Boolean).map(line => JSON.parse(line));
  }
  return [];
};

// Rota para registrar um novo usuário
app.post('/register', (req, res) => {
  const { name, email, password, userType } = req.body;

  const users = readUsersFromFile();

  const existingUser = users.find(user => user.email === email || user.name === name);
  if (existingUser) {
    return res.status(400).json({ message: 'Usuário com este nome ou e-mail já existe.' });
  }

  const newUser = { name, email, password, userType };
  const userString = JSON.stringify(newUser) + '\n';

  fs.appendFile(filePath, userString, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao salvar o usuário.' });
    }
    res.status(201).json({ message: 'Usuário registrado com sucesso!', newUser });
  });
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const users = readUsersFromFile();

  const user = users.find(user => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos' });
  }

  const token = jwt.sign({ email: user.email, name: user.name, role: user.userType }, secretKey, { expiresIn: '1h' });
  res.status(200).json({ token, name: user.name, message: 'Login realizado com sucesso' });
});

// Rotas específicas para médicos, pacientes e administradores
app.get('/consultas', authenticateToken, checkRole('doctor'), (req, res) => {
  res.json({ message: 'Aqui estão suas consultas, médico!' });
});

app.get('/marcar-consulta', authenticateToken, checkRole('patient'), (req, res) => {
  res.json({ message: 'Aqui você pode marcar uma consulta, paciente!' });
});

app.get('/gerenciar', authenticateToken, checkRole('admin'), (req, res) => {
  res.json({ message: 'Aqui você pode gerenciar o sistema, administrador!' });
});
