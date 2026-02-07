/**
 * Permission Labels and Utilities
 * Centralized permission mapping for consistent Arabic translations
 */

// Complete permission slug to Arabic label mapping
export const PERMISSION_LABELS: Record<string, string> = {
    // Dashboard
    'dashboard:view': 'عرض لوحة التحكم',

    // Courses Module
    'courses:view': 'عرض الكورسات',
    'courses:create': 'إنشاء كورس جديد',
    'courses:edit': 'تعديل الكورسات',
    'courses:delete': 'حذف الكورسات',

    // Exams Module
    'exams:view': 'عرض الامتحانات',
    'exams:create': 'إنشاء امتحان جديد',
    'exams:edit': 'تعديل الامتحانات',
    'exams:delete': 'حذف الامتحانات',

    // Files Module
    'files:view': 'عرض الملفات',
    'files:upload': 'رفع ملفات جديدة',
    'files:delete': 'حذف الملفات',

    // Codes Module
    'codes:view': 'عرض أكواد التفعيل',
    'codes:generate': 'توليد أكواد جديدة',
    'codes:delete': 'حذف الأكواد',

    // Students Module
    'students:view': 'متابعة الطلاب',
    'students:edit': 'تعديل بيانات الطلاب',
    'students:suspend': 'إيقاف/تفعيل الطلاب',
    'students:delete': 'حذف الطلاب',

    // Requests Module
    'requests:view': 'عرض طلبات الدخول',
    'requests:approve': 'قبول الطلبات',
    'requests:reject': 'رفض الطلبات',

    // Wallet Module
    'wallet:view': 'عرض المحفظة المالية',
    'wallet:withdraw': 'سحب الرصيد',

    // Support Module
    'support:view': 'عرض تذاكر الدعم',
    'support:respond': 'الرد على التذاكر',

    // Homework Module
    'homework:view': 'عرض الواجبات',
    'homework:grade': 'تصحيح الواجبات',
};

// Module-level labels (for sidebar display)
export const MODULE_LABELS: Record<string, string> = {
    'dashboard': 'لوحة التحكم',
    'courses': 'إدارة الكورسات',
    'exams': 'بنك الأسئلة',
    'files': 'مكتبة الملفات',
    'codes': 'أكواد التفعيل',
    'students': 'الطلاب والمتابعة',
    'requests': 'طلبات الدخول',
    'wallet': 'المحفظة المالية',
    'support': 'الدعم الفني',
    'homework': 'تصحيح الواجبات',
};

/**
 * Get human-readable label for a permission slug
 */
export function getPermissionLabel(slug: string): string {
    return PERMISSION_LABELS[slug] || slug;
}

/**
 * Get module label from permission slug
 */
export function getModuleLabel(moduleOrSlug: string): string {
    const module = moduleOrSlug.split(':')[0];
    return MODULE_LABELS[module] || module;
}

/**
 * Convert array of permission slugs to Arabic labels
 */
export function formatPermissions(permissions: string[]): string[] {
    return permissions.map(p => PERMISSION_LABELS[p] || p);
}

/**
 * Check if user has any permission for a module
 */
export function hasModulePermission(permissions: string[], module: string): boolean {
    if (!permissions || !Array.isArray(permissions)) return false;

    // Check for exact match (old format)
    if (permissions.includes(module)) return true;

    // Check for any permission starting with module:
    return permissions.some(p => p.startsWith(`${module}:`));
}

/**
 * Group permissions by module for display
 */
export function groupPermissionsByModule(permissions: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    permissions.forEach(perm => {
        const [module] = perm.split(':');
        if (!grouped[module]) {
            grouped[module] = [];
        }
        grouped[module].push(perm);
    });

    return grouped;
}

/**
 * Get grouped Arabic labels for permissions display
 * Returns labels like: "إدارة الكورسات (عرض، إضافة، تعديل، حذف)"
 */
export function getGroupedPermissionLabels(permissions: string[]): string[] {
    const grouped = groupPermissionsByModule(permissions);
    const result: string[] = [];

    const moduleDisplayNames: Record<string, string> = {
        'dashboard': 'لوحة التحكم',
        'courses': 'إدارة الكورسات',
        'exams': 'إدارة الامتحانات والأسئلة',
        'files': 'مكتبة الملفات',
        'codes': 'إدارة أكواد التفعيل',
        'students': 'متابعة الطلاب وحظرهم',
        'requests': 'إدارة طلبات الدخول',
        'wallet': 'الاطلاع على المحفظة المالية',
        'support': 'الدعم الفني والتذاكر',
        'homework': 'تصحيح الواجبات',
    };

    const actionLabels: Record<string, string> = {
        'view': 'عرض',
        'create': 'إضافة',
        'edit': 'تعديل',
        'delete': 'حذف',
        'upload': 'رفع',
        'generate': 'توليد',
        'approve': 'قبول',
        'reject': 'رفض',
        'suspend': 'إيقاف',
        'withdraw': 'سحب',
        'respond': 'رد',
        'grade': 'تصحيح',
    };

    Object.entries(grouped).forEach(([module, perms]) => {
        const moduleName = moduleDisplayNames[module] || MODULE_LABELS[module] || module;

        // Extract actions
        const actions = perms.map(p => {
            const action = p.split(':')[1];
            return actionLabels[action] || action;
        });

        // If all actions are present, just show module name
        if (actions.length >= 3) {
            result.push(`${moduleName} (${actions.slice(0, 3).join('، ')}...)`);
        } else if (actions.length > 1) {
            result.push(`${moduleName} (${actions.join('، ')})`);
        } else {
            result.push(`${moduleName} - ${actions[0]}`);
        }
    });

    return result;
}
