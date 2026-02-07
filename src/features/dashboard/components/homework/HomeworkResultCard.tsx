import { motion } from 'framer-motion';
import { Clock, XCircle, Calendar, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';

interface HomeworkResultCardProps {
    homework: {
        id: number;
        title: string;
        course: string;
        score: number | null;
        maxScore: number;
        submittedAt: string | null;
        dueDate: string;
        status: 'graded' | 'pending' | 'not_submitted';
    };
    index: number;
}

export function HomeworkResultCard({ homework, index }: HomeworkResultCardProps) {
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
                "hover:border-brand-500/50 hover:shadow-[0_20px_40px_-15px_rgba(197,160,89,0.2)] hover:bg-white/60 dark:hover:bg-[var(--dark-panel)]"
            )}>
                {/* 1. Status Icon / Score */}
                <div className={clsx(
                    "w-20 h-20 rounded-3xl flex flex-col items-center justify-center shrink-0 transition-all duration-500 border-2 relative z-10",
                    homework.status === 'graded' && "bg-emerald-500/5 border-emerald-500/20 text-emerald-500",
                    homework.status === 'pending' && "bg-amber-500/5 border-amber-500/20 text-amber-500",
                    homework.status === 'not_submitted' && "bg-rose-500/5 border-rose-500/20 text-rose-500"
                )}>
                    {homework.status === 'graded' ? (
                        <>
                            <span className="text-2xl font-black leading-none">{homework.score}</span>
                            <span className="text-[10px] font-bold opacity-60">/{homework.maxScore}</span>
                        </>
                    ) : homework.status === 'pending' ? (
                        <Clock className="w-10 h-10" />
                    ) : (
                        <XCircle className="w-10 h-10" />
                    )}
                </div>

                {/* 2. Content Area */}
                <div className="flex-1 min-w-0 text-center md:text-right relative z-10 w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h4 className="text-xl font-black text-[var(--text-primary)] truncate font-display transition-colors">
                            {homework.title}
                        </h4>
                        <span className={clsx(
                            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border w-fit mx-auto md:mx-0",
                            homework.status === 'graded' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            homework.status === 'pending' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                            homework.status === 'not_submitted' && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}>
                            {homework.status === 'graded' && "تم التصحيح"}
                            {homework.status === 'pending' && "قيد المراجعة"}
                            {homework.status === 'not_submitted' && "لم يتم التسليم"}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-brand)]" />
                            <span>{homework.course}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                            <Calendar className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                            <span>موعد التسليم: {new Date(homework.dueDate).toLocaleDateString('ar-EG')}</span>
                        </div>
                    </div>

                    {/* Score Bar (Only if graded) */}
                    {homework.status === 'graded' && homework.score !== null && (
                        <div className="space-y-1">
                            <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(homework.score / homework.maxScore) * 100}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Action Indicator */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-brand-500/10 group-hover:border-brand-500/40 transition-all relative z-10 shrink-0">
                    <ChevronLeft className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--color-brand)] group-hover:translate-x-[-4px] transition-all" />
                </div>
            </div>
        </motion.div>
    );
}
