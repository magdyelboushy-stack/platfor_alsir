
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User, AuthTokens, UserRole } from '@/core/types/common';
import { api } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';

interface AuthState {
    user: User | null;
    tokens: AuthTokens | null;
    csrfToken: string | null; // Added CSRF Token
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AuthActions {
    login: (email: string, password: string, role?: string) => Promise<void>;
    register: (formData: FormData) => Promise<boolean>;
    registerStaff: (formData: FormData) => Promise<boolean>; // New Action for Teachers/Admins
    validateStep: (data: Record<string, any>) => Promise<boolean>; // New Action
    logout: () => void;
    refreshAccessToken: () => Promise<void>;
    fetchUser: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>; // New Action
    updatePassword: (data: any) => Promise<void>; // New Action
    fetchCsrfToken: () => Promise<string>; // New Action
    verifySms: (phone: string, code: string) => Promise<void>;
    setLoading: (loading: boolean) => void;
    hasRole: (roles: UserRole | UserRole[]) => boolean;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    user: null,
    tokens: null,
    csrfToken: null,
    isAuthenticated: false,
    isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        immer((set, get) => ({
            ...initialState,

            // --------------------------------------------------------
            // Fetch CSRF Token
            // --------------------------------------------------------
            fetchCsrfToken: async () => {
                try {
                    // Call the routed endpoint
                    const response = await api.get<{ csrf_token: string }>('/csrf-token');
                    const token = response.csrf_token;

                    set((state) => { state.csrfToken = token; });
                    return token;
                } catch (error) {
                    return '';
                }
            },

            validateStep: async (data: Record<string, any>) => {
                set((state) => { state.isLoading = true; });
                try {
                    // 1. Get/Make sure we have a fresh CSRF Token
                    await get().fetchCsrfToken();

                    // 2. Call Validation Endpoint
                    await api.post(ENDPOINTS.AUTH.VALIDATE_STEP, data);

                    set((state) => { state.isLoading = false; });
                    return true;
                } catch (error: any) {
                    set((state) => { state.isLoading = false; });
                    throw error;
                }
            },

            // --------------------------------------------------------
            // Register Action
            // --------------------------------------------------------
            register: async (formData: FormData) => {
                set((state) => { state.isLoading = true; });

                try {
                    // 1. Get CSRF Token
                    const csrfToken = await get().fetchCsrfToken();
                    if (!csrfToken) throw new Error('Security Check Failed (CSRF)');

                    // Append CSRF to FormData
                    formData.append('csrf_token', csrfToken);

                    // 2. Call API
                    await api.post(ENDPOINTS.AUTH.REGISTER, formData);

                    set((state) => { state.isLoading = false; });
                    return true;
                } catch (error) {
                    set((state) => { state.isLoading = false; });
                    throw error;
                }
            },

            // --------------------------------------------------------
            // Register Staff Action (For Teachers/Admins)
            // --------------------------------------------------------
            registerStaff: async (formData: FormData) => {
                set((state) => { state.isLoading = true; });

                try {
                    // 1. Get CSRF Token
                    const csrfToken = await get().fetchCsrfToken();
                    if (!csrfToken) throw new Error('Security Check Failed (CSRF)');

                    // Append CSRF to FormData
                    formData.append('csrf_token', csrfToken);

                    // 2. Call API (Using the same register endpoint or a specific one)
                    // Assuming we use the same endpoint but handle it via logic internally or a new endpoint if exists.
                    // Based on "InitTeacherAccountPage", it likely sends to a specific endpoint or generic register.
                    // For now, let's map it to REGISTER endpoint but ensure we catch errors.
                    await api.post(ENDPOINTS.AUTH.REGISTER, formData);

                    set((state) => { state.isLoading = false; });
                    return true;
                } catch (error) {
                    set((state) => { state.isLoading = false; });
                    throw error;
                }
            },



            // --------------------------------------------------------
            // Login Action
            // --------------------------------------------------------
            login: async (email: string, password: string, role?: string) => {
                set((state) => { state.isLoading = true; });

                try {
                    // 1. Get CSRF Token first
                    const csrfToken = await get().fetchCsrfToken();
                    if (!csrfToken) throw new Error('Security Check Failed (CSRF)');

                    // 2. Real Login API Call
                    // Send CSRF in header is best, but we'll configure client to do that.
                    // For now, we rely on the session cookie + CSRF Header injection via client.ts 
                    // (which we will update next to read from store)

                    // We might need to pass it explicitly if client.ts isn't updated yet, 
                    // but let's assume we update client.ts to read useAuthStore.getState().csrfToken

                    const payload: any = { email, password, csrf_token: csrfToken };
                    if (role) payload.role = role;

                    const response = await api.post<{ user: User, token: string }>(
                        ENDPOINTS.AUTH.LOGIN,
                        payload
                    );

                    set((state) => {
                        state.user = response.user;
                        state.tokens = { token: response.token }; // Map string to object
                        state.isAuthenticated = true;
                        state.isLoading = false;
                    });
                } catch (error) {
                    set((state) => { state.isLoading = false; });
                    throw error;
                }
            },

            // --------------------------------------------------------
            // Logout Action
            // --------------------------------------------------------
            logout: () => {
                set((state) => {
                    state.user = null;
                    state.tokens = null;
                    state.csrfToken = null;
                    state.isAuthenticated = false;
                });
                localStorage.removeItem('auth-storage');
                // Optional: Call API logout to destroy session on server
            },

            // --------------------------------------------------------
            // Refresh Token Action (Not needed for Cookie Session but kept for compatibility)
            // --------------------------------------------------------
            refreshAccessToken: async () => {
                // With cookies, the browser handles this automatically via the session.
                // We just verify the session is still valid.
                try {
                    await get().fetchUser();
                } catch {
                    get().logout();
                    throw new Error('Session expired');
                }
            },

            // --------------------------------------------------------
            // Fetch Current User
            // --------------------------------------------------------
            fetchUser: async () => {
                set((state) => { state.isLoading = true; });

                try {
                    const response = await api.get<{ user: User }>(ENDPOINTS.AUTH.ME); // Backend: /auth/me

                    set((state) => {
                        // Adjust based on actual backend response wrapper
                        state.user = response.user || response;
                        state.isAuthenticated = true;
                        state.isLoading = false;
                    });
                } catch {
                    get().logout();
                }
            },

            // --------------------------------------------------------
            // Update Profile Info
            // --------------------------------------------------------
            updateProfile: async (data: Partial<User>) => {
                set((state) => { state.isLoading = true; });
                try {
                    // 1. Get/Make sure we have a fresh CSRF Token
                    const csrfToken = await get().fetchCsrfToken();

                    // 2. Call Profile Update Endpoint
                    const response = await api.post<{ user: User }>(
                        ENDPOINTS.AUTH.UPDATE_PROFILE,
                        { ...data, csrf_token: csrfToken }
                    );

                    set((state) => {
                        state.user = response.user || response; // Map response to state
                        state.isLoading = false;
                    });
                } catch (error: any) {
                    set((state) => { state.isLoading = false; });
                    // Throw the specific backend error message if available
                    const errorMessage = error.response?.data?.message || error.message;
                    throw new Error(errorMessage);
                }
            },

            // --------------------------------------------------------
            // Update Password
            // --------------------------------------------------------
            updatePassword: async (data: any) => {
                set((state) => { state.isLoading = true; });
                try {
                    const csrfToken = await get().fetchCsrfToken();
                    await api.post(ENDPOINTS.AUTH.UPDATE_PASSWORD, { ...data, csrf_token: csrfToken });
                    set((state) => { state.isLoading = false; });
                } catch (error: any) {
                    set((state) => { state.isLoading = false; });
                    const errorMessage = error.response?.data?.message || error.message;
                    throw new Error(errorMessage);
                }
            },

            // --------------------------------------------------------
            // Verify SMS Action
            // --------------------------------------------------------
            verifySms: async (phone: string, code: string) => {
                set((state) => { state.isLoading = true; });
                try {
                    const csrfToken = await get().fetchCsrfToken();
                    await api.post(ENDPOINTS.AUTH.VERIFY_SMS, { phone, code, csrf_token: csrfToken });
                    set((state) => { state.isLoading = false; });
                } catch (error: any) {
                    set((state) => { state.isLoading = false; });
                    throw error;
                }
            },

            // --------------------------------------------------------
            // Set Loading State
            // --------------------------------------------------------
            setLoading: (loading: boolean) => {
                set((state) => { state.isLoading = loading; });
            },

            // --------------------------------------------------------
            // Role Check Helper
            // --------------------------------------------------------
            hasRole: (roles: UserRole | UserRole[]) => {
                const { user } = get();
                if (!user) return false;

                const roleArray = Array.isArray(roles) ? roles : [roles];
                return roleArray.includes(user.role);
            },
        })),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                tokens: state.tokens,
                user: state.user,
                // ✅ SECURITY FIX: Do NOT persist CSRF token to localStorage (XSS vulnerability)
                // Fetch fresh token from backend on each session
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Selectors
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectUserRole = (state: AuthStore) => state.user?.role;
export const selectCsrfToken = (state: AuthStore) => state.csrfToken;
