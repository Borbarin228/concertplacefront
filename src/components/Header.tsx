// components/Header.jsx
// @ts-ignore
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { authService } from '../services/authService';
import Login from './Login';

import { Button, Menu, MenuItem } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';

const isAdminUser = (user: any) => {
    const v = user?.is_admin;
    return v === true || v === 1 || v === '1';
};

const Header = () => {
    const [infoAnchorEl, setInfoAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [moderationAnchorEl, setModerationAnchorEl] = useState<null | HTMLElement>(null);


    const handleUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setInfoAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setInfoAnchorEl(null);
    };

    useEffect(() => {
        checkAuth();
    }, [location.pathname]);

    const checkAuth = () => {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        const userStr = localStorage.getItem('user');
        let user: any = null;

        if (userStr) {
            try {
                user = JSON.parse(userStr);
            } catch (e) {
                console.error('Error parsing user data in Header:', e);
            }
        }

        const id = authService.getUserId();
        setUserId(id ?? null);

        const adminFlag = isAdminUser(user);
        setIsAdmin(authenticated && adminFlag);
    };

    // @ts-ignore
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

    const handleModerationMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setModerationAnchorEl(event.currentTarget);
    };

    const handleModerationMenuClose = () => {
        setModerationAnchorEl(null);
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

            <div>
                <Button
                id = "info-menu-button"
                aria-controls={infoAnchorEl ? "info-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={infoAnchorEl ? "true" : undefined}
                onMouseEnter={handleUserMenuOpen}
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
                id = "info-menu"
                anchorEl={infoAnchorEl}
                open={Boolean(infoAnchorEl)}
                onClose={handleUserMenuClose}
                MenuListProps={{
                    onMouseLeave: handleUserMenuClose,
                    onMouseEnter: ()=>{},
                }}
                sx={{
                    pointerEvents: 'auto', // Разрешаем взаимодействие
                    '& .MuiPaper-root': {
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    },
                }}
                >
                    <MenuItem onClick={()=>navigate('/main#info')}>
                        ИНФОРМАЦИЯ
                    </MenuItem>

                    <MenuItem onClick={()=>navigate('/main#about-us')}>
                        О НАС
                    </MenuItem>

                    <MenuItem onClick={()=>navigate('/main#offer')}>
                        ЧТО МЫ ПРЕДЛАГАЕМ
                    </MenuItem>


                </Menu>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '20px', position: 'relative'}}>

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
                                        },
                                        '& .MuiMenuItem-root': {
                                            fontSize: '1rem',
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
                    <Link to="/login" className="header-link">Войти</Link>
                )}
            </div>
        </header>
    );
};

export default Header;
