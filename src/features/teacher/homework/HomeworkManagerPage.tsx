// ============================================================
// Teacher Homework Manager
// ============================================================

import {
    FileText
} from 'lucide-react';

// Submissions data - to be fetched from API
const submissions: any[] = [];

export function HomeworkManagerPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">تصحيح الواجبات</h1>
                    <p className="text-[var(--text-secondary)] font-medium">مراجعة وتقييم الملفات المرفوعة من الطلاب.</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                        <tr>
                            <th className="text-right py-4 px-6 text-xs font-bold text-[var(--text-secondary)]">الطالب</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-[var(--text-secondary)]">الواجب / الكورس</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-[var(--text-secondary)]">الملف المرفق</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-[var(--text-secondary)]">تاريخ التسليم</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-[var(--text-secondary)]">الدرجة</th>
                            <th className="py-4 px-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {submissions.map((sub: any) => (
                            <tr key={sub.id} className="group hover:bg-[var(--bg-main)] transition-colors">
                                <td className="py-4 px-6 font-bold text-[var(--text-primary)]">{sub.student}</td>
                                <td className="py-4 px-6">
                                    <p className="text-sm font-bold text-[var(--text-primary)]">{sub.assignment}</p>
                                    <p className="text-[10px] text-[var(--text-secondary)]">{sub.course}</p>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2 text-cyan-500 font-bold text-sm cursor-pointer hover:underline">
                                        <FileText className="w-4 h-4" />
                                        <span>{sub.file}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm font-bold text-[var(--text-secondary)]">{sub.submittedAt}</td>
                                <td className="py-4 px-6">
                                    {sub.status === 'graded' ? (
                                        <span className="text-emerald-500 font-black">{sub.grade}</span>
                                    ) : (
                                        <span className="text-amber-500 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded-lg">انتظار</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-left">
                                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20">
                                        تصحيح
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
