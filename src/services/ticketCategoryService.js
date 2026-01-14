import api from './api.js'
import {API_CONFIG} from "../config/api.js";
const BASE = API_CONFIG.ENDPOINTS.TICKET_CATEGORIES.BASE_METH

export const ticketCategoryService = {
    getAll: () =>
        api.get(BASE),
    createCategory: (categoryData) =>
        api.post(BASE, categoryData),
    deleteCategory: (id) =>
        api.delete(`${BASE}/${id}`),
    updateCategory: (id, categoryData) =>
        api.put(`${BASE}/${id}`, categoryData),

}