import { BaseService } from '@/core/services/BaseService';

export interface DashboardStats {
    users: {
        students: { total: number; active: number; pending: number; blocked: number };
        teachers: { total: number; active: number; pending: number; blocked: number };
        assistants: { total: number; active: number; pending: number; blocked: number };
    };
    courses: { total: number; published: number };
    enrollments: { total: number; uniqueStudents: number };
    codes: { total: number; used: number };
    recentActivity: Array<{ date: string; new_students: number }>;
}

export class DashboardService extends BaseService {
    private static instance: DashboardService;

    private constructor() {
        super();
    }

    public static getInstance(): DashboardService {
        if (!DashboardService.instance) {
            DashboardService.instance = new DashboardService();
        }
        return DashboardService.instance;
    }

    async getStats(): Promise<DashboardStats> {
        return this.get<DashboardStats>('/admin/dashboard/stats');
    }
}

export const dashboardService = DashboardService.getInstance();
