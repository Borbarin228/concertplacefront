// components/Header.jsx
// @ts-ignore
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { useAuthStore } from '../stores/authStore';
import { Button, Menu, MenuItem } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        user,
        isAuthenticated,
        isAdmin,
        userId,
        checkAuth,
        logout,
        initialize
    } = useAuthStore();


    const [infoAnchorEl, setInfoAnchorEl] = useState<null | HTMLElement>(null);
    const [moderationAnchorEl, setModerationAnchorEl] = useState<null | HTMLElement>(null);


    useEffect(() => {
        initialize();
    }, []);


    useEffect(() => {
        checkAuth();
    }, [location.pathname]);


    const handleInfoMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setInfoAnchorEl(event.currentTarget);
    };

    const handleInfoMenuClose = () => {
        setInfoAnchorEl(null);
    };

    const handleModerationMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setModerationAnchorEl(event.currentTarget);
    };

    const handleModerationMenuClose = () => {
        setModerationAnchorEl(null);
    };


    // @ts-ignore
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        }
    };


    const getUserDisplayName = () => {
        if (!user) return 'Профиль';
        return user.name || 'Профиль';
    };

    return (
        <header className="header-bar">

            <div className="header-logo">
                <Link to="/" style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <span className="header-logo-icon">CE</span>
                </Link>
            </div>


            <div className="header-center">
                <Link to="/concert/list" style={{
                    color: 'inherit',
                    textDecoration: 'none'
                }}>
                    Афиша
                </Link>
            </div>


            <div className="info-menu-container">
                <Button
                    id="info-menu-button"
                    aria-controls={infoAnchorEl ? "info-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={infoAnchorEl ? "true" : undefined}
                    onMouseEnter={handleInfoMenuOpen}
                    onClick={handleInfoMenuOpen}
                    endIcon={<ArrowDropDown />}
                    sx={{
                        color: '#ffffff',
                        textTransform: 'none',
                        fontSize: '1.05rem',
                        padding: '4px 10px',
                        minWidth: 'auto',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                    }}
                >
                    ИНФОРМАЦИЯ
                </Button>

                <Menu
                    id="info-menu"
                    anchorEl={infoAnchorEl}
                    open={Boolean(infoAnchorEl)}
                    onClose={handleInfoMenuClose}
                    MenuListProps={{
                        onMouseLeave: handleInfoMenuClose,
                        onMouseEnter: () => {}, // Пустая функция для предотвращения закрытия
                    }}
                    sx={{
                        pointerEvents: 'auto',
                        '& .MuiPaper-root': {
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            minWidth: '200px',
                        },
                        '& .MuiMenuItem-root': {
                            fontSize: '1rem',
                            padding: '10px 16px',
                        },
                    }}
                >
                    <MenuItem onClick={() => {
                        handleInfoMenuClose();
                        navigate('/main#info');
                    }}>
                        ИНФОРМАЦИЯ
                    </MenuItem>

                    <MenuItem onClick={() => {
                        handleInfoMenuClose();
                        navigate('/main#about-us');
                    }}>
                        О НАС
                    </MenuItem>

                    <MenuItem onClick={() => {
                        handleInfoMenuClose();
                        navigate('/main#offer');
                    }}>
                        ЧТО МЫ ПРЕДЛАГАЕМ
                    </MenuItem>
                </Menu>
            </div>

            {/* Правая часть: профиль и меню */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                position: 'relative'
            }}>
                {isAuthenticated ? (
                    <>

                        <div className="profile-menu-container">
                            <Button
                                id="profile-menu-button"
                                aria-controls={infoAnchorEl ? "profile-menu" : undefined}
                                aria-haspopup="true"
                                aria-expanded={infoAnchorEl ? "true" : undefined}
                                onClick={() => navigate('/profile')}
                                sx={{
                                    color: '#ffffff',
                                    textTransform: 'none',
                                    fontSize: '1.05rem',
                                    padding: '4px 10px',
                                    minWidth: 'auto',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                {getUserDisplayName()}
                            </Button>
                        </div>


                        <button
                            type="button"
                            onClick={handleLogout}
                            className="header-link header-link-button"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '1.05rem',
                                padding: '4px 10px',
                                textDecoration: 'none',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Выйти
                        </button>


                        {isAdmin() && (
                            <div className="moderation-menu-container">
                                <Button
                                    id="moderation-button"
                                    aria-controls={moderationAnchorEl ? 'moderation-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={moderationAnchorEl ? 'true' : undefined}
                                    onClick={handleModerationMenuOpen}
                                    endIcon={<ArrowDropDown />}
                                    sx={{
                                        color: '#ffffff',
                                        textTransform: 'none',
                                        fontSize: '1.05rem',
                                        padding: '4px 10px',
                                        minWidth: 'auto',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                        }
                                    }}
                                >
                                    Модерация
                                </Button>

                                <Menu
                                    id="moderation-menu"
                                    anchorEl={moderationAnchorEl}
                                    open={Boolean(moderationAnchorEl)}
                                    onClose={handleModerationMenuClose}
                                    sx={{
                                        '& .MuiPaper-root': {
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            minWidth: '180px',
                                        },
                                        '& .MuiMenuItem-root': {
                                            fontSize: '1rem',
                                            padding: '10px 16px',
                                        },
                                    }}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            handleModerationMenuClose();
                                            navigate('/moderation/concerts');
                                        }}
                                    >
                                        Концерты
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => {
                                            handleModerationMenuClose();
                                            navigate('/moderation/users');
                                        }}
                                    >
                                        Пользователи
                                    </MenuItem>
                                </Menu>
                            </div>
                        )}
                    </>
                ) : (

                    <Link to="/login" className="header-link">
                        Войти
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;