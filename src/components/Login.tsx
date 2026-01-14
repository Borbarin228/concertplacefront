// @ts-ignore
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: {
    email?: string[];
    password?: string[];
    [key: string]: string[] | undefined;
  };
  token?: string;
  user?: any;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Проверка загрузки компонента
  React.useEffect(() => {
    console.log('Login component mounted');
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // @ts-ignore
  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setErrorMessages([]);
    setLoading(true);

    try {
      const response = await authService.login(data);
      const result: LoginResponse = response.data;

      console.log('Успешный вход:', result);

      if (result.token) {
        localStorage.setItem('token', result.token);
      }

      if (result.user?.id) {
        localStorage.setItem('user_id', result.user.id);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      // Навигация после успешного входа
      navigate('/concert/list');

    } catch (err: any) {
      console.error('Login error:', err);

      // Обработка ошибок axios
      if (err.response) {
        const { data, status } = err.response;

        if (status === 422 && data.errors) {
          // Валидационные ошибки Laravel
          const messages: string[] = [];
          Object.keys(data.errors).forEach((key) => {
            if (Array.isArray(data.errors[key])) {
              messages.push(...data.errors[key]);
            }
          });
          setErrorMessages(messages);
        } else if (data.message) {
          setError(data.message);
        } else if (data.error) {
          setError(data.error);
        } else if (status === 401) {
          setError('Неверный email или пароль');
        } else {
          setError(`Ошибка сервера: ${status}`);
        }
      } else if (err.request) {
        if (err.code === 'ECONNABORTED') {
          setError('Таймаут запроса. Проверьте подключение к интернету и убедитесь, что сервер запущен.');
        } else if (err.message?.includes('Network Error')) {
          setError('Ошибка сети или CORS. Проверьте, что сервер запущен и настроен CORS.');
        } else {
          setError('Ошибка сети. Проверьте подключение к интернету.');
        }
      } else {
        setError(err.message || 'Произошла неизвестная ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-wrap">
      <div className="login-container">
        <div className="form-title">ВХОД</div>

        {(error || errorMessages.length > 0) && (
          <div className="error">
            {errorMessages.length > 0 ? (
              errorMessages.map((msg, index) => (
                <React.Fragment key={index}>
                  {msg}
                  {index < errorMessages.length - 1 && <br />}
                </React.Fragment>
              ))
            ) : (
              error
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div className="form-group">
            <input
              type="email"
              className="form-input"
              placeholder="Введите логин"
              {...register('email', {
                required: 'Email обязателен для заполнения',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Некорректный email адрес',
                },
              })}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Введите пароль"
              {...register('password', {
                required: 'Пароль обязателен для заполнения',
                minLength: {
                  value: 6,
                  message: 'Пароль должен содержать минимум 6 символов',
                },
              })}
              disabled={loading}
            />
          </div>

          <button type="submit" className="form-btn" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="register-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
