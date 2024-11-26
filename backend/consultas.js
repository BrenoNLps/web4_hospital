const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('./middlewares');
const router = express.Router();
const CONSULTAS_PATH = path.join(__dirname, 'data', 'consultas.txt');
const USERS_PATH = path.join(__dirname, 'data', 'users.txt');

// Função para ler os médicos do arquivo users.txt
const getDoctors = () => {
    if (!fs.existsSync(USERS_PATH)) {
        console.error('Arquivo users.txt não encontrado.');
        return [];
    }

    const users = fs.readFileSync(USERS_PATH, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map(line => {
            try {
                return JSON.parse(line);
            } catch (error) {
                console.error('Erro ao parsear JSON:', line);
                return null;
            }
        })
        .filter(Boolean);

    return users.filter(user => user.userType === 'doctor');
};

// Função para verificar disponibilidade de horário para consultas
const isAvailable = (doctorEmail, date, time) => {
    const consultas = fs.existsSync(CONSULTAS_PATH)
        ? fs.readFileSync(CONSULTAS_PATH, 'utf-8')
            .split('\n')
            .filter(Boolean)
            .map(JSON.parse)
        : [];

    const chosenDate = new Date(`${date}T${time}`);
    const fortyMinutes = 40 * 60 * 1000;

    for (let consulta of consultas) {
        if (consulta.doctorEmail === doctorEmail) {
            const consultaDate = new Date(`${consulta.date}T${consulta.time}`);
            if (Math.abs(chosenDate - consultaDate) < fortyMinutes) {
                return false;
            }
        }
    }
    return true;
};

// Função para obter consultas por email do médico
const getConsultasByEmail = (doctorEmail) => {
    if (!fs.existsSync(CONSULTAS_PATH)) return [];

    const consultas = fs.readFileSync(CONSULTAS_PATH, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map(JSON.parse);

    return consultas
        .filter(consulta => consulta.doctorEmail === doctorEmail)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordena da mais recente para a mais antiga
};

// Endpoint para buscar médicos
router.get('/doctors', (req, res) => {
    const doctors = getDoctors();
    console.log('Médicos encontrados:', doctors);
    res.json(doctors);
});

// Endpoint para marcar consulta
router.post('/marcar-consulta', (req, res) => {
    const { patientName, doctorEmail, date, time, notes } = req.body;

    if (!isAvailable(doctorEmail, date, time)) {
        return res.status(400).json({ message: 'Horário indisponível para este médico.' });
    }

    const newConsulta = { patientName, doctorEmail, date, time, notes };
    fs.appendFileSync(CONSULTAS_PATH, JSON.stringify(newConsulta) + '\n');

    res.json({ message: 'Consulta marcada com sucesso!' });
});

// Função para obter todas as consultas
const getAllConsultas = () => {
    if (!fs.existsSync(CONSULTAS_PATH)) return [];

    const consultas = fs.readFileSync(CONSULTAS_PATH, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map(JSON.parse);

    return consultas.sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordena da mais recente para a mais antiga
};

// Endpoint para obter todas as consultas
router.get('/todas-consultas', authenticateToken, (req, res) => {
    const consultas = getAllConsultas();

    if (consultas.length === 0) {
        return res.status(404).json({ message: 'Nenhuma consulta registrada.' });
    }

    res.json(consultas);
});

// Endpoint para obter consultas do médico logado
router.get('/consultas', authenticateToken, (req, res) => {
    const { email } = req.user;
    const consultas = getConsultasByEmail(email);

    if (consultas.length === 0) {
        return res.status(404).json({ message: 'O médico não tem nenhuma consulta registrada.' });
    }

    res.json(consultas);
});

// Função para salvar consultas no arquivo
const saveConsultasToFile = (consultas) => {
    fs.writeFileSync(CONSULTAS_PATH, consultas.map(consulta => JSON.stringify(consulta)).join('\n') + '\n');
};

// Endpoint para atualizar uma consulta existente
router.put('/consultas', authenticateToken, (req, res) => {
    const { original, updated } = req.body;

    let consultas = getAllConsultas();

    const consultaIndex = consultas.findIndex(consulta =>
        consulta.patientName === original.patientName &&
        consulta.date === original.date &&
        consulta.time === original.time
    );

    if (consultaIndex === -1) {
        return res.status(404).json({ message: 'Consulta não encontrada.' });
    }

    // Atualiza a consulta existente com os novos dados
    consultas[consultaIndex] = { ...consultas[consultaIndex], ...updated };

    // Salva as alterações
    saveConsultasToFile(consultas);

    res.status(200).json({ message: 'Consulta alterada com sucesso!' });
});

module.exports = router;
