import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Lock, Shield, Check, Phone, UserCog, CheckCheck, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AssistantFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any; // If present, we are in Edit mode
}

// Comprehensive permissions map with module:action format
const PERMISSIONS_MAP = [
    {
        module: 'dashboard',
        label: 'لوحة التحكم',
        isDefault: true,
        actions: [
            { key: 'dashboard:view', label: 'عرض الإحصائيات العامة' }
        ]
    },
    {
        module: 'courses',
        label: 'إدارة الكورسات',
        actions: [
            { key: 'courses:view', label: 'عرض الكورسات' },
            { key: 'courses:create', label: 'إنشاء كورس' },
            { key: 'courses:edit', label: 'تعديل كورس' },
            { key: 'courses:delete', label: 'حذف كورس' }
        ]
    },
    {
        module: 'exams',
        label: 'بنك الأسئلة',
        actions: [
            { key: 'exams:view', label: 'عرض الامتحانات' },
            { key: 'exams:create', label: 'إنشاء امتحان' },
            { key: 'exams:edit', label: 'تعديل امتحان' },
            { key: 'exams:delete', label: 'حذف امتحان' }
        ]
    },
    {
        module: 'files',
        label: 'مكتبة الملفات',
        actions: [
            { key: 'files:view', label: 'عرض الملفات' },
            { key: 'files:upload', label: 'رفع ملف' },
            { key: 'files:delete', label: 'حذف ملف' }
        ]
    },
    {
        module: 'codes',
        label: 'أكواد التفعيل',
        actions: [
            { key: 'codes:view', label: 'عرض الأكواد' },
            { key: 'codes:generate', label: 'توليد أكواد' },
            { key: 'codes:delete', label: 'حذف أكواد' }
        ]
    },
    {
        module: 'students',
        label: 'الطلاب والمتابعة',
        actions: [
            { key: 'students:view', label: 'عرض الطلاب' },
            { key: 'students:edit', label: 'تعديل بيانات طالب' },
            { key: 'students:suspend', label: 'إيقاف/تفعيل طالب' },
            { key: 'students:delete', label: 'حذف طالب' }
        ]
    },
    {
        module: 'wallet',
        label: 'المحفظة',
        isSensitive: true,
        actions: [
            { key: 'wallet:view', label: 'عرض المحفظة والإيرادات' },
            { key: 'wallet:withdraw', label: 'سحب رصيد' }
        ]
    },
    {
        module: 'support',
        label: 'الدعم الفني',
        actions: [
            { key: 'support:view', label: 'عرض التذاكر' },
            { key: 'support:respond', label: 'الرد على التذاكر' }
        ]
    },
    {
        module: 'homework',
        label: 'تصحيح الواجبات',
        actions: [
            { key: 'homework:view', label: 'عرض الواجبات' },
            { key: 'homework:grade', label: 'تصحيح الواجبات' }
        ]
    }
];

// Get all permission keys
const ALL_PERMISSIONS = PERMISSIONS_MAP.flatMap(m => m.actions.map(a => a.key));
const DEFAULT_PERMISSIONS = PERMISSIONS_MAP
    .filter(m => m.isDefault)
    .flatMap(m => m.actions.map(a => a.key));

