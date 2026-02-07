// ============================================================
// DashboardGrid - Premium Stats Grid Layout
// ============================================================

import { motion } from 'framer-motion';
import {
    BookOpen,
    GraduationCap,
    Clock,
    FileText,
    Wallet,
    TrendingUp,
    Award,
    Flame
} from 'lucide-react';
import { StatCard } from './StatCard';
import type { DashboardStats } from '../types';

interface DashboardGridProps {
    stats: DashboardStats;
    isLoading?: boolean;
}

// Format minutes to readable time
const formatWatchTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
    }).format(amount);
};

export function DashboardGrid({ stats, isLoading }: DashboardGridProps) {
    if (isLoading) {
        return <DashboardGridSkeleton />;
    }

    const statItems = [
        {
            title: 'Enrolled Courses',
            value: stats.enrolledCourses,
            icon: BookOpen,
            color: 'indigo' as const,
            subtitle: 'Active courses',
        },
        {
            title: 'Completed Lessons',
            value: stats.completedLessons,
            icon: GraduationCap,
            color: 'emerald' as const,
            trend: { value: 12, isPositive: true },
        },
        {
            title: 'Watch Time',
            value: formatWatchTime(stats.totalWatchTime),
            icon: Clock,
            color: 'violet' as const,
            subtitle: 'This month',
        },
        {
            title: 'Upcoming Exams',
            value: stats.upcomingExams,
            icon: FileText,
            color: 'amber' as const,
            subtitle: 'Scheduled',
        },
        {
            title: 'Wallet Balance',
            value: formatCurrency(stats.walletBalance),
            icon: Wallet,
            color: 'emerald' as const,
        },
        {
            title: 'Average Score',
            value: `${stats.averageScore}%`,
            icon: TrendingUp,
            color: 'indigo' as const,
            trend: { value: 5, isPositive: true },
        },
        {
            title: 'Certificates',
            value: stats.certificatesEarned,
            icon: Award,
            color: 'amber' as const,
            subtitle: 'Earned',
        },
        {
            title: 'Learning Streak',
            value: `${stats.streakDays} days`,
            icon: Flame,
            color: 'rose' as const,
            subtitle: 'Keep it up!',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
            {statItems.map((item, index) => (
                <StatCard
                    key={item.title}
                    title={item.title}
                    value={item.value}
                    icon={item.icon}
                    color={item.color}
                    trend={item.trend}
                    subtitle={item.subtitle}
                    delay={index * 0.05}
                />
            ))}
        </motion.div>
    );
}

// Skeleton Loader
function DashboardGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="h-32 rounded-2xl bg-slate-800/50 animate-pulse"
                />
            ))}
        </div>
    );
}
