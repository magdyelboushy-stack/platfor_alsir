// ============================================================
// useDashboardStats - Custom Hook for Dashboard Data
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { DashboardData, DashboardStats, CourseProgress, UpcomingExam, RecentActivity } from '../types';

// Query Keys
export const dashboardKeys = {
    all: ['dashboard'] as const,
    stats: () => [...dashboardKeys.all, 'stats'] as const,
    courses: () => [...dashboardKeys.all, 'courses'] as const,
    exams: () => [...dashboardKeys.all, 'exams'] as const,
    activity: () => [...dashboardKeys.all, 'activity'] as const,
};

// ============================================================
// Fetch Functions
// ============================================================
const fetchDashboardStats = async (): Promise<DashboardStats> => {
    return api.get<DashboardStats>(ENDPOINTS.DASHBOARD.STATS);
};

const fetchCourseProgress = async (): Promise<CourseProgress[]> => {
    return api.get<CourseProgress[]>('/dashboard/courses');
};

const fetchUpcomingExams = async (): Promise<UpcomingExam[]> => {
    return api.get<UpcomingExam[]>('/dashboard/exams');
};

const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    return api.get<RecentActivity[]>(ENDPOINTS.DASHBOARD.RECENT_ACTIVITY);
};

// ============================================================
// Main Hook - Combines All Dashboard Data
// ============================================================
export function useDashboardData() {
    const statsQuery = useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: fetchDashboardStats,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const coursesQuery = useQuery({
        queryKey: dashboardKeys.courses(),
        queryFn: fetchCourseProgress,
        staleTime: 1000 * 60 * 5,
    });

    const examsQuery = useQuery({
        queryKey: dashboardKeys.exams(),
        queryFn: fetchUpcomingExams,
        staleTime: 1000 * 60 * 2, // 2 minutes for time-sensitive data
    });

    const activityQuery = useQuery({
        queryKey: dashboardKeys.activity(),
        queryFn: fetchRecentActivity,
        staleTime: 1000 * 60 * 1, // 1 minute
    });

    const isLoading =
        statsQuery.isLoading ||
        coursesQuery.isLoading ||
        examsQuery.isLoading ||
        activityQuery.isLoading;

    const isError =
        statsQuery.isError ||
        coursesQuery.isError ||
        examsQuery.isError ||
        activityQuery.isError;

    const data: DashboardData | null =
        statsQuery.data && coursesQuery.data && examsQuery.data && activityQuery.data
            ? {
                stats: statsQuery.data,
                courseProgress: coursesQuery.data,
                upcomingExams: examsQuery.data,
                recentActivity: activityQuery.data,
            }
            : null;

    const refetchAll = () => {
        statsQuery.refetch();
        coursesQuery.refetch();
        examsQuery.refetch();
        activityQuery.refetch();
    };

    return {
        data,
        isLoading,
        isError,
        refetchAll,
        // Individual queries for granular access
        stats: statsQuery,
        courses: coursesQuery,
        exams: examsQuery,
        activity: activityQuery,
    };
}

// ============================================================
// Individual Hooks for Specific Widgets
// ============================================================
export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: fetchDashboardStats,
        staleTime: 1000 * 60 * 5,
    });
}

export function useCourseProgress() {
    return useQuery({
        queryKey: dashboardKeys.courses(),
        queryFn: fetchCourseProgress,
        staleTime: 1000 * 60 * 5,
    });
}

export function useUpcomingExams() {
    return useQuery({
        queryKey: dashboardKeys.exams(),
        queryFn: fetchUpcomingExams,
        staleTime: 1000 * 60 * 2,
    });
}

export function useRecentActivity() {
    return useQuery({
        queryKey: dashboardKeys.activity(),
        queryFn: fetchRecentActivity,
        staleTime: 1000 * 60 * 1,
    });
}
