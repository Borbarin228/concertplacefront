// src/stores/concertStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { concertService } from '../services/concertService';
import { authService } from '../services/authService';
import type { Concert, PaginationMeta } from '../types/concert';

interface ConcertState {

    concerts: Concert[];
    concertsLoading: boolean;
    concertsError: string | null;
    concertsPagination: PaginationMeta;


    acceptedConcerts: Concert[];
    acceptedLoading: boolean;
    acceptedError: string | null;
    acceptedPagination: PaginationMeta;


    selectedConcert: Concert | null;
    selectedLoading: boolean;
    selectedError: string | null;


    fetchConcerts: (page?: number, filters?: any) => Promise<void>;
    acceptConcert: (concertId: number) => Promise<void>;
    deleteConcert: (concertId: number) => Promise<void>;


    fetchAcceptedConcerts: (page?: number) => Promise<void>;


    fetchConcertById: (id: number) => Promise<void>;


    clearErrors: () => void;
    clearSelected: () => void;
}


// @ts-ignore
export const useConcertStore = create<ConcertState>()(
    persist(
        (set, get) => ({

            concerts: [],
            concertsLoading: false,
            concertsError: null,
            concertsPagination: {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0
            },

            acceptedConcerts: [],
            acceptedLoading: false,
            acceptedError: null,
            acceptedPagination: {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0
            },

            selectedConcert: null,
            selectedLoading: false,
            selectedError: null,

            // Действия
// @ts-ignore
            fetchConcerts: async (page = 1, filters = {}) => {
                try {
                    set({ concertsLoading: true, concertsError: null });

                    const response = await concertService.getAll(page);
                    const result = response.data;

                    if (result?.data && Array.isArray(result.data)) {
                        set({
                            concerts: result.data,
                            concertsPagination: result.meta || {
                                current_page: page,
                                last_page: 1,
                                per_page: 10,
                                total: result.data.length
                            }
                        });
                    } else {
                        set({ concerts: [] });
                    }
                } catch (error: any) {
                    console.error('Error fetching concerts:', error);

                    // Проверяем авторизацию
                    if (error.response?.status === 401) {
                        authService.logout();
                        window.location.href = '/login';
                    }

                    set({
                        concertsError: error.response?.data?.message || 'Ошибка при загрузке концертов'
                    });
                } finally {
                    set({ concertsLoading: false });
                }
            },
// @ts-ignore
            fetchAcceptedConcerts: async (page = 1) => {
                try {
                    set({ acceptedLoading: true, acceptedError: null });

                    const response = await concertService.getAll(page);
                    const result = response.data;

                    if (result?.data && Array.isArray(result.data)) {
                        const acceptedConcerts = result.data.filter(
                            (concert: Concert) => concert.is_accepted === true
                        );

                        set({
                            acceptedConcerts,
                            acceptedPagination: result.meta || {
                                current_page: page,
                                last_page: 1,
                                per_page: 10,
                                total: acceptedConcerts.length
                            }
                        });
                    } else {
                        set({ acceptedConcerts: [] });
                    }
                } catch (error: any) {
                    console.error('Error fetching accepted concerts:', error);

                    if (error.response?.status === 401) {
                        authService.logout();
                        window.location.href = '/login';
                    }

                    set({
                        acceptedError: error.response?.data?.message || 'Ошибка при загрузке концертов'
                    });
                } finally {
                    set({ acceptedLoading: false });
                }
            },
// @ts-ignore
            acceptConcert: async (concertId: number) => {
                try {
                    // Оптимистичное обновление
                    set(state => ({
                        concerts: state.concerts.map(concert =>
                            concert.id === concertId
                                ? { ...concert, is_accepted: true }
                                : concert
                        )
                    }));

                    await concertService.accept(concertId);

                } catch (error: any) {
                    console.error('Error accepting concert:', error);

                    // Откатываем оптимистичное обновление при ошибке
                    set(state => ({
                        concerts: state.concerts.map(concert =>
                            concert.id === concertId
                                ? { ...concert, is_accepted: false }
                                : concert
                        ),
                        concertsError: error.response?.data?.message || 'Не удалось подтвердить концерт'
                    }));

                    throw error;
                }
            },
// @ts-ignore
            deleteConcert: async (concertId: number) => {
                try {
                    // Оптимистичное удаление
                    set(state => ({
                        concerts: state.concerts.filter(concert => concert.id !== concertId),
                        acceptedConcerts: state.acceptedConcerts.filter(
                            concert => concert.id !== concertId
                        ),
                        selectedConcert: state.selectedConcert?.id === concertId
                            ? null
                            : state.selectedConcert
                    }));

                    await concertService.delete(concertId);

                } catch (error: any) {
                    console.error('Error deleting concert:', error);

                    // При ошибке нужно заново загрузить данные
                    await get().fetchConcerts(get().concertsPagination.current_page);
                    await get().fetchAcceptedConcerts(get().acceptedPagination.current_page);

                    set({
                        concertsError: error.response?.data?.message || 'Не удалось удалить концерт'
                    });

                    throw error;
                }
            },
// @ts-ignore
            fetchConcertById: async (id: number) => {
                try {
                    set({ selectedLoading: true, selectedError: null });

                    const response = await concertService.getById(id);
                    const concert = response.data;

                    set({ selectedConcert: concert });

                } catch (error: any) {
                    console.error('Error fetching concert:', error);

                    set({
                        selectedError: error.response?.data?.message || 'Ошибка при загрузке концерта'
                    });
                } finally {
                    set({ selectedLoading: false });
                }
            },

            clearErrors: () => {
                set({
                    concertsError: null,
                    acceptedError: null,
                    selectedError: null
                });
            },

            clearSelected: () => {
                set({
                    selectedConcert: null,
                    selectedError: null
                });
            }
        }),
        {
            name: 'concert-storage', // название ключа в localStorage
            partialize: (state) => ({
                // Сохраняем только определенные поля в localStorage
                acceptedConcerts: state.acceptedConcerts,
                acceptedPagination: state.acceptedPagination,
                concertsPagination: state.concertsPagination
            })
        }
    )
);