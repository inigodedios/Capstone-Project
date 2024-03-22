import React from 'react';
import UserProfile from './UserProfile';
import Login from './login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SignUpForm from './SignUp';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <div className='Capstone-Project'>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<UserProfile />} />
        </Route>
      </Routes>
    </Router>
    </div>
  );
};

export default App;





