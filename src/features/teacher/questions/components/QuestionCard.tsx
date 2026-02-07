import { motion } from 'framer-motion';
import { Edit2, Trash2, Copy, Eye, MoreVertical, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuestionCardProps {
    question: {
        id: number;
        text: string;
        subject: string;
        grade: string;
        difficulty: string;
        type: string;
        points: number;
    };
}

export function QuestionCard({ question }: QuestionCardProps) {
    const navigate = useNavigate();
    const difficultyColors: any = {
        'سهل': 'text-emerald-500 bg-emerald-500/10',
        'متوسط': 'text-amber-500 bg-amber-500/10',
        'صعب': 'text-rose-500 bg-rose-500/10',
        'للمتفوقين': 'text-purple-500 bg-purple-500/10',
    };

    const handleEdit = () => {
        // Since we are editing a question, we navigate to the editor with this question's ID
        // In this mock setup, question IDs might be used to fetch the context
        navigate(`/teacher/exams/${question.id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 hover:border-brand-500 transition-all flex flex-col gap-6 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
        >
            {/* Header: Type & Action Menu */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    <Layers className="w-4 h-4" />
                    <span className="text-xs font-black">{question.type}</span>
                </div>
                <button className="w-10 h-10 rounded-xl hover:bg-[var(--bg-main)] transition-colors flex items-center justify-center text-[var(--text-secondary)]">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Content: Question Text */}
            <div className="flex-1">
                <p className="text-[var(--text-primary)] font-bold text-lg leading-relaxed line-clamp-3 mb-4">
                    {question.text}
                </p>

                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-[var(--bg-main)] text-[var(--text-secondary)] text-xs font-black">
                        {question.subject}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-[var(--bg-main)] text-[var(--text-secondary)] text-xs font-black">
                        {question.grade}
                    </span>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black ${difficultyColors[question.difficulty]}`}>
                        {question.difficulty}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black">
                        {question.points} نقاط
                    </span>
                </div>
            </div>

            {/* Actions: Grid */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[var(--border-color)]">
                <button
                    onClick={handleEdit}
                    title="معاينة"
                    className="h-12 rounded-2xl bg-[var(--bg-main)] hover:bg-brand-500/10 hover:text-brand-500 transition-all flex items-center justify-center"
                >
                    <Eye className="w-5 h-5" />
                </button>
                <button
                    onClick={handleEdit}
                    title="تعديل"
                    className="h-12 rounded-2xl bg-[var(--bg-main)] hover:bg-emerald-500/10 hover:text-emerald-500 transition-all flex items-center justify-center"
                >
                    <Edit2 className="w-5 h-5" />
                </button>
                <button title="نسخ" className="h-12 rounded-2xl bg-[var(--bg-main)] hover:bg-cyan-500/10 hover:text-cyan-500 transition-all flex items-center justify-center">
                    <Copy className="w-5 h-5" />
                </button>
                <button title="حذف" className="h-12 rounded-2xl bg-[var(--bg-main)] hover:bg-rose-500/10 hover:text-rose-500 transition-all flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
