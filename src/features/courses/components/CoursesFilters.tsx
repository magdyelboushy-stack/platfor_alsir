import { motion } from 'framer-motion';
import { Search, Filter, LayoutGrid, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface CoursesFiltersProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    selectedSubject: string;
    setSelectedSubject: (val: string) => void;
    selectedLevel: string;
    setSelectedLevel: (val: string) => void;
    isLevelLocked?: boolean;
}

const subjects = ["الكل", "الجبر", "الهندسة", "التفاضل والتكامل", "الميكانيكا", "الإحصاء", "حساب المثلثات"];
const levels = [
    "جميع الصفوف",
    "الصف الرابع الابتدائى", "الصف الخامس الابتدائى", "الصف السادس الابتدائى",
    "الصف الأول الإعدادي", "الصف الثاني الإعدادي", "الصف الثالث الإعدادي",
    "الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"
];

export const CoursesFilters = ({
    searchQuery,
    setSearchQuery,
    selectedSubject,
    setSelectedSubject,
    selectedLevel,
    setSelectedLevel,
    isLevelLocked = false
}: CoursesFiltersProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        >
            <div className="grid md:grid-cols-4 gap-4 p-5 bg-white/5 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] border-2 border-brand-500/10 shadow-3xl transition-all">
                {/* Search */}
                <div className="md:col-span-2 relative group">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن اسم الدرس أو الكورس..."
                        className="w-full py-5 px-16 rounded-[2rem] bg-white/10 dark:bg-black/20 border-2 border-transparent focus:border-brand-500/40 focus:bg-white/20 dark:focus:bg-black/40 outline-none text-[var(--text-primary)] font-bold transition-all placeholder:text-slate-500 shadow-inner"
                    />
                </div>

                {/* Subject Filter */}
                <div className="relative group">
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="appearance-none w-full py-5 px-8 pr-14 rounded-[2rem] bg-white/10 dark:bg-black/20 border-2 border-transparent focus:border-brand-500/40 outline-none text-[var(--text-primary)] font-black cursor-pointer transition-all shadow-inner"
                    >
                        {subjects.map(s => <option key={s} value={s} className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">{s}</option>)}
                    </select>
                    <ChevronDown className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-brand-500" />
                    <Filter className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>

                {/* Level Filter (Locked for logged-in students) */}
                <div className={clsx("relative group", isLevelLocked && "opacity-60 pointer-events-none")}>
                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        disabled={isLevelLocked}
                        className="appearance-none w-full py-5 px-8 pr-14 rounded-[2rem] bg-white/10 dark:bg-black/20 border-2 border-transparent focus:border-brand-500/40 outline-none text-[var(--text-primary)] font-black cursor-pointer transition-all shadow-inner disabled:bg-black/5"
                    >
                        {levels.map(l => <option key={l} value={l} className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">{l}</option>)}
                    </select>
                    <ChevronDown className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-brand-500" />
                    <LayoutGrid className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
            </div>
        </motion.div>
    );
};
