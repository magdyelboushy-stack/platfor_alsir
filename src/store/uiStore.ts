// ============================================================
// UI Store - Global UI State Management
// ============================================================

import { create } from 'zustand';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
}

interface UIState {
    // Sidebar
    isSidebarOpen: boolean;
    isSidebarCollapsed: boolean;

    // Modals
    activeModal: string | null;
    modalData: Record<string, unknown>;

    // Toasts
    toasts: Toast[];

    // Theme
    theme: 'light' | 'dark';

    // Loading overlays
    globalLoading: boolean;
}

interface UIActions {
    // Sidebar
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebarCollapse: () => void;

    // Modals
    openModal: (modalId: string, data?: Record<string, unknown>) => void;
    closeModal: () => void;

    // Toasts
    showToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;

    // Theme
    toggleTheme: () => void;

    // Loading
    setGlobalLoading: (loading: boolean) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
    // Initial State
    isSidebarOpen: true,
    isSidebarCollapsed: false,
    activeModal: null,
    modalData: {},
    toasts: [],
    theme: 'dark',
    globalLoading: false,

    // Sidebar Actions
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    toggleSidebarCollapse: () => set((state) => ({
        isSidebarCollapsed: !state.isSidebarCollapsed
    })),

    // Modal Actions
    openModal: (modalId, data = {}) => set({
        activeModal: modalId,
        modalData: data
    }),
    closeModal: () => set({ activeModal: null, modalData: {} }),

    // Toast Actions
    showToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: Toast = { ...toast, id };

        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto-remove after duration
        const duration = toast.duration ?? 5000;
        setTimeout(() => {
            get().removeToast(id);
        }, duration);
    },

    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
    })),

    // Theme Actions
    toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
    })),

    // Loading Actions
    setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));

// Convenience hooks
export const useSidebar = () => useUIStore((state) => ({
    isOpen: state.isSidebarOpen,
    isCollapsed: state.isSidebarCollapsed,
    toggle: state.toggleSidebar,
    toggleCollapse: state.toggleSidebarCollapse,
}));

export const useToast = () => useUIStore((state) => ({
    toasts: state.toasts,
    show: state.showToast,
    remove: state.removeToast,
}));
