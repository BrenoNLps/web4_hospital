// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const checkRole = require('./checkRole');
const roles = require('./roles');

// Rotas do Administrador
router.get('/admin/dashboard', checkRole(roles.ADMIN), (req, res) => {
    res.json({ message: 'Bem-vindo ao painel do administrador!' });
});

// Rotas do Médico
router.get('/medico/dashboard', checkRole(roles.MEDICO), (req, res) => {
    res.json({ message: 'Bem-vindo ao painel do médico!' });
});

// Rotas do Paciente
router.get('/paciente/dashboard', checkRole(roles.PACIENTE), (req, res) => {
    res.json({ message: 'Bem-vindo ao painel do paciente!' });
});


module.exports = router;
