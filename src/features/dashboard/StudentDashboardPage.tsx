// ============================================================
// StudentDashboard - Dashboard Layout
// ============================================================

import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { Navbar } from '@/core/components/Navbar';
import {
    User,
    BookOpen,
    FileText,
    Trophy,
    Video,
    Settings,
    Bell,
    Upload,
    MessageSquare,
    CreditCard,
    Menu,
    X
} from 'lucide-react';

// Sidebar Navigation
const sidebarItems = [
    { icon: User, label: 'الملف الشخصي', href: '/dashboard/profile' },
    { icon: BookOpen, label: 'الكورسات', href: '/dashboard/courses' },
    { icon: Trophy, label: 'نتائج الامتحانات', href: '/dashboard/exams' },
    { icon: FileText, label: 'نتائج الواجبات', href: '/dashboard/homework' },
    { icon: Upload, label: 'رفع الواجب', href: '/dashboard/upload' },
    { icon: Video, label: 'فيديوهات الواجبات', href: '/dashboard/homework-videos' },
    { icon: CreditCard, label: 'المحفظة والاشتراكات', href: '/dashboard/billing' },
    { icon: MessageSquare, label: 'الدعم الفني', href: '/dashboard/support' },
    { icon: Bell, label: 'الإشعارات', href: '/dashboard/notifications' },
    { icon: Settings, label: 'الإعدادات', href: '/dashboard/settings' },
];

export function StudentDashboardPage() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[var(--bg-main)] overflow-x-hidden" dir="rtl">
            <Navbar />

            <div className="flex pt-20">
                {/* Mobile Sidebar Toggle */}
                <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="fixed bottom-4 left-4 z-40 p-4 rounded-full bg-[var(--color-brand)] text-white shadow-lg md:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Sidebar */}
                <aside
                    className={clsx(
                        "fixed inset-y-0 right-0 z-50 w-72 transition-transform duration-500 md:translate-x-0 md:sticky md:top-20 md:h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar md:bg-transparent",
                        isMobileSidebarOpen ? "translate-x-0 shadow-2xl bg-[var(--bg-secondary)]" : "translate-x-full"
                    )}
                >
                    <div className="p-6 h-full">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between mb-8 md:hidden">
                            <h2 className="text-xl font-black text-[var(--text-primary)]">القائمة</h2>
                            <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 text-[var(--text-secondary)]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation Matrix */}
                        <div className="relative p-2 rounded-[2rem] bg-white/5 dark:bg-black/10 backdrop-blur-3xl border border-white/10 shadow-2xl">
                            <nav className="space-y-1 relative z-10">
                                {sidebarItems.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <NavLink
                                            key={item.href}
                                            to={item.href}
                                            onClick={() => setIsMobileSidebarOpen(false)}
                                            className={clsx(
                                                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all text-right group relative overflow-hidden",
                                                isActive
                                                    ? "bg-brand-500 text-white shadow-brand-500/40"
                                                    : "text-[var(--text-secondary)] hover:text-[var(--color-brand)] hover:bg-brand-500/5"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                                isActive
                                                    ? "bg-white/20 text-white"
                                                    : "bg-[var(--color-brand)]/10 text-[var(--color-brand)] group-hover:bg-[var(--color-brand)]/20"
                                            )}>
                                                <item.icon className="w-5 h-5" />
                                            </div>

                                            <span className="text-sm font-display tracking-tight transition-colors">{item.label}</span>

                                            {/* Accent dot replaced by solid background, keeping subtle shine effect */}
                                            {isActive && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Support Card in Sidebar */}
                        <div className="mt-8 p-6 rounded-[2rem] bg-gradient-to-br from-brand-600/10 to-amber-600/10 border border-white/10 hidden md:block">
                            <p className="text-xs font-black text-[var(--color-brand)] uppercase tracking-widest mb-2">الدعم الفني</p>
                            <p className="text-xs font-bold text-slate-500 dark:text-white/40 leading-relaxed mb-4">واجهتك مشكلة؟ احنا دايماً موجودين عشانك.</p>
                            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--text-primary)] text-xs font-black hover:bg-white/10 transition-all">تحدث معنا</button>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile sidebar */}
                {isMobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* Main Content (Outlet) */}
                <main className="flex-1 p-4 md:p-8 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
