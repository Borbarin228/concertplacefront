// @ts-ignore
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { concertService } from '../services/concertService';
import { authService } from '../services/authService';
import './ConcertPage.css';

interface Ticket {
    id: number;
    number: number;
    category: {
        id: number;
        name: string;
        price: number;
    };
    created_at: string;
}

interface Concert {
    id: number;
    city: string;
    place: string;
    start_at: string;
    is_accepted: boolean;
    user_id: number;
    tickets?: Ticket[];
}

const ConcertPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [concert, setConcert] = useState<Concert | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchConcert(parseInt(id));
        }
    }, [id]);

    const fetchConcert = async (concertId: number) => {
        try {
            setLoading(true);
            setError(null);

            if (!authService.isAuthenticated()) {
                navigate('/login');
                return;
            }

            const response = await concertService.getById(concertId);
            const result = response.data;
            const concertData = result.data || result;

            setConcert(concertData);
        } catch (err: any) {
            console.error('Error fetching concert:', err);
            if (err.response?.status === 401) {
                authService.logout();
                navigate('/login');
                return;
            }
            setError(err.response?.data?.message || 'Ошибка при загрузке данных концерта');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="concert-page-loading">
                <div className="spinner"></div>
                <p>Загрузка концерта...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="concert-page-error">
                <h2>Ошибка загрузки</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/concert/list')}>Вернуться к списку</button>
            </div>
        );
    }

    if (!concert) {
        return (
            <div className="concert-page-error">
                <h2>Концерт не найден</h2>
                <button onClick={() => navigate('/concert/list')}>Вернуться к списку</button>
            </div>
        );
    }

    const tickets = concert.tickets || [];

    return (
        <div className="concert-page-container">
            <div className="concert-page-row">
                <div className="concert-page-col-left">
                    <div className="concert-page-card">
                        <div className="concert-page-card-body">
                            <h5 className="concert-page-card-title">Детали концерта</h5>
                            <p className="concert-page-card-text">
                                Город: {concert.city}<br />
                                Место: {concert.place}<br />
                                Дата: {formatDate(concert.start_at)}<br />
                                Статус: {concert.is_accepted ? 'Принят' : 'Ожидает'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="concert-page-col-right">
                    <h3>Билеты</h3>

                    {tickets.length > 0 ? (
                        <>
                            <div className="concert-page-table-responsive">
                                <table className="concert-page-table">
                                    <thead className="concert-page-table-head">
                                        <tr>
                                            <th>Номер билета</th>
                                            <th>Категория</th>
                                            <th>Цена</th>
                                            <th>Создан</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.map((ticket) => (
                                            <tr key={ticket.id}>
                                                <td>{ticket.number}</td>
                                                <td>{ticket.category.name}</td>
                                                <td>${ticket.category.price}</td>
                                                <td>{formatDate(ticket.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h4>Карточки билетов</h4>
                            <div className="concert-page-ticket-cards">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className="concert-page-ticket-card">
                                        <div className="concert-page-ticket-card-body">
                                            <p className="concert-page-ticket-card-text">
                                                Номер билета: {ticket.number}<br />
                                                Категория: {ticket.category.name}<br />
                                                Цена: ${ticket.category.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="concert-page-alert">
                            Нет доступных билетов для этого концерта.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ConcertPage;