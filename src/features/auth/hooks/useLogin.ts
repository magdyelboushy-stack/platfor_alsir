// ============================================================
// useLogin - Custom Hook for Authentication
// ============================================================

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import type { LoginCredentials } from '../types';

interface UseLoginReturn {
    login: (credentials: LoginCredentials) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

export function useLogin(): UseLoginReturn {
    const navigate = useNavigate();
    const authLogin = useAuthStore((state) => state.login);
    const showToast = useUIStore((state) => state.showToast);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);

        try {
            await authLogin(credentials.email, credentials.password);

            showToast({
                type: 'success',
                title: 'Welcome back!',
                message: 'You have successfully logged in.',
            });

            // Navigate to dashboard based on role
            navigate('/dashboard');
        } catch (err: any) {
            if (err.response?.data?.code === 'EMAIL_VERIFICATION_REQUIRED') {
                // We let the component handle this specific state
                throw err;
            }

            const errorMessage = err.response?.data?.error || err.message || 'Invalid email or password. Please try again.';
            setError(errorMessage);

            showToast({
                type: 'error',
                title: 'Login Failed',
                message: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }, [authLogin, navigate, showToast]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        login,
        isLoading,
        error,
        clearError,
    };
}

// ============================================================
// useLogout Hook
// ============================================================
export function useLogout() {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const showToast = useUIStore((state) => state.showToast);

    const handleLogout = useCallback(() => {
        logout();
        showToast({
            type: 'info',
            title: 'Logged Out',
            message: 'You have been successfully logged out.',
        });
        navigate('/login');
    }, [logout, navigate, showToast]);

    return handleLogout;
}
