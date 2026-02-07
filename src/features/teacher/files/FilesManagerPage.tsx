// ============================================================
// Teacher Files Manager - Premium Library Redesign
// ============================================================

import { useEffect, useState } from 'react';
import { FilesHeader } from './components/FilesHeader';
import { FilesStats } from './components/FilesStats';
import { FilesToolbar } from './components/FilesToolbar';
import { FileList } from './components/FileList';
import { FileUploadModal } from './components/FileUploadModal';
import { getImageUrl, getFileDownloadUrl } from '@/core/utils/url';
import { api } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';

// Mock Data
const mockFiles: any[] = [];

export function FilesManagerPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [filesList, setFilesList] = useState(mockFiles);

    // Load files from API on mount
    useEffect(() => {
        (async () => {
            try {
                const resp = await api.get<{ items: any[] }>(ENDPOINTS.TEACHER.FILES.LIST);
                const items = resp?.items || [];
                setFilesList(items);
            } catch (e) {
                console.error('Failed to load files list', e);
            }
        })();
    }, []);

    const handleUpload = async (data: any) => {
        setIsUploading(true);
        try {
            if (data?.type === 'link' && data?.data) {
                const rawUrl: string = String(data.data);
                const newItem = {
                    id: String(Date.now()),
                    name: data.name || 'ملف بدون اسم',
                    type: 'pdf',
                    url: rawUrl,
                    size: '-',
                    date: new Date().toLocaleDateString('ar-EG'),
                    downloads: 0,
                };
                setFilesList(prev => [newItem, ...prev]);
            } else if (data?.type === 'file' && data?.data) {
                const file: File = data.data as File;
                const form = new FormData();
                form.append('file', file);
                // Optional: name
                if (data.name) form.append('name', data.name);

                const resp = await api.post<{ url: string; filename: string; size?: number; mime_type?: string; id?: string; original_name?: string; provider?: string; display_name?: string }>(
                    ENDPOINTS.TEACHER.FILES.UPLOAD,
                    form,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );

                const newItem = {
                    id: (resp as any)?.id || String(Date.now()),
                    // Prefer backend display_name (library title), then original_name, then provided name or file.name
                    name: resp?.display_name || resp?.original_name || data.name || file.name,
                    display_name: resp?.display_name || undefined,
                    original_name: resp?.original_name || undefined,
                    type: file.type || 'file',
                    url: resp?.url || '',
                    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                    date: new Date().toLocaleDateString('ar-EG'),
                    downloads: 0,
                };
                setFilesList(prev => [newItem, ...prev]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = (id: string) => {
        const file = filesList.find((f: any) => String(f.id) === String(id));
        if (!file) return;

        // إن كان داخل منصتنا (documents/ أو thumbnails/ إلخ) استخدم getImageUrl
        // وإن كان رابط خارجي مثل Google Drive فنحوّله لرابط تحميل مباشر
        const href = file.url ? (/^https?:\/\//i.test(file.url) ? getFileDownloadUrl(file.url) : getImageUrl(file.url)) : '';
        if (!href) return;

        const a = document.createElement('a');
        a.href = getFileDownloadUrl(file.url);
        a.download = ((file.display_name || file.original_name || file.name || 'file') as string).replace(/\s+/g, '_');
        a.click();
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // عدّاد التنزيلات
        setFilesList(prev => prev.map(f => (String(f.id) === String(id) ? { ...f, downloads: (f.downloads || 0) + 1 } : f)));
    };

    const handleDelete = async (id: string) => {
        try {
            await api.post(ENDPOINTS.TEACHER.FILES.DELETE(id), {});
            setFilesList(filesList.filter(f => String(f.id) !== String(id)));
        } catch (e) {
            console.error('Failed to delete file', e);
        }
    };

    const filteredFiles = filesList.filter(f =>
        ((f.original_name || f.name || '') as string).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalSpace: '50 GB',
        usedSpace: '0 GB',
        filesCount: filesList.length,
        totalDownloads: filesList.reduce((acc, f) => acc + (f.downloads || 0), 0)
    };

    return (
        <div className="space-y-12 max-w-[1600px] mx-auto py-8 animate-in fade-in duration-700">
            {/* 1. Header Area */}
            <FilesHeader
                onUpload={() => setIsUploadModalOpen(true)}
                isUploading={isUploading}
            />

            {/* 2. Key Statistics */}
            <FilesStats stats={stats} />

            {/* 3. Action Toolbar */}
            <FilesToolbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            {/* 4. Main Library View */}
            <div className="px-2">
                <FileList
                    files={filteredFiles}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                />
            </div>

            {/* 5. Upload Modal */}
            <FileUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSubmit={handleUpload}
            />

            {/* Aesthetics: Decorative Orbs */}
            <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
