import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Video, Trash2, FileText, HelpCircle, ChevronRight } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    content_type: 'video' | 'pdf' | 'exam';
    content_url: string | null;
    duration_minutes: number;
    sort_order: number;
    // Include description for lesson to be edited in LessonEditor
    description?: string | null;
}

interface Section {
    id: string;
    title: string;
    sort_order: number;
    lessons: Lesson[];
}

interface CourseSyllabusProps {
    sections: Section[];
    selectedLessonId: string | null;
    onSelectLesson: (lessonId: string) => void;
    onAddSection: () => void;
    onAddLesson: (sectionId: string) => void;
    onUpdateSection: (sectionId: string, title: string) => void;
    onDeleteSection: (sectionId: string) => void;
}

export function CourseSyllabus({
    sections,
    selectedLessonId,
    onSelectLesson,
    onAddSection,
    onAddLesson,
    onUpdateSection,
    onDeleteSection
}: CourseSyllabusProps) {

    const getIconForType = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4" />;
            case 'pdf': return <FileText className="w-4 h-4" />;
            case 'exam': return <HelpCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} دقيقة`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] md:rounded-[2.5rem] flex flex-col shadow-sm overflow-hidden h-full">
            <div className="p-4 md:p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-main)]/50 backdrop-blur-md sticky top-0 z-20">
                <div>
                    <h3 className="text-base md:text-lg font-black text-[var(--text-primary)]">هيكل المنهج</h3>
                    <p className="text-[8px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">نظم المحتوى في وحدات ودروس</p>
                </div>
                <button
                    onClick={onAddSection}
                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-[10px] md:text-xs font-black transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                >
                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden xs:inline">قسم جديد</span>
                    <span className="xs:hidden">إضافة</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar scroll-smooth">
                {sections.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-[var(--bg-main)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)]">
                            <Plus className="w-8 h-8 text-[var(--text-secondary)] opacity-30" />
                        </div>
                        <p className="text-[var(--text-secondary)] font-bold mb-2">لا توجد وحدات بعد</p>
                        <p className="text-xs text-[var(--text-secondary)] opacity-60">ابدأ بإضافة وحدة جديدة لمنهجك</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {sections.map((section, sIndex) => (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: sIndex * 0.1 }}
                                className="border border-[var(--border-color)] rounded-3xl bg-[var(--bg-main)]/30 overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Section Header */}
                                <div className="p-4 flex items-center gap-3 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-brand-500 transition-colors">
                                        <GripVertical className="w-5 h-5 cursor-move" />
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue={section.title}
                                        onBlur={(e) => {
                                            if (e.target.value !== section.title) {
                                                onUpdateSection(section.id, e.target.value);
                                            }
                                        }}
                                        className="font-black text-[var(--text-primary)] bg-transparent border-none outline-none flex-1 focus:ring-0"
                                        placeholder="عنوان الوحدة..."
                                    />
                                    <div className="mr-auto">
                                        <button
                                            onClick={() => onDeleteSection(section.id)}
                                            className="p-2 border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                <div className="p-4 space-y-3">
                                    {section.lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            onClick={() => onSelectLesson(lesson.id)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${selectedLessonId === lesson.id
                                                ? 'bg-brand-500/5 border-brand-500 shadow-inner'
                                                : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-brand-500/30'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl ${lesson.content_type === 'video' ? 'bg-blue-500/10 text-blue-500 shadow-blue-500/10' :
                                                lesson.content_type === 'pdf' ? 'bg-rose-500/10 text-rose-500 shadow-rose-500/10' :
                                                    'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10'
                                                } shadow-soft`}>
                                                {getIconForType(lesson.content_type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-black ${selectedLessonId === lesson.id ? 'text-brand-500' : 'text-[var(--text-primary)]'}`}>
                                                    {lesson.title}
                                                </p>
                                                <p className="text-[10px] text-[var(--text-secondary)] font-bold opacity-60">
                                                    {lesson.content_type === 'video' ? 'فيديو' : lesson.content_type === 'pdf' ? 'ملف PDF' : 'اختبار تقييمي'}
                                                    {lesson.duration_minutes > 0 && ` • ${formatDuration(lesson.duration_minutes)}`}
                                                </p>
                                            </div>
                                            {selectedLessonId === lesson.id && (
                                                <ChevronRight className="w-4 h-4 text-brand-500" />
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => onAddLesson(section.id)}
                                        className="w-full h-14 border-2 border-dashed border-[var(--border-color)] rounded-2xl text-xs font-black text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500 hover:bg-brand-500/5 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center group-hover:border-brand-500/50 transition-all">
                                            <Plus className="w-3 h-3" />
                                        </div>
                                        إضافة درس جديد
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
