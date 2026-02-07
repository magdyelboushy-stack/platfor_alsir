// ============================================================
// CoursePlayerPage - Gold Premium Edition (Magdy Elboushy Luxe)
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Play,
    ChevronRight,
    CheckCircle,
    Menu,
    X,
    FileText,
    HelpCircle,
    Clock,
    Zap,
    Lock,
    Settings,
    Share2,
    ExternalLink,
    Download,
} from 'lucide-react';
import { clsx } from 'clsx';
import { HLSPlayer } from '../player/components/HLSPlayer';
import { VdoCipherPlayer } from '../player/components/VdoCipherPlayer';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { getEmbedUrl, getImageUrl } from '@/core/utils/url';
import { formatGradeLevel } from '@/core/utils/localization';

const isVdoCipherId = (url: string) => {
    if (!url) return false;
    if (url.includes('://')) return false;
    return /^[a-z0-9]{32}$/i.test(url);
};

export function CoursePlayerPage() {
    const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
    const [course, setCourse] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'content' | 'attachments' | 'notes'>('content');
    const navigate = useNavigate();
    const lastSyncTime = useRef<number>(0);
    const lastDurationRef = useRef<number>(0);
    const lastSecondsRef = useRef<number>(0);

    const allLessons = course?.curriculum?.flatMap((m: any) => m.lessons) || [];
    const currentLesson = allLessons.find((l: any) => l.id === lessonId) || allLessons[0];

    const fetchCourse = useCallback(async () => {
        if (!courseId) return;
        try {
            const response = await apiClient.get(ENDPOINTS.COURSES.DETAIL(courseId));
            setCourse(response.data);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    const handleLessonComplete = useCallback(async () => {
        if (!currentLesson?.id) return;
        try {
            const formData = new FormData();
            const d = lastDurationRef.current && lastDurationRef.current > 0 ? Math.floor(lastDurationRef.current) : 0;
            if (d > 0) {
                formData.append('duration', d.toString());
            }
            await apiClient.post(ENDPOINTS.PLAYER.COMPLETE(currentLesson.id), formData);
            // Success feedback
            try {
                const { useUIStore } = await import('@/store');
                const showToast = useUIStore.getState().showToast;
                showToast({ type: 'success', title: 'تم الإكمال', message: 'تم إكمال الدرس بنجاح، أحسنت!', duration: 5000 });
            } catch (e) { }
            await fetchCourse();
        } catch (error: any) {
            // Show feedback to the user
            const msg = error?.response?.data?.error || 'فشل إكمال الدرس، تأكد من مشاهدة الفيديو بالكامل ثم أعد المحاولة';
            console.error('Failed to mark lesson complete:', error);
            // Use UI store toast if available
            try {
                const { useUIStore } = await import('@/store');
                const showToast = useUIStore.getState().showToast;
                showToast({ type: 'error', title: 'تعذر الإكمال', message: msg, duration: 6000 });
            } catch (e) { }
        }
    }, [currentLesson?.id, fetchCourse]);

    const handleTimeUpdate = useCallback(async (seconds: number, duration?: number) => {
        if (!currentLesson?.id) return;

        const now = Date.now();
        const isEnded = duration && seconds >= duration - 0.5; // treat as ended
        // Sync every 10 seconds, but always sync once at end
        if (!isEnded && (now - lastSyncTime.current < 10000)) return;

        lastSyncTime.current = now;
        lastSecondsRef.current = seconds || 0;
        if (typeof duration === 'number' && duration > 0) {
            lastDurationRef.current = duration;
        }
        try {
            const formData = new FormData();
            formData.append('seconds', Math.floor(seconds).toString());
            if (typeof duration === 'number' && duration > 0) {
                formData.append('duration', Math.floor(duration).toString());
            }
            await apiClient.post(ENDPOINTS.PLAYER.PROGRESS(currentLesson.id), formData);
        } catch (error) {
            console.error('Failed to update progress timestamp:', error);
        }
    }, [currentLesson?.id]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse, lessonId]);

    if (loading) return (
        <div className="h-screen bg-[var(--bg-main)] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin shadow-lamp" />
        </div>
    );

    if (!course || !course.isEnrolled) {
        return (
            <div className="h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
                <div className="w-40 h-40 bg-[var(--color-brand)]/10 text-[var(--color-brand)] rounded-[2.5rem] flex items-center justify-center mb-10 border border-[var(--color-brand)]/20 shadow-lamp">
                    <Lock className="w-20 h-20" />
                </div>
                <h1 className="text-4xl font-black text-[var(--text-primary)] mb-6">الوصول مقيد</h1>
                <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="px-12 py-5 bg-[var(--color-brand)] text-white rounded-[1.5rem] font-black shadow-2xl hover:scale-105 transition-all"
                >
                    انضم للمسار الآن
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-main)] overflow-hidden font-body" dir="rtl">
            {/* Header */}
            <header className="h-16 md:h-20 shrink-0 bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-b border-[var(--border-color)] flex items-center justify-between px-4 md:px-8 z-[60] relative">
                <div className="flex items-center gap-3 md:gap-6 min-w-0">
                    <Link to={`/course/${courseId}`} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-card)] transition-all shrink-0">
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                    <p className="text-sm md:text-lg font-black text-[var(--text-primary)] flex items-center gap-2 truncate">
                        <span className="w-1.5 h-6 bg-[var(--color-brand)] rounded-full hidden md:block" />
                        <span className="truncate">{currentLesson?.title}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 md:gap-4 shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={clsx(
                            "w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl border transition-all",
                            isSidebarOpen ? "bg-[var(--color-brand)]/10 border-[var(--color-brand)]/20 text-[var(--color-brand)]" : "bg-[var(--bg-main)] border-[var(--border-color)]"
                        )}
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    {!currentLesson?.isCompleted ? (
                        <button onClick={handleLessonComplete} className="px-3 md:px-6 py-2 md:py-2.5 bg-[var(--color-brand)] text-white rounded-xl font-black text-[10px] md:text-xs shadow-lamp hover:scale-105 transition-all">
                            <span className="hidden sm:inline">إكمال الدرس</span>
                            <CheckCircle className="w-4 h-4 sm:hidden" />
                        </button>
                    ) : (
                        <div className="px-3 md:px-6 py-2 md:py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-black text-[10px] md:text-xs flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> <span className="hidden sm:inline">تم الإكمال</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{
                        width: isSidebarOpen ? (window.innerWidth < 1024 ? '100%' : 450) : 0,
                        opacity: isSidebarOpen ? 1 : 0,
                        x: isSidebarOpen ? 0 : 50
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={clsx(
                        "z-50 shrink-0 border-l border-[var(--border-color)] bg-[var(--bg-card)] md:bg-[var(--bg-card)]/50 backdrop-blur-3xl overflow-hidden flex flex-col h-[calc(100vh-4rem)] md:h-full fixed md:sticky top-16 md:top-0 right-0",
                        !isSidebarOpen && "pointer-events-none"
                    )}
                >
                    <div className="w-full md:w-[450px] flex flex-col h-full max-w-full">
                        <div className="p-6 md:p-10 shrink-0 border-b border-[var(--border-color)]">
                            <h3 className="text-2xl font-black mb-6">محتوى المسار</h3>
                            <div className="p-1 h-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-full shadow-inner">
                                <div className="h-full bg-[var(--color-brand)] rounded-full shadow-lamp" style={{ width: '65%' }} />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
                            {course.curriculum?.map((module: any, mi: number) => (
                                <div key={module.id}>
                                    <div className="flex items-center gap-4 mb-4 px-4 font-black text-xs uppercase opacity-40">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center">{mi + 1}</div>
                                        {module.title}
                                    </div>
                                    <div className="space-y-3">
                                        {module.lessons?.map((lesson: any) => {
                                            const active = currentLesson?.id === lesson.id;
                                            return (
                                                <div
                                                    key={lesson.id}
                                                    onClick={() => !lesson.isLocked && navigate(`/course/${courseId}/learn/${lesson.id}`)}
                                                    className={clsx(
                                                        "group flex items-center gap-5 p-5 rounded-[2rem] border-2 transition-all cursor-pointer relative",
                                                        active ? "bg-[var(--color-brand)] text-white border-transparent shadow-lamp" :
                                                            lesson.isLocked ? "opacity-40 grayscale cursor-not-allowed border-transparent" : "hover:border-[var(--color-brand)]/20 border-transparent bg-[var(--bg-secondary)]"
                                                    )}
                                                >
                                                    <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", active ? "bg-white/20" : "bg-[var(--bg-main)] shadow-inner text-[var(--color-brand)]")}>
                                                        {lesson.isLocked ? <Lock className="w-5 h-5" /> : lesson.type === 'video' ? <Play className="w-5 h-5 fill-current" /> : <FileText className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 truncate font-black text-sm">{lesson.title}</div>
                                                    {lesson.isCompleted && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.aside>

                <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {/* Media Container */}
                    <div className="w-full bg-[#0a0f18] relative aspect-video shadow-2xl overflow-hidden">
                        {currentLesson?.type === 'video' ? (
                            <div className="absolute inset-0 bg-black">
                                {currentLesson.contentUrl?.includes('.m3u8') ? (
                                    <HLSPlayer
                                        src={currentLesson.contentUrl}
                                        onComplete={handleLessonComplete}
                                        onTimeUpdate={handleTimeUpdate}
                                        initialTime={currentLesson.watched_seconds}
                                    />
                                ) : isVdoCipherId(currentLesson.contentUrl) ? (
                                    <VdoCipherPlayer
                                        videoId={currentLesson.contentUrl}
                                        onVideoEnd={handleLessonComplete}
                                        onTimeUpdate={handleTimeUpdate}
                                        initialTime={currentLesson.watched_seconds}
                                    />
                                ) : (
                                    <iframe src={getEmbedUrl(currentLesson.contentUrl)} className="w-full h-full border-0" allowFullScreen />
                                )}
                            </div>
                        ) : currentLesson?.type === 'pdf' ? (
                            <div className="absolute inset-0 bg-[#1e293b] flex flex-col">
                                {/* PDF Viewer - using object with iframe fallback */}
                                <div className="flex-1 relative bg-[#525659]">
                                    <object
                                        data={`${getImageUrl(currentLesson?.contentUrl)}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                                        type="application/pdf"
                                        className="w-full h-full"
                                        aria-label={currentLesson.title}
                                    >
                                        {/* Fallback: PDF.js viewer if native PDF viewer fails */}
                                        <iframe
                                            src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(getImageUrl(currentLesson?.contentUrl))}`}
                                            className="w-full h-full border-0"
                                            title={currentLesson.title}
                                            sandbox="allow-scripts allow-same-origin allow-modals"
                                        />
                                    </object>
                                </div>
                                {/* Download & Open Buttons - Fixed at bottom */}
                                <div className="shrink-0 p-3 md:p-4 bg-gradient-to-t from-black/90 to-transparent backdrop-blur-sm border-t border-white/10">
                                    <div className="flex gap-2 md:gap-3">
                                        <a
                                            href={getImageUrl(currentLesson?.contentUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 bg-blue-500 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-lg hover:bg-blue-600 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                                            <span>فتح في تاب جديد</span>
                                        </a>
                                        <a
                                            href={getImageUrl(currentLesson?.contentUrl)}
                                            download
                                            className="flex-1 flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 bg-red-500 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-lg hover:bg-red-600 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <Download className="w-4 h-4 md:w-5 md:h-5" />
                                            <span>تحميل PDF</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center p-12">
                                <div className="max-w-xl w-full text-center p-16 bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border border-white/10">
                                    <HelpCircle className="w-20 h-20 mx-auto mb-8 text-amber-500" />
                                    <h2 className="text-4xl font-black text-white mb-10">بداية الاختبار</h2>
                                    <Link to={`/course/${courseId}/exam/${currentLesson?.contentUrl}`} className="inline-flex py-6 px-16 bg-amber-500 text-white rounded-[2rem] font-black text-xl shadow-lamp">ابدأ الآن</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta & Tabs */}
                    <div className="p-5 md:p-12 max-w-6xl mx-auto space-y-8 md:space-y-12 pb-32">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[var(--border-color)]">
                            <div className="grid grid-cols-2 sm:flex sm:items-center gap-6 md:gap-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--color-brand)]/10 text-[var(--color-brand)] rounded-2xl flex items-center justify-center shadow-inner"><Zap className="w-5 h-5 md:w-6 md:h-6" /></div>
                                    <div><p className="text-[10px] uppercase font-black opacity-40">الصف</p><p className="font-black text-sm md:text-base">{formatGradeLevel(course.gradeLevel)}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner"><FileText className="w-5 h-5 md:w-6 md:h-6" /></div>
                                    <div><p className="text-[10px] uppercase font-black opacity-40">الفصل</p><p className="font-black text-sm md:text-base">{course.term || 'ترم أول'}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner"><Clock className="w-5 h-5 md:w-6 md:h-6" /></div>
                                    <div><p className="text-[10px] uppercase font-black opacity-40">المدة</p><p className="font-black text-sm md:text-base">{currentLesson?.duration}</p></div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 md:flex-none py-3 px-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] shadow-sm flex items-center justify-center gap-2 transition-all">
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-xs font-black md:hidden">مشاركة</span>
                                </button>
                                <button className="flex-1 md:flex-none py-3 px-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] shadow-sm flex items-center justify-center gap-2 transition-all">
                                    <Settings className="w-4 h-4" />
                                    <span className="text-xs font-black md:hidden">الإعدادات</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6 md:space-y-8">
                            <div className="flex gap-6 md:gap-10 border-b border-[var(--border-color)] overflow-x-auto no-scrollbar">
                                {(['content', 'notes', 'attachments'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={clsx(
                                            "pb-4 md:pb-6 font-black text-base md:text-xl relative whitespace-nowrap transition-colors",
                                            activeTab === tab ? "text-[var(--color-brand)]" : "text-[var(--text-secondary)] opacity-50"
                                        )}
                                    >
                                        {tab === 'content' ? 'عن المحاضرة' : tab === 'notes' ? 'ملاحظاتي' : 'المرفقات'}
                                        {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-[var(--color-brand)] rounded-full shadow-lamp" />}
                                    </button>
                                ))}
                            </div>
                            <div className="prose prose-lg md:prose-xl prose-invert max-w-none font-bold text-[var(--text-secondary)] leading-relaxed">
                                {activeTab === 'content' && (
                                    <div className="space-y-4">
                                        <p className="text-sm md:text-base">
                                            {currentLesson?.description || 'أهلاً بك يا بطل! في هذه المحاضرة نركز على الفهم العميق والتدريب المكثف على أنماط امتحانات النظام الجديد.'}
                                        </p>
                                    </div>
                                )}
                                {activeTab === 'notes' && <textarea className="w-full h-32 md:h-40 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-[2rem] p-5 md:p-8 font-black outline-none shadow-inner text-sm md:text-base" placeholder="اضف ملاحظتك المبدعة هنا..." />}
                                {activeTab === 'attachments' && (
                                    <div className="text-center py-12 opacity-50">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p className="text-sm">لا توجد مرفقات متاحة حالياً</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}