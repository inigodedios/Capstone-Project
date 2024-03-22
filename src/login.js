import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
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
        setError('Error de login: Usuario o contraseña incorrectos');
      }
    } catch (error) {
      setError('Error de login: No se pudo conectar al servidor');
      console.error('Error:', error);
    }
  };

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
