import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import type { ApiError } from '@/core/types/common';

const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://elsirelshamy.alwaysdata.net/api');

export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const { tokens, csrfToken, fetchCsrfToken } = useAuthStore.getState();

        if (tokens?.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }

        const method = (config.method || 'get').toUpperCase();
        if (method !== 'GET') {
            let tokenToUse = csrfToken;
            if (!tokenToUse) {
                tokenToUse = await fetchCsrfToken();
            }
            if (tokenToUse) {
                config.headers['X-CSRF-Token'] = tokenToUse;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
            if (window.location.pathname === '/login' || window.location.pathname === '/register') {
                return Promise.reject(error);
            }

            const { tokens, logout, refreshAccessToken } = useAuthStore.getState();
            const { showToast } = useUIStore.getState();

            if (tokens?.refreshToken) {
                try {
                    await refreshAccessToken();
                    const newTokens = useAuthStore.getState().tokens;
                    if (newTokens?.accessToken && originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                        return apiClient(originalRequest);
                    }
                } catch {
                    logout();
                    showToast({
                        type: 'warning',
                        title: 'إنتهت الجلسة',
                        message: 'يرجى تسجيل الدخول مرة أخرى لمتابعة الاستخدام.',
                    });
                }
            } else {
                logout();
                const backendMsg = error.response?.data?.error || error.response?.data?.message;
                showToast({
                    type: 'error',
                    title: 'تنبيه الأمان',
                    message: backendMsg || 'تم تسجيل الخروج، يرجى التحقق من حالة حسابك.',
                });
            }
        }

        if (error.response?.status === 403) {
            const { showToast } = useUIStore.getState();
            const backendMsg = error.response.data?.error || error.response.data?.message;
            showToast({
                type: 'error',
                title: 'دخول غير مصرح',
                message: backendMsg || 'ليس لديك الصلاحية للقيام بهذا الإجراء.',
            });
        }

        return Promise.reject(error);
    }
);
export const api = {
    get: <T>(url: string, config?: object) =>
        apiClient.get<T>(url, config).then((res) => res.data),

    post: <T>(url: string, data?: object, config?: object) =>
        apiClient.post<T>(url, data, config).then((res) => res.data),

    put: <T>(url: string, data?: object, config?: object) =>
        apiClient.put<T>(url, data, config).then((res) => res.data),

    patch: <T>(url: string, data?: object, config?: object) =>
        apiClient.patch<T>(url, data, config).then((res) => res.data),

    delete: <T>(url: string, config?: object) =>
        apiClient.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;
