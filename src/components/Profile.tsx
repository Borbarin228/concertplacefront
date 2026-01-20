// src/pages/Profile.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { concertService } from '../services/concertService';
import { ticketService } from '../services/ticketService';
import { API_CONFIG } from '../config/api';
import { useAuthStore } from '../stores/authStore';
import './Profile.css';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  avatar: string | null;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface Ticket {
  id: number;
  number?: number;
  concert?: {
    id: number;
    city: string;
    place: string;
    start_at: string;
    user?: {
      id: number;
      name: string;
      avatar?: string;
    };
  };
  category?: {
    id: number;
    name: string;
  };
}

interface Concert {
  id: number;
  city: string;
  place: string;
  start_at: string;
  is_accepted: boolean;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Используем Zustand store
  const {
    user: authUser,
    isAuthenticated,
    getUserId,
    isAdmin,
    updateUser,
    checkAuth
  } = useAuthStore();

  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [unsavedWarning, setUnsavedWarning] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    remove_avatar: false
  });

  useEffect(() => {
    // Проверяем аутентификацию при монтировании
    const isAuth = checkAuth();
    if (!isAuth) {
      navigate('/login');
      return;
    }

    // Если пользователь уже есть в store, используем его
    if (authUser) {
      setUser(authUser as User);
      setFormData({
        name: authUser.name || '',
        email: authUser.email || '',
        remove_avatar: false
      });

      if (authUser.avatar) {
        const avatarUrl = authUser.avatar.startsWith('http')
            ? authUser.avatar
            : `${API_CONFIG.BASE_URL.replace('/api', '')}${authUser.avatar}`;
        setAvatarPreview(avatarUrl);
      }
    }

    fetchUserProfile();
    fetchTickets();
    fetchUserConcerts();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await userService.getById(userId);
      const result = response.data;
      const userData = result.data || result;

      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        remove_avatar: false
      });

      if (userData.avatar) {
        const avatarUrl = userData.avatar.startsWith('http')
            ? userData.avatar
            : `${API_CONFIG.BASE_URL.replace('/api', '')}${userData.avatar}`;
        setAvatarPreview(avatarUrl);
      }

    } catch (err: any) {
      console.error('Error fetching user:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || err.message || 'Не удалось загрузить данные пользователя');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;

      const response = await userService.getTickets(userId);
      const ticketsData = response.data.data || response.data || [];
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
    }
  };

  const fetchUserConcerts = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;

      // Загружаем все концерты и фильтруем по user_id
      const response = await concertService.getAll(1);
      const concertsData = response.data.data || response.data || [];
      const allConcerts = Array.isArray(concertsData) ? concertsData : [];
      const userConcerts = allConcerts.filter((concert: Concert) => concert.user_id === userId);
      setConcerts(userConcerts);
    } catch (err: any) {
      console.error('Error fetching concerts:', err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setAvatarPreview(ev.target.result as string);
          setUnsavedWarning(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      if (formData.remove_avatar) {
        submitData.append('remove_avatar', '1');
      }
      if (fileInputRef.current?.files?.[0]) {
        submitData.append('avatar', fileInputRef.current.files[0]);
      }
      submitData.append('_method', 'PUT');

      const response = await userService.updateUser(user.id, submitData);
      const result = response.data;
      const updatedUser = result.data || result;

      // Обновляем состояние пользователя
      setUser(updatedUser);

      // Обновляем пользователя в Zustand store
      updateUser(updatedUser);

      setUnsavedWarning(false);
      setSuccess('Профиль успешно обновлен!');

      // Обновляем formData с новыми значениями
      setFormData({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        remove_avatar: false
      });

      // Обновляем превью аватара
      if (updatedUser.avatar && !formData.remove_avatar) {
        const avatarUrl = updatedUser.avatar.startsWith('http')
            ? updatedUser.avatar
            : `${API_CONFIG.BASE_URL.replace('/api', '')}${updatedUser.avatar}`;
        setAvatarPreview(avatarUrl);
      } else if (formData.remove_avatar) {
        setAvatarPreview(null);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Очищаем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err: any) {
      console.error('Error updating user:', err);

      // Обработка ошибок валидации
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(', ') || 'Ошибка валидации данных');
      } else if (err.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message || 'Не удалось обновить данные');
      }
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!window.confirm('Удалить билет?')) return;

    try {
      await ticketService.deleteTicket(ticketId);
      fetchTickets();
    } catch (err: any) {
      console.error('Error deleting ticket:', err);
      setError(err.response?.data?.message || 'Не удалось удалить билет');
    }
  };

  const handleDeleteConcert = async (concertId: number) => {
    if (!window.confirm('Удалить мероприятие?')) return;

    try {
      await concertService.delete(concertId);
      fetchUserConcerts();
    } catch (err: any) {
      console.error('Error deleting concert:', err);
      setError(err.response?.data?.message || 'Не удалось удалить мероприятие');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getAvatarUrl = (avatar: string | null | undefined): string | null => {
    if (!avatar || avatar.trim() === '') return null;

    const trimmed = avatar.trim();

    if (trimmed.startsWith('http')) return trimmed;

    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;

    return `${cleanBaseUrl}/${cleanPath}`;
  };

  if (loading && !user) {
    return (
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="profile-container">
          <div style={{textAlign: 'center', color: '#000', fontSize: '1.1rem'}}>
            Данные пользователя не найдены
          </div>
        </div>
    );
  }

  return (
      <div className="profile-container">
        {error && (
            <div style={{color: '#e74c3c', textAlign: 'center', marginBottom: '20px', padding: '10px', backgroundColor: '#fee', borderRadius: '8px'}}>
              {error}
            </div>
        )}
        {success && (
            <div style={{color: '#27ae60', textAlign: 'center', marginBottom: '20px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '8px'}}>
              {success}
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="profile-row">
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <label htmlFor="avatar-input" style={{cursor: 'pointer'}}>
                <img
                    id="avatar-preview"
                    src={avatarPreview || getAvatarUrl(user.avatar) || '/images/user-placeholder.png'}
                    className="profile-avatar avatar-hover"
                    alt="Аватар пользователя"
                    onError={(e) => {
                      e.currentTarget.src = '/images/user-placeholder.png';
                    }}
                />
              </label>
              <input
                  id="avatar-input"
                  ref={fileInputRef}
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{display: 'none'}}
              />
              {unsavedWarning && (
                  <div id="unsaved-warning" style={{display: 'block', color: '#e74c3c', fontSize: '1.05rem', marginTop: '8px'}}>
                    Вы не сохранили изменения
                  </div>
              )}
              {user.avatar && (
                  <div style={{marginTop: '8px'}}>
                    <label style={{color: '#000'}}>
                      <input
                          type="checkbox"
                          name="remove_avatar"
                          checked={formData.remove_avatar}
                          onChange={(e) => setFormData({...formData, remove_avatar: e.target.checked})}
                      />
                      {' '}Удалить аватар
                    </label>
                  </div>
              )}
            </div>
            <div className="profile-fields">
              <div>
                <div className="profile-field-label">Имя Профиля</div>
                <div className="profile-field-box">
                  <input
                      type="text"
                      name="name"
                      className="profile-input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                  />
                </div>
              </div>
              <div>
                <div className="profile-field-label">Почта</div>
                <div className="profile-field-box">
                  <input
                      type="email"
                      name="email"
                      className="profile-input"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                  />
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="confirm-btn" disabled={loading}>
            {loading ? 'Сохранение...' : 'Подтвердить изменения'}
          </button>
        </form>

        <div className="profile-title">Мои Билеты</div>
        <div className="tickets-list">
          {tickets.length > 0 ? (
              tickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-card">
                    <img
                        src={getAvatarUrl(ticket.concert?.user?.avatar) || '/images/user-placeholder.png'}
                        className="ticket-artist-photo"
                        alt="Фото артиста"
                        onError={(e) => {
                          e.currentTarget.src = '/images/user-placeholder.png';
                        }}
                    />
                    <div className="ticket-info">
                      <div className="ticket-title">{ticket.concert?.user?.name || 'Артист'}</div>
                      <div className="ticket-place">{ticket.concert?.city || ''} – {ticket.concert?.place || ''}</div>
                      <div className="ticket-date">{formatDate(ticket.concert?.start_at)}</div>
                    </div>
                    <span className="ticket-category">{ticket.category?.name || ''}</span>
                    <span className="ticket-cut"></span>
                    <span className="ticket-qty">X{ticket.number || 1}</span>
                    <button
                        type="button"
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="delete-ticket-btn"
                    >
                      &#10006;
                    </button>
                  </div>
              ))
          ) : (
              <div style={{color: '#888', fontSize: '1.1rem', textAlign: 'center'}}>
                У вас пока нет билетов.
              </div>
          )}
        </div>

        <Link to="/concert/create" className="create-event-btn">
          Создать мероприятие
        </Link>

        <div className="my-events-title">Мои мероприятия</div>
        <div className="concert-list">
          {concerts.length > 0 ? (
              concerts.map((concert) => (
                  <div key={concert.id} className="concert-card">
                    <img
                        src={getAvatarUrl(concert.user?.avatar) || '/images/user-placeholder.png'}
                        className="concert-photo"
                        alt="Фото пользователя"
                        onError={(e) => {
                          e.currentTarget.src = '/images/user-placeholder.png';
                        }}
                    />
                    <div className="concert-info">
                      <div className="concert-title">{concert.user?.name || 'Без имени'}</div>
                      <div className="concert-place">{concert.city} – {concert.place}</div>
                      <div className="concert-date">{formatDate(concert.start_at)}</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleDeleteConcert(concert.id)}
                        className="delete-concert-btn"
                    >
                      &#10006;
                    </button>
                  </div>
              ))
          ) : (
              <div style={{color: '#000', fontSize: '1.1rem', textAlign: 'center'}}>
                Вы ещё не создавали мероприятий.
              </div>
          )}
        </div>
      </div>
  );
};

export default Profile;