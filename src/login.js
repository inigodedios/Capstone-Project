import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * The Login component allows users to enter their credentials (username and password)
 * to authenticate and gain access to the user profile page.
 * 
 * @returns The Login component renders a form for username and password input,
 * and provides functionality for user authentication and navigation to the user profile upon successful login.
 */
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  /**
   * useEffect hook checks if the user is already authenticated (based on localStorage data)
   * and navigates to the home page if true.
   */
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  /**
   * Handles the login submission event. It sends a POST request with the username and password
   * to the server for authentication. Upon success, it stores the authentication status and user ID
   * in localStorage and navigates to the home page.
   * 
   * @param {Object} e - The event object associated with the form submission.
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the default form submission behavior
    try {
      const response = await fetch('https://capstoneinifinal.lm.r.appspot.com/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', data.user_id);
        navigate('/');
      } else {
        setError('Login error: Incorrect username or password');
      }
    } catch (error) {
      setError('Login error: Could not connect to the server');
      console.error('Error:', error);
    }
  };

  // Render the login form and handle form submission
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-center">
              <h1>DEBUGGING DOLLARS</h1>
            </div>
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login to Your Account</h2>
              {error && <p className="text-danger text-center">{error}</p>}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username:</label>
                  <input
                    id="username"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password:</label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary">Login</button>
                </div>
              </form>
              <div className="mt-3 text-center">
                <p>Don't have an account? <button className="btn btn-link" onClick={() => navigate('/signup')}>Register here</button></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;