// src/components/CreateConcert.tsx
// @ts-ignore
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { concertService } from '../services/concertService';
import { ticketCategoryService } from '../services/ticketCategoryService';
import { authService } from '../services/authService';
import './CreateConcert.css';

interface TicketCategory {
    id: number;
    name: string;
    description?: string;
    price?: number;
}

const CreateConcert: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<TicketCategory[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
    const [prices, setPrices] = useState<Record<number, string>>({});
    const [formData, setFormData] = useState({
        city: '',
        place: '',
        start_at: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await ticketCategoryService.getAll();
            const categoriesData = response.data.data || response.data || [];
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (err: any) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleCategoryToggle = (categoryId: number) => {
        const newSelected = new Set(selectedCategories);
        if (newSelected.has(categoryId)) {
            newSelected.delete(categoryId);
            const newPrices = { ...prices };
            delete newPrices[categoryId];
            setPrices(newPrices);
        } else {
            newSelected.add(categoryId);
        }
        setSelectedCategories(newSelected);
    };

    const handlePriceChange = (categoryId: number, price: string) => {
        setPrices({
            ...prices,
            [categoryId]: price
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!authService.isAuthenticated()) {
            setError('Вы не авторизованы. Пожалуйста, войдите в систему.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const userId = authService.getUserId();
            if (!userId) {
                setError('Не удалось получить ID пользователя');
                return;
            }

            // Подготавливаем данные для отправки
            const concertData: any = {
                city: formData.city,
                place: formData.place,
                start_at: formData.start_at,
                user_id: userId,
                is_accepted: false,
            };

            // Добавляем категории и цены
            if (selectedCategories.size > 0) {
                concertData.categories = Array.from(selectedCategories);
                concertData.prices = {};
                selectedCategories.forEach(categoryId => {
                    const price = prices[categoryId];
                    if (price && parseFloat(price) > 0) {
                        concertData.prices[categoryId] = parseFloat(price);
                    }
                });
            }

            const response = await concertService.create(concertData);

            if (response.data.success || response.data.data) {
                // Перенаправляем на страницу созданного концерта
                const concertId = response.data.data?.id || response.data.id;
                navigate(`/concert/${concertId}`);
            } else {
                setError('Не удалось создать концерт');
            }

        } catch (err: any) {
            console.error('Error creating concert:', err);
            
            if (err.response?.status === 422) {
                const validationData = err.response.data.errors;
                const errorMessages = Object.values(validationData).flat();
                setError(errorMessages.join(', ') || 'Пожалуйста, исправьте ошибки в форме');
            } else if (err.response?.status === 401) {
                setError('Сессия истекла. Пожалуйста, войдите снова.');
                authService.logout();
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(err.response?.data?.message || err.message || 'Произошла ошибка при создании концерта');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!authService.isAuthenticated()) {
        return (
            <div className="create-concert-container">
                <div className="auth-required">
                    <h2>Требуется авторизация</h2>
                    <p>Для создания концерта необходимо войти в систему.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="login-button"
                    >
                        Войти в систему
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="create-concert-container">
            <div className="create-title">Создание Концерта</div>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form className="create-form" onSubmit={handleSubmit}>
                <div className="create-row">
                    <input
                        type="text"
                        name="city"
                        className="create-input"
                        placeholder="Город"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                    />
                    <input
                        type="text"
                        name="place"
                        className="create-input"
                        placeholder="Площадка"
                        value={formData.place}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="create-categories" id="categories-list">
                    {categories.map((category) => (
                        <label key={category.id} className="category-label">
                            <input
                                type="checkbox"
                                name="categories[]"
                                value={category.id}
                                checked={selectedCategories.has(category.id)}
                                onChange={() => handleCategoryToggle(category.id)}
                                disabled={loading}
                                className="category-checkbox"
                            />
                            <span className={`category-btn ${selectedCategories.has(category.id) ? 'selected' : ''}`}>
                                {category.name}
                            </span>
                            <input
                                type="number"
                                name={`prices[${category.id}]`}
                                className="category-price"
                                placeholder="Цена"
                                min="0"
                                step="1"
                                value={prices[category.id] || ''}
                                onChange={(e) => handlePriceChange(category.id, e.target.value)}
                                disabled={!selectedCategories.has(category.id) || loading}
                            />
                        </label>
                    ))}
                </div>

                <input
                    type="date"
                    name="start_at"
                    className="create-date"
                    placeholder="Дата"
                    value={formData.start_at}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    min={new Date().toISOString().split('T')[0]}
                />

                <button
                    type="submit"
                    className="publish-btn"
                    disabled={loading}
                >
                    {loading ? 'Создание...' : 'Опубликовать'}
                </button>
            </form>
        </div>
    );
};

export default CreateConcert;
