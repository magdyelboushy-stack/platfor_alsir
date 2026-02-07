import { Search, Filter } from 'lucide-react';

interface FilesToolbarProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
}

export function FilesToolbar({ searchTerm, setSearchTerm }: FilesToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 px-2">
            <button className="h-16 px-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500 font-black flex items-center gap-3 transition-all active:scale-95 shrink-0">
                <Filter className="w-5 h-5" />
                <span>تصفية</span>
            </button>

            <div className="flex-1 relative group">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] group-focus-within:text-brand-500 transition-colors" />
                <input
                    type="text"
                    placeholder="ابحث عن اسم الملف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-16 pr-14 pl-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all"
                />
            </div>
        </div>
    );
}
