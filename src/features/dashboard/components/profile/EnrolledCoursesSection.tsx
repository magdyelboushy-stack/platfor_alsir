import { motion } from 'framer-motion';
import { Play, CheckCircle2, ChevronLeft, BookOpen } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { getImageUrl } from '@/core/utils/url';

export function EnrolledCoursesSection() {
    const { courses, isLoading } = useDashboardStore();

    if (isLoading && courses.length === 0) {
        return (
            <div className="space-y-4 md:space-y-5 animate-pulse">
                {[1, 2].map(i => <div key={i} className="h-40 bg-[var(--bg-secondary)] rounded-3xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex justify-between items-center px-4 md:px-6">
                <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)] font-display underline decoration-brand-500/20 underline-offset-4 md:underline-offset-8">المقررات الدراسية النشطة</h3>
                <button className="text-[11px] md:text-sm font-black text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors flex items-center gap-1.5 md:gap-2 group">
                    عرض الكل <ChevronLeft className="w-3.5 h-3.5 md:w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="space-y-4 md:space-y-5">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] bg-[var(--bg-secondary)] backdrop-blur-2xl border border-[var(--border-color)] hover:border-brand-500/40 transition-all shadow-sm hover:shadow-xl"
                        >
                            {/* Course Thumbnail */}
                            <div className="relative w-full md:w-44 h-40 md:h-32 rounded-2xl md:rounded-3xl overflow-hidden shrink-0 border border-slate-200/50 dark:border-white/5 shadow-inner bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                {course.thumbnail ? (
                                    <img src={getImageUrl(course.thumbnail)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                                ) : (
                                    <div className="p-4 text-center text-slate-400/30">
                                        <Play className="w-8 h-8 mx-auto opacity-30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <motion.div
                                        whileHover={{ scale: 1.2 }}
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-lg"
                                    >
                                        <Play className="w-5 h-5 md:w-6 h-6 fill-current translate-x-[2px]" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-2 md:space-y-5 flex flex-col justify-center min-w-0">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-1">
                                    <div className="space-y-0.5">
                                        <h4 className="font-black text-base md:text-xl text-[var(--text-primary)] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">{course.title}</h4>
                                        <p className="text-[10px] md:text-xs font-bold text-[var(--text-secondary)] opacity-60 italic">{course.instructor}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 md:px-4 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest self-start md:self-center">
                                        <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        متاح
                                    </div>
                                </div>

                                {/* Progress Info */}
                                <div className="space-y-2 md:space-y-3">
                                    <div className="flex justify-between items-end text-[9px] md:text-[11px] font-black text-[var(--text-secondary)] opacity-60 tracking-tight">
                                        <span>{course.completedCount}/{course.lessonsCount} حصص</span>
                                        <span className="text-brand-700 dark:text-brand-400 text-xs md:text-sm font-black">{course.progress}%</span>
                                    </div>
                                    <div className="h-1.5 md:h-2.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden p-[1px] md:p-[2px] shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${course.progress}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-brand-700 to-brand-500 rounded-full shadow-[0_0_10px_rgba(197,160,89,0.3)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center space-y-4 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)]">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-50">
                            <BookOpen className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="text-xl font-black text-[var(--text-secondary)] opacity-60">لا توجد مقررات دراسية نشطة حالياً.</p>
                        <button className="px-8 py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl font-black text-sm shadow-xl shadow-brand-700/30 transition-all">تصفح الكورسات المتاحة</button>
                    </div>
                )}
            </div>
        </div>
    );
}
