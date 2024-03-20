import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para almacenar mensajes de error
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5001/login', {
        method: 'POST',
        body: JSON.stringify({ username: username, password: password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
      });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', response.user_id); 
      navigate('/');
    } catch (error) {
      setError('Error de login: Usuario o contraseña incorrectos');
      console.error('Error:', error);
    }
};

// Ejemplo de un botón de logout que podrías agregar en UserProfile.js o en otro componente

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userId');
  window.location.href = '/login'; // Esta línea redirige al usuario a /login
};


  return (
    <div>
      <h2>Login to Your Account</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
