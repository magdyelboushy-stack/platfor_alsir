import { SubmissionHistoryCard } from './SubmissionHistoryCard';
import { History } from 'lucide-react';

interface Submission {
    id: number;
    title: string;
    fileName: string;
    size: string;
    date: string;
    status: 'verified' | 'pending' | 'rejected';
    score?: string | null;
    reason?: string;
}

interface SubmissionHistoryListProps {
    submissions: Submission[];
}

export function SubmissionHistoryList({ submissions }: SubmissionHistoryListProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <History className="w-5 h-5 text-[var(--color-brand)]" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight">سجل التسليمات السابقة</h3>
            </div>

            <div className="space-y-4">
                {submissions.length > 0 ? (
                    submissions.map((sub, index) => (
                        <SubmissionHistoryCard key={sub.id} submission={sub} index={index} />
                    ))
                ) : (
                    <div className="p-10 rounded-[2.5rem] bg-white/5 border-2 border-dashed border-brand-500/10 text-center opacity-70">
                        <p className="text-[var(--text-secondary)] font-bold italic">لا توجد تسليمات سابقة حتى الآن.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
