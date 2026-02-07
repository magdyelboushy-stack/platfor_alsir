import { Plus } from 'lucide-react';

interface CodesHeaderProps {
    onGenerate: () => void;
}

export function CodesHeader({ onGenerate }: CodesHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
            <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight">
                    إدارة <span className="text-brand-500">أكواد التفعيل</span>
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                    قم بتوليد وإدارة كروت الشحن وأكواد الخصم لطلابك بكل سهولة.
                </p>
            </div>

            <button
                onClick={onGenerate}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-[1.5rem] font-black shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:scale-105 transition-all active:scale-95 group"
            >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                    <Plus className="w-5 h-5" />
                </div>
                <span>توليد أكواد جديدة</span>
            </button>
        </div>
    );
}
