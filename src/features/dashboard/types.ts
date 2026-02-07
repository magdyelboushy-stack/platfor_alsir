// ============================================================
// Dashboard Types - E-learning Platform
// ============================================================

import type { UserRole } from '@/core/types/common';

export interface DashboardStats {
    enrolledCourses: number;
    completedLessons: number;
    totalWatchTime: number; // in minutes
    upcomingExams: number;
    walletBalance: number;
    averageScore: number;
    certificatesEarned: number;
    streakDays: number;
}

export interface CourseProgress {
    courseId: string;
    title: string;
    thumbnail: string;
    progress: number; // 0-100
    totalLessons: number;
    completedLessons: number;
    lastAccessed: string;
}

export interface UpcomingExam {
    id: string;
    title: string;
    courseTitle: string;
    scheduledAt: string;
    duration: number; // in minutes
    questionsCount: number;
}

export interface RecentActivity {
    id: string;
    type: 'lesson_completed' | 'exam_passed' | 'course_enrolled' | 'certificate_earned';
    title: string;
    description: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface DashboardData {
    stats: DashboardStats;
    courseProgress: CourseProgress[];
    upcomingExams: UpcomingExam[];
    recentActivity: RecentActivity[];
}

// Role-specific dashboard configs
export interface DashboardConfig {
    role: UserRole;
    widgets: DashboardWidget[];
    quickActions: QuickAction[];
}

export interface DashboardWidget {
    id: string;
    type: 'stats' | 'courses' | 'exams' | 'activity' | 'wallet' | 'students' | 'tickets';
    title: string;
    size: 'small' | 'medium' | 'large';
    order: number;
}

export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    href: string;
    color: string;
}
