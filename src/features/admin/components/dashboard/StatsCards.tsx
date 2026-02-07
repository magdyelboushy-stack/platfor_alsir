import { Users, GraduationCap, BookOpen, Ticket, TrendingUp, ArrowUpRight } from 'lucide-react';
import { DashboardStats } from '../../services/DashboardService';

interface StatsCardsProps {
    stats: DashboardStats | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
    const statCards = [
        {
            icon: Users,
            label: 'إجمالي الطلاب',
            value: stats?.users.students.total || 0,
            subValue: `${stats?.users.students.active || 0} نشط`,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        },
        {
            icon: GraduationCap,
            label: 'المعلمين',
            value: stats?.users.teachers.total || 0,
            subValue: `${stats?.users.teachers.pending || 0} قيد المراجعة`,
            color: 'text-brand-500',
            bg: 'bg-brand-500/10',
            border: 'border-brand-500/20'
        },
        {
            icon: BookOpen,
            label: 'الكورسات',
            value: stats?.courses.total || 0,
            subValue: `${stats?.courses.published || 0} منشور`,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            icon: Ticket,
            label: 'أكواد التفعيل',
            value: stats?.codes.total || 0,
            subValue: `${stats?.codes.used || 0} مستخدم`,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
                <div
                    key={index}
                    className="bg-[var(--bg-secondary)] rounded-[2rem] p-6 border border-[var(--border-color)] hover:border-brand-500/30 transition-all hover:translate-y-[-4px] shadow-sm hover:shadow-lg group"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.border} border transition-colors group-hover:scale-110 duration-300`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-70">نشط</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl font-black text-[var(--text-primary)] font-display">
                            {stat.value.toLocaleString('ar-EG')}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] font-bold opacity-80">{stat.label}</div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                        <span className="text-xs text-[var(--text-secondary)] font-medium opacity-60">{stat.subValue}</span>
                        <ArrowUpRight className="w-4 h-4 text-[var(--text-secondary)] opacity-30 group-hover:text-brand-500 group-hover:opacity-100 transition-all" />
                    </div>
                </div>
            ))}
        </div>
    );
}
