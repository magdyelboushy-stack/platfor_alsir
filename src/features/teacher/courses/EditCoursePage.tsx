import { useState, useEffect } from 'react';
import {
    Layout, Settings, ArrowRight, Eye,
    Rocket, MoreVertical, Loader2, Trash2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useToast } from '@/store/uiStore';

// Components
import { CourseSyllabus } from '../components/courses/CourseSyllabus';
import { LessonEditor } from '../components/courses/LessonEditor';
import { CourseGeneralSettings } from '../components/courses/CourseGeneralSettings';
import { CourseMediaUpload } from '../components/courses/CourseMediaUpload';
import { Dialog } from '@/core/components/Dialog';

type TabType = 'builder' | 'settings';

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    intro_video_url: string | null;
    price: number;
    education_stage: string;
    grade_level: string;
    status: string;
    created_at: string;
    updated_at: string;
    // تضمين الأهداف لتمريرها إلى الإعدادات العامة والعرض
    objectives?: string[];
}

interface Lesson {
    id: string;
    title: string;
    content_type: 'video' | 'pdf' | 'exam';
    content_url: string | null;
    duration_minutes: number;
    sort_order: number;
    // Include description for editing and display in LessonEditor
    description?: string | null;
}

interface Section {
    id: string;
    title: string;
    sort_order: number;
    lessons: Lesson[];
}

