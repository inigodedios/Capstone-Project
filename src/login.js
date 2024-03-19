import React from 'react';
import LoginForm from './components/LoginForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate(); // Hook de React Router para la navegación

  const handleLogin = async (formData) => {
    try {
      const response = await axios.post(`http://127.0.0.1:5000/login`, formData);
      console.log(response.data); // Maneja la respuesta del servidor según sea necesario
      navigate('/'); // Redirige al usuario a la página de inicio después de iniciar sesión
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Login to Your Account</h2>
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
};

export default Login;
