import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://capstoneinifinal.lm.r.appspot.com/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Signed up successfully:', data.message);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', data.user_id);
        navigate('/');
      } else {
        setError(`Error signing up: ${data.message}`);
      }
    } catch (error) {
      setError('Error signing up: Could not connect to the server');
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-center">Sign Up</h2>
            </div>
            <div className="card-body">
              {error && <p className="text-danger">{error}</p>}
              <form onSubmit={handleSignUp}>
                <div className="mb-3">
                  <label htmlFor="signup-username" className="form-label">Username:</label>
                  <input
                    id="signup-username"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="signup-password" className="form-label">Password:</label>
                  <input
                    id="signup-password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary">Sign Up</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
