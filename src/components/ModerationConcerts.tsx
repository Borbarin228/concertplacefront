// src/components/ModerationConcerts.tsx
// @ts-ignore
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { concertService } from '../services/concertService';
import { authService } from '../services/authService';
import { API_CONFIG } from '../config/api';
import './ModerationConcerts.css';

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

interface ApiResponse {
    data: Concert[];
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

const ModerationConcerts: React.FC = () => {
    const navigate = useNavigate();
    const [concerts, setConcerts] = useState<Concert[]>([]);
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

        const user = authService.getCurrentUser();
        if (!authService.isAuthenticated() || !user?.is_admin) {
            navigate('/main');
            return;
        }
        fetchConcerts(1);
    }, []);

    // @ts-ignore
    const fetchConcerts = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            if (!authService.isAuthenticated()) {
                navigate('/login');
                return;
            }


            const response = await concertService.getAll(page);
            const result = response.data;

            if (result && result.data && Array.isArray(result.data)) {
                setConcerts(result.data);

                if (result.meta) {
                    setPagination({
                        currentPage: result.meta.current_page,
                        totalPages: result.meta.last_page,
                        perPage: result.meta.per_page,
                        total: result.meta.total
                    });
                }
            } else {
                setConcerts([]);
            }

        } catch (err: any) {
            console.error('Error fetching concerts:', err);
            if (err.response?.status === 401) {
                authService.logout();
                navigate('/login');
                return;
            }
            setError(err.response?.data?.message || 'Ошибка при загрузке данных');
        } finally {
            setLoading(false);
        }
    };

    // @ts-ignore
    const handleAccept = async (e: React.MouseEvent<HTMLButtonElement>, concertId: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Подтвердить этот концерт?')) return;

        try {
            setProcessingId(concertId);
            setError(null);
            setSuccess(null);

            const response = await concertService.accept(concertId);


            setConcerts(prevConcerts =>
                prevConcerts.map(concert =>
                    concert.id === concertId
                        ? { ...concert, is_accepted: true }
                        : concert
                )
            );

            setSuccess('Концерт успешно подтвержден!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error accepting concert:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Не удалось подтвердить концерт';
            setError(errorMessage);
            setTimeout(() => setError(null), 5000);
        } finally {
            setProcessingId(null);
        }
    };

    // @ts-ignore
    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, concertId: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Удалить концерт?')) return;

        try {
            setProcessingId(concertId);
            setError(null);
            setSuccess(null);

            await concertService.delete(concertId);

            // Удаляем концерт из списка
            setConcerts(prevConcerts =>
                prevConcerts.filter(concert => concert.id !== concertId)
            );

            setSuccess('Концерт успешно удален!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error deleting concert:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Не удалось удалить концерт';
            setError(errorMessage);
            setTimeout(() => setError(null), 5000);
        } finally {
            setProcessingId(null);
        }
    };

    const handleNextPage = () => {
        if (pagination.currentPage < pagination.totalPages) {
            fetchConcerts(pagination.currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (pagination.currentPage > 1) {
            fetchConcerts(pagination.currentPage - 1);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        } catch (e) {
            return dateString;
        }
    };

    const getAvatarUrl = (avatar: string | null | undefined) => {
        if (!avatar) return '/images/user-placeholder.png';
        // @ts-ignore
        if (avatar.startsWith('http')) return avatar;
        // Убеждаемся, что путь начинается с /
        // @ts-ignore
        const avatarPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
        return `${API_CONFIG.BASE_URL.replace('/api', '')}${avatarPath}`;
    };

    if (loading && concerts.length === 0) {
        return (
            <div className="moderation-concerts-loading">
                <div className="spinner"></div>
                <p>Загрузка концертов...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="moderation-concerts-error">
                <h2>Ошибка загрузки</h2>
                <p>{error}</p>
                <button onClick={() => fetchConcerts(1)}>Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="moderation-concerts-container">
            <div className="moder-concerts-title">Концерты (Модерация)</div>

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
                {concerts.length > 0 ? (
                    concerts.map((concert) => (
                        <Link
                            key={concert.id}
                            to={`/concert/${concert.id}`}
                            className="concert-card-link"
                        >
                            <div className="concert-card">
                                <img
                                    src={getAvatarUrl(concert.user?.avatar)}
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
                                {!concert.is_accepted && (
                                    <button
                                        type="button"
                                        className="accept-concert-btn"
                                        onClick={(e) => handleAccept(e, concert.id)}
                                        disabled={processingId === concert.id}
                                    >
                                        {processingId === concert.id ? 'Обработка...' : 'Подтвердить'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="delete-concert-btn"
                                    onClick={(e) => handleDelete(e, concert.id)}
                                    disabled={processingId === concert.id}
                                >
                                    {processingId === concert.id ? '...' : 'X'}
                                </button>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="no-concerts-message">
                        Пока концертов нет.
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

export default ModerationConcerts;