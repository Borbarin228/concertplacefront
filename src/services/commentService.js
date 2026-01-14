import api from './api.js'
import {API_CONFIG} from "../config/api.js";
const BASE = API_CONFIG.ENDPOINTS.COMMENTS.BASE_METH

export const commentService = {
    createComment: (commentData) =>
        api.post(BASE, commentData),
    updateComment: (id, commentData) =>
        api.put(`${BASE}/${id}`, commentData),
    deleteComment: (id) =>
        api.delete(`${BASE}/${id}`),
}