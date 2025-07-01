import { useEffect } from 'react';

function Logout() {
  useEffect(() => {
    // Remove user tokens/info from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Add any other keys you use for auth here
    window.location.replace('/'); // Full page reload to landing page
  }, []);
  return null;
}

export default Logout;
