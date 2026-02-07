import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

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

interface SubmissionHistoryCardProps {
    submission: Submission;
    index: number;
}

export function SubmissionHistoryCard({ submission, index }: SubmissionHistoryCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col md:flex-row items-center gap-6 p-5 rounded-[2rem] bg-white/5 dark:bg-black/10 border border-white/5 hover:border-brand-500/20 transition-all"
        >
            <div className={clsx(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
                submission.status === 'verified' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                submission.status === 'pending' && "bg-amber-500/10 border-amber-500/20 text-amber-500",
                submission.status === 'rejected' && "bg-rose-500/10 border-rose-500/20 text-rose-500"
            )}>
                <FileText className="w-7 h-7" />
            </div>

            <div className="flex-1 min-w-0 text-center md:text-right">
                <h4 className="font-black text-[var(--text-primary)] truncate transition-colors text-lg line-clamp-1">{submission.title}</h4>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1 text-[10px] font-bold text-[var(--text-secondary)] opacity-50">
                    <span>{submission.fileName}</span>
                    <span className="w-1 h-1 bg-[var(--text-secondary)] rounded-full" />
                    <span>{submission.size}</span>
                    <span className="w-1 h-1 bg-[var(--text-secondary)] rounded-full" />
                    <span>{submission.date}</span>
                </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
                {submission.status === 'verified' && (
                    <div className="flex flex-col items-end">
                        <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5" />
                            تم التصحيح ({submission.score})
                        </span>
                    </div>
                )}
                {submission.status === 'pending' && (
                    <span className="px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black border border-amber-500/20 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        قيد المراجعة
                    </span>
                )}
                {submission.status === 'rejected' && (
                    <div className="flex flex-col items-center md:items-end gap-2">
                        <span className="px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black border border-rose-500/20 flex items-center gap-2">
                            <XCircle className="w-3.5 h-3.5" />
                            مرفوض
                        </span>
                        {submission.reason && (
                            <span className="text-[9px] text-rose-500 font-bold bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 max-w-[150px] text-center">
                                {submission.reason}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
