// ============================================================
// StatCard - Premium Dashboard Statistic Card
// ============================================================

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
    delay?: number;
}

const colorVariants = {
    indigo: {
        bg: 'from-indigo-500/20 to-indigo-600/10',
        icon: 'bg-indigo-500/20 text-indigo-400',
        glow: 'group-hover:shadow-indigo-500/20',
    },
    emerald: {
        bg: 'from-emerald-500/20 to-emerald-600/10',
        icon: 'bg-emerald-500/20 text-emerald-400',
        glow: 'group-hover:shadow-emerald-500/20',
    },
    amber: {
        bg: 'from-amber-500/20 to-amber-600/10',
        icon: 'bg-amber-500/20 text-amber-400',
        glow: 'group-hover:shadow-amber-500/20',
    },
    rose: {
        bg: 'from-rose-500/20 to-rose-600/10',
        icon: 'bg-rose-500/20 text-rose-400',
        glow: 'group-hover:shadow-rose-500/20',
    },
    violet: {
        bg: 'from-violet-500/20 to-violet-600/10',
        icon: 'bg-violet-500/20 text-violet-400',
        glow: 'group-hover:shadow-violet-500/20',
    },
};

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'indigo',
    delay = 0,
}: StatCardProps) {
    const colors = colorVariants[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={clsx(
                'group relative overflow-hidden rounded-2xl p-6',
                'bg-gradient-to-br', colors.bg,
                'border border-white/5',
                'backdrop-blur-xl',
                'transition-all duration-500 ease-out',
                'hover:-translate-y-1',
                'hover:shadow-2xl',
                colors.glow
            )}
        >
            {/* Background Glow Effect */}
            <div
                className={clsx(
                    'absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl',
                    'bg-gradient-to-br opacity-0 transition-opacity duration-500',
                    'group-hover:opacity-30',
                    color === 'indigo' && 'from-indigo-500 to-violet-500',
                    color === 'emerald' && 'from-emerald-500 to-teal-500',
                    color === 'amber' && 'from-amber-500 to-orange-500',
                    color === 'rose' && 'from-rose-500 to-pink-500',
                    color === 'violet' && 'from-violet-500 to-purple-500',
                )}
            />

            <div className="relative z-10 flex items-start justify-between">
                {/* Content */}
                <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-400">{title}</p>

                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white font-display">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </span>

                        {trend && (
                            <span
                                className={clsx(
                                    'flex items-center text-xs font-medium',
                                    trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                                )}
                            >
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                        )}
                    </div>

                    {subtitle && (
                        <p className="text-xs text-slate-500">{subtitle}</p>
                    )}
                </div>

                {/* Icon */}
                <div
                    className={clsx(
                        'flex h-12 w-12 items-center justify-center rounded-xl',
                        colors.icon,
                        'transition-transform duration-300',
                        'group-hover:scale-110'
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {/* Decorative Bottom Border */}
            <div
                className={clsx(
                    'absolute bottom-0 left-0 h-1 w-full',
                    'bg-gradient-to-r opacity-0 transition-opacity duration-300',
                    'group-hover:opacity-100',
                    color === 'indigo' && 'from-indigo-500 to-violet-500',
                    color === 'emerald' && 'from-emerald-500 to-teal-500',
                    color === 'amber' && 'from-amber-500 to-orange-500',
                    color === 'rose' && 'from-rose-500 to-pink-500',
                    color === 'violet' && 'from-violet-500 to-purple-500',
                )}
            />
        </motion.div>
    );
}
