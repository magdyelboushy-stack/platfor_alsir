import { motion, AnimatePresence } from 'framer-motion';
import { NotificationItem } from './NotificationItem';
import { Bell, CheckSquare } from 'lucide-react';
import { clsx } from 'clsx';

interface Notification {
    id: number;
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
    date: string;
    read: boolean;
}

interface NotificationListProps {
    notifications: Notification[];
    filter: 'all' | 'unread';
    onFilterChange: (filter: 'all' | 'unread') => void;
    onMarkAsRead: (id: number) => void;
    onDelete: (id: number) => void;
    onMarkAllRead: () => void;
}

export function NotificationList({
    notifications,
    filter,
    onFilterChange,
    onMarkAsRead,
    onDelete,
    onMarkAllRead
}: NotificationListProps) {
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-8">
            {/* Header / Management Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-sm relative">
                        <Bell className="w-6 h-6 text-[var(--color-brand)]" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-[var(--bg-main)]">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight uppercase">مركز التنبيهات</h3>
                        <p className="text-xs font-bold text-[var(--text-secondary)] opacity-50">تابع كل جديد ومهم بخصوص حسابك</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                    <button
                        onClick={onMarkAllRead}
                        disabled={unreadCount === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/40 dark:bg-black/20 border border-brand-500/10 text-xs font-black text-[var(--text-secondary)] hover:text-[var(--color-brand)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <CheckSquare className="w-4 h-4" />
                        تحديد الكل كمقروء
                    </button>

                    <div className="p-1.5 rounded-2xl bg-white/40 dark:bg-black/20 border border-brand-500/10 flex gap-1">
                        {(['all', 'unread'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => onFilterChange(f)}
                                className={clsx(
                                    "px-6 py-2 rounded-xl text-xs font-black transition-all",
                                    filter === f
                                        ? "bg-[var(--color-brand)] text-white shadow-lg shadow-brand-500/20"
                                        : "text-[var(--text-secondary)] hover:bg-brand-500/5"
                                )}
                            >
                                {f === 'all' ? 'الكل' : 'غير مقروء'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notifications Display Section */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout" initial={false}>
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                index={index}
                                onMarkAsRead={onMarkAsRead}
                                onDelete={onDelete}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-20 rounded-[3.5rem] border-2 border-dashed border-brand-500/10 text-center bg-white/5 backdrop-blur-sm opacity-60"
                        >
                            <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell className="w-10 h-10 text-[var(--color-brand)]" />
                            </div>
                            <p className="text-2xl font-black text-[var(--text-secondary)] mb-2 uppercase tracking-tight">لا توجد إشعارات</p>
                            <p className="text-xs font-bold text-[var(--text-secondary)] opacity-50">بمجرد وصول تنبيهات جديدة، ستجدها تظهر هنا فوراً.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
