import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'; // Certifique-se de importar o CSS

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        // Armazena o token e o nome no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('name', data.name); // Armazena dados
        localStorage.setItem('email', email);

        // Decodifica o token JWT para extrair o role
        const decodedToken = JSON.parse(atob(data.token.split('.')[1]));
        const userRole = decodedToken.role;
        console.log(userRole); // Verifique o papel do usuário

        // Redireciona o usuário com base no role
        switch (userRole) {
          case 'admin':
            navigate('/gerenciar');
            break;
          case 'doctor':
            navigate('/consultas');
            break;
          case 'patient':
            navigate('/marcarconsulta');
            break;
          default:
            console.log('Papel não reconhecido');
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Erro no login. Tente novamente.');
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h2>Login</h2>
        {error && <p>{error}</p>}
        <form onSubmit={handleLogin}>
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
          <button type="submit">Login</button>
          <button type="button" className="button-back" onClick={() => navigate('/')}>
            Voltar para a Página Inicial
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
