// SignUpForm.js
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
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignUp}>
        <div>
          <label htmlFor="signup-username">Username:</label>
          <input
            id="signup-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="signup-password">Password:</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpForm;
