import api from './api.js';
import {API_CONFIG} from "../config/api.js";
const BASE = API_CONFIG.ENDPOINTS.TICKETS.BASE_METH

export const ticketService = {
    createTicket: (ticketData) =>
        api.post(BASE, ticketData),

    deleteTicket: (id) =>
        api.delete(`${BASE}/${id}`),

}