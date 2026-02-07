import { Search, GraduationCap, X } from 'lucide-react';
import { clsx } from 'clsx';
import { EDUCATION_SYSTEM } from '@/core/utils/educationMapping';

interface StudentFiltersProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    filters: {
        stage: string;
        grade: string;
    };
    onFilterChange: (key: string, val: string) => void;
}

export function StudentFilters({ searchTerm, onSearchChange, filters, onFilterChange }: StudentFiltersProps) {
    const activeStage = EDUCATION_SYSTEM.find(s => s.id === filters.stage);

    return (
        <div className="space-y-6" dir="rtl">
            {/* Search & Main Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute right-4 lg:right-5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-[var(--text-secondary)] group-focus-within:text-[var(--color-brand)] transition-colors" />
                    <input
                        type="text"
                        placeholder="ابحث عن طالب بالاسم أو رقم الهاتف..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={clsx(
                            "w-full pr-10 lg:pr-14 pl-6 py-3.5 lg:py-4 rounded-3xl outline-none transition-all duration-300 font-bold text-sm lg:text-base",
                            "bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 focus:border-brand-500/40 focus:ring-4 focus:ring-brand-500/5 backdrop-blur-xl shadow-sm text-[var(--text-primary)]"
                        )}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Stage Filter - Improved horizontal scroll */}
                <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 lg:mx-0 lg:px-0">
                    <FilterButton
                        active={!filters.stage}
                        onClick={() => { onFilterChange('stage', ''); onFilterChange('grade', ''); }}
                    >
                        الكل
                    </FilterButton>
                    {EDUCATION_SYSTEM.map(stage => (
                        <FilterButton
                            key={stage.id}
                            active={filters.stage === stage.id}
                            onClick={() => { onFilterChange('stage', stage.id); onFilterChange('grade', ''); }}
                        >
                            {stage.name}
                        </FilterButton>
                    ))}
                </div>
            </div>

            {/* Sub-filters (Grades) */}
            {activeStage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2"
                >
                    <div className="flex items-center gap-2 ml-4 text-[var(--text-secondary)] opacity-60">
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-xs font-black uppercase">الصفوف الدراسية:</span>
                    </div>
                    {activeStage.grades.map(grade => (
                        <button
                            key={grade.id}
                            onClick={() => onFilterChange('grade', grade.id)}
                            className={clsx(
                                "px-6 py-2 rounded-2xl text-[10px] font-black border transition-all duration-300 uppercase tracking-widest",
                                filters.grade === grade.id
                                    ? "bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20 scale-105"
                                    : "bg-white/40 dark:bg-[var(--bg-card)] text-[var(--text-secondary)] border-brand-500/10 hover:border-brand-500/30"
                            )}
                        >
                            {grade.name}
                        </button>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

function FilterButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "px-8 py-4 rounded-3xl font-black text-sm border whitespace-nowrap transition-all duration-500",
                active
                    ? "bg-[var(--color-brand)] text-white border-brand-500 shadow-lg shadow-brand-500/20 translate-y-[-2px]"
                    : "bg-white/40 dark:bg-[var(--bg-card)] text-[var(--text-secondary)] border-brand-500/10 hover:border-brand-500/30 hover:bg-white/60 dark:hover:bg-white/[0.03]"
            )}
        >
            {children}
        </button>
    );
}

import { motion } from 'framer-motion';
