import api from './api.js';
import {API_CONFIG} from "../config/api.js";

export const authService = {
    login: (credentials)=>
        api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),

    register: (userData)=>
        api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData),

    logout: () => {
        // Для Laravel Sanctum может потребоваться заголовок
        return api.get(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
            }
        })
            .finally(() => {
                // Очищаем localStorage в любом случае
                localStorage.removeItem('token');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('id');
                localStorage.removeItem('user');
                sessionStorage.clear(); // Если используете sessionStorage
            });
    },



    isAuthenticated: () => {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        return !!token;
    },
    getUserId: () => {
        const userId = localStorage.getItem('user_id');

        if (userId) {
            return parseInt(userId, 10);
        }},
    getToken: () => {
        return localStorage.getItem('token') || localStorage.getItem('access_token');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error('Error parsing user data:', e);
                return null;
            }
        }
        return null;
    }

};