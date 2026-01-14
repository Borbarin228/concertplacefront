// components/Layout.jsx
// @ts-ignore
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import './Layout.css';
const Layout = () => {
    return (
        <>
            <Header />
            <main className = "layout">
                <Outlet /> {/* Здесь будут отображаться дочерние страницы */}
            </main>
            <Footer />
        </>
    );
};

export default Layout;