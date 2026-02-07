import { apiClient } from '@/core/api/client';

export interface RegistrationRequest {
    id: string;
    student: string;
    type: 'new_registration';
    time: string;
    details: {
        fullName: string;
        email: string;
        phone: string;
        gradeLevel: string;
        educationStage: string;
        governorate: string;
        city: string;
        guardianName: string;
        guardianPhone: string;
        gender: 'male' | 'female';
        birthDate: string;
        avatar: string;
    };
}

class RequestsService {
    /**
     * Get all pending registration requests
     */
    public async getPendingRequests(): Promise<RegistrationRequest[]> {
        const { data } = await apiClient.get<RegistrationRequest[]>('/admin/requests/pending');
        return data;
    }

    /**
     * Approve a request (activate student)
     */
    public async approveRequest(id: string): Promise<void> {
        await apiClient.post(`/admin/requests/${id}/approve`);
    }

    /**
     * Reject a request (delete student)
     */
    public async rejectRequest(id: string): Promise<void> {
        await apiClient.post(`/admin/requests/${id}/reject`);
    }
}

export const requestsService = new RequestsService();
