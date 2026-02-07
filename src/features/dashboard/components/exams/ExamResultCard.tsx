import { motion } from 'framer-motion';
import { Clock, Calendar, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

interface ExamResultCardProps {
    exam: {
        id: number | string;
        title: string;
        course: string;
        score: number;
        maxScore: number;
        date: string;
        passed: boolean;
        duration: string;
    };
    index: number;
}

export function ExamResultCard({ exam, index }: ExamResultCardProps) {
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
                {/* 1. Dynamic Score Circle */}
                <div className={clsx(
                    "w-20 h-20 rounded-3xl flex flex-col items-center justify-center shrink-0 transition-all duration-500 border-2 relative z-10",
                    exam.passed
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                        : "bg-rose-500/5 border-rose-500/20 text-rose-500"
                )}>
                    <span className="text-2xl font-black leading-none">{exam.score}</span>
                    <span className="text-[10px] font-bold opacity-60">/{exam.maxScore}</span>
                </div>

                {/* 2. Content Area */}
                <div className="flex-1 min-w-0 text-center md:text-right relative z-10 w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h4 className="text-xl font-black text-[var(--text-primary)] truncate font-display">
                            {exam.title}
                        </h4>
                        <span className={clsx(
                            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border w-fit mx-auto md:mx-0",
                            exam.passed ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}>
                            {exam.passed ? "ناجح ✓" : "لم يوفق ✕"}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-brand)]" />
                            <span>{exam.course}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                            <Clock className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                            <span>{exam.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                            <Calendar className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                            <span>{new Date(exam.date).toLocaleDateString('ar-EG')}</span>
                        </div>
                    </div>

                    {/* Score Bar */}
                    <div className="space-y-1">
                        <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(exam.score / exam.maxScore) * 100}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={clsx(
                                    "h-full rounded-full",
                                    exam.passed ? "bg-emerald-500" : "bg-rose-500"
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Action Button */}
                <Link
                    to={`/exam/review/${exam.id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-500/10 hover:bg-brand-500/20 text-[var(--color-brand)] transition-all relative z-10 shrink-0 border border-brand-500/20"
                >
                    <span className="font-black text-sm">مراجعة</span>
                    <Eye className="w-4 h-4" />
                </Link>

                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </motion.div>
    );
}
