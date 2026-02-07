// ============================================================
// QuestionCard - Individual Question Display Component
// ============================================================

import { clsx } from 'clsx';
import { Flag, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export type QuestionType = 'mcq' | 'true-false' | 'short-answer' | 'single' | 'multiple' | 'true_false' | 'essay';

export interface Question {
    id: string;
    type: QuestionType;
    text: string;
    options?: any[]; // Allow for real options objects {id, text, image_url}
    correctAnswer?: string | string[];
    points?: number;
}

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    selectedAnswer: string | string[] | null;
    isFlagged: boolean;
    onAnswer: (answer: string | string[]) => void;
    onToggleFlag: () => void;
}

export function QuestionCard({
    question,
    questionNumber,
    selectedAnswer,
    isFlagged,
    onAnswer,
    onToggleFlag
}: QuestionCardProps) {


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-lg"
        >
            {/* Question Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-500/30">
                        {questionNumber}
                    </span>
                    <div>
                        <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider">
                            {(question.type === 'mcq' || question.type === 'single' || question.type === 'multiple') && 'اختيار من متعدد'}
                            {(question.type === 'true-false' || question.type === 'true_false') && 'صواب أو خطأ'}
                            {(question.type === 'short-answer' || question.type === 'essay') && 'إجابة قصيرة'}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onToggleFlag}
                    className={clsx(
                        "p-3 rounded-xl border transition-all",
                        isFlagged
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-500"
                            : "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-amber-500/50 hover:text-amber-500"
                    )}
                >
                    <Flag className={clsx("w-5 h-5", isFlagged && "fill-amber-500")} />
                </button>
            </div>

            {/* Question Text */}
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8 leading-relaxed">
                {question.text}
            </h2>

            {/* Options */}
            {(question.type === 'mcq' || question.type === 'single' || question.type === 'multiple') && question.options && (
                <div className="space-y-4">
                    {question.options.map((option, index) => {
                        // Support both simple string and {id, text} objects
                        const optionId = typeof option === 'string' ? option : (option.id || option.text);
                        const optionText = typeof option === 'string' ? option : option.text;
                        const isSelected = selectedAnswer === optionId;
                        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...

                        return (
                            <button
                                key={index}
                                onClick={() => onAnswer(optionId)}
                                className={clsx(
                                    "w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-right transition-all group",
                                    isSelected
                                        ? "bg-cyan-500/10 border-cyan-500 text-[var(--text-primary)]"
                                        : "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-500/50"
                                )}
                            >
                                <div className={clsx(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all shrink-0",
                                    isSelected
                                        ? "bg-cyan-500 text-white"
                                        : "bg-[var(--bg-card)] text-[var(--text-secondary)] group-hover:bg-cyan-500/10"
                                )}>
                                    {optionLetter}
                                </div>
                                <span className="flex-1 font-bold text-lg">{optionText}</span>
                                {isSelected && <CheckCircle2 className="w-6 h-6 text-cyan-500" />}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* True/False */}
            {(question.type === 'true-false' || question.type === 'true_false') && (
                <div className="grid grid-cols-2 gap-4">
                    {['صواب', 'خطأ'].map((option) => {
                        const isSelected = selectedAnswer === option;
                        return (
                            <button
                                key={option}
                                onClick={() => onAnswer(option)}
                                className={clsx(
                                    "p-6 rounded-2xl border-2 font-black text-xl transition-all",
                                    isSelected
                                        ? option === 'صواب'
                                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                                            : "bg-red-500/10 border-red-500 text-red-500"
                                        : "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-500/50"
                                )}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Short Answer */}
            {(question.type === 'short-answer' || question.type === 'essay') && (
                <textarea
                    value={(selectedAnswer as string) || ''}
                    onChange={(e) => onAnswer(e.target.value)}
                    placeholder="اكتب إجابتك هنا..."
                    className="w-full h-40 p-6 rounded-2xl bg-[var(--bg-main)] border-2 border-[var(--border-color)] text-[var(--text-primary)] font-bold text-lg resize-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all"
                    dir="rtl"
                />
            )}
        </motion.div>
    );
}
