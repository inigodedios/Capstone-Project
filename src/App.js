// En tu archivo App.js o donde definas tus rutas

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import Login from './login';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userId = localStorage.getItem('userId');

  if (!isAuthenticated || !userId) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        {/* Redirige cualquier otra ruta a /login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
