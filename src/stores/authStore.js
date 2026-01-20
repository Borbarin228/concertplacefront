import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from "../services/authService.js";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const { user, token } = await authService.login(credentials);
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });
                    return { success: true, user };
                } catch (error) {
                    const errorMsg = error.response?.data?.message || error.message || 'Ошибка входа';
                    set({
                        error: errorMsg,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    return { success: false, error: errorMsg };
                }
            },


            checkAuth: () => {
                const isAuth = authService.isAuthenticated();
                const userStr = localStorage.getItem('user');
                const token = localStorage.getItem('token');

                let user = null;
                try {
                    user = userStr ? JSON.parse(userStr) : null;
                } catch (e) {
                    console.error('Error parse JSON: ', e);
                }

                set({
                    user: user || get().user,
                    token: token || get().token,
                    isAuthenticated: isAuth,
                });

                return isAuth;
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await authService.logout();
                } catch (error) {
                    console.error('Logout error: ', error);
                } finally {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    });

                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            },

            isAdmin: () => {
                const user = get().user;
                if (!user) return false;


                const v = user.is_admin;
                return v === true;
            },


            checkAdmin: () => {
                return get().isAdmin();
            },


            getUserId: () => {
                const user = get().user;
                return user?.id || null;
            },


            updateUser: (updates) => {
                const currentUser = get().user;
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...updates };
                    set({ user: updatedUser });
                    // Обновляем в localStorage для совместимости
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            },


            initialize: () => {
                const userStr = localStorage.getItem('user');
                const token = localStorage.getItem('token');

                if (userStr && token) {
                    try {
                        const user = JSON.parse(userStr);
                        set({
                            user,
                            token,
                            isAuthenticated: true,
                        });
                        return true;
                    } catch (e) {
                        console.error('Error initialize: ', e);
                    }
                }
                return false;
            },


            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',

            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);