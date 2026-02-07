import { useEffect, useState } from 'react';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { getImageUrl } from '@/core/utils/url';

type TeacherFileItem = {
    id: string;
    name: string;
    display_name?: string | null;
    original_name?: string | null;
    type?: string;
    url: string;
    size?: string;
    date?: string;
    downloads?: number;
};

interface FileLibraryPickerProps {
    onSelect: (file: TeacherFileItem) => void;
    onClose: () => void;
}

export function FileLibraryPicker({ onSelect, onClose }: FileLibraryPickerProps) {
    const [items, setItems] = useState<TeacherFileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        apiClient.get<{ items: TeacherFileItem[] }>(ENDPOINTS.TEACHER.FILES.LIST)
            .then(res => {
                if (!mounted) return;
                const all = res.data?.items || [];
                // Filter PDFs robustly: by type === 'pdf' or url ends with .pdf
                const pdfs = all.filter((f: TeacherFileItem) => {
                    const name = (f.display_name || f.original_name || f.name || '').toLowerCase();
                    const url = (f.url || '').toLowerCase();
                    const type = (f.type || '').toLowerCase();
                    return type === 'pdf' || name.endsWith('.pdf') || url.endsWith('.pdf');
                });
                setItems(pdfs);
            })
            .catch(err => {
                setError(err?.response?.data?.error || 'فشل تحميل مكتبة الملفات');
            })
            .finally(() => setLoading(false));
        return () => { mounted = false; };
    }, []);

    const filtered = items.filter((f) => {
        const name = (f.display_name || f.original_name || f.name || '').toLowerCase();
        return !search || name.includes(search.toLowerCase());
    });

    return (
        <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-[var(--text-primary)]">اختيار ملف PDF من المكتبة</h3>
                <button
                    onClick={onClose}
                    className="px-3 py-2 rounded-xl bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 transition-all"
                >
                    إغلاق
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث باسم الملف..."
                    className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                />
            </div>

            {loading ? (
                <div className="py-10 text-center text-[var(--text-secondary)]">جاري تحميل الملفات...</div>
            ) : error ? (
                <div className="py-10 text-center text-red-500">{error}</div>
            ) : filtered.length === 0 ? (
                <div className="py-10 text-center text-[var(--text-secondary)]">لا توجد ملفات PDF في مكتبتك حتى الآن.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((f) => {
                        const displayName = f.display_name || f.original_name || f.name || 'غير مسمى';
                        return (
                            <div
                                key={f.id}
                                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col gap-2"
                            >
                                <div className="font-bold text-[var(--text-primary)]">{displayName}</div>
                                <div className="text-xs text-[var(--text-secondary)]">
                                    {f.size ? `الحجم: ${f.size}` : ''} {f.date ? ` • التاريخ: ${f.date}` : ''}
                                </div>
                                <div className="mt-2 flex items-center gap-3">
                                    <a
                                        href={getImageUrl(f.url)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-2 rounded-xl bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-all"
                                    >
                                        معاينة
                                    </a>
                                    <button
                                        onClick={() => onSelect(f)}
                                        className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
                                    >
                                        اختيار هذا الملف
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}