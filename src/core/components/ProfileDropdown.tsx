import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    BookOpen,
    Wallet,
    LogOut,
    ChevronDown,
    Settings,
    Bell,
    LayoutDashboard
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/core/utils/url';

export function ProfileDropdown() {
    const { user, logout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const studentName = user?.name || "طالب متميز";

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get initials from name
    const getInitials = (name: string) => {
        const names = name?.split(' ') || [];
        return names.length > 1
            ? `${names[0][0]}${names[names.length - 1][0]}`
            : (name?.substring(0, 2) || "??");
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const menuItems = [
        // Standard Student links (visible to students, or as baseline)
        ...(user?.role === 'student' ? [
            { icon: User, label: 'حسابي', href: '/dashboard' },
            { icon: BookOpen, label: 'كورساتي', href: '/dashboard/courses' },
            { icon: Wallet, label: 'محفظتي', href: '/dashboard/wallet' },
        ] : []),

        // Admin Specific Links
        ...(user?.role === 'admin' ? [
            { icon: LayoutDashboard, label: 'لوحة الإدارة', href: '/admin/dashboard' },
            { icon: Settings, label: 'إعدادات المنصة', href: '/admin/settings' },
        ] : []),

        // Assistant Specific Links
        ...(user?.role === 'assistant' ? [
            { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/assistant/dashboard' },
        ] : []),

        // Shared links
        { icon: Bell, label: 'الإشعارات', href: user?.role === 'admin' ? '/admin/support' : '/dashboard/notifications' },
        { icon: Settings, label: 'الإعدادات الشخصية', href: user?.role === 'admin' ? '/admin/settings' : '/dashboard/settings' },
    ];

    const avatarUrl = getImageUrl(user?.avatar);

    return (
        <div ref={dropdownRef} className="relative" dir="rtl">
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all duration-300 relative group overflow-hidden scale-animation",
                    "bg-white/50 dark:bg-[#0c0c0c]",
                    "hover:border-brand-500/60 hover:shadow-[0_0_20px_rgba(197,160,89,0.2)]",
                    isOpen && "border-brand-500/60 shadow-[0_0_25px_rgba(197,160,89,0.3)]"
                )}
            >
                <div className="absolute inset-0 bg-brand-500/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />

                {/* Avatar Area */}
                <div className="relative z-10">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={studentName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-brand-500/40 shadow-lg"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-sm border border-brand-500/10">
                            {getInitials(studentName)}
                        </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-white dark:border-[#0c0c0c]" />
                </div>

                <span className="hidden lg:block text-sm font-black text-[var(--text-primary)] dark:text-white max-w-[120px] truncate tracking-tight relative z-10 transition-colors">
                    {studentName}
                </span>

                <ChevronDown className={clsx(
                    "w-4 h-4 text-[var(--color-brand)] transition-transform duration-500 mr-1 relative z-10",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="absolute top-full left-0 mt-4 w-72 sm:w-80 bg-white/95 dark:bg-[#0c0c0c] backdrop-blur-xl border border-brand-500/5 rounded-[2.5rem] shadow-brand-500/20 overflow-hidden z-50 ring-1 ring-black/5 dark:ring-white/5"
                    >
                        {/* User Hub Header - Adaptive */}
                        <div className="p-6 bg-brand-500/5 dark:bg-[#1a1a1a]/40 border-b border-brand-500/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="relative">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={studentName}
                                            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/30 shadow-xl"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-xl border-2 border-white/20">
                                            {getInitials(studentName)}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-[#1a1a1a]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-[var(--text-primary)] text-lg tracking-tight">
                                        أهلاً وسهلاً
                                    </p>
                                    <p className="text-[var(--color-brand)] font-black text-base truncate">
                                        {studentName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Items - Adaptive */}
                        <div className="p-3 space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between px-5 py-4 rounded-2xl text-[var(--text-secondary)] dark:text-slate-300 hover:bg-brand-500/5 dark:hover:bg-[#1a1a1a] hover:text-[var(--color-brand)] transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-brand-500/5 dark:bg-white/5 group-hover:bg-brand-500/10 transition-colors">
                                            <item.icon className="w-5 h-5 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
                                        </div>
                                        <span className="font-black text-[15px]">{item.label}</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 rotate-90 opacity-0 group-hover:opacity-40 transition-all" />
                                </Link>
                            ))}
                        </div>

                        {/* Action Area - Adaptive */}
                        <div className="bg-brand-500/5 dark:bg-[#141414]/80 p-3 border-t border-brand-500/5">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all group font-black"
                            >
                                <div className="p-2 rounded-xl bg-rose-500/5 group-hover:bg-rose-500/20 transition-colors">
                                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </div>
                                <span>تسجيل الخروج</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
