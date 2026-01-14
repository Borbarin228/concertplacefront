// @ts-ignore
import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import api from '../services/api';
import { API_CONFIG } from '../config/api';
import './Register.css';

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation?: string;
    description?: string;
    avatar?: FileList;
}

interface RegisterResponse{
    success?: boolean;
    message?: string;
    error?: string;
    errors?:{
        name?: string[];
        email?: string[];
        password?: string[];
        description?: string[];
        avatar?: string[];
        [key: string]: string[] | undefined;
    }
    token?: string;
    user?: any;
}

const Register: React.FC = () =>{
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState:{errors}
    } = useForm<RegisterFormData>()

    // @ts-ignore
    const onSubmit = async (data: RegisterFormData) => {
        setError(null);
        setErrorMessages([]);
        setLoading(true);

        try{
            // Создаем FormData для отправки файлов
            const formData = new FormData();

            // Добавляем текстовые поля
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('password', data.password);

            if (data.password_confirmation) {
                formData.append('password_confirmation', data.password_confirmation);
            }

            if (data.description) {
                formData.append('description', data.description);
            }

            // Добавляем файл аватара, если он есть
            if (data.avatar && data.avatar[0]) {
                formData.append('avatar', data.avatar[0]);
            }

            // Используем api напрямую для FormData (axios автоматически определит Content-Type)
            const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result: RegisterResponse = response.data;

            if (result.token){
                localStorage.setItem('token', result.token);
            }

            if (result.user?.id) {
                localStorage.setItem('user_id', result.user.id);
                localStorage.setItem('user', JSON.stringify(result.user));
            }

            console.log('Успешная регистрация!', result);
            navigate('/concert/list');

        } catch (err: any) {
            console.error('Registration error:', err);

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
                setError(err.message || 'Произошла ошибка при регистрации');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="center-wrap">
            <div className="register-container">
                <div className="form-title">РЕГИСТРАЦИЯ</div>

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

                <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="Введите email"
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
                        <label htmlFor="password" className="form-label">Пароль</label>
                        <input
                            id="password"
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

                    <div className="form-group">
                        <label htmlFor="password_confirmation" className="form-label">Подтвердите пароль</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            className="form-input"
                            placeholder="Повторите пароль"
                            {...register('password_confirmation', {
                                required: 'Подтверждение пароля обязательно',
                                validate: (value, formValues) => {
                                    const passwordInput = document.getElementById('password') as HTMLInputElement;
                                    return value === passwordInput?.value || 'Пароли не совпадают';
                                }
                            })}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Имя профиля</label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="Имя профиля"
                            {...register('name', {
                                required: 'Имя обязательно для заполнения',
                                minLength: {
                                    value: 2,
                                    message: 'Имя должно содержать минимум 2 символа',
                                },
                            })}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="form-label">Описание (необязательно)</label>
                        <textarea
                            id="description"
                            className="form-textarea"
                            placeholder="О себе..."
                            {...register('description')}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="avatar" className="form-label">Аватар (необязательно)</label>
                        <input
                            id="avatar"
                            type="file"
                            className="form-file"
                            accept="image/*"
                            {...register('avatar')}
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="form-btn" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
