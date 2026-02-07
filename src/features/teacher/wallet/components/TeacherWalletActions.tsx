import { Download, CreditCard, Share2 } from 'lucide-react';

export function TeacherWalletActions() {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <button className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.5rem] font-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95">
                <CreditCard className="w-5 h-5" />
                <span>طلب سحب رصيد</span>
            </button>
            <button className="flex-1 md:flex-none px-8 py-4 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-emerald-500 rounded-[1.5rem] font-black hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Download className="w-5 h-5" />
                <span>تحميل التقرير المال</span>
            </button>
            <button className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-emerald-500 hover:border-emerald-500 rounded-[1.5rem] font-black hover:scale-105 transition-all flex items-center justify-center active:scale-95">
                <Share2 className="w-5 h-5" />
            </button>
        </div>
    );
}
