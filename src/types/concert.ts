export interface ConcertUser{
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

export interface TicketCategory{
    id: number;
    name: string;
    description: string;
    price: number;
}

export interface Concert{
    id: number;
    city: string;
    place: string;
    start_at: string;
    is_accepted: boolean;
    user_id: number;
    user?: ConcertUser;
    ticket_categories?: TicketCategory[];
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
    path?: string;
    links?: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface ApiResponse{
    data: Concert[];
    success: boolean;
    links?:{
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta?: PaginationMeta
}