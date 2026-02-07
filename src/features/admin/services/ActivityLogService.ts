import { apiClient } from '@/core/api/client';

export interface ActivityLog {
    id: string;
    action: string;
    action_label: string;
    target: string;
    actor: {
        name: string;
        email: string;
        role: string;
        avatar: string | null;
    };
    meta: {
        ip?: string;
        agent?: string;
        role?: string;
    };
    created_at: string;
}

export interface ActivityLogsResponse {
    data: ActivityLog[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

export class ActivityLogService {
    private static instance: ActivityLogService;

    private constructor() { }

    public static getInstance(): ActivityLogService {
        if (!ActivityLogService.instance) {
            ActivityLogService.instance = new ActivityLogService();
        }
        return ActivityLogService.instance;
    }

    public async getLogs(page = 1, search = ''): Promise<ActivityLogsResponse> {
        const { data } = await apiClient.get('/admin/logs', {
            params: { page, search }
        });
        return data;
    }
}

export const activityLogService = ActivityLogService.getInstance();
