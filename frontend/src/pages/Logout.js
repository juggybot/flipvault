import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    // Remove user tokens/info from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Add any other keys you use for auth here
    setRedirect(true);
    navigate('/', { replace: true });
  }, [navigate]);

  if (redirect) {
    return <Navigate to="/" replace />;
  }
  return null;
}

export default Logout;
