import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí eliminas el token de autenticación o cualquier dato de sesión.
    // Por ejemplo, si usas localStorage:
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token'); // Asume que guardas un token, ajusta según tu caso

    navigate('/login');
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default LogoutButton;
