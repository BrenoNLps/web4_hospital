const jwt = require('jsonwebtoken');
const secretKey = 'schave_secreta'; 
// Middleware para verificar token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401); // Se não houver token, não autorizado

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403); // Se o token não for válido, acesso proibido
    req.user = user; // Armazena os dados do usuário na requisição
    next(); // Chama o próximo middleware ou rota
  });
}

// Middleware para verificar papéis (roles)
function checkRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
  };
}

module.exports = { authenticateToken, checkRole };
