// App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ConcertList from "./components/ConcertList";
import ConcertPage from "./components/ConcertPage";
import CreateConcert from "./components/CreateConcert";
import ModerationConcerts from "./components/ModerationConcerts";
import Main from "./components/Main";
import Layout from "./components/Layout";
import ModerationUsers from "./components/ModerationUsers";

// Ленивая загрузка компонента Profile
const Profile = React.lazy(() => import('./components/Profile'));

// Компонент для защищенных маршрутов
// Компонент для защищенных маршрутов (JavaScript версия)
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token') !== null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Компонент для маршрутов администратора
const AdminRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token') !== null;
    const userStr = localStorage.getItem('user');
    let isAdmin = false;

    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            isAdmin = user?.is_admin === true || user?.is_admin === 1;
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/main" replace />;
    }

    return children;
};


const PublicRoute = ({ children, allowAuthenticated = false }) => {
    const isAuthenticated = localStorage.getItem('token') !== null;


    if (isAuthenticated && !allowAuthenticated) {
        return <Navigate to="/main" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Layout />}>

                        <Route index element={<Navigate to="/main" replace />} />
                        <Route path="login" element={
                            <PublicRoute allowAuthenticated={true}>
                                <Login />
                            </PublicRoute>
                        } />
                        <Route path="register" element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        } />
                        <Route path="main" element={<Main />} />


                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Suspense fallback={
                                    <div className="loading-spinner">
                                        <div className="spinner"></div>
                                        <p>Загрузка профиля...</p>
                                    </div>
                                }>
                                    <Profile />
                                </Suspense>
                            </ProtectedRoute>
                        } />


                        <Route path="/concert">
                            <Route index element={
                                <ProtectedRoute>
                                    <Navigate to="/concert/list" replace />
                                </ProtectedRoute>
                            } />
                            <Route path="list" element={
                                <ProtectedRoute>
                                    <ConcertList />
                                </ProtectedRoute>
                            } />
                            <Route path=":id" element={
                                <ProtectedRoute>
                                    <ConcertPage />
                                </ProtectedRoute>
                            } />
                            <Route path="create" element={
                                <ProtectedRoute>
                                    <CreateConcert />
                                </ProtectedRoute>
                            } />
                        </Route>


                        <Route path="moderation">
                            <Route path="concerts" element={
                                <AdminRoute>
                                    <ModerationConcerts />
                                </AdminRoute>
                            } />
                            <Route path="users" element={
                                <AdminRoute>
                                    <ModerationUsers />
                                </AdminRoute>
                            } />
                        </Route>
                    </Route>

                    {/* Дополнительные маршруты, если нужно */}
                    <Route path="*" element={<Navigate to="/main" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;