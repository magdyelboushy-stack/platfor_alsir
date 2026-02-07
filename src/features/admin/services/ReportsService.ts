import { apiClient } from '@/core/api/client';

export interface FinancialStats {
    total_revenue: number;
    total_codes: number;
    used_codes: number;
    active_teachers: number;
}

export interface TeacherRevenue {
    id: string;
    name: string;
    email: string;
    avatar: string;
    coursesCount: number;
    codes: {
        generated: number;
        used: number;
        usageRate: number;
    };
    revenue: number;
}

export interface FinancialReportData {
    summary: FinancialStats;
    teachers: TeacherRevenue[];
}

class ReportsService {
    public async getFinancialReport(): Promise<FinancialReportData> {
        const { data } = await apiClient.get<FinancialReportData>('/admin/reports');
        return data;
    }
}

export const reportsService = new ReportsService();
