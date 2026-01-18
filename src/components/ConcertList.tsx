// src/components/ConcertList.tsx
// @ts-ignore
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { concertService } from '../services/concertService';
import { authService } from '../services/authService';
import { API_CONFIG } from '../config/api';
import './ConcertList.css';

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
    ticket_categories?: Array<{
        id: number;
        name: string;
        description: string;
        price: number;
    }>;
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

const ConcertList: React.FC = () => {
    const navigate = useNavigate();
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        perPage: 10,
        total: 0
    });

    // Загружаем концерты при монтировании
    useEffect(() => {
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
                console.log(result);
                const acceptedConcerts = result.data.filter((concert: Concert) => concert.is_accepted === true);
                setConcerts(acceptedConcerts);
                
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

    const getAvatarUrl = (avatar: string | null | undefined): string | null => {

        return localStorage.getItem('avatar');
    };

    if (loading && concerts.length === 0) {
        return (
            <div className="concert-list-loading">
                <div className="spinner"></div>
                <p>Загрузка концертов...</p>
            </div>
        );
    }

            if (error) {
        return (
            <div className="concert-list-error">
                <h2>Ошибка загрузки</h2>
                <p>{error}</p>
                <button onClick={() => fetchConcerts(1)}>Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="concert-list-container">
            <div className="concerts-title">Список Концертов</div>

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
                            <Link to={`/concert/${concert.id}`} className="concert-buy">
                                КУПИТЬ
                            </Link>
                        </div>
                    ))
                ) : (
                    <div style={{color: '#888', fontSize: '1.1rem', textAlign: 'center'}}>
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

export default ConcertList;
