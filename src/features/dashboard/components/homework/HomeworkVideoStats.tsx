import { motion } from 'framer-motion';
import { Video, Eye, Clock } from 'lucide-react';

interface HomeworkVideoStatsProps {
    total: number;
    watched: number;
    unwatched: number;
}

export function HomeworkVideoStats({ total, watched, unwatched }: HomeworkVideoStatsProps) {
    const stats = [
        { label: 'إجمالي الفيديوهات', value: total, icon: Video, color: 'var(--color-brand)' },
        { label: 'تمت المشاهدة', value: watched, icon: Eye, color: '#10b981' },
        { label: 'لم تُشاهَد بعد', value: unwatched, icon: Clock, color: '#f59e0b' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative p-6 rounded-[2rem] bg-white/50 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all duration-500"
                >
                    <div className="flex flex-col items-center gap-3 relative z-10">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                            style={{ background: `${stat.color}15`, color: stat.color }}
                        >
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-[var(--text-primary)] mb-1">{stat.value}</p>
                            <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
