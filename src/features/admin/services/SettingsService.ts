import { BaseService } from '@/core/services/BaseService';

export interface SystemSettings {
    app_name: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    logo_url: string;
    banner_url: string;
    contact_email: string;
    contact_phone: string;
    whatsapp_number: string;
    facebook_url: string;
    instagram_url: string;
    youtube_url: string;
    tiktok_url: string;
    telegram_url: string;
    telegram_group: string;
    whatsapp_group: string;
    facebook_group: string;
    address: string;
}

export class SettingsService extends BaseService {
    private static instance: SettingsService;

    private constructor() {
        super();
    }

    public static getInstance(): SettingsService {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
        }
        return SettingsService.instance;
    }

    async getSettings(): Promise<SystemSettings> {
        return this.get<SystemSettings>('/admin/settings');
    }

    async updateSettings(formData: FormData): Promise<SystemSettings> {
        return this.post<SystemSettings>('/admin/settings', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
}

export const settingsService = SettingsService.getInstance();
