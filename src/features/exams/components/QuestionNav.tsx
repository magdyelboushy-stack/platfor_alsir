// ============================================================
// QuestionNav - Question Navigation Sidebar Component
// ============================================================

import { clsx } from 'clsx';
import { Flag, CheckCircle, Circle } from 'lucide-react';

interface QuestionNavProps {
    totalQuestions: number;
    currentQuestion: number;
    answeredQuestions: Set<number>;
    flaggedQuestions: Set<number>;
    onNavigate: (index: number) => void;
}

export function QuestionNav({
    totalQuestions,
    currentQuestion,
    answeredQuestions,
    flaggedQuestions,
    onNavigate
}: QuestionNavProps) {
    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-sm font-black">
                    {totalQuestions}
                </span>
                الأسئلة
            </h3>

            <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestions }, (_, i) => {
                    const isAnswered = answeredQuestions.has(i);
                    const isFlagged = flaggedQuestions.has(i);
                    const isCurrent = currentQuestion === i;

                    return (
                        <button
                            key={i}
                            onClick={() => onNavigate(i)}
                            className={clsx(
                                "relative w-10 h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center border-2",
                                isCurrent
                                    ? "bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/30 scale-110"
                                    : isAnswered
                                        ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                                        : "bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-cyan-500/50"
                            )}
                        >
                            {i + 1}
                            {isFlagged && (
                                <Flag className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 fill-amber-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-[var(--border-color)] space-y-3">
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500 flex items-center justify-center">
                        <Circle className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold">السؤال الحالي</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="font-bold">تمت الإجابة</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <div className="w-6 h-6 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center relative">
                        <Flag className="w-3 h-3 text-amber-500" />
                    </div>
                    <span className="font-bold">مُعلَّم للمراجعة</span>
                </div>
            </div>
        </div>
    );
}
