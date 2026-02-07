import { ArrowRight, Save, Clock, HelpCircle, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExamBuilderHeaderProps {
    title: string;
    questionsCount: number;
    duration: number;
    activeTab: 'settings' | 'questions';
    setActiveTab: (tab: 'settings' | 'questions') => void;
    onSave: () => void;
    onPublish?: () => void;
    saving?: boolean;
}

export function ExamBuilderHeader({
    title,
    questionsCount,
    duration,
    activeTab,
    setActiveTab,
    onSave,
    onPublish,
    saving = false
}: ExamBuilderHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2 shrink-0 bg-[var(--bg-main)]/80 backdrop-blur-md sticky top-0 z-20 pb-4">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => navigate('/teacher/exams')}
                    className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500/50 transition-all active:scale-95"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)]">
                        {title || 'إنشاء امتحان جديد'}
                    </h1>
                    <p className="text-[var(--text-secondary)] font-bold text-sm flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-brand-500" />
                            {questionsCount} سؤال
                        </span>
                        <span className="w-1 h-1 bg-[var(--border-color)] rounded-full" />
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-brand-500" />
                            {duration} دقيقة
                        </span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)] shadow-inner flex-1 md:flex-none">
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'settings'
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Clock className="w-4 h-4" />
                        الإعدادات
                    </button>
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'questions'
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <HelpCircle className="w-4 h-4" />
                        الأسئلة
                    </button>
                </div>

                <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-3 px-6 py-3.5 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl font-black hover:border-brand-500/50 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>مسودة</span>
                </button>

                {onPublish && (
                    <button
                        onClick={onPublish}
                        disabled={saving}
                        className="flex items-center justify-center gap-3 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 group"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        <span>نشر الامتحان</span>
                    </button>
                )}
            </div>
        </div>
    );
}

