import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuestionBankHeader() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-8">
            {/* Title & Add Button */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="text-right">
                    <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight">
                        بنك <span className="text-brand-500">الأسئلة والامتحانات</span>
                    </h2>
                    <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-[0_0_15px_rgba(197,160,89,0.4)]" />
                    <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                        قم بإنشاء وتصحيح الامتحانات، ومتابعة أداء الطلاب.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/teacher/exams/new')}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-[1.5rem] font-black shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:scale-105 transition-all active:scale-95 group"
                >
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span>امتحان جديد</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 px-2">
                <button className="h-16 px-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500 font-black flex items-center gap-3 transition-all active:scale-95">
                    <Filter className="w-5 h-5" />
                    <span>تصفية</span>
                </button>

                <div className="flex-1 relative group">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="ابحث عن امتحان..."
                        className="w-full h-16 pr-14 pl-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all"
                    />
                </div>
            </div>
        </div>
    );
}
