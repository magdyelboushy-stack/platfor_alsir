// ============================================================
// CourseDetailsPage - Magdy Elboushy Platform (Modular Edition)
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { Navbar } from '@/core/components/Navbar';
import { Footer } from '@/core/components/Footer';
import { ContactSection } from '@/core/components/ContactSection';
import { clsx } from 'clsx';
import { Helmet } from 'react-helmet-async';
import { formatStage, formatGradeLevel } from '@/core/utils/localization';
import { getImageUrl } from '@/core/utils/url';

// Modular Components
import { CourseDetailsHero } from './components/details/CourseDetailsHero';
import { CourseDetailsSidebar } from './components/details/CourseDetailsSidebar';
import { CourseDetailsContent } from './components/details/CourseDetailsContent';
import { RatingModal } from './components/details/RatingModal';

// Normalize backend response to consistent camelCase fields expected by UI
const normalizeLesson = (l: any) => ({
    id: l?.id,
    title: l?.title ?? l?.name ?? '',
    type: l?.type ?? l?.lesson_type ?? l?.file_type ?? 'video',
    duration: l?.duration ?? l?.length ?? '',
    isLocked: l?.isLocked ?? l?.locked ?? l?.is_locked ?? false,
    isCompleted: l?.isCompleted ?? l?.completed ?? l?.is_completed ?? false,
    contentUrl: l?.contentUrl ?? l?.content_url ?? l?.url ?? l?.video_url ?? '',
    // Add description from various possible backend field names
    description: l?.description ?? l?.desc ?? l?.about ?? '',
    // Keep snake_case for player compatibility, also add camelCase alias if needed elsewhere
    watched_seconds: l?.watched_seconds ?? l?.watchedSeconds ?? 0,
    watchedSeconds: l?.watchedSeconds ?? l?.watched_seconds ?? 0,
});

const normalizeModule = (m: any) => ({
    id: m?.id,
    title: m?.title ?? m?.name ?? '',
    lessons: Array.isArray(m?.lessons) ? m.lessons.map(normalizeLesson) : [],
});

const normalizeCourse = (c: any) => ({
    ...c,
    title: c?.title ?? c?.name ?? '',
    thumbnail: c?.thumbnail ?? c?.thumbnail_url ?? c?.image ?? c?.cover ?? '',
    educationStage: c?.educationStage ?? c?.education_stage ?? c?.stage ?? '',
    gradeLevel: c?.gradeLevel ?? c?.grade_level ?? c?.grade ?? c?.level ?? '',
    teacherName: c?.teacherName ?? c?.teacher_name ?? c?.teacher ?? c?.instructor ?? '',
    teacherAvatar: c?.teacherAvatar ?? c?.teacher_avatar ?? null,
    subject: c?.subject ?? '',
    isSubscribed: c?.isSubscribed ?? c?.isEnrolled ?? c?.is_enrolled ?? false,
    isEnrolled: c?.isEnrolled ?? c?.is_enrolled ?? c?.isSubscribed ?? false,
    price: Number(c?.price ?? c?.cost ?? c?.amount ?? 0),
    introVideoUrl: c?.introVideoUrl ?? c?.intro_video_url ?? c?.promo_video_url ?? '',
    curriculum: Array.isArray(c?.curriculum)
        ? c.curriculum.map(normalizeModule)
        : (Array.isArray(c?.modules) ? c.modules.map(normalizeModule) : []),
});

