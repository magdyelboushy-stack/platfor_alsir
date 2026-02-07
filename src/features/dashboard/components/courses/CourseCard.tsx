import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, CheckCircle, ChevronLeft, Clock, User } from 'lucide-react';
import { clsx } from 'clsx';

interface CourseCardProps {
    course: {
        id: number;
        title: string;
        progress: number;
        teacher: string;
        lessons: number;
        completedLessons: number;
        enrolledAt: string;
    };
    index: number;
}

export function CourseCard({ course, index }: CourseCardProps) {
    const isCompleted = course.progress === 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group"
        >
            <Link
                to={`/course/${course.id}`}
                className={clsx(
                    "flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2.5rem] transition-all duration-500 relative overflow-hidden",
                    "bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl",
                    "hover:border-brand-500/50 hover:shadow-[0_20px_40px_-15px_rgba(197,160,89,0.2)] hover:bg-white/60 dark:hover:bg-[var(--dark-panel)]"
                )}
            >
                {/* 1. Visual Icon/Indicator */}
                <div className={clsx(
                    "w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 transition-all duration-500 relative z-10",
                    isCompleted
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-[var(--color-brand)]/10 text-[var(--color-brand)] border border-brand-500/20 group-hover:bg-[var(--color-brand)] group-hover:text-white"
                )}>
                    {isCompleted ? <CheckCircle className="w-10 h-10" /> : <Play className="w-10 h-10 group-hover:scale-110 transition-transform" />}
                </div>

                {/* 2. Content Area */}
                <div className="flex-1 min-w-0 text-center md:text-right relative z-10 w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h4 className="text-xl font-black text-[var(--text-primary)] truncate transition-colors drop-shadow-sm">
                            {course.title}
                        </h4>
                        {isCompleted && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 w-fit mx-auto md:mx-0">
                                مكتمل ✓
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                            <User className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                            <span>{course.teacher}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                            <Clock className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                            <span>{course.completedLessons}/{course.lessons} درس</span>
                        </div>
                    </div>

                    {/* Progress Visualization */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end mb-1 px-1">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase">نسبة الإنجاز</span>
                            <span className={clsx("text-sm font-black", isCompleted ? "text-emerald-500" : "text-[var(--color-brand)]")}>
                                {course.progress}%
                            </span>
                        </div>
                        <div className="h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={clsx(
                                    "h-full rounded-full relative",
                                    isCompleted ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-gradient-to-r from-brand-600 to-brand-400 shadow-[0_0_10px_rgba(197,160,89,0.3)]"
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Action Indicator */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-brand-500/10 group-hover:border-brand-500/40 transition-all relative z-10 shrink-0">
                    <ChevronLeft className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--color-brand)] group-hover:translate-x-[-4px] transition-all" />
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
        </motion.div>
    );
}
