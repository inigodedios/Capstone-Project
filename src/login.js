import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para almacenar mensajes de error
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      navigate('/'); // Redirige al usuario a la página principal si ya está autenticado
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://127.0.0.1:5001/login', {
        method: 'POST',
        body: JSON.stringify({ username: username, password: password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
      });
  
      const data = await response.json(); // Convertir la respuesta en JSON
  
      if (response.ok) {
        // Si la respuesta del servidor es exitosa (HTTP 200-299), establecer la sesión y redirigir
        localStorage.setItem('isAuthenticated', 'true');
        // Asegúrate de que el servidor responde con el ID de usuario adecuado en el cuerpo de la respuesta
        localStorage.setItem('userId', data.user_id); // Ajustar según el campo correcto
        navigate('/');
      } else {
        // Manejar respuestas no exitosas mostrando un mensaje de error
        setError('Error de login: Usuario o contraseña incorrectos');
      }
    } catch (error) {
      // Manejar errores de red o fallos en la solicitud
      setError('Error de login: No se pudo conectar al servidor');
      console.error('Error:', error);
    }
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
