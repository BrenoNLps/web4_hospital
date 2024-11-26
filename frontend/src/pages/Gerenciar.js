import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Gerenciar.css'; // Arquivo CSS para estilização

const Gerenciar = () => {
  const [consultas, setConsultas] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Obtém o token do localStorage

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const fetchConsultas = async () => {
    try {
      const response = await fetch('http://localhost:4000/todas-consultas', { 
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

  const handleUpdateConsulta = async (consultaOriginal, updatedConsulta) => {
    try {
      const response = await fetch(`http://localhost:4000/consultas`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ original: consultaOriginal, updated: updatedConsulta }),
      });

      if (response.ok) {
        alert('Consulta alterada com sucesso!');
        fetchConsultas(); // Atualiza a lista após alteração
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao alterar a consulta.');
      }
    } catch (error) {
      setError('Erro ao alterar a consulta. Tente novamente.');
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
    <div className="gerenciar-container">
      <button onClick={handleLogout} className="logout-btn">Logout</button>
      <h1>Gerenciar Consultas</h1>
      {error && <p className="error">{error}</p>}
      {consultas.length === 0 ? (
        <p>Nenhuma consulta registrada.</p>
      ) : (
        consultas.map((consulta, index) => (
          <form
            key={index}
            className="consulta-form"
            onSubmit={(e) => {
              e.preventDefault();
              const updatedConsulta = {
                date: e.target.date.value,
                time: e.target.time.value,
                patientName: e.target.patientName.value,
                notes: e.target.notes.value,
              };
              handleUpdateConsulta(consulta, updatedConsulta);
            }}
          >
            <label>
              Data:
              <input type="date" name="date" defaultValue={new Date(consulta.date).toISOString().substr(0, 10)} />
            </label>
            <label>
              Hora:
              <input type="time" name="time" defaultValue={consulta.time} />
            </label>
            <label>
              Paciente:
              <input type="text" name="patientName" defaultValue={consulta.patientName} />
            </label>
            <label>
              Notas:
              <input type="text" name="notes" defaultValue={consulta.notes} />
            </label>
            <button type="submit">Alterar</button>
          </form>
        ))
      )}
    </div>
  );
};

export default Gerenciar;
