import api from './api.js'
import {API_CONFIG} from "../config/api.js";
const BASE = API_CONFIG.ENDPOINTS.USERS.BASE_METH

export const userService = {
    getAll: () =>
        api.get(BASE),
    getById: (id) =>
        api.get(`${BASE}/${id}`),
    updateUser: (id, userData) => {
        // Если это FormData, используем POST с _method: PUT для Laravel
        if (userData instanceof FormData) {
            return api.post(`${BASE}/${id}`, userData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
        }
        // Иначе используем обычный PUT
        return api.put(`${BASE}/${id}`, userData);
    },
    deleteUser: (id) =>
        api.delete(`${BASE}/${id}`),
    getTickets: (id) =>
        api.get(`${BASE}/${id}/${API_CONFIG.ENDPOINTS.USERS.GETTERS.GET_TICKETS}`),
    getTicketCategories: (id) =>
        api.get(`${BASE}/${id}/${API_CONFIG.ENDPOINTS.USERS.GETTERS.GET_CATEGORIES}`),

}