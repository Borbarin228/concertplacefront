import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при выходе');
      }

      // Удаляем токен из localStorage
      localStorage.removeItem('token');

      // Перенаправляем на страницу входа
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при выходе');
      setLoading(false);

      // Даже при ошибке удаляем токен и перенаправляем на страницу входа
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div className="profile">
      <button 
        onClick={handleLogout} 
        disabled={loading}
        className="logout-button"
      >
        {loading ? 'Выход...' : 'Logout'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Profile;

