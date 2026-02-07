import { Plus, UploadCloud } from 'lucide-react';

interface FilesHeaderProps {
    onUpload: () => void;
    isUploading: boolean;
}

export function FilesHeader({ onUpload, isUploading }: FilesHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
            <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight">
                    مكتبة <span className="text-brand-500">الملفات والكتب</span>
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-[0_0_15px_rgba(197,160,89,0.4)]" />
                <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                    قم بتنظيم مذكراتك، ملفات الـ PDF، والكتب الدراسية في مكان واحد آمن.
                </p>
            </div>

            <button
                onClick={onUpload}
                disabled={isUploading}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-[1.5rem] font-black shadow-brand-500/20 shadow-brand-500/40 hover:scale-105 transition-all active:scale-95 group disabled:opacity-50 disabled:scale-100"
            >
                {isUploading ? (
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center animate-pulse">
                        <UploadCloud className="w-5 h-5 animate-bounce" />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                        <Plus className="w-5 h-5" />
                    </div>
                )}
                <span>{isUploading ? 'جاري الرفع...' : 'رفع ملف جديد'}</span>
            </button>
        </div>
    );
}
