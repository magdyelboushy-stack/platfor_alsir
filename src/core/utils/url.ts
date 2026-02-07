/**
 * Get the full URL for an image/file from the API
 */
export function getImageUrl(path: string | null | undefined): string {
    if (!path) return '';

    // Normalize API_URL and remove trailing slash
    const envApiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api';
    const API_URL = envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
    const BASE_URL = API_URL.replace('/api', '');
    const IS_DEV = (import.meta as any).env?.DEV === true;

    const result = (() => {
        // 1. If it's already a full URL, return it
        if (path.startsWith('http')) return path;

        // 2. Clear any leading slashes for consistency in logic
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;

        // 3. If it's an API path like "api/files/..."
        if (cleanPath.startsWith('api/')) {
            // In development, if it's a file path, we can try to serve it directly via junctions
            if (IS_DEV) {
                const fileMatch = cleanPath.match(/^api\/files\/(avatars|thumbnails|banners|documents)\/(.+)$/);
                if (fileMatch) {
                    return `/${fileMatch[1]}/${fileMatch[2]}`;
                }
                return `/${cleanPath}`;
            }
            // In production, prepend BASE_URL
            return `${BASE_URL}/${cleanPath}`;
        }

        // 4. If it's a relative storage path (e.g. "avatars/...", "banners/...", "thumbnails/...", "documents/...")
        if (
            cleanPath.startsWith('avatars/') ||
            cleanPath.startsWith('banners/') ||
            cleanPath.startsWith('thumbnails/') ||
            cleanPath.startsWith('documents/')
        ) {
            // In development, use relative path directly since we have junctions in public/
            if (IS_DEV) {
                return `/${cleanPath}`;
            }
            // In production, prepend full API URL
            return `${API_URL}/files/${cleanPath}`;
        }

        // 5. Public assets/uploads
        if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('assets/')) {
            return `${BASE_URL}/${cleanPath}`;
        }

        // 6. Default: prepend API URL
        return `${API_URL}/${cleanPath}`;
    })();

    return result;
}

/**
 * Convert standard YouTube/Vimeo links to embeddable formats
 */
export function getEmbedUrl(url: string | null | undefined): string {
    if (!url) return '';

    // YouTube Handle (watch?v= or youtu.be/)
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo Handle
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
}

export function getFileDownloadUrl(inputPath: string | null | undefined) {
    if (!inputPath) return '';

    const url = getImageUrl(inputPath);

    // If it's not an http(s) URL, return as-is
    const isHttp = /^https?:\/\//i.test(url);
    if (!isHttp) return url;

    try {
        const u = new URL(url);
        const host = u.hostname.toLowerCase();

        // Google Drive patterns -> convert to direct download URL
        if (host.includes('drive.google.com')) {
            // 1) /file/d/<ID>/view
            const fileIdFromPath = (() => {
                const m = u.pathname.match(/\/file\/d\/([^\/]+)/);
                return m?.[1] || null;
            })();

            // 2) /open?id=<ID>
            const fileIdFromOpen = u.pathname.includes('/open') ? (u.searchParams.get('id') || null) : null;

            // 3) /uc?id=<ID>
            const fileIdFromUc = u.pathname.includes('/uc') ? (u.searchParams.get('id') || null) : null;

            const fileId = fileIdFromPath || fileIdFromOpen || fileIdFromUc;
            if (fileId) {
                return `https://drive.google.com/uc?export=download&id=${fileId}`;
            }
            // Fallback: keep original URL
            return url;
        }

        // Dropbox shared link -> force direct download
        if (host.includes('dropbox.com')) {
            // Example: https://www.dropbox.com/s/<id>/file.pdf?dl=0 -> dl=1
            u.searchParams.set('dl', '1');
            return u.toString();
        }

        // Default: return normalized URL
        return url;
    } catch {
        return url;
    }
}
