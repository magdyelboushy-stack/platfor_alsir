// ============================================================
// Exam Types - E-learning Platform
// ============================================================

export interface Exam {
    id: string;
    courseId: string;
    title: string;
    description: string;
    duration: number; // in minutes
    passScore: number; // percentage required to pass
    questionsCount: number;
    isRandomized: boolean;
    maxAttempts: number;
    status: 'upcoming' | 'active' | 'completed';
    scheduledAt?: string;
    endsAt?: string;
}

export interface Question {
    id: string;
    examId: string;
    type: 'single' | 'multiple' | 'true_false' | 'essay';
    text: string;
    options?: QuestionOption[];
    points: number;
    order: number;
}

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean; // Only available after submission
}

export interface ExamSession {
    id: string;
    examId: string;
    startedAt: string;
    endsAt: string;
    remainingTime: number; // in seconds
    currentQuestionIndex: number;
    answers: Record<string, string | string[]>;
    status: 'in_progress' | 'submitted' | 'timed_out';
}

export interface ExamResult {
    id: string;
    examId: string;
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    timeTaken: number; // in seconds
    submittedAt: string;
    answers: AnswerResult[];
}

export interface AnswerResult {
    questionId: string;
    selectedAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
}

// Anti-Cheat Types
export interface AntiCheatEvent {
    type: 'tab_switch' | 'copy_paste' | 'right_click' | 'fullscreen_exit' | 'devtools';
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface ProctorState {
    isFullscreen: boolean;
    violations: AntiCheatEvent[];
    warningsCount: number;
    isLocked: boolean;
}
