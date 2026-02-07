import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Info, MessageSquare, CheckCircle, Clock, PlayCircle, FileText, HelpCircle, Lock, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface CourseDetailsContentProps {
    course: any;
    onPlayLesson: (lesson: any) => void;
}

export const CourseDetailsContent = ({ course, onPlayLesson }: CourseDetailsContentProps) => {
    const [activeTab, setActiveTab] = useState<'curriculum' | 'overview'>('curriculum');
    const [expandedModule, setExpandedModule] = useState<string | null>(course.curriculum?.[0]?.id || null);

    const objectives: string[] = Array.isArray(course?.objectives) ? course.objectives : [];

    return (
        <div className="space-y-10">
            {/* Tab Navigation */}
            <div className="p-3 bg-[var(--bg-card)] rounded-[2.5rem] border-2 border-[var(--border-color)] shadow-2xl flex gap-3">
                {[
                    { id: 'curriculum', label: 'محتوى الكورس', icon: LayoutGrid },
                    { id: 'overview', label: 'عن الكورس', icon: Info },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={clsx(
                            "flex-1 py-5 rounded-[2rem] font-black text-base transition-all duration-500 flex items-center justify-center gap-3",
                            activeTab === tab.id
                                ? "bg-[var(--color-brand)] text-white shadow-2xl shadow-brand-500/30 -translate-y-1"
                                : "text-[var(--text-secondary)] hover:bg-white/5 uppercase tracking-tighter"
                        )}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {/* Description Section */}
                        <div className="p-10 rounded-[3rem] bg-[var(--bg-card)] border-2 border-[var(--border-color)] shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10 flex items-center gap-5 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-[var(--color-brand)] shadow-inner">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h3 className="text-3xl font-black text-[var(--text-primary)] font-display uppercase tracking-tighter">عن هذا الكورس</h3>
                            </div>
                            <p className="relative z-10 text-[var(--text-secondary)] leading-[2] text-xl font-bold transition-colors">
                                {course.description}
                            </p>
                        </div>

                        {/* Objectives Section */}
                        <div className="p-10 rounded-[3rem] bg-[var(--bg-card)] border-2 border-[var(--border-color)] shadow-3xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
                            <div className="relative z-10 flex items-center gap-5 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-3xl font-black text-[var(--text-primary)] font-display uppercase tracking-tighter">أهداف الكورس</h3>
                            </div>
                            {objectives.length ? (
                                <div className="relative z-10 grid sm:grid-cols-2 gap-6">
                                    {objectives.map((obj: string, i: number) => (
                                        <div key={i} className="flex items-center gap-5 p-6 rounded-3xl bg-white/5 border-2 border-transparent hover:border-emerald-500/20 transition-all hover:scale-[1.02] shadow-sm">
                                            <div className="shrink-0 w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <span className="font-black text-[var(--text-primary)] text-lg transition-colors leading-relaxed tracking-tight">{obj}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="relative z-10 text-[var(--text-secondary)] font-bold">لا توجد أهداف محددة لهذا الكورس حالياً.</p>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="curriculum"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        {course.curriculum?.map((module: any, idx: number) => (
                            <div key={module.id} className="relative group/module">
                                {/* Timeline Trace */}
                                <div className="absolute top-10 bottom-0 right-[2.45rem] w-1 bg-gradient-to-b from-brand-500/30 via-brand-500/10 to-transparent z-0 hidden sm:block rounded-full" />

                                <div
                                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                                    className={clsx(
                                        "relative z-10 p-6 sm:p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-700 flex items-center justify-between shadow-2xl overflow-hidden",
                                        expandedModule === module.id
                                            ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white shadow-brand-500/20"
                                            : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-brand-500/50"
                                    )}
                                >
                                    {/* Shining Effect when expanded */}
                                    {expandedModule === module.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                                    )}

                                    <div className="flex items-center gap-6">
                                        <div className={clsx(
                                            "w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-2xl font-black shadow-inner shrink-0 transition-transform duration-500",
                                            expandedModule === module.id ? "bg-white/20 rotate-12" : "bg-white/5 text-[var(--color-brand)]"
                                        )}>
                                            {String(idx + 1).padStart(2, '0')}
                                        </div>
                                        <div>
                                            <h3 className="text-xl lg:text-3xl font-black font-display mb-2 leading-none">{module.title}</h3>
                                            <p className={clsx("text-xs font-black uppercase tracking-[0.2em] opacity-80")}>
                                                {module.lessons?.length || 0} درس متاح الآن
                                            </p>
                                        </div>
                                    </div>
                                    <div className={clsx(
                                        "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-inner",
                                        expandedModule === module.id ? "bg-white/20 rotate-90" : "bg-white/5 border border-white/10"
                                    )}>
                                        <ChevronRight className="w-8 h-8" />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedModule === module.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-4 space-y-4 pr-0 sm:pr-28 pl-4 py-4">
                                                {module.lessons?.map((lesson: any) => (
                                                    <div key={lesson.id} className="p-6 rounded-[2rem] bg-[var(--bg-card)] border-2 border-[var(--border-color)] flex flex-wrap items-center justify-between hover:border-[var(--color-brand)]/30 transition-all shadow-xl group/lesson relative overflow-hidden">
                                                        <div className="flex items-center gap-6 relative z-10">
                                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--color-brand)] group-hover/lesson:bg-[var(--color-brand)] group-hover/lesson:text-white transition-all transform group-hover/lesson:scale-110 shadow-inner">
                                                                {lesson.type === 'video' ? <PlayCircle className="w-8 h-8" /> :
                                                                    lesson.type === 'pdf' ? <FileText className="w-8 h-8" /> :
                                                                        <HelpCircle className="w-8 h-8" />}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xl font-black text-[var(--text-primary)] mb-2 tracking-tight">{lesson.title}</h5>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
                                                                        <Clock className="w-4 h-4" />
                                                                        {lesson.duration}
                                                                    </span>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)]" />
                                                                    <span className="text-[10px] font-black uppercase px-4 py-1.5 rounded-xl bg-brand-500/10 text-[var(--color-brand)] shadow-inner">
                                                                        {lesson.type === 'video' ? 'شرح فيديو' : lesson.type === 'pdf' ? 'ملخص PDF' : 'اختبار'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="relative z-10 mt-4 sm:mt-0">
                                                            {lesson.isLocked ? (
                                                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-secondary)] bg-white/5 shadow-inner border border-white/5">
                                                                    <Lock className="w-5 h-5 opacity-40" />
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => onPlayLesson(lesson)}
                                                                    className="px-8 py-3 rounded-2xl bg-[var(--color-brand)] text-white text-[11px] font-black shadow-xl shadow-brand-500/20 hover:scale-[1.05] active:scale-95 transition-all uppercase tracking-widest"
                                                                >
                                                                    أبدأ الآن
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
