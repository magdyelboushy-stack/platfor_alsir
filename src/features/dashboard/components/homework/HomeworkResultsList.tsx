import { HomeworkResultCard } from './HomeworkResultCard';
import { FileText } from 'lucide-react';

interface Homework {
    id: number;
    title: string;
    course: string;
    score: number | null;
    maxScore: number;
    submittedAt: string | null;
    dueDate: string;
    status: 'graded' | 'pending' | 'not_submitted';
}

interface HomeworkResultsListProps {
    homeworks: Homework[];
}

export function HomeworkResultsList({ homeworks }: HomeworkResultsListProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <FileText className="w-5 h-5 text-[var(--color-brand)]" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight">سجل الواجبات</h3>
            </div>

            <div className="space-y-4">
                {homeworks.length > 0 ? (
                    homeworks.map((hw, index) => (
                        <HomeworkResultCard key={hw.id} homework={hw} index={index} />
                    ))
                ) : (
                    <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-brand-500/10 text-center bg-white/5 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                            <FileText className="w-8 h-8 text-[var(--color-brand)]" />
                        </div>
                        <p className="text-xl font-black text-[var(--text-secondary)] opacity-60">لا توجد سجلات واجبات حالياً.</p>
                        <p className="text-xs font-bold text-[var(--text-secondary)] mt-2 opacity-40">بمجرد تسليم وتصحيح واجباتك، ستظهر جميع التفاصيل هنا.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
