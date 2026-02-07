// ============================================================
// DashboardLayout - Main Dashboard Shell
// ============================================================

import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
    BookOpen,
    Play,
    FileText,
    Wallet,
    MessageSquare,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    User,
    Bell,
    Award
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { useSidebar } from '@/store/uiStore';
import { getImageUrl } from '@/core/utils/url';
import { useSettings } from '@/contexts/SettingsContext';
import { getFileUrl } from '@/utils/fileUrl';

interface DashboardLayoutProps {
    children: ReactNode;
}

const navItems = [
    { icon: User, label: 'الملف الشخصي', href: '/dashboard' },
    { icon: BookOpen, label: 'الكورسات', href: '/dashboard/courses' },
    { icon: Award, label: 'نتائج الامتحانات', href: '/dashboard/exams' },
    { icon: FileText, label: 'نتائج الواجبات', href: '/dashboard/homework-results' },
    { icon: Play, label: 'رفع الواجب', href: '/dashboard/homework-upload' },
    { icon: MessageSquare, label: 'فيديوهات الواجبات', href: '/dashboard/homework-videos' },
    { icon: Wallet, label: 'بيانات المحفظة', href: '/dashboard/wallet' },
    { icon: Bell, label: 'الاشتراكات', href: '/dashboard/subscriptions' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { settings } = useSettings();
    const { isOpen, isCollapsed, toggle, toggleCollapse } = useSidebar();

    const avatarUrl = user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : getImageUrl(`avatars/${user.avatar.split(/[\\/]/).pop()}`)) : null;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex transition-colors duration-300" dir="rtl">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggle}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed lg:static inset-y-0 right-0 z-50', // Move to the right for RTL
                    'flex flex-col',
                    'bg-[var(--bg-secondary)] backdrop-blur-3xl',
                    'border-l border-[var(--border-color)]',
                    'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    isCollapsed ? 'w-24' : 'w-72',
                    isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                )}
                dir="rtl"
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
                    {!isCollapsed && (
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center border border-brand-500/20">
                                {settings?.logo_url ? (
                                    <img src={getFileUrl(settings.logo_url)} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-brand)] to-brand-700 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <span className="font-bold text-[var(--text-primary)] font-display truncate max-w-[140px]">
                                {settings?.app_name || 'Bacaloria System'}
                            </span>
                        </Link>
                    )}
                    <button
                        onClick={toggleCollapse}
                        className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <ChevronLeft className={clsx('w-5 h-5 transition-transform', isCollapsed && 'rotate-180')} />
                    </button>
                    <button
                        onClick={toggle}
                        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation - Premium Floating Modules */}
                <nav className="flex-1 py-8 px-4 space-y-4 overflow-y-auto custom-scrollbar" dir="rtl">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={clsx(
                                    'group flex items-center gap-4 px-4 py-4 rounded-2xl relative transition-all duration-500',
                                    isActive
                                        ? 'bg-[var(--color-brand)] text-white shadow-[0_0_30px_rgba(197,160,89,0.3)]'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]'
                                )}
                            >
                                <div className={clsx(
                                    "p-2.5 rounded-xl transition-all duration-300",
                                    isActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                                )}>
                                    <item.icon className="w-6 h-6 flex-shrink-0" />
                                </div>
                                {!isCollapsed && <span className="font-black text-lg tracking-tight">{item.label}</span>}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute right-0 w-1.5 h-8 bg-white rounded-l-full shadow-[0_0_15px_white]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-[var(--border-color)]">
                    <div className={clsx('flex items-center gap-3', isCollapsed && 'justify-center')}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-white" />
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 text-right">
                                <p className="font-black text-[var(--text-primary)] truncate text-sm">{user?.name}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] capitalize font-bold opacity-60">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className={clsx(
                            'mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-transparent font-black text-xs',
                            'text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/10',
                            'transition-all duration-300',
                            isCollapsed && 'px-2'
                        )}
                    >
                        <LogOut className="w-4 h-4" />
                        {!isCollapsed && <span className="mr-1">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
                    <button
                        onClick={toggle}
                        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                        <button className="relative p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
