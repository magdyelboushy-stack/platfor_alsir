import { QuestionCard } from './QuestionCard';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockQuestions: any[] = [];

export function QuestionList() {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockQuestions.map((question: any, index: number) => (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <QuestionCard question={question} />
                    </motion.div>
                ))}

                {/* New Exam Card - Matching Screenshot Vibe */}
                <motion.button
                    onClick={() => navigate('/teacher/exams/new')}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="border-2 border-dashed border-[var(--border-color)] rounded-[2.5rem] flex flex-col items-center justify-center gap-6 p-10 text-[var(--text-secondary)] hover:border-brand-500 hover:text-brand-500 hover:bg-brand-500/5 transition-all group min-h-[350px]"
                >
                    <div className="w-20 h-20 rounded-full bg-[var(--bg-main)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-[var(--border-color)] group-hover:border-brand-500/30">
                        <Plus className="w-10 h-10" />
                    </div>
                    <span className="font-black text-xl">إنشاء امتحان جديد</span>
                </motion.button>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-center gap-2 py-10">
                <button className="w-12 h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-500 hover:text-brand-500 transition-all font-black">
                    1
                </button>
                <button className="w-12 h-12 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-brand-500 hover:text-brand-500 transition-all font-black">
                    2
                </button>
                <button className="w-12 h-12 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-brand-500 hover:text-brand-500 transition-all font-black">
                    3
                </button>
                <span className="text-[var(--text-secondary)] px-2">...</span>
                <button className="px-6 h-12 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-brand-500 transition-all font-black">
                    التالي
                </button>
            </div>
        </div>
    );
}
