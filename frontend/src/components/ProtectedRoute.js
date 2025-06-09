import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { requirePaidPlan } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthorized(false);
          return;
        }
        const hasPaidPlan = await requirePaidPlan();
        setIsAuthorized(hasPaidPlan);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