export function CourseDetailsPage() {
    const { id: courseId } = useParams<{ id: string }>();
    const [course, setCourse] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch Course Details
    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.COURSES.DETAIL(courseId || ''));
            // Normalize fields from backend before setting state
            setCourse(normalizeCourse(response.data));
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handlePlayLesson = (lesson: any) => {
        if (!lesson.isLocked) {
            navigate(`/course/${courseId}/learn/${lesson.id}`);
        }
    };

    const handleEnroll = async () => {
        try {
            await apiClient.post(ENDPOINTS.COURSES.ENROLL(courseId || ''));
            fetchCourse(); // Refresh to update enrollment/subscription state
        } catch (error) {
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-2xl shadow-brand-500/20" />
                    <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs">جارٍ تحميل تفاصيل المنهج...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6">
                <div className="text-center max-w-md p-12 rounded-[3.5rem] bg-[var(--bg-card)] border-2 border-[var(--border-color)] shadow-3xl">
                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <X className="w-10 h-10" />
                    </div>
                    <p className="text-2xl font-black text-[var(--text-primary)] mb-6">عذراً، هذا الكورس غير متاح حالياً</p>
                    <button
                        onClick={() => navigate('/courses')}
                        className="w-full py-5 bg-[var(--color-brand)] text-white rounded-2xl font-black shadow-2xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        العودة لقائمة الكورسات
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-500 pb-20" dir="rtl">
            <Helmet>
                <title>{`${course.title} - ${course.subject || ''} ${course.teacherName ? `| ${course.teacherName}` : ''}`}</title>
                <meta
                    name="description"
                    content={course.description || `تعرف على ${course.title} مع ${course.teacherName || 'أفضل المعلمين'}، محتوى منظم وشرح مبسط لل${formatStage(course.educationStage)} و${formatGradeLevel(course.gradeLevel)}.`}
                />
                <meta
                    name="keywords"
                    content={[
                        'كورسات', 'شرح', 'منصة تعليمية', 'PDF',
                        course.title,
                        course.subject || '',
                        formatStage(course.educationStage),
                        formatGradeLevel(course.gradeLevel),
                        course.teacherName || ''
                    ].filter(Boolean).join(', ')}
                />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:title" content={`${course.title} - السير الشامي`} />
                <meta property="og:description" content={course.description || 'محتوى تعليمي منظم وشرح مبسط'} />
                <meta property="og:type" content="article" />
                <meta property="og:image" content={getImageUrl(course.thumbnail) || '/assets/alseershami-banner.jpg'} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Course',
                        name: course.title,
                        description: course.description || '',
                        provider: {
                            '@type': 'Organization',
                            name: 'السير الشامي'
                        },
                        educationalLevel: [formatStage(course.educationStage), formatGradeLevel(course.gradeLevel)].filter(Boolean),
                        instructor: course.teacherName ? { '@type': 'Person', name: course.teacherName } : undefined
                    })}
                </script>
            </Helmet>
            <Navbar />

            {/* Modals */}
            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
            />

            {/* Premium Header Section */}
            <CourseDetailsHero
                course={course}
                onOpenRating={() => setIsRatingModalOpen(true)}
            />

            {/* Main Content Layout */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 -mt-16 relative z-20">
                <div className="grid lg:grid-cols-3 gap-12">

                    {/* Dashboard-Style Sidebar (Pricing, CTA, Stats) - First on Mobile */}
                    <div className="lg:col-span-1 order-1 lg:order-2">
                        <CourseDetailsSidebar
                            course={course}
                            onOpenRating={() => setIsRatingModalOpen(true)}
                            onEnroll={handleEnroll}
                        />
                    </div>

                    {/* Content Area (Tabs, Description, Curriculum) - Second on Mobile */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <CourseDetailsContent
                            course={course}
                            onPlayLesson={handlePlayLesson}
                        />
                    </div>
                </div>
            </main>

            {/* Support section & Footer */}
            <div className="mt-20">
                <ContactSection />
                <Footer />
            </div>

            {/* Mobile Sticky CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[var(--bg-card)]/80 backdrop-blur-2xl border-t border-[var(--border-color)] z-[100] shadow-3xl">
                <button
                    onClick={() => {
                        if (course.isSubscribed) return;
                        handleEnroll();
                    }}
                    disabled={course.isSubscribed}
                    className={clsx(
                        "w-full py-5 rounded-2xl text-white font-black text-lg shadow-2xl transition-all active:scale-95",
                        course.isSubscribed ? "bg-emerald-500 shadow-emerald-500/20" : "bg-[var(--color-brand)] shadow-brand-500/20"
                    )}
                >
                    {course.isSubscribed ? 'تم الاشتراك بنجاح ✅' : (Number(course.price) <= 0 ? 'اشترك مجاناً الآن' : 'اشترك في الكورس')}
                </button>
            </div>
        </div>
    );
}

// Internal icon for error page
const X = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
