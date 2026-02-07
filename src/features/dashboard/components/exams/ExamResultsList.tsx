import { ExamResultCard } from './ExamResultCard';
import { Trophy } from 'lucide-react';

interface Exam {
    id: number | string;
    title: string;
    course: string;
    score: number;
    maxScore: number;
    date: string;
    passed: boolean;
    duration: string;
}

interface ExamResultsListProps {
    results: Exam[];
}

export function ExamResultsList({ results }: ExamResultsListProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <Trophy className="w-5 h-5 text-[var(--color-brand)]" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight">سجل الامتحانات</h3>
            </div>

            <div className="space-y-4">
                {results.length > 0 ? (
                    results.map((exam, index) => (
                        <ExamResultCard key={exam.id} exam={exam} index={index} />
                    ))
                ) : (
                    <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-brand-500/10 text-center bg-white/5 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                            <Trophy className="w-8 h-8 text-[var(--color-brand)]" />
                        </div>
                        <p className="text-xl font-black text-[var(--text-secondary)] opacity-60">لا توجد نتائج امتحانات حالياً.</p>
                        <p className="text-xs font-bold text-[var(--text-secondary)] mt-2 opacity-40">عند تأدية أي امتحان ستظهر نتيجتك وتحليلك هنا فوراً.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
