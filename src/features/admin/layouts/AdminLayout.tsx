// ============================================================
// Admin Dashboard Layout - Premium Super Admin Panel
// ============================================================

import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    Bell,
    BarChart3,
    Activity,
    ChevronLeft,
    FileText,
    BookOpen,
    FileQuestion,
    FolderOpen,
    Ticket,
    UserCog,
    ClipboardList,
    Wallet,
    Headphones,
    Mail
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/core/components/ThemeToggle';
import { clsx } from 'clsx';
import { getImageUrl } from '@/core/utils/url';
import { useSettings } from '@/contexts/SettingsContext';
import { getFileUrl } from '@/utils/fileUrl';

export function AdminLayout() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { logout, user } = useAuthStore();
    const { settings } = useSettings();
    const navigate = useNavigate();

    // Verify admin role
    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Admin Navigation Items (Admin = Teacher in single-teacher platform)
    const allNavItems = [
        // Main Dashboard
        { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin/dashboard', end: true, roles: ['admin'] },

        // Course Management
        { icon: BookOpen, label: 'الكورسات', path: '/admin/courses', roles: ['admin'] },
        { icon: FileQuestion, label: 'الاختبارات', path: '/admin/exams', roles: ['admin'] },
        { icon: FolderOpen, label: 'الملفات', path: '/admin/files', roles: ['admin'] },

        // Student Management
        { icon: Users, label: 'الطلاب', path: '/admin/students', roles: ['admin'] },
        { icon: UserPlus, label: 'طلبات التسجيل', path: '/admin/registrations', roles: ['admin'] },
        { icon: Ticket, label: 'أكواد التفعيل', path: '/admin/codes', roles: ['admin'] },

        // Team
        { icon: UserCog, label: 'المساعدين', path: '/admin/assistants', roles: ['admin'] },

        // Content
        { icon: ClipboardList, label: 'الواجبات', path: '/admin/homework', roles: ['admin'] },
        { icon: FileText, label: 'المذاكرات', path: '/admin/evaluations', roles: ['admin'] },

        // Financial
        { icon: Wallet, label: 'المحفظة', path: '/admin/wallet', roles: ['admin'] },
        { icon: BarChart3, label: 'التقارير المالية', path: '/admin/reports', roles: ['admin'] },

        // System
        { icon: Activity, label: 'سجل النشاط', path: '/admin/logs', roles: ['admin'] },
        { icon: Settings, label: 'إعدادات النظام', path: '/admin/settings', roles: ['admin'] },
        { icon: Headphones, label: 'الدعم الفني', path: '/admin/support', roles: ['admin'] },
        { icon: Mail, label: 'رسائل التواصل', path: '/admin/contact-messages', roles: ['admin'] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(user?.role || ''));


    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex text-[var(--text-primary)] font-sans transition-colors duration-300" dir="rtl">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-md"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarOpen ? 300 : 0,
                    x: isSidebarOpen ? 0 : 300
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={clsx(
                    "fixed lg:sticky top-0 right-0 h-screen bg-[var(--bg-secondary)] border-l border-[var(--border-color)] z-[70] flex flex-col shadow-2xl transition-colors duration-300",
                    !isSidebarOpen && "lg:w-0 overflow-hidden border-none"
                )}
            >
                {/* Brand Area */}
                <div className="h-24 flex items-center gap-4 px-8 border-b border-[var(--border-color)] relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl border border-brand-500/10 flex items-center justify-center overflow-hidden shadow-lg rotate-3 group-hover:rotate-0 transition-transform bg-[var(--bg-main)]">
                        {settings?.logo_url ? (
                            <img src={getFileUrl(settings.logo_url)} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                            <Shield className="w-6 h-6 text-brand-500" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-black text-xl text-[var(--text-primary)] tracking-tight leading-tight">
                            {settings?.app_name || 'مركز الإدارة'}
                        </h1>
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest opacity-80">Super Admin Panel</span>
                    </div>

                    {/* Close button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden absolute left-4 p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                </div>

                {/* Profile Widget */}
                <div className="px-6 py-8 shrink-0">
                    <div className="flex items-center gap-4 bg-white/5 dark:bg-black/20 p-5 rounded-[2.5rem] border border-brand-500/10 relative overflow-hidden group shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative">
                            <div className="w-14 h-14 rounded-[1.5rem] border border-brand-500/5 overflow-hidden shadow-lg bg-[var(--bg-main)]">
                                <img
                                    src={getImageUrl(user?.avatar) || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg-secondary)] shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0 relative">
                            <h3 className="font-black text-sm text-[var(--text-primary)] truncate font-display">{user?.name || "المسؤول"}</h3>
                            <p className="text-[10px] font-bold text-brand-500 truncate opacity-80">صلاحيات كاملة</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-2 pb-10">
                    <div className="px-6 mb-4 mt-2">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40">
                            إدارة النظام
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    clsx(
                                        "w-full flex items-center gap-4 px-6 py-4 rounded-[1.8rem] font-black transition-all text-right group relative overflow-hidden",
                                        isActive
                                            ? "bg-brand-500 text-white shadow-xl shadow-brand-500/20 translate-x-[-4px]"
                                            : "text-[var(--text-secondary)] hover:text-brand-500 hover:bg-brand-500/5"
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div
                                            className={clsx(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                isActive
                                                    ? "bg-white/20 text-white rotate-6"
                                                    : "bg-brand-500/10 text-brand-500 group-hover:bg-brand-500/20 group-hover:rotate-[-6deg]"
                                            )}
                                        >
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-display tracking-tight">
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <div className="absolute inset-y-0 right-0 w-1.5 bg-white/30 rounded-l-full" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-main)]/50 space-y-3 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-rose-500 hover:bg-rose-500/10 transition-all group overflow-hidden relative"
                    >
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span className="text-sm">تسجيل خروج</span>
                        <ChevronLeft className="w-4 h-4 mr-auto opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                    </button>

                    <ThemeToggle />
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-[var(--bg-main)]">
                {/* Top Header */}
                <header className="h-24 flex items-center justify-between px-6 lg:px-12 z-40 bg-[var(--bg-main)]/60 backdrop-blur-2xl border-b border-brand-500/10 sticky top-0 transition-all">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 dark:bg-black/20 border border-brand-500/10 text-[var(--text-primary)] hover:border-brand-500/30 transition-all active:scale-95 shadow-sm"
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <div className="hidden md:block">
                            <h2 className="text-2xl font-black text-[var(--text-primary)] font-display tracking-tight">لوحة الإدارة العامة</h2>
                            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-60">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 bg-white/5 dark:bg-black/20 px-5 py-2.5 rounded-2xl border border-brand-500/10 shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                            <span className="text-xs font-black text-[var(--text-secondary)] opacity-80">النظام آمن</span>
                        </div>

                        <button className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-500/5 hover:bg-brand-500/10 text-brand-500 transition-all border border-brand-500/10">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[var(--bg-secondary)] shadow-sm" />
                        </button>
                    </div>
                </header>

                {/* Content Viewport */}
                <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
                    <div className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-12 min-h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
