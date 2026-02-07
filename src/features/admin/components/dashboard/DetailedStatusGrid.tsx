import { Users, GraduationCap, CheckCircle, Clock, XCircle } from 'lucide-react';
import { DashboardStats } from '../../services/DashboardService';

interface DetailedStatusGridProps {
    stats: DashboardStats | null;
}

export function DetailedStatusGrid({ stats }: DetailedStatusGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Students Status */}
            <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-6 border border-[var(--border-color)]">
                <h3 className="text-lg font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                        <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    حالة الطلاب
                </h3>
                <div className="space-y-4">
                    <StatusRow
                        icon={CheckCircle}
                        label="حساب نشط"
                        count={stats?.users.students.active || 0}
                        total={stats?.users.students.total || 1}
                        color="text-emerald-500"
                        bg="bg-emerald-500"
                    />
                    <StatusRow
                        icon={Clock}
                        label="قيد المراجعة"
                        count={stats?.users.students.pending || 0}
                        total={stats?.users.students.total || 1}
                        color="text-amber-500"
                        bg="bg-amber-500"
                    />
                    <StatusRow
                        icon={XCircle}
                        label="محظور"
                        count={stats?.users.students.blocked || 0}
                        total={stats?.users.students.total || 1}
                        color="text-red-500"
                        bg="bg-red-500"
                    />
                </div>
            </div>

            {/* Teachers Status */}
            <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-6 border border-[var(--border-color)]">
                <h3 className="text-lg font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-500/10">
                        <GraduationCap className="w-5 h-5 text-brand-500" />
                    </div>
                    حالة المعلمين
                </h3>
                <div className="space-y-4">
                    <StatusRow
                        icon={CheckCircle}
                        label="حساب نشط"
                        count={stats?.users.teachers.active || 0}
                        total={stats?.users.teachers.total || 1}
                        color="text-emerald-500"
                        bg="bg-emerald-500"
                    />
                    <StatusRow
                        icon={Clock}
                        label="قيد المراجعة"
                        count={stats?.users.teachers.pending || 0}
                        total={stats?.users.teachers.total || 1}
                        color="text-amber-500"
                        bg="bg-amber-500"
                    />
                    <StatusRow
                        icon={XCircle}
                        label="محظور"
                        count={stats?.users.teachers.blocked || 0}
                        total={stats?.users.teachers.total || 1}
                        color="text-red-500"
                        bg="bg-red-500"
                    />
                </div>
            </div>
        </div>
    );
}

function StatusRow({ icon: Icon, label, count, total, color, bg }: {
    icon: any;
    label: string;
    count: number;
    total: number;
    color: string;
    bg: string;
}) {
    const percentage = Math.round((count / total) * 100) || 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-[var(--text-secondary)] text-sm font-bold opacity-90">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-black text-[var(--text-primary)]">{count}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium opacity-50">({percentage}%)</span>
                </div>
            </div>
            <div className="w-full h-2 bg-[var(--bg-main)] rounded-full overflow-hidden">
                <div
                    className={`h-full ${bg} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
