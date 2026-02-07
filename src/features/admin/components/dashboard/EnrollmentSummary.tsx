import { DollarSign } from 'lucide-react';
import { DashboardStats } from '../../services/DashboardService';

interface EnrollmentSummaryProps {
    stats: DashboardStats | null;
}

export function EnrollmentSummary({ stats }: EnrollmentSummaryProps) {
    return (
        <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] p-8 border border-[var(--border-color)] shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-amber-500" />

            <h3 className="text-xl font-black text-[var(--text-primary)] font-display mb-6">ملخص الاشتراكات</h3>

            <div className="flex-1 flex flex-col justify-center items-center py-6">
                <div className="relative mb-6 group">
                    <div className="absolute inset-0 bg-brand-500 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />
                    <div className="w-32 h-32 rounded-full border-4 border-[var(--bg-main)] shadow-2xl bg-gradient-to-br from-brand-500 to-amber-600 flex items-center justify-center relative z-10 transform group-hover:scale-105 transition-transform">
                        <DollarSign className="w-12 h-12 text-white" />
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-5xl font-black text-[var(--text-primary)] font-display mb-2 tracking-tight">
                        {stats?.enrollments.total || 0}
                    </div>
                    <p className="text-sm font-bold text-[var(--text-secondary)] opacity-60">إجمالي عمليات الاشتراك</p>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[var(--border-color)] grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-2xl bg-[var(--bg-main)]">
                    <div className="text-lg font-black text-brand-600">{stats?.enrollments.uniqueStudents || 0}</div>
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60">طالب مشترك</div>
                </div>
                <div className="text-center p-3 rounded-2xl bg-[var(--bg-main)]">
                    <div className="text-lg font-black text-emerald-600">85%</div>
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60">نسبة التفعيل</div>
                </div>
            </div>
        </div>
    );
}
