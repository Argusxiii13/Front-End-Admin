import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { getSocket } from '../lib/socket';

const apiUrl = import.meta.env.VITE_API_URL;

const ProtectedRoute = () => {
  const [isAuth, setIsAuth] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const validateToken = async (token) => {
    try {
      const response = await axios.post(`${apiUrl}/api/validate-token`, { token });
      return response.data.valid;
    } catch (error) {
      return false; // Return false on any error during validation
    }
  };

  const initializeNotifications = async (adminId) => {
    try {
      // Initialize socket connection for this admin
      const socket = getSocket();
      socket.emit('join-admin-room', adminId);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const checkAuth = async () => {
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    const storedAdminInfo = localStorage.getItem('adminInfo');

    if (isDemoMode && storedAdminInfo) {
      setIsAuth(true);
      setIsLoading(false);
      
      // Initialize notifications for demo mode
      try {
        const adminInfo = JSON.parse(storedAdminInfo);
        const adminId = adminInfo.admin_id || adminInfo.id;
        if (adminId) {
          initializeNotifications(adminId);
        }
      } catch (error) {
        console.error('Error parsing admin info:', error);
      }
      return;
    }

    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setIsAuth(false);
      setIsLoading(false);
      return;
    }

    const isValid = await validateToken(token);
    
    if (!isValid) {
      localStorage.removeItem('authToken'); // Clear invalid token
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('demoMode');
      setIsAuth(false);
      setIsLoading(false);
      return;
    }

    // Initialize notifications for authenticated user
    try {
      const adminInfo = JSON.parse(storedAdminInfo || '{}');
      const adminId = adminInfo.admin_id || adminInfo.id;
      if (adminId) {
        initializeNotifications(adminId);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
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
