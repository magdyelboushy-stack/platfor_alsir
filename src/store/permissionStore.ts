/**
 * Permission Store
 * Zustand store for managing user permissions (RBAC)
 */

import { create } from 'zustand';
import { apiClient } from '@/core/api/client';

interface PermissionState {
    permissions: string[];
    role: string;
    teacherId: string | null;
    isLoaded: boolean;

    // Methods
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasModuleAccess: (module: string) => boolean;
    fetchPermissions: () => Promise<void>;
    reset: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
    permissions: [],
    role: '',
    teacherId: null,
    isLoaded: false,

    /**
     * Check if user has a specific permission
     * @param permission - Full permission string (e.g., 'students:view')
     */
    hasPermission: (permission: string) => {
        const { permissions, role } = get();

        // Admin and Teacher have all permissions
        if (['admin', 'teacher'].includes(role) || permissions.includes('*')) {
            return true;
        }

        // Direct match
        if (permissions.includes(permission)) {
            return true;
        }

        // Module-level check (e.g., 'students' grants 'students:view')
        const [module] = permission.split(':');
        return permissions.includes(module);
    },

    /**
     * Check if user has any of the given permissions
     */
    hasAnyPermission: (permissionList: string[]) => {
        const { hasPermission } = get();
        return permissionList.some(p => hasPermission(p));
    },

    /**
     * Check if user can access a module (any action within it)
     */
    hasModuleAccess: (module: string) => {
        const { permissions, role } = get();

        if (['admin', 'teacher'].includes(role) || permissions.includes('*')) {
            return true;
        }

        // Check for module-level permission
        if (permissions.includes(module)) {
            return true;
        }

        // Check if any permission starts with this module
        return permissions.some(p => p.startsWith(`${module}:`));
    },

    /**
     * Fetch current user's permissions from API
     */
    fetchPermissions: async () => {
        try {
            const { data } = await apiClient.get('/admin/permissions/current');
            set({
                permissions: data.permissions || [],
                role: data.role || '',
                teacherId: data.teacherId || null,
                isLoaded: true
            });
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            set({ isLoaded: true }); // Mark as loaded even on error
        }
    },

    /**
     * Reset permissions (on logout)
     */
    reset: () => {
        set({
            permissions: [],
            role: '',
            teacherId: null,
            isLoaded: false
        });
    }
}));

/**
 * Hook for checking a single permission
 */
export function useHasPermission(permission: string): boolean {
    return usePermissionStore(s => s.hasPermission)(permission);
}

/**
 * Hook for checking module access
 */
export function useCanAccessModule(module: string): boolean {
    return usePermissionStore(s => s.hasModuleAccess)(module);
}
