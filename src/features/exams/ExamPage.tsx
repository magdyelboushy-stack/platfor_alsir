import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    Send,
    AlertTriangle,
    Trophy,
    CheckCircle,
    XCircle,
    Home,
    RotateCcw,
    Maximize,
    Shield,
    Grid,
    X
} from 'lucide-react';
import { clsx } from 'clsx';
import { apiClient } from '@/core/api/client';

// Components
import { ExamTimer } from './components/ExamTimer';
import { QuestionNav } from './components/QuestionNav';
import { QuestionCard } from './components/QuestionCard';
import { ExamReviewModal } from './components/ExamReviewModal';

export function ExamPage() {
    const { examId } = useParams();

    // Exam State
    const [exam, setExam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, string>>(new Map());
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [attemptId, setAttemptId] = useState<string | null>(null);

    // Anti-Cheat State
    const [warningCount, setWarningCount] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showStartModal, setShowStartModal] = useState(true);
    const [examCancelled, setExamCancelled] = useState(false);

    // Fetch Real Exam Data
    useEffect(() => {
        if (!examId) return;

        const fetchData = async () => {
            try {
                const res = await apiClient.get(`/exams/${examId}`);
                setExam(res.data);
            } catch (error) {
                console.error('Failed to fetch exam:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [examId]);

    // Current Question
    const currentQuestion = exam?.questions ? exam.questions[currentQuestionIndex] : null;
    const answeredQuestions = new Set(Array.from(answers.keys()).map((id) => {
        // Find index of this question id in exam.questions
        return exam?.questions?.findIndex((q: any) => q.id === id);
    }).filter(i => i !== -1));

    // Anti-Cheat: Fullscreen Handler
    const enterFullscreen = useCallback(() => {
        const doc = document.documentElement;
        if (doc.requestFullscreen) {
            doc.requestFullscreen().catch(() => { });
        }
    }, []);

    // Anti-Cheat: Visibility & Fullscreen Change Detection
    useEffect(() => {
        if (showStartModal || isSubmitted || examCancelled) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarningCount(prev => prev + 1);
                setShowWarningModal(true);
            }
        };

        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            if (!isFull && !isSubmitted && !showStartModal && !examCancelled) {
                setWarningCount(prev => prev + 1);
                setShowWarningModal(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [showStartModal, isSubmitted, examCancelled]);

    // Anti-Cheat: Reload Protection
    useEffect(() => {
        if (showStartModal || isSubmitted || examCancelled) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'هل أنت متأكد من مغادرة الاختبار؟ سيتم إنهاء محاولتك تلقائياً.';
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [showStartModal, isSubmitted, examCancelled]);

    // Block Right-Click and Shortcuts
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && ['c', 'x', 'v', 'a', 'p', 'r', 'u'].includes(e.key.toLowerCase())) ||
                e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Auto-cancel exam after 2 exits
    useEffect(() => {
        if (warningCount >= 2 && !examCancelled && !isSubmitted) {
            setExamCancelled(true);
            handleSubmit(); // Auto submit on final violation
        }
    }, [warningCount, examCancelled, isSubmitted]);

    // Handle Answer
    const handleAnswer = (answer: string | string[]) => {
        if (!currentQuestion) return;
        const newAnswers = new Map(answers);
        newAnswers.set(currentQuestion.id, answer as string);
        setAnswers(newAnswers);
    };

    // Handle Flag Toggle
    const handleToggleFlag = () => {
        const newFlagged = new Set(flaggedQuestions);
        if (newFlagged.has(currentQuestionIndex)) {
            newFlagged.delete(currentQuestionIndex);
        } else {
            newFlagged.add(currentQuestionIndex);
        }
        setFlaggedQuestions(newFlagged);
    };

    // Handle Navigation
    const goToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        setIsMobileNavOpen(false);
    };

    const goNext = () => {
        if (exam && currentQuestionIndex < exam.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    const goPrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    // Handle Review
    const handleReviewNavigate = (index: number) => {
        setCurrentQuestionIndex(index);
        setIsReviewing(false);
    };

    // Handle Submit
    const handleSubmit = async () => {
        if (isSubmitted) return;
        setIsReviewing(false);

        try {
            const answersObj = Object.fromEntries(answers);
            const res = await apiClient.post(`/exams/${examId}/submit`, {
                attempt_id: attemptId,
                answers: answersObj,
                anti_cheat_violations: warningCount
            });

            setScore(Number(res.data.score) || 0);
            setCorrectCount(Number(res.data.correct_count) || 0);
            setIsSubmitted(true);
            if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
        } catch (error) {
            console.error('Submission failed:', error);
            // Fallback: at least show local results if offline/error
            setIsSubmitted(true);
        }
    };

    // Start Exam
    const startExam = async () => {
        try {
            const res = await apiClient.post(`/exams/${examId}/start`);
            if (res.data.success) {
                setAttemptId(res.data.attempt_id);
                setShowStartModal(false);
                enterFullscreen();
            }
        } catch (error: any) {
            alert(error?.response?.data?.error || 'فشل بدء الاختبار');
        }
    };

    const handleTimeUp = () => handleSubmit();

    if (loading) return (
        <div className="h-screen bg-[var(--bg-main)] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!exam) return null;

    // Calculate percentage local for UI
    const totalPointsPossible = exam.questions.reduce((acc: number, q: any) => acc + (Number(q.points) || 1), 0);
    const percentage = totalPointsPossible > 0 ? Math.round((Number(score) / totalPointsPossible) * 100) : 0;


    return (
        <div
            className="min-h-screen bg-[var(--bg-main)] transition-colors select-none"
            dir="rtl"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
        >

            {/* Review Modal */}
            {isReviewing && (
                <ExamReviewModal
                    isOpen={isReviewing}
                    questions={exam.questions}
                    answers={answers}
                    flagged={flaggedQuestions}
                    onClose={() => setIsReviewing(false)}
                    onNavigate={handleReviewNavigate}
                    onSubmit={handleSubmit}
                />
            )}

            {/* Start Modal */}
            <AnimatePresence>
                {showStartModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-md w-full border border-[var(--border-color)] shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-4">
                                {exam.title}
                            </h2>
                            <p className="text-[var(--text-secondary)] font-bold mb-6">
                                سيتم تفعيل وضع ملء الشاشة لمنع الغش. عند الخروج من ملء الشاشة أو ترك التبويب سيتم تسجيل تحذير.
                            </p>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 text-amber-500 text-sm font-bold">
                                <AlertTriangle className="w-5 h-5 inline-block ml-2" />
                                الوقت المحدد: {exam.duration_minutes} دقيقة | عدد الأسئلة: {exam.questions.length}
                            </div>
                            <button
                                onClick={startExam}
                                className="w-full py-4 rounded-2xl bg-cyan-500 text-white font-black text-lg hover:bg-cyan-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/30"
                            >
                                <Maximize className="w-5 h-5" />
                                ابدأ الاختبار
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Warning Modal */}
            <AnimatePresence>
                {showWarningModal && !isSubmitted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-md w-full border border-red-500/30 shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-red-500 mb-4">
                                تحذير! ⚠️
                            </h2>
                            <p className="text-[var(--text-secondary)] font-bold mb-4">
                                تم اكتشاف محاولة خروج من وضع الاختبار. يرجى البقاء في وضع ملء الشاشة.
                            </p>
                            <p className="text-red-500 font-black mb-6">
                                عدد التحذيرات: {warningCount} / 2
                            </p>
                            {warningCount >= 2 || examCancelled ? (

                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-all"
                                >
                                    تم إنهاء الاختبار تلقائياً
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowWarningModal(false);
                                        enterFullscreen();
                                    }}
                                    className="w-full py-4 rounded-2xl bg-cyan-500 text-white font-black hover:bg-cyan-600 transition-all"
                                >
                                    العودة للاختبار
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Modal */}
            <AnimatePresence>
                {isSubmitted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-lg w-full border border-[var(--border-color)] shadow-2xl text-center"
                        >
                            <div className={clsx(
                                "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6",
                                percentage >= 60 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            )}>
                                <Trophy className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2">
                                {percentage >= 60 ? "أحسنت! 🎉" : "حاول مرة أخرى 💪"}
                            </h2>
                            <p className="text-[var(--text-secondary)] font-bold mb-6">
                                {exam.title}
                            </p>

                            <div className="bg-[var(--bg-main)] rounded-2xl p-6 mb-6">
                                <div className="text-6xl font-black text-cyan-500 mb-2">
                                    {percentage}%
                                </div>
                                <p className="text-[var(--text-secondary)] font-bold">
                                    {correctCount} من {exam.questions.length} إجابات صحيحة
                                </p>
                            </div>

                            {/* Quick Summary */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                    <span className="text-2xl font-black text-emerald-500">{correctCount}</span>
                                    <p className="text-xs font-bold text-[var(--text-secondary)]">صحيحة</p>
                                </div>
                                <div className="bg-red-500/10 rounded-xl p-4 text-center">
                                    <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                                    <span className="text-2xl font-black text-red-500">{exam.questions.length - correctCount}</span>
                                    <p className="text-xs font-bold text-[var(--text-secondary)]">خاطئة</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Link
                                    to="/"
                                    className="flex-1 py-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-black flex items-center justify-center gap-2 hover:bg-[var(--bg-card)] transition-all"
                                >
                                    <Home className="w-5 h-5" />
                                    العودة للرئيسية
                                </Link>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 py-4 rounded-2xl bg-cyan-500 text-white font-black flex items-center justify-center gap-2 hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/30"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    إعادة المحاولة
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isMobileNavOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                            onClick={() => setIsMobileNavOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-80 bg-[var(--bg-card)] z-50 p-6 shadow-2xl lg:hidden overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-[var(--text-primary)]">قائمة الأسئلة</h3>
                                <button
                                    onClick={() => setIsMobileNavOpen(false)}
                                    className="p-2 hover:bg-[var(--bg-secondary)] rounded-full text-[var(--text-secondary)]"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <QuestionNav
                                totalQuestions={exam ? exam.questions.length : 0}
                                currentQuestion={currentQuestionIndex}
                                answeredQuestions={answeredQuestions}
                                flaggedQuestions={flaggedQuestions}
                                onNavigate={goToQuestion}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Exam Interface (Only show if not in start modal and not submitted) */}
            {!showStartModal && !isSubmitted && (
                <>
                    {/* Header */}
                    <header className="h-20 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
                        <div className="flex items-center gap-3 sm:gap-4">
                            {/* Mobile Nav Toggle */}
                            <button
                                onClick={() => setIsMobileNavOpen(true)}
                                className="lg:hidden p-2 hover:bg-[var(--bg-input)] rounded-xl text-[var(--text-secondary)] transition-colors"
                            >
                                <Grid className="w-6 h-6" />
                            </button>

                            <div className="text-right">
                                <p className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] hidden sm:block">{exam.course_name || 'كورس غير معروف'}</p>
                                <h1 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate max-w-[150px] sm:max-w-xs">{exam.title}</h1>
                            </div>
                        </div>
                        <ExamTimer initialMinutes={Number(exam.duration_minutes) || 30} onTimeUp={handleTimeUp} />
                    </header>

                    {/* Main Content */}
                    <div className="flex gap-8 p-4 sm:p-8 max-w-7xl mx-auto">
                        {/* Question Area */}
                        <div className="flex-1">
                            <AnimatePresence mode="wait">
                                <QuestionCard
                                    key={currentQuestion.id}
                                    question={currentQuestion}
                                    questionNumber={currentQuestionIndex + 1}
                                    selectedAnswer={answers.get(currentQuestion.id.toString()) || null}
                                    isFlagged={flaggedQuestions.has(currentQuestionIndex)}
                                    onAnswer={handleAnswer}
                                    onToggleFlag={handleToggleFlag}
                                />
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-8">
                                <button
                                    onClick={goPrev}
                                    disabled={currentQuestionIndex === 0}
                                    className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold flex items-center gap-2 hover:bg-[var(--bg-input)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                    السابق
                                </button>

                                {currentQuestionIndex === exam.questions.length - 1 ? (
                                    <button
                                        onClick={() => setIsReviewing(true)}
                                        className="px-8 py-3 rounded-xl bg-cyan-500 text-white font-black flex items-center gap-2 hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/30"
                                    >
                                        <Send className="w-5 h-5" />
                                        مراجعة وإنهاء
                                    </button>
                                ) : (
                                    <button
                                        onClick={goNext}
                                        className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold flex items-center gap-2 hover:bg-[var(--bg-input)] transition-colors"
                                    >
                                        التالي
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-80 hidden lg:block sticky top-28 h-fit">
                            <QuestionNav
                                totalQuestions={exam.questions.length}
                                currentQuestion={currentQuestionIndex}
                                answeredQuestions={answeredQuestions}
                                flaggedQuestions={flaggedQuestions}
                                onNavigate={goToQuestion}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
