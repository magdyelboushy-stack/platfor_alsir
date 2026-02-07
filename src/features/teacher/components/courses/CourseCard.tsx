import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Star, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/core/utils/url';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface CourseCardProps {
    course: {
        id: number | string;
        title: string;
        thumbnail: string | null;
        lessons: number;
        duration: string;
        students: number;
        rating: number | string;
        status: 'published' | 'draft' | 'archived';
    };
}

export function CourseCard({ course }: CourseCardProps) {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const basePath = user?.role === 'assistant' ? '/assistant' : '/admin';

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-brand-500/30 transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => navigate(`${basePath}/courses/${course.id}`)}
        >
            {/* Thumbnail */}
            <div className="aspect-video relative overflow-hidden bg-slate-900/50">
                <img
                    src={getImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border ${course.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        : course.status === 'archived'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                        }`}>
                        {course.status === 'published' ? 'منشور' : course.status === 'archived' ? 'مؤرشف' : 'مسودة'}
                    </span>
                </div>

                {/* Actions Menu Trigger */}
                <button className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all backdrop-blur-sm">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col text-right">
                <h3 className="text-base font-bold text-white mb-3 line-clamp-2 leading-relaxed group-hover:text-brand-500 transition-colors font-display">
                    {course.title}
                </h3>

                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold mb-5 justify-end">
                    <div className="flex items-center gap-1.5">
                        <span>{course.duration}</span>
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span>{course.lessons} درس</span>
                        <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-300">{course.students} طالب</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{course.rating || '0.0'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
