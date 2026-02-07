import { getImageUrl } from '@/core/utils/url';

export const getFileUrl = (path: string | null | undefined): string => {
    return getImageUrl(path);
};

export const getAvatarUrl = (path: string | null | undefined, email: string): string => {
    const url = getFileUrl(path);
    if (url) return url;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
};
