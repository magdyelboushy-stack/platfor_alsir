import { motion } from 'framer-motion';
import { ShieldCheck, UserPlus, Layers } from 'lucide-react';
import { clsx } from 'clsx';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface RequestHeaderProps {
    totalRequests: number;
    newRegistrations: number;
    deviceResets: number;
}

export function RequestHeader({ totalRequests, newRegistrations, deviceResets }: RequestHeaderProps) {
    return (
        <motion.div variants={itemVariants} className="space-y-8" dir="rtl">
            <div className="text-right">
                <h1 className="text-2xl lg:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
                    طلبات <span className="text-gradient">الدخول والأمان</span>
                </h1>
                <p className="text-[var(--text-secondary)] mt-2 font-medium opacity-80">
                    مراجعة طلبات الانضمام الجديدة، تغيير الأجهزة، وتنبيهات الأمان في الوقت الفعلي.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="تسجيلات جديدة"
                    value={newRegistrations}
                    icon={UserPlus}
                    color="brand"
                />
                <StatCard
                    label="طلبات الأجهزة"
                    value={deviceResets}
                    icon={ShieldCheck}
                    color="amber"
                />
                <StatCard
                    label="إجمالي الطلبات"
                    value={totalRequests}
                    icon={Layers}
                    color="indigo"
                    highlight
                />
            </div>
        </motion.div>
    );
}

function StatCard({ label, value, icon: Icon, color, highlight }: {
    label: string,
    value: number,
    icon: any,
    color: 'indigo' | 'amber' | 'brand',
    highlight?: boolean
}) {
    const colors = {
        indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        brand: "bg-brand-500/10 text-brand-500 border-brand-500/5"
    };

    return (
        <div className={clsx(
            "p-6 rounded-[2rem] border backdrop-blur-xl transition-all duration-500 group relative overflow-hidden",
            "bg-white/40 dark:bg-[var(--bg-card)] border-brand-500/10 shadow-sm",
            "hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5",
            highlight && "border-brand-500/30 bg-brand-500/[0.03]"
        )}>
            <div className="flex items-center justify-between relative z-10">
                <div className="text-right">
                    <p className="text-[var(--text-secondary)] text-xs font-black mb-1 opacity-70 uppercase tracking-wider">{label}</p>
                    <h4 className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tighter">
                        {value}
                    </h4>
                </div>
                <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                    colors[color]
                )}>
                    <Icon className="w-7 h-7" />
                </div>
            </div>

            {/* Decorative background pulse */}
            <div className={clsx(
                "absolute -bottom-6 -left-6 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40",
                color === 'indigo' ? 'bg-indigo-500' : color === 'amber' ? 'bg-amber-500' : 'bg-brand-500'
            )} />
        </div>
    );
}
