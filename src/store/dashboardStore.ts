import { create } from 'zustand';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';

interface DashboardStats {
    enrolledCoursesCount: number;
    totalExamsScore: number;
    learningHours: number;
    streak: string;
    understandingRate: number;
    performanceLevel: number;
    accuracy: number;
    xp: number;
    rank: string;
}

interface Course {
    id: number;
    title: string;
    instructor: string;
    progress: number;
    lessonsCount: number;
    completedCount: number;
    thumbnail?: string;
}

interface DashboardState {
    stats: DashboardStats | null;
    courses: Course[];
    isLoading: boolean;
    error: string | null;
    fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    stats: null,
    courses: [],
    isLoading: false,
    error: null,

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
            const [statsRes, coursesRes] = await Promise.all([
                apiClient.get(ENDPOINTS.DASHBOARD.STATS),
                apiClient.get(ENDPOINTS.COURSES.MY_COURSES)
            ]);

            set({
                stats: statsRes.data as DashboardStats,
                courses: coursesRes.data as Course[],
                isLoading: false
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || 'Failed to fetch dashboard data',
                isLoading: false,
                // Fallback empty states
                stats: {
                    enrolledCoursesCount: 0,
                    totalExamsScore: 0,
                    learningHours: 0,
                    streak: 'جديد',
                    understandingRate: 0,
                    performanceLevel: 0,
                    accuracy: 0,
                    xp: 0,
                    rank: 'مبتدئ'
                },
                courses: []
            });
        }
    }
}));
