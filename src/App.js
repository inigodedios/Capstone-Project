// En tu archivo App.js o donde definas tus rutas

import React from 'react';
import UserProfile from './UserProfile';
import Login from './login'; // Asegúrate de que la ruta sea correcta y la capitalización coincida con el nombre del archivo
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // Verifica la ruta correcta
import StockDetails from './components/StockDetails'; // Corrige el typo aquí '.components' debe ser './components'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Envoltura para rutas protegidas con ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<UserProfile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
