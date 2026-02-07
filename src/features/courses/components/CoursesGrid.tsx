import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { CourseCard } from './CourseCard';

interface CoursesGridProps {
    courses: any[];
    levelName: string;
    onEnroll: (courseId: string) => void;
}

export const CoursesGrid = ({ courses, levelName, onEnroll }: CoursesGridProps) => {
    return (
        <section className="py-12 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-16 px-4">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-10 bg-gradient-to-b from-brand-500 to-brand-700 rounded-full shadow-lg shadow-brand-500/20" />
                        <h2 className="text-3xl font-black text-[var(--text-primary)] font-display tracking-tight transition-colors">
                            كورسات <span className="text-brand-700 dark:text-brand-500">{levelName}</span> <span className="text-brand-500">({courses.length})</span>
                        </h2>
                    </div>
                </div>

                {courses.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {courses.map((course, i) => (
                            <CourseCard key={course.id} course={course} index={i} onEnroll={onEnroll} />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-40 bg-[var(--bg-secondary)]/20 rounded-[4rem] border-2 border-dashed border-brand-500/10"
                    >
                        <div className="w-32 h-32 rounded-full bg-brand-500/5 border-2 border-brand-500/10 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <Search className="w-14 h-14 text-brand-500/30" />
                        </div>
                        <h3 className="text-4xl font-black text-[var(--text-primary)] mb-6 font-display transition-colors">لا توجد كورسات مطابقة حالياً</h3>
                        <p className="text-xl text-[var(--text-secondary)] font-bold max-w-lg mx-auto leading-relaxed">بناءً على مرحلتك الدراسية، لا توجد كورسات متاحة في هذا القسم حالياً. جرب تغيير فلاتر البحث.</p>
                    </motion.div>
                )}
            </div>
        </section>
    );
};
