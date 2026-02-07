import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, RefreshCw, AlertTriangle, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';

interface Subscription {
    id: number;
    courseName: string;
    teacher: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired';
    price: number;
    daysRemaining: number;
}

interface SubscriptionCardProps {
    subscription: Subscription;
    index: number;
}

export function SubscriptionCard({ subscription, index }: SubscriptionCardProps) {
    const isActive = subscription.status === 'active';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group"
        >
            <div className={clsx(
                "flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2.5rem] transition-all duration-500 relative overflow-hidden",
                "bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl",
                "hover:border-brand-500/50 hover:shadow-brand-500/20 hover:bg-white/60 dark:hover:bg-[var(--dark-panel)]",
                !isActive && "opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
            )}>
                {/* 1. Status Visual Cluster */}
                <div className={clsx(
                    "w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 transition-all duration-500 border-2 relative z-10",
                    isActive
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                )}>
                    {isActive ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                </div>

                {/* 2. Primary Information Area */}
                <div className="flex-1 min-w-0 text-center md:text-right relative z-10 w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                        <h4 className="text-xl font-black text-[var(--text-primary)] truncate font-display group-hover:text-[var(--color-brand)] transition-colors">
                            {subscription.courseName}
                        </h4>
                        <span className={clsx(
                            "inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black border w-fit mx-auto md:mx-0 uppercase tracking-widest",
                            isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}>
                            {isActive ? "نشط حالياً" : "انتهى الاشتراك"}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                            <span className="w-2 h-2 rounded-full bg-brand-500 shadow-brand-500/50" />
                            <span>{subscription.teacher}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-secondary)] opacity-60">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                                {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('ar-EG') : '---'}
                                {subscription.endDate && ` - ${new Date(subscription.endDate).toLocaleDateString('ar-EG')}`}
                                {!subscription.endDate && subscription.startDate && ' (مشترك حالياً)'}
                            </span>
                        </div>
                    </div>

                    {/* Progress indicator or Price info */}
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        {isActive ? (
                            <div className={clsx(
                                "flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black border shadow-sm",
                                subscription.daysRemaining <= 30 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            )}>
                                {subscription.daysRemaining <= 30 && <AlertTriangle className="w-3 h-3" />}
                                <span>متبقي {subscription.daysRemaining} يوم</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-500/5 text-rose-500 text-[10px] font-black border border-rose-500/10">
                                <span>قيمة الاشتراك: {subscription.price} ج.م</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Action Logic */}
                <div className="flex items-center justify-center gap-3 relative z-10 w-full md:w-auto">
                    {!isActive && (
                        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-brand)] text-white font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-500/20">
                            <RefreshCw className="w-4 h-4" />
                            تجديد الآن
                        </button>
                    )}
                    <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-brand-500/10 group-hover:border-brand-500/40 transition-all">
                        <ChevronLeft className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--color-brand)] group-hover:translate-x-[-4px] transition-all" />
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
        </motion.div>
    );
}
