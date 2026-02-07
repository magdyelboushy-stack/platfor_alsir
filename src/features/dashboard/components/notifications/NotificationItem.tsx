import { motion } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, Clock, Trash2, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Notification {
    id: number;
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
    date: string;
    read: boolean;
}

interface NotificationItemProps {
    notification: Notification;
    index: number;
    onMarkAsRead: (id: number) => void;
    onDelete: (id: number) => void;
}

export function NotificationItem({ notification, index, onMarkAsRead, onDelete }: NotificationItemProps) {
    const isUnread = !notification.read;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <div className={clsx(
                "flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2rem] transition-all duration-500 relative overflow-hidden",
                "bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl",
                "hover:border-brand-500/30 hover:shadow-[0_20px_40px_-15px_rgba(197,160,89,0.1)] hover:bg-white/60 dark:hover:bg-[var(--dark-panel)]",
                isUnread && "border-brand-500/20 bg-brand-500/5 shadow-[0_10px_30px_-10px_rgba(197,160,89,0.1)]"
            )}>
                {/* 1. Icon Visual Container */}
                <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 border relative z-10",
                    isUnread ? "shadow-[0_5px_15px_-5px_rgba(197,160,89,0.3)] bg-brand-500/10 border-brand-500/20 text-[var(--color-brand)]" : "bg-white/10 border-white/10 text-[var(--text-secondary)] opacity-50"
                )}>
                    {notification.type === 'success' && <CheckCircle className="w-8 h-8 text-emerald-500" />}
                    {notification.type === 'info' && <Info className="w-8 h-8 text-blue-500" />}
                    {notification.type === 'warning' && <AlertTriangle className="w-8 h-8 text-amber-500" />}
                </div>

                {/* 2. Content Details */}
                <div className="flex-1 min-w-0 text-center md:text-right relative z-10 w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h4 className={clsx(
                            "text-lg font-black font-display transition-colors",
                            isUnread ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] opacity-70"
                        )}>
                            {notification.title}
                        </h4>
                        {isUnread && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-500 text-white text-[8px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">جديد</span>
                        )}
                    </div>
                    <p className={clsx(
                        "text-sm font-bold mb-3",
                        isUnread ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)] opacity-50"
                    )}>
                        {notification.message}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-black opacity-40 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{notification.date}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Luxe Actions Overlay */}
                <div className="flex items-center justify-center gap-3 relative z-10 w-full md:w-auto md:opacity-0 group-hover:opacity-100 transition-all">
                    {isUnread && (
                        <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                            title="تحديد كمقروء"
                        >
                            <Check className="w-4 h-4 shadow-sm" />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(notification.id)}
                        className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"
                        title="حذف الإشعار"
                    >
                        <Trash2 className="w-4 h-4 shadow-sm" />
                    </button>
                </div>

                {/* Hover Accent Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
        </motion.div>
    );
}
