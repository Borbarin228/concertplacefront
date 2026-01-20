// src/components/ConcertList.tsx
// @ts-ignore
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useConcertStore } from '../stores/concertStore';
import { authService } from '../services/authService';
import { API_CONFIG } from '../config/api';
import './ConcertList.css';

const ConcertList: React.FC = () => {
    const navigate = useNavigate();

    // Используем хук store для получения состояния и действий
    const {
        acceptedConcerts,
        acceptedLoading,
        acceptedError,
        acceptedPagination,
        fetchAcceptedConcerts,
        clearErrors
    } = useConcertStore();

    // Загружаем концерты при монтировании
    useEffect(() => {
        // Проверяем авторизацию
        if (!authService.isAuthenticated()) {
            navigate('/login');
            return;
        }

        // Загружаем подтвержденные концерты с первой страницы
        fetchAcceptedConcerts(1);

        // Очищаем ошибки при размонтировании компонента
        return () => {
            clearErrors();
        };
    }, []);

    // Обработчики пагинации
    const handleNextPage = () => {
        if (acceptedPagination.current_page < acceptedPagination.last_page) {
            fetchAcceptedConcerts(acceptedPagination.current_page + 1);
        }
    };

    const handlePrevPage = () => {
        if (acceptedPagination.current_page > 1) {
            fetchAcceptedConcerts(acceptedPagination.current_page - 1);
        }
    };

    // Форматирование даты
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

    // Получение URL аватара
    const getAvatarUrl = (avatar: string | null | undefined): string => {
        if (!avatar) return '/images/user-placeholder.png';

        if (avatar.startsWith('http')) {
            return avatar;
        }

        // Формируем полный URL используя ваш API_CONFIG
        const avatarPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
        return `${API_CONFIG.BASE_URL.replace('/api', '')}${avatarPath}`;
    };

    // Состояние загрузки (только при первой загрузке)
    if (acceptedLoading && acceptedConcerts.length === 0) {
        return (
            <div className="concert-list-loading">
                <div className="spinner"></div>
                <p>Загрузка концертов...</p>
            </div>
        );
    }

    // Состояние ошибки
    if (acceptedError) {
        return (
            <div className="concert-list-error">
                <h2>Ошибка загрузки</h2>
                <p>{acceptedError}</p>
                <button onClick={() => fetchAcceptedConcerts(1)}>
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className="concert-list-container">
            <div className="concerts-title">Список Концертов</div>

            <div className="concert-list">
                {acceptedConcerts.length > 0 ? (
                    acceptedConcerts.map((concert) => (
                        <div key={concert.id} className="concert-card">
                            <img
                                src={getAvatarUrl(concert.user?.avatar)}
                                className="concert-photo"
                                alt="Фото пользователя"
                                onError={(e) => {
                                    e.currentTarget.src = '/images/user-placeholder.png';
                                }}
                            />
                            <div className="concert-info">
                                <div className="concert-title">
                                    {concert.user?.name || 'Без имени'}
                                </div>
                                <div className="concert-place">
                                    {concert.city} – {concert.place}
                                </div>
                                <div className="concert-date">
                                    {formatDate(concert.start_at)}
                                </div>
                            </div>
                            <Link
                                to={`/concert/${concert.id}`}
                                className="concert-buy"
                            >
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

            {/* Пагинация */}
            {acceptedPagination.last_page > 1 && (
                <div className="pagination-container">
                    {/* Кнопка назад */}
                    {acceptedPagination.current_page === 1 ? (
                        <span className="pagination-arrow disabled">&#8592;</span>
                    ) : (
                        <button
                            onClick={handlePrevPage}
                            className="pagination-arrow"
                            disabled={acceptedLoading}
                        >
                            &#8592;
                        </button>
                    )}

                    {/* Информация о текущей странице */}
                    <span className="pagination-info">
                        Страница {acceptedPagination.current_page} из {acceptedPagination.last_page}
                    </span>

                    {/* Кнопка вперед */}
                    {acceptedPagination.current_page < acceptedPagination.last_page ? (
                        <button
                            onClick={handleNextPage}
                            className="pagination-arrow"
                            disabled={acceptedLoading}
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