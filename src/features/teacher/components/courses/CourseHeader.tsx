import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface CourseHeaderProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export function CourseHeader({ searchTerm, setSearchTerm }: CourseHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <motion.div
                variants={itemVariants}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="text-right">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white font-display">إدارة الكورسات</h1>
                    <p className="text-slate-400 mt-1">قم بإدارة محتوى كورساتك، إضافة دروس جديدة، ومتابعة الاشعارات.</p>
                </div>
                <button
                    onClick={() => navigate('/teacher/courses/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-1 justify-center"
                >
                    <Plus className="w-5 h-5" />
                    <span>كورس جديد</span>
                </button>
            </motion.div>

            {/* Filters Bar */}
            <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4"
            >
                <div className="flex-1 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="ابحث عن كورس..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white focus:border-brand-500/50 outline-none transition-colors text-right"
                    />
                </div>
                <button className="px-6 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-slate-400 hover:text-white font-bold flex items-center justify-center gap-2 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>تصفية</span>
                </button>
            </motion.div>
        </div>
    );
}
