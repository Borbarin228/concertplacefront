// src/services/concertService.js
import api from './api.js';
import { API_CONFIG } from "../config/api.js";

const BASE = API_CONFIG.ENDPOINTS.CONCERTS?.BASE_METH || '/concerts';

export const concertService = {
    getAll: (page = 1, perPage = null) => {
        let url = `${BASE}?page=${page}`;
        if (perPage) {
            url += `&per_page=${perPage}`;
        }
        return api.get(url);
    },

    getById: (id) =>
        api.get(`${BASE}/${id}`),

    // Метод создания концерта
    create: (concertData) =>
        api.post(BASE, concertData),

    update: (id, concertData) =>
        api.put(`${BASE}/${id}`, concertData),

    delete: (id) =>
        api.delete(`${BASE}/${id}`),
    
    // Метод подтверждения концерта для модерации
    accept: (id) => {
        // Используем POST для маршрута accept
        return api.post(`${BASE}/${id}/accept`, {});
    },
};