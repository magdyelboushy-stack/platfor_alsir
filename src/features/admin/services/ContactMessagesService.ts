import { BaseService } from '@/core/services/BaseService';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useAuthStore } from '@/store/authStore';

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'new' | 'sent' | 'failed' | 'responded';
    created_at: string;
    admin_reply?: string;
    replied_at?: string | null;
}

export class ContactMessagesService extends BaseService {
    private static instance: ContactMessagesService;
    public static getInstance(): ContactMessagesService {
        if (!ContactMessagesService.instance) {
            ContactMessagesService.instance = new ContactMessagesService();
        }
        return ContactMessagesService.instance;
    }

    async list(): Promise<ContactMessage[]> {
        return this.get<ContactMessage[]>(ENDPOINTS.SUPPORT.CONTACT_MESSAGES);
    }

    async updateStatus(id: string, status: ContactMessage['status']): Promise<ContactMessage> {
        const csrf = await useAuthStore.getState().fetchCsrfToken();
        const res = await this.post<{ updated: ContactMessage }>(
            ENDPOINTS.SUPPORT.UPDATE_CONTACT_STATUS(id),
            { status, csrf_token: csrf }
        );
        return res.updated;
    }

    async reply(id: string, reply: string): Promise<{ sent: boolean; message: string }> {
        const csrf = await useAuthStore.getState().fetchCsrfToken();
        return this.post<{ sent: boolean; message: string }>(
            ENDPOINTS.SUPPORT.REPLY_CONTACT_MESSAGE(id),
            { reply, csrf_token: csrf }
        );
    }
}

export const contactMessagesService = ContactMessagesService.getInstance();
