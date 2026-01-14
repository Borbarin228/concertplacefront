// components/Header.jsx
// @ts-ignore
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { authService } from '../services/authService';
import MenuBar from './MenuBar';

const Header = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [moderationMenuOpen, setModerationMenuOpen] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
            const user = authService.getCurrentUser();
            const id = authService.getUserId();
            setUserId(id);
            setIsAdmin(user?.is_admin === true || user?.is_admin === 1);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUserId(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // В любом случае очищаем состояние
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUserId(null);
            navigate('/login');
        }
    };

    const handleModerationMenuToggle = () => {
        setModerationMenuOpen(!moderationMenuOpen);
    };

    const handleModerationMenuOpen = () => {
        setModerationMenuOpen(true);
    };

    const handleModerationMenuClose = () => {
        setModerationMenuOpen(false);
    };

    return (
        <header className="header-bar">
            <div className="header-logo">
                <Link to="/" style={{color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center'}}>
                    <span className="header-logo-icon">CE</span>
                </Link>
            </div>
            <div className="header-center">
                <Link to="/concert/list" style={{color: 'inherit', textDecoration: 'none'}}>Афиша</Link>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px', position: 'relative'}}>
                <MenuBar />
                {isAuthenticated ? (
                    <>
                        <Link to={`/profile`} className="header-link">Профиль</Link>
                        <button 
                            type="button" 
                            onClick={handleLogout} 
                            className="header-link header-link-button"
                        >
                            Выйти
                        </button>
                        {isAdmin && (
                            <div 
                                className="moderation-menu-container"
                                onMouseEnter={handleModerationMenuOpen}
                                onMouseLeave={handleModerationMenuClose}
                            >
                                <button 
                                    type="button"
                                    className="header-link moderation-menu-button"
                                    onClick={handleModerationMenuToggle}
                                >
                                    Модерация
                                    <span className="moderation-arrow">▼</span>
                                </button>
                                {moderationMenuOpen && (
                                    <div 
                                        className="moderation-dropdown"
                                        onMouseEnter={handleModerationMenuOpen}
                                        onMouseLeave={handleModerationMenuClose}
                                    >
                                        <Link to="/moderation/concerts" className="moderation-menu-item">
                                            Концерты
                                        </Link>
                                        <div className="moderation-menu-item disabled">Пользователи</div>
                                        <div className="moderation-menu-item disabled">Комментарии</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <Link to="/login" className="header-link">Войти</Link>
                )}
            </div>
        </header>
    );
};

export default Header;
