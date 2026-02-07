import { apiClient } from '@/core/api/client';

export abstract class BaseService {
    protected api = apiClient;

    protected async get<T>(url: string): Promise<T> {
        const { data } = await this.api.get<T>(url);
        return data;
    }

    protected async post<T>(url: string, payload?: any, config?: any): Promise<T> {
        const { data } = await this.api.post<T>(url, payload, config);
        return data;
    }

    protected async put<T>(url: string, payload?: any): Promise<T> {
        const { data } = await this.api.put<T>(url, payload);
        return data;
    }

    protected async patch<T>(url: string, payload?: any): Promise<T> {
        const { data } = await this.api.patch<T>(url, payload);
        return data;
    }

    protected async delete<T>(url: string): Promise<T> {
        const { data } = await this.api.delete<T>(url);
        return data;
    }
}
