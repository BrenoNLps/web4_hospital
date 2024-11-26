
const roles = require('./roles');

function checkRole(role) {
    return (req, res, next) => {
        const userRole = req.user.role; // Supondo que o papel do usuário está no token JWT

        if (userRole === role) {
            return next(); // Permite a execução da rota
        } else {
            return res.status(403).json({ message: 'Acesso negado.' }); // Não permitido
        }
    };
}

module.exports = checkRole;
