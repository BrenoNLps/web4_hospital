import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MarcarConsulta.css';

const MarcarConsulta = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(''); // Estado para armazenar a imagem do Pixabay
  const navigate = useNavigate();

  const patientName = localStorage.getItem('name'); // Nome do paciente logado
  console.log(patientName);

  useEffect(() => {
    // Buscar médicos
    fetch('http://localhost:4000/doctors')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao buscar médicos');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setDoctors(data);
      })
      .catch((error) => {
        console.error('Erro ao buscar médicos:', error);
        setMessage('Erro ao carregar médicos.');
      });

    // Buscar imagem do Pixabay com base no nome do paciente
    const fetchPixabayImage = async () => {
      const pixabayApiKey = '47294031-e63a84e4a653e6838505d7a51'; // Chave da API do Pixabay
      const searchTerm = patientName || 'person'; // Usar o nome do paciente ou 'person' como fallback
      try {
        const response = await fetch(
          `https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(searchTerm)}&image_type=photo&per_page=5`
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar imagem do Pixabay');
        }

        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
          setImage(data.hits[0].webformatURL); // Armazena a URL da imagem no estado
        } else {
          console.warn('Nenhuma imagem encontrada para o termo:', searchTerm);
        }
      } catch (error) {
        console.error('Erro ao buscar imagem do Pixabay:', error);
        setImage(''); // Limpa a imagem caso haja erro
      }
    };

    fetchPixabayImage();
  }, [patientName]); // Rodar sempre que o nome do paciente mudar

  const handleSubmit = (e) => {
    e.preventDefault();

    const consultaData = {
      patientName,
      doctorEmail: selectedDoctor,
      date,
      time,
      notes,
    };

    fetch('http://localhost:4000/marcar-consulta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultaData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message);
          });
        }
        return response.json();
      })
      .then((data) => {
        setMessage('Consulta marcada com sucesso!');
      })
      .catch((error) => {
        setMessage('Erro ao marcar consulta: ' + error.message);
        console.error('Erro ao marcar consulta:', error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1>Marcar Consulta</h1>
        {message && <span>{message}</span>}
        {image && <img src={image} alt="Imagem do paciente" className="profile-image" />} {/* Exibe a imagem */}
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
                doctors.map((doctor) => (
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
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default MarcarConsulta;
