import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa o useNavigate para redirecionamento
import '../styles/MarcarConsulta.css';

const MarcarConsulta = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Cria uma instância do navigate para redirecionamento

  useEffect(() => {
    fetch('http://localhost:4000/doctors')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar médicos');
        }
        return response.json();
      })
      .then(data => {
        console.log(data); // Para verificar se os médicos estão sendo recebidos
        setDoctors(data);
      })
      .catch(error => {
        console.error('Erro ao buscar médicos:', error);
        setMessage('Erro ao carregar médicos.');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const patientName = localStorage.getItem('name'); // Pegando o nome do paciente logado

    const consultaData = {
      patientName, // Agora estamos usando patientName
      doctorEmail: selectedDoctor,
      date,
      time,
      notes
    };

    fetch('http://localhost:4000/marcar-consulta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultaData)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message);
          });
        }
        return response.json();
      })
      .then(data => {
        setMessage('Consulta marcada com sucesso!');
      })
      .catch(error => {
        setMessage('Erro ao marcar consulta: ' + error.message);
        console.error('Erro ao marcar consulta:', error);
      });
  };

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove o token do localStorage
    localStorage.removeItem('name'); // Remove o nome do paciente
    navigate('/login'); // Redireciona para a página de login
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1>Marcar Consulta</h1>
        {message && <span>{message}</span>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Médico:</label>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)} 
              required
            >
              <option value="">Selecione um médico</option>
              {doctors.length > 0 ? (
                doctors.map(doctor => (
                  <option key={doctor.email} value={doctor.email}>
                    {doctor.name}
                  </option>
                ))
              ) : (
                <option value="">Nenhum médico disponível</option>
              )}
            </select>
          </div>
          <div>
            <label>Data:</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label>Horário:</label>
            <input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label>Anotações:</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              required 
            />
          </div>
          <button type="submit">Marcar Consulta</button>
        </form>
        <button onClick={handleLogout} className="logout-button">Logout</button> {/* Botão de logout */}
      </div>
    </div>
  );
};

export default MarcarConsulta;
