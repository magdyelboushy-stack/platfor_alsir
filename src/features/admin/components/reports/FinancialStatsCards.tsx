import { DollarSign, FileCheck, Users, Percent } from 'lucide-react';
import { FinancialStats } from '../../services/ReportsService';

interface Props {
    stats: FinancialStats;
}

export function FinancialStatsCards({ stats }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform -translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 opacity-90">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm">إجمالي العائدات</span>
                    </div>
                    <h3 className="text-3xl font-black font-display tracking-tight dir-ltr text-right">
                        {formatCurrency(stats.total_revenue)}
                    </h3>
                    <p className="text-xs font-bold opacity-60 mt-1">القيمة التقديرية للأكواد المستخدمة</p>
                </div>
            </div>

            {/* Used Codes */}
            <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-6 border border-[var(--border-color)] group hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-[var(--text-secondary)]">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                        <FileCheck className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">الأكواد المستخدمة</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-[var(--text-primary)] font-display">{stats.used_codes}</h3>
                    <span className="text-xs font-bold text-[var(--text-secondary)] opacity-50">/ {stats.total_codes} كود</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 w-full bg-[var(--bg-main)] h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(stats.used_codes / (stats.total_codes || 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Active Teachers */}
            <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-6 border border-[var(--border-color)] group hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-[var(--text-secondary)]">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                        <Users className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">المدرسين النشطين</span>
                </div>
                <h3 className="text-3xl font-black text-[var(--text-primary)] font-display">{stats.active_teachers}</h3>
                <p className="text-xs font-bold text-[var(--text-secondary)] opacity-50 mt-1">مدرس لديهم اشتراكات</p>
            </div>

            {/* Conversion Rate */}
            <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-6 border border-[var(--border-color)] group hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-[var(--text-secondary)]">
                    <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                        <Percent className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">نسبة التفعيل</span>
                </div>
                <h3 className="text-3xl font-black text-[var(--text-primary)] font-display">
                    {stats.total_codes > 0 ? Math.round((stats.used_codes / stats.total_codes) * 100) : 0}%
                </h3>
                <p className="text-xs font-bold text-[var(--text-secondary)] opacity-50 mt-1">من إجمالي الأكواد المولدة</p>
            </div>
        </div>
    );
}
