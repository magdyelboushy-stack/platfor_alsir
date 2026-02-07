import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Video, FileText, HelpCircle, Save, Trash2,
    ExternalLink, RefreshCw, Loader2
} from 'lucide-react';
import { FileLibraryPicker } from '../files/FileLibraryPicker';
import apiClient from '@/core/api/client';

type LessonType = 'video' | 'pdf' | 'exam';

interface Lesson {
    id: string;
    title: string;
    content_type: LessonType;
    content_url: string | null;
    duration_minutes: number;
    sort_order: number;
    // Added optional description field
    description?: string | null;
}

interface LessonEditorProps {
    lesson: Lesson | null;
    onSave: (lessonId: string, data: Partial<Lesson>) => Promise<void>;
    onDelete: (lessonId: string) => Promise<void>;
}

export function LessonEditor({ lesson, onSave, onDelete }: LessonEditorProps) {
    const [title, setTitle] = useState('');
    const [contentType, setContentType] = useState<LessonType>('video');
    const [contentUrl, setContentUrl] = useState('');
    const [duration, setDuration] = useState(0);
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Exam Selector State
    interface ExamOption {
        id: string;
        title: string;
        questionsCount: number;
    }
    const [exams, setExams] = useState<ExamOption[]>([]);
    const [isLoadingExams, setIsLoadingExams] = useState(false);

    // Fetch exams when needed
    useEffect(() => {
        if (contentType === 'exam' && exams.length === 0) {
            setIsLoadingExams(true);
            apiClient.get('/admin/exams')
                .then((res: any) => {
                    if (res.data.success) {
                        setExams(res.data.items || []);
                    }
                })
                .catch((err: any) => console.error('Failed to load exams', err))
                .finally(() => setIsLoadingExams(false));
        }
    }, [contentType]);

    // Update local state when lesson changes
    useEffect(() => {
        if (lesson) {
            setTitle(lesson.title);
            setContentType(lesson.content_type);
            setContentUrl(lesson.content_url || '');
            setDuration(lesson.duration_minutes);
            setDescription(lesson.description ?? '');
        }
    }, [lesson]);

    const handleSave = async () => {
        if (!lesson) return;

        setIsSaving(true);
        try {
            await onSave(lesson.id, {
                title,
                content_type: contentType,
                content_url: contentUrl || null,
                duration_minutes: duration,
                description: description?.trim() || null,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!lesson) return;

        if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;

        setIsDeleting(true);
        try {
            await onDelete(lesson.id);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!lesson) {
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 flex flex-col items-center justify-center text-center h-full shadow-sm">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-secondary)] mb-6 shadow-inner border border-[var(--border-color)]">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                    >
                        <RefreshCw className="w-8 h-8 md:w-10 md:h-10 opacity-30" />
                    </motion.div>
                </div>
                <h3 className="text-lg md:text-xl font-black text-[var(--text-primary)] mb-2">محرر الدروس المحترف</h3>
                <p className="text-[var(--text-secondary)] text-[10px] md:text-sm max-w-xs mx-auto leading-relaxed opacity-60 font-medium px-4">
                    اختر درساً من القائمة اليمنى لبدء إضافة المحتوى، رفع الفيديوهات، أو اختيار الامتحانات الملحقة.
                </p>
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={lesson.id}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 flex flex-col shadow-sm h-full"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 pb-4 md:pb-6 border-b border-[var(--border-color)] gap-4">
                    <div>
                        <h3 className="text-lg md:text-xl font-black text-[var(--text-primary)]">تعديل الدرس</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">المعرف: #{lesson.id.slice(0, 8)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-2.5 md:p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                            title="حذف الدرس"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Trash2 className="w-4 h-4 md:w-5 md:h-5" />}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 sm:flex-initial px-6 md:px-10 py-3 md:py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black text-xs md:text-sm transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Save className="w-4 h-4 md:w-5 md:h-5" />}
                            حفظ
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pl-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4">اسم الدرس</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-black text-lg focus:border-brand-500 outline-none transition-all shadow-inner"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4">وصف الدرس (عن المحاضرة)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="اكتب وصفاً جذاباً يوضح فكرة الدرس وأهدافه"
                            className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-brand-500 outline-none transition-all shadow-inner"
                        />
                    </div>

                    {/* Content Type Selector */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4">نوع المحتوى</label>
                        <div className="grid grid-cols-3 gap-4">
                            {(['video', 'pdf', 'exam'] as LessonType[]).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setContentType(type)}
                                    className={`py-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all active:scale-95 ${contentType === type
                                        ? 'bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-500/20'
                                        : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-500/30'
                                        }`}
                                >
                                    <div className={`p-3 rounded-2xl ${contentType === type ? 'bg-white/20' : 'bg-[var(--bg-card)]'}`}>
                                        {type === 'video' ? <Video className="w-6 h-6" /> : type === 'pdf' ? <FileText className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-tight">
                                        {type === 'video' ? 'فيديو تعليمي' : type === 'pdf' ? 'ملخص PDF' : 'اختبار تقييمي'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Content Fields */}
                    <div className="p-8 rounded-[2rem] bg-[var(--bg-main)]/50 border border-[var(--border-color)] border-dashed">
                        {contentType === 'video' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Video className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">إعدادات الفيديو</h4>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-secondary)] mr-4">رابط الفيديو (YouTube, Vimeo, or VdoCipher ID)</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={contentUrl}
                                                onChange={(e) => setContentUrl(e.target.value)}
                                                placeholder="https://... أو Video ID لـ VdoCipher"
                                                className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-brand-500 outline-none transition-all dir-ltr text-left shadow-sm group-hover:border-brand-500/30"
                                            />
                                            <ExternalLink className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] opacity-30" />
                                        </div>
                                        <p className="text-[9px] text-brand-500 font-bold px-4 opacity-70">
                                            * يدعم روابط YouTube و Vimeo، أو يمكنك كتابة الـ Video ID الخاص بـ VdoCipher مباشرة.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-secondary)] mr-4">مدة الفيديو (بالدقائق)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-brand-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {contentType === 'pdf' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">رابط الملف</h4>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] mr-4">رابط ملف PDF</label>
                                    <input
                                        type="text"
                                        value={contentUrl}
                                        onChange={(e) => setContentUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-brand-500 outline-none transition-all dir-ltr text-left shadow-sm"
                                    />
                                    <div className="flex items-center gap-3 mt-3">
                                        <button
                                            onClick={() => setIsPickerOpen(true)}
                                            className="px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-all active:scale-95"
                                        >
                                            اختيار من مكتبة الملفات
                                        </button>
                                        <span className="text-[10px] text-[var(--text-secondary)]">
                                            يمكنك لصق رابط خارجي، أو اختيار ملف PDF من مكتبتك.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {contentType === 'exam' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">ربط امتحان</h4>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-secondary)] mr-4">اختر الامتحان</label>
                                    {isLoadingExams ? (
                                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] px-4 py-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            جاري تحميل الامتحانات...
                                        </div>
                                    ) : exams.length > 0 ? (
                                        <select
                                            value={contentUrl}
                                            onChange={(e) => setContentUrl(e.target.value)}
                                            className="w-full px-6 py-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-brand-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                        >
                                            <option value="">-- اختر امتحاناً --</option>
                                            {exams.map((exam) => (
                                                <option key={exam.id} value={exam.id}>
                                                    {exam.title} ({exam.questionsCount} سؤال)
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="text-center p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl">
                                            <p className="text-sm text-[var(--text-secondary)] mb-2">لا توجد امتحانات متاحة</p>
                                            <a href="/admin/exams/new" target="_blank" className="text-xs font-bold text-brand-500 hover:underline">
                                                إنشاء امتحان جديد
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Modal: File Library Picker */}
            {isPickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-[95%] max-w-4xl rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-[var(--text-primary)]">مكتبة الملفات - PDF</h3>
                            <button
                                onClick={() => setIsPickerOpen(false)}
                                className="px-3 py-2 rounded-xl bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 transition-all"
                            >
                                إغلاق
                            </button>
                        </div>
                        <FileLibraryPicker
                            onSelect={(file) => {
                                setContentUrl(file.url || '');
                                setIsPickerOpen(false);
                            }}
                            onClose={() => setIsPickerOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}