// ============================================================
// ExamProctor - Proctored Exam Interface
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Send,
    CheckCircle,
    Circle,
    Shield,
    AlertOctagon
} from 'lucide-react';
import { clsx } from 'clsx';
import { useExamSession } from '../hooks/useExamSession';
import { useAntiCheat } from '../hooks/useAntiCheat';
import type { Question } from '../types';

interface ExamProctorProps {
    examId: string;
    onComplete?: () => void;
}

export function ExamProctor({ examId, onComplete }: ExamProctorProps) {
    const {
        exam,
        session,
        questions,
        currentQuestion,
        currentIndex,
        answers,
        formattedTime,
        totalQuestions,
        answeredCount,
        progress,
        isTimeWarning,
        isTimeCritical,
        isLoading,
        isStarting,
        isSubmitting,
        startExam,
        selectAnswer,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        submitExam,
    } = useExamSession({
        examId,
        onTimeUp: () => submitExam(),
        onSubmit: () => onComplete?.(),
    });

    const antiCheat = useAntiCheat({
        enabled: !!session,
        maxWarnings: 3,
        onLockout: () => submitExam(),
    });

    // Pre-exam screen
    if (!session) {
        return (
            <ExamStartScreen
                exam={exam}
                isLoading={isLoading || isStarting}
                onStart={startExam}
            />
        );
    }

    // Locked out screen
    if (antiCheat.isLocked) {
        return <LockedOutScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Warning Banner */}
            <AnimatePresence>
                {antiCheat.state.warningsCount > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-amber-500/10 border-b border-amber-500/20"
                    >
                        <div className="container mx-auto px-4 py-2 flex items-center gap-2 text-amber-400 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>
                                Warning: {antiCheat.state.warningsCount} violation(s) detected.
                                {antiCheat.warningsRemaining} warnings remaining before lockout.
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Exam Title */}
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-indigo-400" />
                        <h1 className="font-semibold text-white">{exam?.title}</h1>
                    </div>

                    {/* Timer */}
                    <div
                        className={clsx(
                            'flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold',
                            isTimeCritical && 'bg-rose-500/20 text-rose-400 animate-pulse',
                            isTimeWarning && !isTimeCritical && 'bg-amber-500/20 text-amber-400',
                            !isTimeWarning && 'bg-slate-800 text-white'
                        )}
                    >
                        <Clock className="w-5 h-5" />
                        {formattedTime}
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">
                            {answeredCount}/{totalQuestions} answered
                        </span>
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 flex gap-6">
                {/* Question Panel */}
                <div className="flex-1">
                    {currentQuestion && (
                        <QuestionCard
                            question={currentQuestion}
                            selectedAnswer={answers[currentQuestion.id]}
                            onAnswer={(answer) => selectAnswer(currentQuestion.id, answer)}
                            index={currentIndex}
                        />
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={prevQuestion}
                            disabled={currentIndex === 0}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-xl',
                                'bg-slate-800 text-white',
                                'transition-all duration-300',
                                'hover:bg-slate-700',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Previous
                        </button>

                        {currentIndex < totalQuestions - 1 ? (
                            <button
                                onClick={nextQuestion}
                                className={clsx(
                                    'flex items-center gap-2 px-4 py-2 rounded-xl',
                                    'bg-indigo-500 text-white',
                                    'transition-all duration-300',
                                    'hover:bg-indigo-400'
                                )}
                            >
                                Next
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={submitExam}
                                disabled={isSubmitting}
                                className={clsx(
                                    'flex items-center gap-2 px-6 py-2 rounded-xl',
                                    'bg-emerald-500 text-white font-medium',
                                    'transition-all duration-300',
                                    'hover:bg-emerald-400',
                                    'disabled:opacity-50'
                                )}
                            >
                                <Send className="w-5 h-5" />
                                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Question Navigator */}
                <aside className="w-64 flex-shrink-0">
                    <div className="glass-card p-4 sticky top-24">
                        <h3 className="font-medium text-white mb-4">Questions</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, i) => (
                                <button
                                    key={q.id}
                                    onClick={() => goToQuestion(i)}
                                    className={clsx(
                                        'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium',
                                        'transition-all duration-200',
                                        i === currentIndex && 'ring-2 ring-indigo-500',
                                        answers[q.id]
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    )}
                                >
                                    {answers[q.id] ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        i + 1
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

// ============================================================
// Sub-Components
// ============================================================

interface QuestionCardProps {
    question: Question;
    selectedAnswer?: string | string[];
    onAnswer: (answer: string | string[]) => void;
    index: number;
}

function QuestionCard({ question, selectedAnswer, onAnswer, index }: QuestionCardProps) {
    return (
        <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
        >
            <div className="flex items-start gap-4 mb-6">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold">
                    {index + 1}
                </span>
                <div>
                    <p className="text-white text-lg">{question.text}</p>
                    <p className="text-slate-500 text-sm mt-1">{question.points} points</p>
                </div>
            </div>

            <div className="space-y-3 ml-12">
                {question.options?.map((option) => {
                    const isSelected = selectedAnswer === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => onAnswer(option.id)}
                            className={clsx(
                                'w-full text-left p-4 rounded-xl',
                                'border transition-all duration-200',
                                isSelected
                                    ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                    : 'bg-slate-800/50 border-white/5 text-slate-300 hover:border-white/10 hover:bg-slate-800'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {isSelected ? (
                                    <CheckCircle className="w-5 h-5 text-indigo-400" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-500" />
                                )}
                                <span>{option.text}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}

interface ExamStartScreenProps {
    exam?: { title: string; description: string; duration: number; questionsCount: number } | null;
    isLoading: boolean;
    onStart: () => void;
}

function ExamStartScreen({ exam, isLoading, onStart }: ExamStartScreenProps) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 max-w-md w-full text-center"
            >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{exam?.title || 'Loading...'}</h1>
                <p className="text-slate-400 mb-6">{exam?.description}</p>

                <div className="flex justify-center gap-6 mb-8 text-sm">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">{exam?.duration}</p>
                        <p className="text-slate-500">minutes</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">{exam?.questionsCount}</p>
                        <p className="text-slate-500">questions</p>
                    </div>
                </div>

                <div className="text-xs text-amber-400 bg-amber-500/10 rounded-xl p-3 mb-6">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    This is a proctored exam. Tab switching and copy/paste are monitored.
                </div>

                <button
                    onClick={onStart}
                    disabled={isLoading}
                    className="btn-primary w-full"
                >
                    {isLoading ? 'Starting...' : 'Start Exam'}
                </button>
            </motion.div>
        </div>
    );
}

function LockedOutScreen() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-6">
                    <AlertOctagon className="w-8 h-8 text-rose-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Exam Terminated</h1>
                <p className="text-slate-400">
                    Your exam has been automatically submitted due to multiple violations of exam rules.
                </p>
            </div>
        </div>
    );
}