export function AssistantFormModal({ isOpen, onClose, onSubmit, initialData }: AssistantFormModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || '');
            setEmail(initialData.email || '');
            setPhone(initialData.phone || '');
            setSelectedPerms(initialData.permissions || []);
            setPassword(''); // Don't pre-fill password
            setExpandedModules([]);
        } else if (isOpen && !initialData) {
            // Reset for new entry with default permissions
            setName('');
            setEmail('');
            setPhone('');
            setPassword('');
            setSelectedPerms([...DEFAULT_PERMISSIONS]);
            setExpandedModules([]);
        }
    }, [isOpen, initialData]);

    const togglePermission = (permKey: string) => {
        setSelectedPerms(prev =>
            prev.includes(permKey) ? prev.filter(p => p !== permKey) : [...prev, permKey]
        );
    };

    const toggleModule = (moduleKey: string) => {
        const module = PERMISSIONS_MAP.find(m => m.module === moduleKey);
        if (!module) return;

        const modulePermissions = module.actions.map(a => a.key);
        const allSelected = modulePermissions.every(p => selectedPerms.includes(p));

        if (allSelected) {
            // Deselect all module permissions
            setSelectedPerms(prev => prev.filter(p => !modulePermissions.includes(p)));
        } else {
            // Select all module permissions
            setSelectedPerms(prev => [...new Set([...prev, ...modulePermissions])]);
        }
    };

    const toggleExpandModule = (moduleKey: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleKey) ? prev.filter(m => m !== moduleKey) : [...prev, moduleKey]
        );
    };

    const selectAllPermissions = () => {
        setSelectedPerms([...ALL_PERMISSIONS]);
    };

    const deselectAllPermissions = () => {
        setSelectedPerms([...DEFAULT_PERMISSIONS]); // Keep defaults
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = { name, email, phone, permissions: selectedPerms };
        if (password) {
            payload.password = password;
        }
        onSubmit(payload);
        onClose();
    };

    const getModuleSelectionState = (module: typeof PERMISSIONS_MAP[0]) => {
        const modulePerms = module.actions.map(a => a.key);
        const selectedCount = modulePerms.filter(p => selectedPerms.includes(p)).length;
        if (selectedCount === 0) return 'none';
        if (selectedCount === modulePerms.length) return 'all';
        return 'partial';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-l from-brand-500/5 to-transparent shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                                    {isEditMode ? <UserCog className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                                </div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)]">
                                    {isEditMode ? 'تعديل بيانات المساعد' : 'إضافة مساعد جديد'}
                                </h2>
                            </div>
                            <button onClick={onClose} className="p-3 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form - Scrollable */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-black text-[var(--text-secondary)] px-2">الاسم بالكامل</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="مثال: محمد أحمد"
                                    className="w-full h-14 px-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm font-black text-[var(--text-secondary)] px-2">رقم الهاتف</label>
                                <div className="relative">
                                    <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-40" />
                                    <input
                                        required
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="012345678912"
                                        className="w-full h-14 pr-14 pl-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all dir-ltr"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-[var(--text-secondary)] px-2">البريد الإلكتروني</label>
                                    <div className="relative">
                                        <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-40" />
                                        <input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="assistant@system.com"
                                            className="w-full h-14 pr-14 pl-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all dir-ltr"
                                        />
                                    </div>
                                </div>
                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-[var(--text-secondary)] px-2">
                                        {isEditMode ? 'كلمة المرور (اختياري)' : 'كلمة المرور'}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-40" />
                                        <input
                                            required={!isEditMode}
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={isEditMode ? "اتركها فارغة للتجاهل" : "••••••••"}
                                            className="w-full h-14 pr-14 pl-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all dir-ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-black text-[var(--text-secondary)] flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        تحديد الصلاحيات ({selectedPerms.length}/{ALL_PERMISSIONS.length})
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={selectAllPermissions}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                                        >
                                            <CheckCheck className="w-3.5 h-3.5" />
                                            تحديد الكل
                                        </button>
                                        <button
                                            type="button"
                                            onClick={deselectAllPermissions}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500/20 transition-all"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                            إلغاء الكل
                                        </button>
                                    </div>
                                </div>

                                {/* Modules Grid */}
                                <div className="space-y-3 max-h-[300px] overflow-y-auto p-3 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-main)] custom-scrollbar">
                                    {PERMISSIONS_MAP.map(module => {
                                        const state = getModuleSelectionState(module);
                                        const isExpanded = expandedModules.includes(module.module);

                                        return (
                                            <div key={module.module} className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-card)]">
                                                {/* Module Header */}
                                                <div
                                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-[var(--bg-main)]/50 transition-colors"
                                                    onClick={() => toggleExpandModule(module.module)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); toggleModule(module.module); }}
                                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${state === 'all'
                                                                ? 'bg-brand-500 border-brand-500 text-white'
                                                                : state === 'partial'
                                                                    ? 'bg-brand-500/30 border-brand-500 text-white'
                                                                    : 'border-[var(--border-color)]'
                                                                }`}
                                                        >
                                                            {state !== 'none' && <Check className="w-3 h-3" />}
                                                        </button>
                                                        <span className="font-bold text-[var(--text-primary)] text-sm">
                                                            {module.label}
                                                        </span>
                                                        {module.isSensitive && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold">
                                                                بيانات مالية
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-[var(--text-secondary)]">
                                                        {module.actions.filter(a => selectedPerms.includes(a.key)).length}/{module.actions.length}
                                                    </span>
                                                </div>

                                                {/* Module Actions (Expanded) */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="border-t border-[var(--border-color)] overflow-hidden"
                                                        >
                                                            <div className="p-3 flex flex-wrap gap-2 bg-[var(--bg-main)]/30">
                                                                {module.actions.map(action => (
                                                                    <button
                                                                        key={action.key}
                                                                        type="button"
                                                                        onClick={() => togglePermission(action.key)}
                                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${selectedPerms.includes(action.key)
                                                                            ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                                                                            : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-500/30'
                                                                            }`}
                                                                    >
                                                                        {selectedPerms.includes(action.key) && <Check className="w-3 h-3" />}
                                                                        {action.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 h-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-black hover:bg-[var(--bg-card)] transition-all active:scale-95"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] h-14 rounded-2xl bg-brand-500 text-white font-black shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 hover:scale-105 transition-all active:scale-95"
                                >
                                    {isEditMode ? 'حفظ التعديلات' : 'تأكيد الإضافة'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
