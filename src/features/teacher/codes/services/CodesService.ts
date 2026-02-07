import { api } from '@/core/api/client';

export interface ActivationCode {
    id: string;
    code: string;
    course_id: string;
    course_title?: string;
    price: number;
    batch_name?: string;
    status: 'active' | 'used' | 'expired' | 'cancelled';
    assigned_to_id?: string;
    assigned_to_name?: string;
    redeemed_by_name?: string;
    created_at: string;
    expires_at?: string;
    redeemed_at?: string;
}

export interface CodeStats {
    total: number;
    used: number;
    active: number;
    expired: number;
    revenue: number;
}

export interface GenerateCodesRequest {
    course_id: string;
    price: number;
    batch_name?: string;
    count?: number;
    students?: string[];
}

export interface GenerateCodesResponse {
    success: boolean;
    message: string;
    count: number;
    codes: { id: string; code: string; assigned_to?: string }[];
    course: string;
    batch_name?: string;
}

export interface RedeemCodeResponse {
    success: boolean;
    message: string;
    course: {
        id: string;
        title: string;
    };
}

class CodesServiceClass {
    /**
     * Get all codes for the current teacher
     */
    async getCodes(showUsed: boolean = false): Promise<ActivationCode[]> {
        return api.get<ActivationCode[]>('/admin/codes', { params: { show_used: showUsed } });
    }

    /**
     * Get code statistics
     */
    async getStats(): Promise<CodeStats> {
        return api.get<CodeStats>('/admin/codes/stats');
    }

    /**
     * Generate new activation codes
     */
    async generateCodes(data: GenerateCodesRequest): Promise<GenerateCodesResponse> {
        return api.post<GenerateCodesResponse>('/admin/codes', data);
    }

    /**
     * Redeem an activation code (for students)
     */
    async redeemCode(code: string): Promise<RedeemCodeResponse> {
        return api.post<RedeemCodeResponse>('/codes/redeem', { code });
    }
}

export const CodesService = new CodesServiceClass();
