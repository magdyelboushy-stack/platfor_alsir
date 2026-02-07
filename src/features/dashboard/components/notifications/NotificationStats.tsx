import { motion } from 'framer-motion';
import { Bell, CheckSquare, List } from 'lucide-react';

interface NotificationStatsProps {
    total: number;
    unread: number;
}

export function NotificationStats({ total, unread }: NotificationStatsProps) {
    const stats = [
        { label: 'إجمالي الإشعارات', value: total, icon: List, color: 'var(--color-brand)' },
        { label: 'غير مقروء', value: unread, icon: Bell, color: '#ef4444' },
        { label: 'تمت قراءتها', value: total - unread, icon: CheckSquare, color: '#10b981' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative p-8 rounded-[2.5rem] bg-white/50 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all duration-500"
                >
                    <div className="flex flex-row md:flex-col items-center gap-6 relative z-10">
                        <div
                            className="w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-black/5"
                            style={{ background: `${stat.color}15`, color: stat.color }}
                        >
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div className="text-right md:text-center">
                            <p className="text-4xl font-black text-[var(--text-primary)] mb-1 font-display tabular-nums tracking-tighter">{stat.value}</p>
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">{stat.label}</p>
                        </div>
                    </div>
                    {/* Background Glow Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.02] dark:to-white/[0.02] rounded-[2.5rem] pointer-events-none" />
                </motion.div>
            ))}
        </div>
    );
}
