/**
 * Permission Guard Component
 * Conditionally renders content based on user permissions (RBAC)
 * Now reading permissions from BOTH permissionStore AND authStore for reliability
 */

import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissionStore } from '@/store/permissionStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { hasModulePermission } from '@/core/utils/permissions';
import { ShieldAlert, Lock } from 'lucide-react';

interface PermissionGuardProps {
    /** Required permission (e.g., 'students:view') */
    permission?: string;
    /** Alternative: Check module access instead of specific permission */
    module?: string;
    /** Content to render if permission granted */
    children: ReactNode;
    /** Fallback content if no permission (default: Access Denied UI) */
    fallback?: ReactNode;
    /** Redirect path if no permission */
    redirect?: string;
    /** Show toast on access denied */
    showToast?: boolean;
}

/**
 * Access Denied Fallback Component
 */
function AccessDeniedFallback() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">
                غير مصرح بالوصول
            </h2>
            <p className="text-[var(--text-secondary)] max-w-md mb-6">
                ليس لديك الصلاحيات الكافية للوصول إلى هذا القسم.
                يرجى التواصل مع المسؤول للحصول على الصلاحيات المطلوبة.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <Lock className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500 font-bold">صلاحية غير متوفرة</span>
            </div>
        </div>
    );
}

/**
 * Wrapper component for permission-based rendering
 * 
 * Usage:
 * <PermissionGuard permission="students:view">
 *     <StudentsList />
 * </PermissionGuard>
 * 
 * With module check (allows if user has ANY permission for that module):
 * <PermissionGuard module="students">
 *     <StudentsPage />
 * </PermissionGuard>
 */
export function PermissionGuard({
    permission,
    module,
    children,
    fallback,
    redirect,
    showToast: shouldShowToast = false
}: PermissionGuardProps) {
    // Get permissions from BOTH stores for reliability
    const storePermissions = usePermissionStore(s => s.permissions);
    const storeRole = usePermissionStore(s => s.role);
    const authUser = useAuthStore(s => s.user);
    const { showToast } = useUIStore();

    // Combine permissions from both sources
    const userPermissions = authUser?.permissions || storePermissions || [];
    const userRole = authUser?.role || storeRole || '';

    // Teachers and admins have full access
    if (userRole === 'teacher' || userRole === 'admin') {
        return <>{children}</>;
    }

    // Determine if access is granted for assistants
    let isAllowed = false;

    if (permission) {
        // Check for exact permission OR module-level access
        const moduleFromPermission = permission.split(':')[0];
        isAllowed = userPermissions.includes(permission) ||
            hasModulePermission(userPermissions, moduleFromPermission);
    } else if (module) {
        // Check if user has ANY permission for this module
        isAllowed = hasModulePermission(userPermissions, module);
    } else {
        // No permission specified = always render
        isAllowed = true;
    }

    useEffect(() => {
        if (!isAllowed && shouldShowToast) {
            showToast({
                type: 'error',
                title: 'غير مصرح',
                message: 'ليس لديك الصلاحية للوصول إلى هذا القسم.',
            });
        }
    }, [isAllowed, shouldShowToast, showToast]);

    if (!isAllowed) {
        if (redirect) {
            return <Navigate to={redirect} replace />;
        }
        // Use provided fallback or default Access Denied UI
        return <>{fallback !== undefined ? fallback : <AccessDeniedFallback />}</>;
    }

    return <>{children}</>;
}

/**
 * HOC version for wrapping entire pages
 */
export function withPermission<P extends object>(
    Component: React.ComponentType<P>,
    permission: string,
    fallbackPath: string = '/assistant/dashboard'
) {
    return function WrappedComponent(props: P) {
        return (
            <PermissionGuard permission={permission} redirect={fallbackPath} showToast>
                <Component {...props} />
            </PermissionGuard>
        );
    };
}

/**
 * Component that only renders for specific roles
 */
interface RoleGuardProps {
    roles: string[];
    children: ReactNode;
    fallback?: ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
    const storeRole = usePermissionStore(s => s.role);
    const authUser = useAuthStore(s => s.user);
    const role = authUser?.role || storeRole;

    if (!roles.includes(role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Guard for teacher-only content (hides from assistants)
 */
export function TeacherOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
    return <RoleGuard roles={['admin', 'teacher']} fallback={fallback}>{children}</RoleGuard>;
}

/**
 * Guard for assistant with specific permission (for action buttons, etc.)
 */
interface ActionButtonGuardProps {
    permission: string;
    children: ReactNode;
}

export function ActionButtonGuard({ permission, children }: ActionButtonGuardProps) {
    const storePermissions = usePermissionStore(s => s.permissions);
    const authUser = useAuthStore(s => s.user);
    const userPermissions = authUser?.permissions || storePermissions || [];
    const userRole = authUser?.role || '';

    // Teachers/admins always see buttons
    if (userRole === 'teacher' || userRole === 'admin') {
        return <>{children}</>;
    }

    // For assistants, check specific permission
    const moduleFromPermission = permission.split(':')[0];
    const hasAccess = userPermissions.includes(permission) ||
        hasModulePermission(userPermissions, moduleFromPermission);

    if (!hasAccess) {
        return null;
    }

    return <>{children}</>;
}
