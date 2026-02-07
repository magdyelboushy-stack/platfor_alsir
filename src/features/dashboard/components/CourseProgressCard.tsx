// ============================================================
// CourseProgressCard - Premium Course Progress Display
// ============================================================

import { motion } from 'framer-motion';
import { Play, Clock, CheckCircle } from 'lucide-react';
import { getImageUrl } from '@/core/utils/url';
import { clsx } from 'clsx';
import type { CourseProgress } from '../types';

interface CourseProgressCardProps {
    course: CourseProgress;
    index?: number;
    onContinue?: (courseId: string) => void;
}

export function CourseProgressCard({
    course,
    index = 0,
    onContinue
}: CourseProgressCardProps) {
    const progressPercent = Math.round(course.progress);
    const isCompleted = progressPercent === 100;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={clsx(
                'group relative flex gap-4 p-4 rounded-xl',
                'bg-slate-800/50 border border-white/5',
                'backdrop-blur-sm',
                'transition-all duration-300',
                'hover:bg-slate-800/80 hover:border-white/10',
                'hover:shadow-lg hover:shadow-indigo-500/5'
            )}
        >
            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden">
                <img
                    src={getImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Play Overlay */}
                <div
                    className={clsx(
                        'absolute inset-0 flex items-center justify-center',
                        'bg-black/40 opacity-0 transition-opacity duration-300',
                        'group-hover:opacity-100'
                    )}
                >
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-4 h-4 text-slate-900 ml-0.5" />
                    </div>
                </div>

                {/* Completed Badge */}
                {isCompleted && (
                    <div className="absolute top-1 right-1">
                        <CheckCircle className="w-5 h-5 text-emerald-400 drop-shadow-lg" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate mb-1 group-hover:text-indigo-300 transition-colors">
                    {course.title}
                </h4>

                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.completedLessons}/{course.totalLessons} lessons
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
                        className={clsx(
                            'absolute inset-y-0 left-0 rounded-full',
                            isCompleted
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                        )}
                    />
                </div>
            </div>

            {/* Progress Percentage */}
            <div className="flex-shrink-0 self-center">
                <span
                    className={clsx(
                        'text-sm font-semibold',
                        isCompleted ? 'text-emerald-400' : 'text-slate-300'
                    )}
                >
                    {progressPercent}%
                </span>
            </div>

            {/* Continue Button (on hover) */}
            {!isCompleted && onContinue && (
                <button
                    onClick={() => onContinue(course.courseId)}
                    className={clsx(
                        'absolute right-4 top-1/2 -translate-y-1/2',
                        'px-3 py-1.5 rounded-lg',
                        'bg-indigo-500 text-white text-xs font-medium',
                        'opacity-0 translate-x-2 transition-all duration-300',
                        'group-hover:opacity-100 group-hover:translate-x-0',
                        'hover:bg-indigo-400'
                    )}
                >
                    Continue
                </button>
            )}
        </motion.div>
    );
}
