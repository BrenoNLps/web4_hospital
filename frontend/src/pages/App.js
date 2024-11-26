import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Consultas from './Consultas';
import MarcarConsulta from './MarcarConsulta'; // Corrigido para MarcarConsulta
import Gerenciar from './Gerenciar';
import '../styles/Home.css'; // Importa o CSS

// Página inicial com botões para Login e Registro
const Home = () => {
  return (
    <div className="circle">
      <h1>Bem-vindo ao Sistema</h1>
      <div className="button-container">
        <a href="/login" className="button">Login</a>
        <a href="/register" className="button">Registrar</a>
      </div>
    </div>
  );
};

// Função para verificar se o usuário está autenticado e tem o papel correto
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log("Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" />;
  }

  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  if (decodedToken.role !== role) {
    console.log("Papel do usuário:", decodedToken.role);
    return <Navigate to="/login" />;
  }

  return children;
};

// Função para redirecionar caso o usuário já esteja logado
const RedirectIfAuthenticated = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userRole = decodedToken.role;

    // Redireciona para a página correta baseada no papel (role)
    switch (userRole) {
      case 'admin':
        return <Navigate to="/gerenciar" />;
      case 'doctor':
        return <Navigate to="/consultas" />;
      case 'patient':
        return <Navigate to="/marcarconsulta" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return children; // Se não estiver autenticado, renderiza a página normalmente
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rotas acessíveis apenas quando o usuário não está logado */}
        <Route 
          path="/login" 
          element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} 
        />
        <Route 
          path="/register" 
          element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} 
        />
        <Route 
          path="/" 
          element={<RedirectIfAuthenticated><Home /></RedirectIfAuthenticated>} 
        />

        {/* Rotas protegidas */}
        <Route
          path="/consultas"
          element={<ProtectedRoute role="doctor"><Consultas /></ProtectedRoute>}
        />
        <Route
          path="/marcarconsulta" 
          element={<ProtectedRoute role="patient"><MarcarConsulta /></ProtectedRoute>}
        />
        <Route
          path="/gerenciar"
          element={<ProtectedRoute role="admin"><Gerenciar /></ProtectedRoute>}
        />

        {/* Rota padrão */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
