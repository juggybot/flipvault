import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api'; // Changed to adminLogin

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('AdminLogin: Attempting login with', { username }); // Log credentials

    try {
      const result = await adminLogin(username, password); // Changed to adminLogin
      console.log('AdminLogin: Login result:', result); // Log the result

      if (result.success) {
        localStorage.setItem('adminToken', 'true'); // Add admin token
        console.log('AdminLogin: Login successful');
        navigate('/admin-dashboard');
      } else {
        console.log('AdminLogin: Login failed');
        alert(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('AdminLogin: Error during login:', error); // Log any errors
      alert('Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Admin Login</h1> {/* Updated heading */}
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default AdminLogin;