import { motion } from 'framer-motion';
import { Download, Plus, Bell } from 'lucide-react';
import { User } from '@/core/types/common';
import { getImageUrl } from '@/core/utils/url';

const TEACHER_IMAGE = '/src/assets/images/image.png';

interface TeacherHeaderProps {
    user: User | null;
    greeting: string;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export function TeacherHeader({ user, greeting }: TeacherHeaderProps) {
    return (
        <motion.header
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border border-brand-500/5 overflow-hidden shadow-lg shrink-0">
                    <img
                        src={getImageUrl(user?.avatar) || TEACHER_IMAGE}
                        alt="Teacher"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="text-right">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white font-display">
                        {greeting}، <span className="text-gradient">أ/ {user?.name}</span> 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        إليك ملخص أداء الطلاب ومبيعات الكورسات هذا الشهر.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Action Buttons */}
                <button className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/5 text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
                    <Download className="w-4 h-4" />
                    <span>تقرير</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">
                    <Plus className="w-5 h-5" />
                    <span>كورس جديد</span>
                </button>

                <div className="h-10 w-px bg-white/10 mx-1 hidden sm:block" />

                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl bg-slate-800/50 border border-white/5 text-slate-400 hover:text-white transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                </button>
            </div>
        </motion.header>
    );
}