export function EditCoursePage() {
    const navigate = useNavigate();
    const { id: courseId } = useParams<{ id: string }>();
    const { user } = useAuthStore();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState<TabType>('builder');
    const [course, setCourse] = useState<Course | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const basePath = user?.role === 'assistant' ? '/assistant' : '/admin';

    // Fetch course data on mount
    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        if (!courseId) return;

        setIsLoading(true);
        try {
            // Fetch course details
            const courseResponse = await apiClient.get(ENDPOINTS.ADMIN.COURSES.DETAIL(courseId));
            setCourse(courseResponse.data);

            // Fetch sections with lessons
            const sectionsResponse = await apiClient.get(ENDPOINTS.ADMIN.COURSES.SECTIONS(courseId));
            setSections(sectionsResponse.data || []);
        } catch (error: any) {
            console.error('Failed to fetch course:', error);
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: 'فشل تحميل بيانات الكورس'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectLesson = (lessonId: string) => {
        // Find lesson in sections
        for (const section of sections) {
            const lesson = section.lessons.find(l => l.id === lessonId);
            if (lesson) {
                setSelectedLesson(lesson);
                return;
            }
        }
    };

    const handleAddSection = async () => {
        if (!courseId) return;

        try {
            const response = await apiClient.post(ENDPOINTS.ADMIN.COURSES.SECTIONS(courseId), {
                title: 'قسم جديد',
                sort_order: sections.length
            });

            setSections([...sections, {
                id: response.data.id,
                title: 'قسم جديد',
                sort_order: sections.length,
                lessons: []
            }]);

            toast.show({
                type: 'success',
                title: 'تم',
                message: 'تم إضافة القسم بنجاح'
            });
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل إضافة القسم'
            });
        }
    };

    const handleAddLesson = async (sectionId: string) => {
        try {
            const response = await apiClient.post(ENDPOINTS.ADMIN.SECTIONS.LESSONS(sectionId), {
                title: 'درس جديد',
                content_type: 'video',
                sort_order: 0
            });

            // Update sections state
            setSections(sections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        lessons: [...section.lessons, {
                            id: response.data.id,
                            title: 'درس جديد',
                            content_type: 'video',
                            content_url: null,
                            duration_minutes: 0,
                            sort_order: section.lessons.length
                        }]
                    };
                }
                return section;
            }));

            toast.show({
                type: 'success',
                title: 'تم',
                message: 'تم إضافة الدرس بنجاح'
            });
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل إضافة الدرس'
            });
        }
    };

    const handleUpdateSection = async (sectionId: string, title: string) => {
        try {
            await apiClient.post(ENDPOINTS.ADMIN.SECTIONS.UPDATE(sectionId), { title });

            setSections(sections.map(section =>
                section.id === sectionId ? { ...section, title } : section
            ));
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل تحديث القسم'
            });
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        try {
            await apiClient.post(ENDPOINTS.ADMIN.SECTIONS.DELETE(sectionId));

            setSections(sections.filter(section => section.id !== sectionId));

            toast.show({
                type: 'success',
                title: 'تم',
                message: 'تم حذف القسم بنجاح'
            });
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل حذف القسم'
            });
        }
    };

    const handleUpdateLesson = async (lessonId: string, data: Partial<Lesson>) => {
        try {
            await apiClient.post(ENDPOINTS.ADMIN.LESSONS.UPDATE(lessonId), data);

            // Update sections state
            setSections(sections.map(section => ({
                ...section,
                lessons: section.lessons.map(lesson =>
                    lesson.id === lessonId ? { ...lesson, ...data } : lesson
                )
            })));

            // Update selected lesson if it's the one being edited
            if (selectedLesson?.id === lessonId) {
                setSelectedLesson({ ...selectedLesson, ...data });
            }

            toast.show({
                type: 'success',
                title: 'تم',
                message: 'تم حفظ الدرس بنجاح'
            });
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل حفظ الدرس'
            });
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        try {
            await apiClient.post(ENDPOINTS.ADMIN.LESSONS.DELETE(lessonId));

            // Update sections state
            setSections(sections.map(section => ({
                ...section,
                lessons: section.lessons.filter(lesson => lesson.id !== lessonId)
            })));

            // Clear selected lesson if it's the one being deleted
            if (selectedLesson?.id === lessonId) {
                setSelectedLesson(null);
            }

            toast.show({
                type: 'success',
                title: 'تم',
                message: 'تم حذف الدرس بنجاح'
            });
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل حذف الدرس'
            });
        }
    };

    const handlePublish = async () => {
        if (!courseId) return;

        setIsPublishing(true);
        try {
            await apiClient.post(ENDPOINTS.ADMIN.COURSES.UPDATE(courseId), {
                status: 'published'
            });

            setCourse(prev => prev ? { ...prev, status: 'published' } : prev);

            toast.show({
                type: 'success',
                title: 'تم النشر',
                message: 'تم نشر الكورس بنجاح'
            });
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل نشر الكورس'
            });
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCourseUpdate = async (data: Partial<Course>) => {
        if (!courseId) return;

        try {
            await apiClient.post(ENDPOINTS.ADMIN.COURSES.UPDATE(courseId), data);
            setCourse(prev => prev ? { ...prev, ...data } : prev);

            toast.show({
                type: 'success',
                title: 'تم',
                message: 'تم حفظ التغييرات'
            });
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل حفظ التغييرات'
            });
        }
    };

    const handleDeleteCourse = async () => {
        if (!courseId) return;
        setIsDeleting(true);
        try {
            await apiClient.post(ENDPOINTS.ADMIN.COURSES.DELETE(courseId));

            toast.show({
                type: 'success',
                title: 'تم',
                message: 'تم حذف الكورس وكل البيانات المرتبطة به بنجاح'
            });

            setIsConfirmOpen(false);
            navigate(`${basePath}/courses`);
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل حذف الكورس'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)] font-bold">جاري تحميل الكورس...</p>
                </div>
            </div>
        );
    }

    // Course not found
    if (!course) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[var(--text-secondary)] font-bold text-xl mb-4">الكورس غير موجود</p>
                    <button
                        onClick={() => navigate(`${basePath}/courses`)}
                        className="px-6 py-3 bg-brand-500 text-white rounded-xl font-bold"
                    >
                        العودة للقائمة
                    </button>
                </div>
            </div>
        );
    }

    const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
    const statusLabel = course.status === 'published' ? 'منشور' : course.status === 'draft' ? 'مسودة' : 'مؤرشف';
    const statusColor = course.status === 'published' ? 'emerald' : course.status === 'draft' ? 'amber' : 'slate';

    return (
        <div className="h-full md:h-[calc(100vh-140px)] flex flex-col gap-6 px-4 md:px-0 pb-10 md:pb-0">
            {/* Top Toolbar */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 md:p-4 rounded-3xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-sm backdrop-blur-md sticky top-0 md:static z-50">
                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        onClick={() => navigate(`${basePath}/courses`)}
                        className="w-10 h-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-brand-500 transition-all active:scale-90"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm md:text-lg font-black text-[var(--text-primary)] truncate">{course.title}</h1>
                            <span className={`hidden sm:inline-block px-2 py-0.5 bg-${statusColor}-500/10 text-${statusColor}-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-${statusColor}-500/20`}>
                                {statusLabel}
                            </span>
                        </div>
                        <p className="text-[8px] md:text-[10px] text-[var(--text-secondary)] font-bold opacity-60 uppercase tracking-widest truncate">
                            {sections.length} وحدة • {totalLessons} درس
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 bg-[var(--bg-main)] p-1 md:p-1.5 rounded-2xl border border-[var(--border-color)] shadow-inner overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('builder')}
                        className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'builder'
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Layout className="w-4 h-4" />
                        بناء المنهج
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap ${activeTab === 'settings'
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        الإعدادات
                    </button>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-none pt-3 lg:pt-0 border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 md:px-4 py-2 text-[var(--text-secondary)] hover:text-brand-500 font-black text-xs transition-colors">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">معاينة</span>
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing || course.status === 'published'}
                            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-slate-900 border border-slate-700 text-white rounded-xl font-black text-xs shadow-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isPublishing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Rocket className="w-4 h-4" />
                            )}
                            <span>{course.status === 'published' ? 'منشور' : 'نشر'}</span>
                        </button>
                        <button
                            onClick={() => setIsConfirmOpen(true)}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-red-600 border border-red-700 text-white rounded-xl font-black text-xs shadow-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            <span>حذف الكورس</span>
                        </button>
                    </div>
                    <button className="p-2.5 text-[var(--text-secondary)] hover:bg-[var(--bg-main)] rounded-xl transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'builder' ? (
                    <motion.div
                        key="builder"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 min-h-0 overflow-y-auto lg:overflow-hidden no-scrollbar"
                    >
                        {/* Left Side: Syllabus Builder */}
                        <div className="w-full lg:col-span-4 h-auto lg:h-full lg:overflow-hidden shrink-0">
                            <CourseSyllabus
                                sections={sections}
                                selectedLessonId={selectedLesson?.id ?? null}
                                onSelectLesson={handleSelectLesson}
                                onAddSection={handleAddSection}
                                onAddLesson={handleAddLesson}
                                onUpdateSection={handleUpdateSection}
                                onDeleteSection={handleDeleteSection}
                            />
                        </div>

                        {/* Right Side: Lesson Content Editor */}
                        <div className="w-full lg:col-span-8 h-auto lg:h-full lg:overflow-hidden">
                            <LessonEditor
                                lesson={selectedLesson}
                                onSave={handleUpdateLesson}
                                onDelete={handleDeleteLesson}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-12 pb-10"
                    >
                        <div className="max-w-4xl mx-auto space-y-12">
                            <CourseGeneralSettings
                                course={course}
                                onUpdate={handleCourseUpdate}
                            />
                            <CourseMediaUpload
                                thumbnail={course.thumbnail}
                                onThumbnailChange={(url) => handleCourseUpdate({ thumbnail: url })}
                                introVideoUrl={course.intro_video_url}
                                onIntroVideoChange={(url) => handleCourseUpdate({ intro_video_url: url })}
                            />

                            {/* Additional Settings - Advanced */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-xl font-black text-[var(--text-primary)]">إعدادات متقدمة</h2>
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-brand-500/10 text-brand-500 rounded-2xl font-black text-xs hover:bg-brand-500 hover:text-white transition-all">
                                        تطبيق الكل
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: 'تفعيل التعليقات على الدروس', key: 'comments' },
                                        { label: 'إرسال شهادة إتمام تلقائية', key: 'certs' },
                                        { label: 'السماح بتحميل ملفات PDF', key: 'downloads' }
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] group hover:border-brand-500/30 transition-all">
                                            <span className="font-bold text-[var(--text-primary)]">{item.label}</span>
                                            <div className="w-12 h-6 rounded-full bg-emerald-500 relative cursor-pointer shadow-inner">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {/* Dialog: Confirm Delete Course */}
                <Dialog
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    type="warning"
                    title="تأكيد حذف الكورس"
                    message="هل أنت متأكد من حذف هذا الكورس نهائيًا؟ سيؤدي ذلك إلى إزالة الأقسام والدروس والتسجيلات والتقدم المرتبط به للطلاب."
                    buttonText="إلغاء"
                >
                    <button
                        onClick={handleDeleteCourse}
                        disabled={isDeleting}
                        className="w-full py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xl transition-all shadow-xl font-display active:scale-[0.98]"
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> : null}
                        تأكيد الحذف
                    </button>
                    <p className="text-[var(--text-secondary)] font-bold mt-4">لا يمكن التراجع عن هذه العملية.</p>
                </Dialog>
            </AnimatePresence>
        </div>
    );
}
