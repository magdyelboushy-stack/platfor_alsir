
import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { Exam, Question, ExamSession, ExamResult } from '../types';

interface UseExamSessionOptions {
    examId: string;
    onTimeUp?: () => void;
    onSubmit?: (result: ExamResult) => void;
}

export function useExamSession({ examId, onTimeUp, onSubmit }: UseExamSessionOptions) {
    const queryClient = useQueryClient();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [session, setSession] = useState<ExamSession | null>(null);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch exam details
    const examQuery = useQuery({
        queryKey: ['exam', examId],
        queryFn: () => api.get<Exam>(ENDPOINTS.EXAMS.DETAIL(examId)),
    });

    // Fetch questions (after starting)
    const questionsQuery = useQuery({
        queryKey: ['exam', examId, 'questions'],
        queryFn: () => api.get<Question[]>(`/exams/${examId}/questions`),
        enabled: !!session,
    });

    // Start exam mutation
    const startMutation = useMutation({
        mutationFn: () => api.post<ExamSession>(ENDPOINTS.EXAMS.START(examId)),
        onSuccess: (data) => {
            setSession(data);
            setRemainingTime(data.remainingTime);
            setCurrentIndex(data.currentQuestionIndex);
            setAnswers(data.answers);
        },
    });

    // Submit exam mutation
    const submitMutation = useMutation({
        mutationFn: (finalAnswers: Record<string, string | string[]>) =>
            api.post<ExamResult>(ENDPOINTS.EXAMS.SUBMIT(examId), { answers: finalAnswers }),
        onSuccess: (result) => {
            setSession(null);
            queryClient.invalidateQueries({ queryKey: ['exam', examId] });
            onSubmit?.(result);
        },
    });

    useEffect(() => {
        if (!session || remainingTime <= 0) return;

        timerRef.current = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    // Time's up - auto submit
                    handleSubmit();
                    onTimeUp?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [session]);

    const startExam = useCallback(() => {
        startMutation.mutate();
    }, [startMutation]);

    const selectAnswer = useCallback((questionId: string, answer: string | string[]) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    }, []);

    const goToQuestion = useCallback((index: number) => {
        if (questionsQuery.data && index >= 0 && index < questionsQuery.data.length) {
            setCurrentIndex(index);
        }
    }, [questionsQuery.data]);

    const nextQuestion = useCallback(() => {
        if (questionsQuery.data && currentIndex < questionsQuery.data.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    }, [currentIndex, questionsQuery.data]);

    const prevQuestion = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    }, [currentIndex]);

    const handleSubmit = useCallback(() => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        submitMutation.mutate(answers);
    }, [answers, isSubmitting, submitMutation]);

    const currentQuestion = questionsQuery.data?.[currentIndex] ?? null;
    const totalQuestions = questionsQuery.data?.length ?? 0;
    const answeredCount = Object.keys(answers).length;
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    const formattedTime = formatTime(remainingTime);
    const isTimeWarning = remainingTime <= 300; // 5 minutes warning
    const isTimeCritical = remainingTime <= 60; // 1 minute critical

    return {
        // State
        exam: examQuery.data,
        session,
        questions: questionsQuery.data ?? [],
        currentQuestion,
        currentIndex,
        answers,
        remainingTime,
        formattedTime,

        // Computed
        totalQuestions,
        answeredCount,
        progress,
        isTimeWarning,
        isTimeCritical,

        // Loading states
        isLoading: examQuery.isLoading || startMutation.isPending,
        isStarting: startMutation.isPending,
        isSubmitting: submitMutation.isPending,

        // Actions
        startExam,
        selectAnswer,
        goToQuestion,
        nextQuestion,
        prevQuestion,
        submitExam: handleSubmit,
    };
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
