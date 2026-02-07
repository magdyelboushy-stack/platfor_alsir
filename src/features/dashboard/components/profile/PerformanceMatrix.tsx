import { motion } from 'framer-motion';
import { Zap, BookOpen } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

interface MetricItemProps {
    label: string;
    value: string;
    subLabel: string;
    color: string;
}

function MetricItem({ label, value, subLabel, color }: MetricItemProps) {
    return (
        <div className="space-y-1 py-2">
            <p className={`text-3xl font-black text-${color}-600 dark:text-${color}-400 underline decoration-${color}-500/10`}>{value}</p>
            <p className="text-[10px] font-black text-[var(--text-secondary)] opacity-60 uppercase tracking-widest leading-none">{label}</p>
            <p className={`text-[9px] font-bold text-${color}-700/60 dark:text-${color}-400/40 mt-1`}>{subLabel}</p>
        </div>
    );
}

export function PerformanceMatrix() {
    const { stats, isLoading } = useDashboardStore();

    const displayStats = stats || {
        understandingRate: 0,
        performanceLevel: 0,
        accuracy: 0,
        xp: 0,
        rank: 'جديد'
    };

    if (isLoading && !stats) {
        return <div className="h-96 bg-[var(--bg-secondary)] rounded-[2.5rem] animate-pulse" />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-secondary)] backdrop-blur-3xl border border-[var(--border-color)] rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden group shadow-xl dark:shadow-2xl h-full"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-brand-500/[0.08] dark:from-brand-500/[0.05] to-transparent pointer-events-none" />

            <div className="flex justify-between items-center mb-8 md:mb-12">
                <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-brand-600/10 dark:bg-brand-500/10 border border-brand-600/20 dark:border-brand-500/20 shrink-0">
                    <BookOpen className="w-5 h-5 md:w-6 h-6 text-brand-700 dark:text-brand-400" />
                </div>
                <h3 className="text-lg md:text-2xl font-black text-[var(--text-primary)] font-display underline decoration-brand-500/20 underline-offset-4 md:underline-offset-8">تحليل القدرات العقلية (الرياضيات)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Visual Progress Stats */}
                <div className="flex flex-wrap md:flex-nowrap justify-between gap-6 md:gap-8 md:border-l border-slate-200 dark:border-white/5 md:pl-12">
                    <MetricItem label="نسبة الفهم" value={`${displayStats.understandingRate}%`} subLabel="تحصيل المحتوى" color="brand" />
                    <MetricItem label="مستوى الأداء" value={`${displayStats.performanceLevel}%`} subLabel="التقييمات" color="emerald" />
                    <MetricItem label="الدقة" value={`${displayStats.accuracy}%`} subLabel="الواجبات" color="amber" />
                </div>

                {/* Performance Context */}
                <div className="flex flex-col items-center md:items-end gap-3 md:gap-6 text-center md:text-right">
                    <div className="space-y-0.5 md:space-y-1">
                        <p className="text-[9px] md:text-xs font-black text-[var(--text-secondary)] opacity-60 uppercase tracking-wide leading-none">الرتبة العالمية بالمنصة</p>
                        <p className="text-xl md:text-3xl font-black text-[var(--text-primary)] leading-none tracking-tighter shadow-sm">على مستوى الدفعة</p>
                    </div>
                    <p className="text-4xl md:text-6xl font-black bg-gradient-to-l from-brand-700 to-brand-500 dark:from-brand-500 dark:to-brand-300 bg-clip-text text-transparent drop-shadow-md">
                        {displayStats.rank}
                    </p>
                </div>
            </div>

            {/* Gamified XP Progress */}
            <div className="mt-10 md:mt-12 space-y-3 md:space-y-4">
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-600 dark:text-amber-500 fill-current" />
                        <span className="text-[10px] md:text-xs font-black text-[var(--text-primary)] opacity-80">نظام الخبرة المتطور (Real-time XP)</span>
                    </div>
                    <span className="text-[10px] md:text-xs font-black text-[var(--text-secondary)] opacity-60">{displayStats.xp} XP</span>
                </div>
                <div className="h-3 md:h-3.5 w-full bg-slate-200 dark:bg-white/5 rounded-full relative p-0.5 md:p-1 overflow-hidden shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((displayStats.xp / 5000) * 100, 100)}%` }}
                        transition={{ duration: 2, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-brand-700 to-brand-500 rounded-full shadow-[0_0_15px_rgba(197,160,89,0.4)]"
                    />
                </div>
            </div>
        </motion.div>
    );
}
