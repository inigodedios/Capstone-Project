import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * LogoutButton component provides a user interface for triggering the logout process.
 * It removes the user's authentication and token information from localStorage
 * and navigates the user back to the login page.
 * 
 * Usage:
 * Renders a button that, when clicked, logs out the user and redirects to the login page.
 * 
 * @returns {JSX.Element} A button element that handles the logout functionality.
 */
const LogoutButton = () => {
  const navigate = useNavigate();

  /**
   * Handles the logout action when the logout button is clicked.
   * Removes user authentication and token data from localStorage,
   * then navigates the user back to the login page.
   */
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Renders the logout button with an onClick event bound to the handleLogout function
  return (
    <button onClick={handleLogout} className="btn btn-danger">Logout</button>
  );
};

export default LogoutButton;
