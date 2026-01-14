// @ts-ignore
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Menu, MenuItem } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import './MenuBar.css';

interface Section {
    id: string;
    label: string;
}

const sections: Section[] = [
    { id: 'about-us', label: 'О НАС' },
    { id: 'offer', label: 'ЧТО МЫ ПРЕДЛАГАЕМ' }
];

const MenuBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Отменяем таймер закрытия, если он есть
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            setCloseTimeout(null);
        }
        setAnchorEl(event.currentTarget);
    };

    const handleMouseLeave = () => {
        // Добавляем небольшую задержку перед закрытием
        const timeout = setTimeout(() => {
            setAnchorEl(null);
        }, 200);
        setCloseTimeout(timeout);
    };

    const handleMenuMouseEnter = () => {
        // Отменяем таймер закрытия при наведении на меню
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            setCloseTimeout(null);
        }
    };

    const handleMenuMouseLeave = () => {
        setAnchorEl(null);
    };

    // Cleanup таймера при размонтировании
    useEffect(() => {
        return () => {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
            }
        };
    }, [closeTimeout]);

    const handleSectionClick = (sectionId: string) => {
        setAnchorEl(null);
        
        // Если мы не на странице Main, переходим на неё
        if (location.pathname !== '/main') {
            navigate('/main');
            // Ждём немного, чтобы страница загрузилась, затем прокручиваем
            setTimeout(() => {
                scrollToSection(sectionId);
            }, 100);
        } else {
            // Если уже на странице Main, просто прокручиваем
            scrollToSection(sectionId);
        }
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 80; // Высота хэдера
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="menu-bar">
            <Button
                id="sections-button"
                aria-controls={open ? 'sections-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                endIcon={<ArrowDropDown />}
                sx={{
                    color: '#ffffff',
                    textTransform: 'none',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' },
                    padding: { xs: '2px 6px', sm: '2px 8px' },
                    minWidth: 'auto',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                Информация
            </Button>
            <Menu
                id="sections-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                MenuListProps={{
                    'aria-labelledby': 'sections-button',
                    onMouseEnter: handleMenuMouseEnter,
                    onMouseLeave: handleMenuMouseLeave,
                }}
                sx={{
                    pointerEvents: open ? 'auto' : 'none',
                    '& .MuiPaper-root': {
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    },
                    '& .MuiMenuItem-root': {
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        },
                    },
                }}
            >
                {sections.map((section) => (
                    <MenuItem 
                        key={section.id} 
                        onClick={() => handleSectionClick(section.id)}
                    >
                        {section.label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default MenuBar;
