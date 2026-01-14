export const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000/api',
    ENDPOINTS:{
        AUTH:{
            LOGIN: '/login',
            REGISTER: '/register',
            LOGOUT: '/logout',
        },
        USERS:{
            BASE_METH:'/users',
            GETTERS:{
                GET_TICKETS:'/tickets',
                GET_CATEGORIES:'/ticket-categories',
            },
        },
        CONCERTS:{
            BASE_METH: '/concerts',
            GETTERS: {
                GET_COMMENTS:'/comments',
                GET_USER:'/user',
            },

        },
        TICKETS:{
            BASE_METH:'/tickets',
        },
        COMMENTS:{
            BASE_METH:'/comments',
        },
        TICKET_CATEGORIES:{
            BASE_METH:'/ticket-categories',
        },
    },
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
}