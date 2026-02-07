import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Flag, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ExamReviewModalProps {
    isOpen: boolean;
    questions: any[];
    answers: Map<string, string>;
    flagged: Set<number>;
    onClose: () => void;
    onNavigate: (index: number) => void;
    onSubmit: () => void;
}

export function ExamReviewModal({
    isOpen,
    questions,
    answers,
    flagged,
    onClose,
    onNavigate,
    onSubmit
}: ExamReviewModalProps) {
    if (!isOpen) return null;

    const answeredCount = answers.size;
    const totalCount = questions.length;
    const unansweredCount = totalCount - answeredCount;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[var(--bg-card)] rounded-3xl p-5 sm:p-8 max-w-4xl w-full border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">مراجعة الإجابات</h2>
                            <p className="text-[var(--text-secondary)] font-bold text-xs sm:text-sm mt-1">
                                يرجى مراجعة إجاباتك قبل التسليم النهائي
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors text-[var(--text-secondary)] -mt-2 -ml-2"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 sm:mb-6">
                        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 sm:p-4 flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <div className="text-lg sm:text-xl font-black text-[var(--text-primary)]">{answeredCount}</div>
                                <div className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)]">تمت الإجابة</div>
                            </div>
                        </div>
                        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 sm:p-4 flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <div className="text-lg sm:text-xl font-black text-[var(--text-primary)]">{flagged.size}</div>
                                <div className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)]">مؤجل للمراجعة</div>
                            </div>
                        </div>
                        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 sm:p-4 flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <div className="text-lg sm:text-xl font-black text-[var(--text-primary)]">{unansweredCount}</div>
                                <div className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)]">لم يتم الإجابة</div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Grid */}
                    <div className="flex-1 overflow-y-auto min-h-0 mb-4 sm:mb-6 pr-1 sm:pr-2 custom-scrollbar">
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
                            {questions.map((q, index) => {
                                const isAnswered = answers.has(q.id);
                                const isFlagged = flagged.has(index);

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => onNavigate(index)}
                                        className={clsx(
                                            "aspect-square rounded-lg sm:rounded-xl border-2 flex flex-col items-center justify-center relative transition-all hover:scale-105 active:scale-95",
                                            isFlagged
                                                ? "border-amber-500 bg-amber-500/10 text-amber-500"
                                                : isAnswered
                                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                                                    : "border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-cyan-500 hover:text-cyan-500"
                                        )}
                                    >
                                        <span className="text-sm sm:text-lg font-black">{index + 1}</span>
                                        {isFlagged && <div className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-[var(--border-color)]">
                        <button
                            onClick={onClose}
                            className="w-full sm:flex-1 py-3 sm:py-4 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-input)] transition-all text-sm sm:text-base"
                        >
                            العودة للاختبار
                        </button>
                        <button
                            onClick={onSubmit}
                            className="w-full sm:flex-1 py-3 sm:py-4 rounded-xl bg-cyan-500 text-white font-black hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            تسليم الاختبار
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
