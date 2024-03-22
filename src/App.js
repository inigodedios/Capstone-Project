import React from 'react';
import UserProfile from './UserProfile';
import Login from './login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SignUpForm from './SignUp';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import 'bootstrap/dist/css/bootstrap.css';

/**
 * The main App component handles routing using React Router.
 * It renders different components based on the URL path and authoritaton status.
 * 
 * @returns The root component of the application, which contains routing logic.
 */
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