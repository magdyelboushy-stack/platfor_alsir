import { ImageIcon, Video, Upload, X, Play, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useToast } from '@/store/uiStore';
import { getImageUrl } from '@/core/utils/url';

interface CourseMediaUploadProps {
    thumbnail?: string | null;
    onThumbnailChange?: (url: string | null) => void;
    introVideoUrl?: string | null;
    onIntroVideoChange?: (url: string | null) => void;
}

export function CourseMediaUpload({
    thumbnail: initialThumbnail,
    onThumbnailChange,
    introVideoUrl: initialIntroVideoUrl,
    onIntroVideoChange
}: CourseMediaUploadProps) {
    const [thumbnail, setThumbnail] = useState<string | null>(initialThumbnail || null);
    const [isUploading, setIsUploading] = useState(false);
    const [promoVideoUrl, setPromoVideoUrl] = useState(initialIntroVideoUrl || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    // Sync local state with prop
    useEffect(() => {
        setThumbnail(initialThumbnail || null);
    }, [initialThumbnail]);

    useEffect(() => {
        setPromoVideoUrl(initialIntroVideoUrl || '');
    }, [initialIntroVideoUrl]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: 'نوع الملف غير مدعوم. يرجى رفع صورة (JPEG, PNG, WebP)'
            });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: 'حجم الملف أكبر من 5MB'
            });
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('thumbnail', file);

            const response = await apiClient.post(ENDPOINTS.ADMIN.COURSES.UPLOAD_THUMBNAIL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = response.data.url;
            setThumbnail(imageUrl);
            onThumbnailChange?.(imageUrl);

            toast.show({
                type: 'success',
                title: 'تم',
                message: 'تم رفع الصورة بنجاح'
            });
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل رفع الصورة'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnail(null);
        onThumbnailChange?.(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                    <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-[var(--text-primary)]">الوسائط والواجهة</h2>
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">اجذب طلابك بصور وفيديوهات احترافية</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Thumbnail Upload */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
                    <label className="text-[10px] md:text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4 mb-4 block">صورة غلاف الكورس</label>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <div
                        className={`relative aspect-video rounded-3xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-main)] overflow-hidden group hover:border-brand-500/50 transition-colors cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--bg-main)]">
                                <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                                <p className="text-sm font-bold text-[var(--text-secondary)]">جاري الرفع...</p>
                            </div>
                        ) : thumbnail ? (
                            <>
                                <img
                                    src={getImageUrl(thumbnail)}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveThumbnail(); }}
                                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-brand-500 transition-colors shadow-sm">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-[var(--text-primary)]">اضغط لرفع صورة</p>
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 opacity-60 font-bold">PNG, JPG (1920x1080 مستحسن)</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Promo Video */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
                    <label className="text-[10px] md:text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4 mb-4 block">فيديو تعريفي (Promo)</label>
                    <div className="relative aspect-video rounded-3xl border border-[var(--border-color)] bg-[var(--bg-main)] overflow-hidden group">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4 group-hover:bg-slate-900/50 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/20 scale-90 group-hover:scale-100 transition-transform">
                                <Play className="w-8 h-8 fill-current" />
                            </div>
                            <span className="text-xs font-black text-white uppercase tracking-widest">رفع فيديو مقدمة الكورس</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-4">
                        <div className="relative group">
                            <input
                                type="text"
                                value={promoVideoUrl}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPromoVideoUrl(val);
                                    onIntroVideoChange?.(val);
                                }}
                                onBlur={() => {
                                    // Trigger save on blur as well to be sure
                                    onIntroVideoChange?.(promoVideoUrl);
                                }}
                                placeholder="أو أضف رابط فيديو (YouTube / Vimeo)"
                                className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] text-sm font-bold focus:border-brand-500 outline-none transition-all group-hover:border-brand-500/30 shadow-inner dir-ltr text-left"
                            />
                            <Video className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] opacity-50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
