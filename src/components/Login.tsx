// @ts-ignore
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './Login.css';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка при входе');
      }

      setSuccess(true);
      
      console.log(result.token);
      if (result.token) {
        localStorage.setItem('token', result.token);
      }

      console.log('Успешный вход:', result);
      
      // Перенаправляем на страницу профиля после успешной авторизации
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email обязателен для заполнения',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Некорректный email адрес',
              },
            })}
            placeholder="Введите email"
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            id="password"
            type="password"
            {...register('password', {
              required: 'Пароль обязателен для заполнения',
              minLength: {
                value: 6,
                message: 'Пароль должен содержать минимум 6 символов',
              },
            })}
            placeholder="Введите пароль"
          />
          {errors.password && <span className="error-message">{errors.password.message}</span>}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Успешный вход!</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default Login;

