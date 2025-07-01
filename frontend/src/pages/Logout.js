import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove user tokens/info from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Add any other keys you use for auth here
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}

export default Logout;
