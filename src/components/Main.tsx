
// @ts-ignore
import React, { useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import './Main.css';
// @ts-ignore
import artist1 from '../assets/artist1.png';
// @ts-ignore
import artist2 from '../assets/artist2.png';

const Main: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Функция для скролла к секции - ИСПРАВЛЕННАЯ
    const scrollToSection = (sectionId: string) => {
        console.log('scrollToSection called with id:', sectionId);

        const element = document.getElementById(sectionId);

        if (element) {
            const headerOffset = 80;


            const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementTop - headerOffset;


            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });


            setTimeout(() => {
                window.scrollBy(0, -headerOffset);
            }, 100);

        } else {
            console.error(`Element with id "${sectionId}" not found!`);
        }
    };

    useEffect(() => {


        if (location.hash) {
            const sectionId = location.hash.substring(1);


            const attemptScroll = () => {
                console.log('Attempting scroll...');
                scrollToSection(sectionId);
            };


            const timer = setTimeout(attemptScroll, 100);

            return () => {

                clearTimeout(timer);

            };
        }
    }, [location]);

    return (
        <div className='main-container' id='info'>
            <div className="composition-wrap">
                <div className="hero-row">
                    <div style={{position: 'relative'}}>
                        <img
                            src={artist1}
                            alt="Main 1"
                            className="hero-img"
                        />
                        <div className="red-square red1"></div>
                    </div>
                    <div className="red-center"></div>
                    <div className="center-col">
                        <button
                            onClick={() => navigate('/login')}
                            className="main-btn"
                        >
                            Войти
                        </button>
                        <div className="register-link">
                            <Link to="/register">Регистрация</Link>
                        </div>
                    </div>
                    <div style={{position: 'relative'}}>
                        <img
                            src={artist2}
                            alt="Main 2"
                            className="hero-img"
                        />
                        <div className="red-square red2"></div>
                    </div>
                </div>
            </div>

            <div id="about-us" className="about-section">
                <div className="about-title">О НАС</div>
                <div className="about-grid">
                    <div className="about-text">
                        <span className="red">МЫ — ПЛАТФОРМА</span>, разработанная для артистов и организаторов мероприятий, чтобы упростить процесс анонсирования концертов и управления событиями.<br />
                        <span className="red">НАША ЦЕЛЬ</span> — создать удобное и эффективное пространство, где музыканты и исполнители могут легко делиться информацией о своих выступлениях и взаимодействовать с аудиторией.
                    </div>
                    <img
                        src={artist1}
                        className="about-img"
                        alt="Концерт 1"
                    />
                    <img
                        src={artist2}
                        className="about-img"
                        alt="Концерт 2"
                    />
                    <div className="about-text">
                        <span className="red">МЫ СТРЕМИМСЯ ПОДДЕРЖИВАТЬ</span> артистов в продвижении их концертов, предоставляя удобные инструменты для планирования, анонсирования и продажи билетов. Мы верим в возможности для артистов, чтобы быть услышанными и видимыми, и хотим сделать процесс организации концертов максимально простым и доступным.
                    </div>
                    <div className="about-text">
                        <span className="red">КОМАНДА СОСТОИТ ИЗ</span> экспертов в области музыки и технологий, которые понимают потребности артистов и организаторов мероприятий. Мы заботимся о том, чтобы помогать артистам достичь своих целей и сделать их концерты заметными и успешными.
                    </div>
                    <img
                        src={artist1}
                        className="about-img"
                        alt="Концерт 3"
                    />
                </div>
            </div>

            <div id="offer" className="artist-section">
                <div className="artist-title">ЧТО МЫ ПРЕДЛАГАЕМ</div>
                <div className="artist-features">
                    <div className="artist-feature">
                        <img
                            src={artist1}
                            className="artist-icon"
                            alt="calendar"
                        />
                        <div>
                            <div className="artist-feature-title">Простая публикация мероприятий:</div>
                            Артисты могут без труда создавать и размещать информацию о своих концертах, в том числе дату, время, место и цены на билеты.
                        </div>
                    </div>
                    <div className="artist-feature">
                        <img
                            src={artist2}
                            className="artist-icon"
                            alt="guitar"
                        />
                        <div>
                            <div className="artist-feature-title">Личный профиль:</div>
                            Каждый артист имеет возможность создать свою страницу, где можно разместить биографию, фотографии, ссылки на социальные сети и предстоящие события.
                        </div>
                    </div>
                    <div className="artist-feature">
                        <img
                            src={artist1}
                            className="artist-icon"
                            alt="ticket"
                        />
                        <div>
                            <div className="artist-feature-title">Интеграция с продажей билетов:</div>
                            Мы предоставляем инструменты для продажи билетов прямо через платформу, упрощая процесс для пользователя.
                        </div>
                    </div>
                    <div className="artist-feature">
                        <img
                            src={artist2}
                            className="artist-icon"
                            alt="feedback"
                        />
                        <div>
                            <div className="artist-feature-title">Обратная связь:</div>
                            Фанаты могут оставлять отзывы и комментарии, создавая активное сообщество вокруг артистов.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Main;