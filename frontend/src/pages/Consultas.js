import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Consultas.css';

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const fetchConsultas = async () => {
    try {
      const response = await fetch('http://localhost:4000/consultas', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        const sortedConsultas = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setConsultas(sortedConsultas);
      } else {
        setError(data.message || 'Erro ao carregar as consultas.');
      }
    } catch (error) {
      setError('Erro ao buscar consultas. Tente novamente.');
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchConsultas();
    }
  }, [token, navigate]);

  return (
    <div className="consultas-container"> {/* Adicione a classe de contêiner aqui */}
      <button onClick={handleLogout}>Logout</button>
      <h1>Página de Consultas</h1>
      {error && <p className="error">{error}</p>}
      {consultas.length === 0 ? (
        <p>O médico não tem nenhuma consulta registrada.</p>
      ) : (
        <ul>
          {consultas.map((consulta) => (
            <li key={consulta.id} className="consulta-item"> {/* Adicione a classe do item aqui */}
              <p><strong>Data:</strong> {new Date(consulta.date).toLocaleDateString()}</p>
              <p><strong>Hora:</strong> {consulta.time}</p>
              <p><strong>Paciente:</strong> {consulta.patientName}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Consultas;
