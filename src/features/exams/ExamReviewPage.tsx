import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Trophy,
    ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { apiClient } from '@/core/api/client';

export function ExamReviewPage() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await apiClient.get(`/exams/review/${attemptId}`);
                setData(res.data);
            } catch (error) {
                console.error('Failed to fetch review:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReview();
    }, [attemptId]);

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-secondary)]">
            فشل تحميل بيانات المراجعة
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-main)] pb-20" dir="rtl">
            {/* Header */}
            <header className="h-20 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] sticky top-0 z-30 transition-all">
                <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-[var(--bg-input)] rounded-xl text-[var(--text-secondary)] transition-colors"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-[var(--text-primary)]">مراجعة الاختبار</h1>
                            <p className="text-sm font-bold text-[var(--text-secondary)]">{data.exam_title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-[var(--text-secondary)]">الدرجة النهائية</p>
                            <p className="text-lg font-black text-cyan-500">{data.score} / {data.total_points}</p>
                        </div>
                        <div className={clsx(
                            "px-4 py-2 rounded-xl border font-black text-sm",
                            data.passed ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                            {data.passed ? "ناجح" : "راسب"}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-8 mt-4">
                {/* Stats Summary Card */}
                <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-color)] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                        <div className="space-y-1">
                            <p className="text-[var(--text-secondary)] text-sm font-bold">النسبة المئوية</p>
                            <p className="text-3xl font-black text-[var(--text-primary)]">{data.percentage}%</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[var(--text-secondary)] text-sm font-bold">تاريخ التقديم</p>
                            <p className="text-3xl font-black text-[var(--text-primary)]">
                                {new Date(data.submitted_at).toLocaleDateString('ar-EG')}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[var(--text-secondary)] text-sm font-bold">مخالفات الغش</p>
                            <p className={clsx(
                                "text-3xl font-black",
                                data.anti_cheat_violations > 0 ? "text-red-500" : "text-emerald-500"
                            )}>
                                {data.anti_cheat_violations}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-[var(--text-primary)] mr-2 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-cyan-500" />
                        تفاصيل الإجابات
                    </h2>

                    {data.questions.map((q: any, idx: number) => {
                        const userAns = q.user_answer;
                        const isCorrect = userAns?.is_correct === 1;

                        return (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-lg group hover:border-cyan-500/30 transition-all"
                            >
                                {/* Question Header */}
                                <div className="p-6 sm:p-8 bg-[var(--bg-secondary)]/30 border-b border-[var(--border-color)]">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-black text-lg">
                                                    {idx + 1}
                                                </span>
                                                <span className="px-3 py-1 rounded-lg bg-[var(--bg-input)] text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider">
                                                    {q.type === 'mcq' ? 'اختيار من متعدد' : q.type === 'short-answer' ? 'إجابة مقالية' : 'صح وغلط'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-[var(--text-primary)] leading-relaxed">
                                                {q.text}
                                            </h3>
                                        </div>
                                        <div className={clsx(
                                            "shrink-0 p-3 rounded-2xl border flex items-center gap-2",
                                            isCorrect ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" :
                                                userAns?.is_correct === 0 ? "bg-red-500/5 border-red-500/20 text-red-500" :
                                                    "bg-amber-500/5 border-amber-500/20 text-amber-500"
                                        )}>
                                            {isCorrect ? <CheckCircle className="w-5 h-5" /> : userAns?.is_correct === 0 ? <XCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            <span className="font-black text-sm">{q.user_answer?.points_earned || 0} / {q.points}</span>
                                        </div>
                                    </div>

                                    {q.image_url && (
                                        <div className="mb-6 rounded-2xl overflow-hidden border border-[var(--border-color)] max-w-lg mx-auto">
                                            <img src={q.image_url} alt="Question" className="w-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                {/* Options List */}
                                <div className="p-6 sm:p-8 space-y-3">
                                    {q.type !== 'short-answer' ? (
                                        q.options.map((opt: any) => {
                                            const isSelected = userAns?.selected_option_ids?.some((id: any) => String(id) === String(opt.id));
                                            const isCorrectOption = Number(opt.is_correct) === 1;
                                            return (
                                                <div key={opt.id} className="space-y-4">
                                                    <div
                                                        className={clsx(
                                                            "p-6 rounded-lg border-4 transition-all flex items-center justify-between shadow-md relative overflow-hidden",
                                                            isCorrectOption
                                                                ? "bg-emerald-500/5 border-emerald-500 text-emerald-800 font-black"
                                                                : isSelected && !isCorrectOption
                                                                    ? "bg-red-500/5 border-red-500 text-red-700 font-black"
                                                                    : "bg-[var(--bg-input)] border-transparent opacity-30 text-[var(--text-secondary)] grayscale"
                                                        )}
                                                    >
                                                        {/* Choice Letter Square (Very Boxy) */}
                                                        <div className="flex items-center gap-5 relative z-10">
                                                            <div className={clsx(
                                                                "w-12 h-12 rounded-sm flex items-center justify-center font-black text-xl transition-all border-2",
                                                                isCorrectOption ? "bg-emerald-500 border-emerald-400 text-white" :
                                                                    isSelected && !isCorrectOption ? "bg-red-500 border-red-400 text-white" :
                                                                        "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)]"
                                                            )}>
                                                                {String.fromCharCode(65 + q.options.indexOf(opt))}
                                                            </div>
                                                            <span className="text-2xl">{opt.text}</span>
                                                        </div>

                                                        {/* Status Indicators */}
                                                        <div className="flex items-center gap-3 relative z-10">
                                                            {isCorrectOption && (
                                                                <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                                                    <CheckCircle className="w-5 h-5" />
                                                                    <span className="text-xs font-black">الإجابة الصحيحة</span>
                                                                </div>
                                                            )}
                                                            {isSelected && !isCorrectOption && (
                                                                <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-500 text-white shadow-lg shadow-red-500/20">
                                                                    <XCircle className="w-5 h-5" />
                                                                    <span className="text-xs font-black">إجابتك (خاطئة)</span>
                                                                </div>
                                                            )}
                                                            {isSelected && isCorrectOption && (
                                                                <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
                                                                    <CheckCircle className="w-5 h-5" />
                                                                    <span className="text-xs font-black">إجابة صحيحة ✓</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Wrong Selection Explanation - Rendered as a distinct Box */}
                                                    {isSelected && !isCorrectOption && opt.wrong_explanation && (
                                                        <div className="mr-6 ml-6 p-6 bg-amber-500/10 border-4 border-amber-500/30 rounded-lg flex gap-5 animate-in slide-in-from-top-4 shadow-xl">
                                                            <div className="w-14 h-14 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                                                                <AlertCircle className="w-8 h-8" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-amber-600 mb-2 border-b border-amber-500/20 pb-1">توضيح المعلم:</p>
                                                                <p className="text-amber-900/80 dark:text-amber-200/90 text-lg font-bold leading-relaxed">{opt.wrong_explanation}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-[var(--bg-input)] p-6 rounded-2xl border border-[var(--border-color)]">
                                                <p className="text-xs font-black text-cyan-500 mb-2 uppercase tracking-tight">إجابتك المسجلة:</p>
                                                <p className="text-[var(--text-primary)] font-bold">{userAns?.essay_answer || '(لم يتم تقديم إجابة)'}</p>
                                            </div>
                                            {!isCorrect && (
                                                <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20">
                                                    <p className="text-xs font-black text-emerald-500 mb-2 uppercase tracking-tight">ملاحظات:</p>
                                                    <p className="text-emerald-700/80 font-bold">سيتم مراجعة الإجابات المقالية يدوياً من قبل المعلم.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Explanation */}
                                    {q.explanation && (
                                        <div className="mt-6 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-black text-cyan-500 mb-1">شرح الإجابة:</p>
                                                <p className="text-[var(--text-secondary)] text-sm font-bold leading-relaxed">{q.explanation}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
