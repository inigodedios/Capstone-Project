import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute component serves as a wrapper for any routes that require user authentication.
 * It checks if the user is authenticated by looking for a specific flag in localStorage.
 * If the user is authenticated, it renders the child components (routes) within it.
 * If not, it redirects the user to the login page.
 *
 * Usage:
 * Wrap any route components in your routing setup that should be accessible only to authenticated users.
 * 
 * @returns {JSX.Element} Either an Outlet component rendering child routes if the user is authenticated,
 *                        or a Navigate component redirecting to the login page if not authenticated.
 */
const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;