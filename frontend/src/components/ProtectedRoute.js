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
        const userPlan = localStorage.getItem('userPlan');
        
        if (!token) {
          setIsAuthorized(false);
          return;
        }

        // If we have a stored paid plan, use that
        if (userPlan && userPlan !== 'FREE') {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Otherwise check with the server
        const hasPaidPlan = await requirePaidPlan();
        if (hasPaidPlan) {
          localStorage.setItem('userPlan', 'PAID');
        } else {
          localStorage.setItem('userPlan', 'FREE');
        }
        setIsAuthorized(hasPaidPlan);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthorized(false);
        localStorage.removeItem('userPlan');
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
