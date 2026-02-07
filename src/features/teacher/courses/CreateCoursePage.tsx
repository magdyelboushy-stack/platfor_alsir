import { useState } from 'react';
import { ArrowRight, Save, Wand2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useToast } from '@/store/uiStore';

// Components
import { CourseFormFields } from '../components/courses/CourseFormFields';

interface CourseFormData {
    title: string;
    description: string;
    price: number;
    education_stage: 'primary' | 'prep' | 'secondary';
    grade_level: string;
    // إضافة الأهداف
    objectives: string[];
}

export function CreateCoursePage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CourseFormData>({
        title: '',
        description: '',
        price: 0,
        education_stage: 'secondary',
        grade_level: 'third_secondary',
        objectives: [],
    });

    const basePath = user?.role === 'assistant' ? '/assistant' : '/admin';

    const handleChange = (field: keyof CourseFormData, value: string | number | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value as any }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.show({ type: 'error', title: 'خطأ', message: 'عنوان الكورس مطلوب' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.post(ENDPOINTS.ADMIN.COURSES.CREATE, formData);
            const courseId = response.data.id;

            toast.show({
                type: 'success',
                title: 'تم بنجاح',
                message: 'تم إنشاء الكورس، يمكنك الآن إضافة المحتوى'
            });

            navigate(`${basePath}/courses/${courseId}`);
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل إنشاء الكورس'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 pb-20 px-4 md:px-0">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        onClick={() => navigate(`${basePath}/courses`)}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500/30 transition-all shadow-sm active:scale-90"
                    >
                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-[var(--text-primary)] mb-1 md:mb-2 font-display">بناء كورس جديد</h1>
                        <p className="text-xs md:text-base text-[var(--text-secondary)] font-bold opacity-60">ابدأ بتحديد الأساسيات، ويمكنك دائماً العودة للتعديل لاحقاً.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl font-black text-sm hover:border-brand-500/30 transition-all shadow-sm active:scale-95">
                        <Wand2 className="w-4 h-4 text-brand-500" />
                        <span>الذكاء الاصطناعي</span>
                    </button>
                </div>
            </div>

            {/* Main Form Content */}
            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
                {/* Form Fields Component */}
                <CourseFormFields formData={formData} onChange={handleChange} />

                {/* Sticky Mobile/Bottom Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-end gap-4 pt-10 border-t border-[var(--border-color)]"
                >
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/courses`)}
                        className="px-8 py-4 bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--text-primary)] rounded-2xl font-black border border-[var(--border-color)] transition-all active:scale-95"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-3 px-10 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black shadow-xl shadow-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="uppercase tracking-widest text-xs">جاري الحفظ...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>حفظ وبدء بناء المنهج</span>
                            </>
                        )}
                    </button>
                </motion.div>
            </form>
        </div>
    );
}
