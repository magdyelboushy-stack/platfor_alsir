import { Search, Filter } from 'lucide-react';
import { clsx } from 'clsx';

interface CodesToolbarProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    showUsed: boolean;
    setShowUsed: (v: boolean) => void;
}

export function CodesToolbar({ searchTerm, setSearchTerm, showUsed, setShowUsed }: CodesToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 px-2">
            <button
                onClick={() => setShowUsed(!showUsed)}
                className={clsx(
                    "h-16 px-8 border rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shrink-0",
                    showUsed
                        ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20"
                        : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500"
                )}
            >
                <Filter className="w-5 h-5" />
                <span>{showUsed ? 'إخفاء الأكواد المستخدمة' : 'عرض الأكواد المستخدمة'}</span>
            </button>

            <div className="flex-1 relative group">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="ابحث عن اسم مجموعة أو كود..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-16 pr-14 pl-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all"
                />
            </div>
        </div>
    );
}
