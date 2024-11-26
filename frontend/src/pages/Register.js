import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css'; // Certifique-se de importar o CSS

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('patient'); // Default para paciente
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState(''); // Estado para armazenar o endereço
  const navigate = useNavigate();

  const handleCepBlur = async () => {
    const formattedCep = cep.replace(/\D/g, '');
    if (formattedCep.length !== 8) {
      console.error('CEP inválido.');
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${formattedCep}/json/`);
      if (!response.ok) {
        throw new Error('Erro ao buscar o endereço.');
      }

      const addressData = await response.json();
      if (addressData.erro) {
        console.error('CEP não encontrado.');
        setAddress(''); // Limpa o endereço se o CEP for inválido
      } else {
        const fullAddress = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}`;
        setAddress(fullAddress); // Salva o endereço no estado
        console.log('Endereço encontrado:', fullAddress);
      }
    } catch (error) {
      console.error('Erro ao consultar o CEP:', error.message);
      setAddress(''); // Limpa o endereço em caso de erro
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { name, email, password, userType, cep, address }; // Inclui CEP e endereço

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
          <input
            type="text"
            placeholder="CEP"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            onBlur={handleCepBlur}
            required
          />
          <input
            type="text"
            placeholder="Endereço"
            value={address}
            readOnly // Apenas leitura, preenchido automaticamente
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
