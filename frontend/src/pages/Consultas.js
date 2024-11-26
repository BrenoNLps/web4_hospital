import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Consultas.css';

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [error, setError] = useState('');
  const [image, setImage] = useState(''); // Estado para armazenar a imagem do Pixabay
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const doctorName = localStorage.getItem('name'); // Nome do medico logado

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

  // Buscar imagem do Pixabay com base no nome do paciente
  const fetchPixabayImage = async () => {
    const pixabayApiKey = '47294031-e63a84e4a653e6838505d7a51'; // Chave da API do Pixabay
    const searchTerm = doctorName || 'person'; // Usar o nome do medico ou 'person' como fallback
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

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchConsultas();
      fetchPixabayImage(); // Chama a função de imagem sempre que o componente for carregado
    }
  }, [token, navigate]);

  return (
    <div className="consultas-container">
      <button onClick={handleLogout}>Logout</button>
      <h1>Página de Consultas</h1>
      {image && <img src={image} alt="Imagem do paciente" className="profile-image" />} {/* Exibe a imagem */}
      {error && <p className="error">{error}</p>}
      {consultas.length === 0 ? (
        <p>O médico não tem nenhuma consulta registrada.</p>
      ) : (
        <ul>
          {consultas.map((consulta) => (
            <li key={consulta.id} className="consulta-item">
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
