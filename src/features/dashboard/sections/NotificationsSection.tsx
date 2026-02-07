import { useState } from 'react';
import { NotificationStats } from '../components/notifications/NotificationStats';
import { NotificationList } from '../components/notifications/NotificationList';

export function NotificationsSection() {
    // 1. Zeroed Data State (Template Only)
    const [notifications, setNotifications] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const totalCount = notifications.length;
    const unreadCount = notifications.filter(n => !n.read).length;

    // 2. Mock Handlers
    const handleMarkAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleDelete = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="space-y-12 pb-20 max-w-6xl mx-auto">
            {/* 1. Header Area - Luxe Alignment */}
            <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight transition-colors">
                    مركز <span className="text-[var(--color-brand)]">التنبيهات</span>
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                    ابق على اطلاع دائم بآخر المستجدات، نتائج الاختبارات، وتنبيهات الدروس الجديدة ومواعيد الحصص المباشرة.
                </p>
            </div>

            {/* 2. Stats Module */}
            <NotificationStats
                total={totalCount}
                unread={unreadCount}
            />

            {/* 3. Main Notifications Repository */}
            <NotificationList
                notifications={filter === 'all' ? notifications : notifications.filter(n => !n.read)}
                filter={filter}
                onFilterChange={setFilter}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onMarkAllRead={handleMarkAllRead}
            />

            {/* Decorative Element */}
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        </div>
    );
}
