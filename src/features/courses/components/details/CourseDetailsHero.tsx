import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { getImageUrl } from '@/core/utils/url';
import { getFileUrl } from '@/utils/fileUrl';
import { formatGradeLevel, formatStage } from '@/core/utils/localization';

interface CourseDetailsHeroProps {
    course: any;
    onOpenRating: () => void;
}

export const CourseDetailsHero = ({ course, onOpenRating }: CourseDetailsHeroProps) => {
    return (
        <div className="relative pt-24 min-h-[500px] flex items-center overflow-hidden">
            {/* Dynamic Banner Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src={getImageUrl(course.thumbnail)}
                    alt="Banner"
                    className="w-full h-full object-cover scale-105"
                />
                {/* Multi-layer Premium Overlays */}
                <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-transparent to-transparent" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
                <div className="max-w-4xl space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-3"
                    >
                        <span className="px-5 py-2 rounded-xl bg-[var(--color-brand)] text-white text-[10px] font-black shadow-xl shadow-brand-500/20 uppercase tracking-widest">
                            {formatStage(course.educationStage)}
                        </span>
                        <span className="px-5 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white text-[10px] font-black border border-white/20">
                            {formatGradeLevel(course.gradeLevel)}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-2xl"
                    >
                        {course.title}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center gap-10"
                    >
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-3xl p-3 pr-4 rounded-[2rem] border border-white/10 shadow-2xl">
                            <div className="w-14 h-14 rounded-full border-2 border-[var(--color-brand)] overflow-hidden shadow-2xl">
                                <img
                                    src={getFileUrl(course.teacherAvatar) || '/assets/السير_الشامي/594930133_1456894779774091_6490422839217536606_n.jpg'}
                                    className="w-full h-full object-cover"
                                    alt={course.teacherName}
                                />
                            </div>
                            <div>
                                <p className="text-lg font-black text-white leading-none mb-1">{course.teacherName}</p>
                                <p className="text-xs text-[var(--color-brand)] font-bold">{course.subject}</p>
                            </div>
                        </div>

                        <div className="h-10 w-[1px] bg-white/10 hidden sm:block" />

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-[var(--color-brand)] p-2 px-5 rounded-2xl shadow-xl shadow-brand-600/20">
                                <Star className="w-5 h-5 text-white fill-current" />
                                <span className="text-xl font-black text-white">5.0</span>
                            </div>
                            <button
                                onClick={onOpenRating}
                                className="text-sm text-white/70 font-black hover:text-[var(--color-brand)] transition-all underline underline-offset-8 decoration-brand-500/30"
                            >
                                (شاركنا تقييمك)
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
