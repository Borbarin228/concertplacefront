// src/components/ModerationUsers.tsx
// @ts-ignore
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { API_CONFIG } from '../config/api';
import './ModerationConcerts.css';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    is_admin?: boolean | number | string;
}

interface ApiResponse {
    data: User[];
    success: boolean;
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        links: Array<any>;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

const ModerationUsers: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        perPage: 10,
        total: 0
    });

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!authService.isAuthenticated() || !currentUser) {
            navigate('/login');
            return;
        }
        if (!currentUser.is_admin) {
            navigate('/main');
            return;
        }
        fetchUsers(1);
    }, []);

    // @ts-ignore
    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            if (!authService.isAuthenticated()) {
                navigate('/login');
                return;
            }

            const response = await userService.getAll(page);
            const result = response.data as ApiResponse;

            // Проверяем различные форматы ответа
            let usersArray: User[] = [];

            if (result && result.data && Array.isArray(result.data)) {
                // Формат с пагинацией
                usersArray = result.data;

                if (result.meta) {
                    setPagination({
                        currentPage: result.meta.current_page,
                        totalPages: result.meta.last_page,
                        perPage: result.meta.per_page,
                        total: result.meta.total
                    });
                }
            } else if (Array.isArray(result)) {
                // Если ответ - просто массив без пагинации
                usersArray = result;
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    perPage: usersArray.length,
                    total: usersArray.length
                });
            } else if (result && typeof result === 'object' && Array.isArray(result.data || result)) {
                // Альтернативный формат
                const data = result.data || result;
                usersArray = Array.isArray(data) ? data : [];
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    perPage: usersArray.length,
                    total: usersArray.length
                });
            }

            setUsers(usersArray);

        } catch (err: any) {
            console.error('Error fetching users:', err);
            if (err.response?.status === 401) {
                authService.logout();
                navigate('/login');
                return;
            }
            setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (pagination.currentPage < pagination.totalPages) {
            fetchUsers(pagination.currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (pagination.currentPage > 1) {
            fetchUsers(pagination.currentPage - 1);
        }
    };

    // @ts-ignore
    const handleDelete = async (userId: number) => {
        if (!window.confirm('Удалить пользователя?')) return;

        try {
            setProcessingId(userId);
            setError(null);
            setSuccess(null);

            await userService.deleteUser(userId);

            // Обновляем список пользователей с текущей страницы
            fetchUsers(pagination.currentPage);

            setSuccess('Пользователь успешно удален!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error deleting user:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Не удалось удалить пользователя';
            setError(errorMessage);
            setTimeout(() => setError(null), 5000);
        } finally {
            setProcessingId(null);
        }
    };

    const getAvatarUrl = (avatar: string | null | undefined) => {
        if (!avatar) return '/images/user-placeholder.png';
        // @ts-ignore
        if (avatar.startsWith('http')) return avatar;
        // @ts-ignore
        const avatarPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
        return `${API_CONFIG.BASE_URL.replace('/api', '')}${avatarPath}`;
    };

    if (loading && users.length === 0) {
        return (
            <div className="moderation-concerts-loading">
                <div className="spinner"></div>
                <p>Загрузка пользователей...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="moderation-concerts-error">
                <h2>Ошибка загрузки</h2>
                <p>{error}</p>
                <button onClick={() => fetchUsers(pagination.currentPage)}>Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="moderation-concerts-container">
            <div className="moder-concerts-title">Пользователи (Модерация)</div>

            {error && (
                <div className="moderation-message error-message">
                    {error}
                </div>
            )}
            {success && (
                <div className="moderation-message success-message">
                    {success}
                </div>
            )}

            <div className="concert-list">
                {users.length > 0 ? (
                    users.map((user) => (
                        <div key={user.id} className="concert-card">
                            <img
                                src={getAvatarUrl(user.avatar || null)}
                                className="concert-photo"
                                alt="Аватар пользователя"
                                onError={(e) => {
                                    e.currentTarget.src = '/images/user-placeholder.png';
                                }}
                            />
                            <div className="concert-info">
                                <div className="concert-title">{user.name || 'Без имени'}</div>
                                <div className="concert-place">{user.email}</div>
                                <div className="concert-date">
                                    {user.is_admin ? 'Администратор' : 'Пользователь'}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="delete-concert-btn"
                                onClick={() => handleDelete(user.id)}
                                disabled={processingId === user.id || user.is_admin}
                            >
                                {processingId === user.id ? '...' : '✕'}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="no-concerts-message">
                        Пользователей нет.
                    </div>
                )}
            </div>

            {pagination.totalPages > 1 && (
                <div className="pagination-container">
                    {pagination.currentPage === 1 ? (
                        <span className="pagination-arrow disabled">&#8592;</span>
                    ) : (
                        <button
                            onClick={handlePrevPage}
                            className="pagination-arrow"
                        >
                            &#8592;
                        </button>
                    )}

                    <span className="pagination-info">
                        Страница {pagination.currentPage} из {pagination.totalPages}
                    </span>

                    {pagination.currentPage < pagination.totalPages ? (
                        <button
                            onClick={handleNextPage}
                            className="pagination-arrow"
                        >
                            &#8594;
                        </button>
                    ) : (
                        <span className="pagination-arrow disabled">&#8594;</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModerationUsers;