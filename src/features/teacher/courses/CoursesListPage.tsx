import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';

// Components
import { CourseCard } from '../components/courses/CourseCard';
import { CourseStats } from '../components/courses/CourseStats';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    price: number;
    educationStage: string;
    gradeLevel: string;
    status: 'draft' | 'published' | 'archived';
    teacherName: string;
    enrollmentCount: number;
    createdAt: string;
    // Optional properties for UI components
    lessons?: number;
    duration?: string;
    students?: number;
    rating?: number;
}

export function CoursesListPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const basePath = user?.role === 'assistant' ? '/assistant' : '/admin';

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.COURSES.LIST);
            setCourses(response.data);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 p-6 lg:p-8"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] font-display tracking-tight leading-tight">
                        إدارة <span className="text-brand-500">محتواك</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] font-bold text-sm md:text-base opacity-60">
                        لدينا اليوم {courses.length} كورسات قيد الإدارة. هل سنضيف جديداً؟
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative group flex-1 sm:flex-initial">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] opacity-40 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="ابحث عن كورس..."
                            className="w-full sm:w-64 pr-11 pl-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-xs font-bold text-[var(--text-primary)] focus:border-brand-500 outline-none transition-all shadow-sm group-hover:border-brand-500/30"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => navigate(`${basePath}/courses/new`)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-brand-500/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إنشاء كورس</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards Section */}
            <CourseStats totalCourses={courses.length} />

            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {isLoading ? (
                    // Skeleton Loading
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-[400px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] animate-pulse" />
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredCourses.map((course) => (
                            <motion.div
                                layout
                                key={course.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CourseCard course={{
                                    ...course,
                                    lessons: course.lessons || 0,
                                    duration: course.duration || '00:00',
                                    students: course.students || 0,
                                    rating: course.rating || 0
                                }} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {/* Add New Quick Card */}
                {!isLoading && searchTerm === '' && (
                    <motion.button
                        variants={itemVariants}
                        onClick={() => navigate(`${basePath}/courses/new`)}
                        className="border-2 border-dashed border-[var(--border-color)] rounded-[2.5rem] flex flex-col items-center justify-center gap-6 p-8 text-[var(--text-secondary)] hover:border-brand-500/50 hover:text-brand-500 hover:bg-brand-500/5 transition-all group min-h-[400px] shadow-sm active:scale-[0.98]"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-[var(--bg-card)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner border border-[var(--border-color)] group-hover:border-brand-500/30">
                            <Plus className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                            <span className="font-black text-xl block mb-2">أضف كورس جديد</span>
                            <p className="text-xs font-bold opacity-60">ابدأ الآن في بناء مستقبلك التعليمي</p>
                        </div>
                    </motion.button>
                )}
            </div>

            {/* Empty State */}
            {!isLoading && filteredCourses.length === 0 && (
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center justify-center py-32 text-center"
                >
                    <div className="w-28 h-28 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] flex items-center justify-center mb-8 shadow-inner">
                        <Search className="w-12 h-12 text-[var(--text-secondary)] opacity-20" />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">لا توجد نتائج مطابقة</h3>
                    <p className="text-[var(--text-secondary)] font-bold opacity-60 max-w-xs leading-relaxed">جرب البحث بكلمات أخرى أو أضف كورساً جديداً لغرض التجربة.</p>
                </motion.div>
            )}
        </motion.div>
    );
}
