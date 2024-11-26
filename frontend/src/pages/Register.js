import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css'; // Certifique-se de importar o CSS

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('patient'); // Default para paciente
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { name, email, password, userType };

    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Erro ao registrar o usuário.');
      }

      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h2>Registro</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select onChange={(e) => setUserType(e.target.value)} value={userType}>
            <option value="admin">Administrador</option>
            <option value="doctor">Médico</option>
            <option value="patient">Paciente</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Registrar</button>
          <button type="button" className="button-back" onClick={() => navigate('/')}>
            Voltar para a Página Inicial
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
