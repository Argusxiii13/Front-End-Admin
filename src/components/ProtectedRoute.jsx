import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const ProtectedRoute = () => {
  const [isAuth, setIsAuth] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const validateToken = async (token) => {
    try {
      const response = await axios.post(`${apiUrl}/api/validate-token`, { token });
      console.log('Token validation response:', response.data);
      return response.data.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false; // Return false on any error during validation
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    console.log('Retrieved token:', token); // Log the retrieved token
    
    if (!token) {
      console.log('No token found. User is not authenticated.');
      setIsAuth(false);
      setIsLoading(false);
      return;
    }

    const isValid = await validateToken(token);
    
    if (!isValid) {
      console.log('Invalid token. User will be redirected to login.');
      localStorage.removeItem('authToken'); // Clear invalid token
      localStorage.removeItem('userInfo');
    } else {
      console.log('Valid token. User is authenticated.');
    }

    setIsAuth(isValid);
    setIsLoading(false);
  };

  React.useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;