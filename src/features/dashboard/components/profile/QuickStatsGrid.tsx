import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Clock, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { useDashboardStore } from '@/store/dashboardStore';

interface StatItemProps {
    icon: any;
    label: string;
    value: string | number;
    color: string;
    delay?: number;
}

function StatItem({ icon: Icon, label, value, color, delay = 0 }: StatItemProps) {
    const colorStyles: Record<string, string> = {
        cyan: "bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-500/20 shadow-brand-500/5",
        emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/5",
        purple: "bg-brand-600/10 text-brand-800 dark:text-brand-500 border-brand-600/20 shadow-brand-600/5",
        amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 shadow-amber-500/5"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6 }}
            className="p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] bg-[var(--bg-secondary)] backdrop-blur-2xl border border-[var(--border-color)] hover:border-brand-500/50 transition-all group shadow-sm hover:shadow-xl"
        >
            <div className={clsx("w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 border transition-all group-hover:scale-110 group-hover:rotate-3 shadow-inner", colorStyles[color])}>
                <Icon className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <p className="text-xl md:text-4xl font-black text-[var(--text-primary)] mb-0.5 md:mb-2 ml-1 tracking-tight">{value}</p>
            <p className="text-[9px] md:text-xs font-black text-[var(--text-secondary)] opacity-60 uppercase tracking-widest leading-none">{label}</p>
        </motion.div>
    );
}

export function QuickStatsGrid() {
    const { stats, fetchDashboardData, isLoading } = useDashboardStore();

    useEffect(() => {
        if (!stats) fetchDashboardData();
    }, []);

    const displayStats = stats || {
        enrolledCoursesCount: 0,
        totalExamsScore: 0,
        learningHours: 0,
        streak: 'جديد'
    };

    if (isLoading && !stats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 opacity-50 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-[var(--bg-secondary)] rounded-3xl" />)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <StatItem icon={BookOpen} label="الحصص المسجلة" value={displayStats.enrolledCoursesCount} color="cyan" delay={0.1} />
            <StatItem icon={Target} label="إجمالي الدرجات" value={displayStats.totalExamsScore} color="emerald" delay={0.2} />
            <StatItem icon={Clock} label="ساعات التعلم" value={displayStats.learningHours} color="purple" delay={0.3} />
            <StatItem icon={Activity} label="الاستمرارية" value={displayStats.streak} color="amber" delay={0.4} />
        </div>
    );
}
