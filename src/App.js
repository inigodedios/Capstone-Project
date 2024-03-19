import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import Login from './login';

function App() {
  // Determina si el usuario está autenticado
  const isAuthenticated = true; // Esto debería ser una verificación real de autenticación
  
  return (
    <Router>
      <Routes>
        {/* Ruta protegida */}
        <Route path="/" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
        {/* Ruta de inicio de sesión */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
