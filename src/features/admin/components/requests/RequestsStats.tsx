import { Clock, Users, ShieldAlert } from 'lucide-react';

interface StatsProps {
    count: number;
}

export function RequestsStats({ count }: StatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-[2rem] p-6 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 opacity-80">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-sm">طلبات معلقة</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black font-display">{count}</h3>
                        <span className="text-sm font-bold opacity-60">طلب</span>
                    </div>
                </div>
            </div>

            {/* Placeholder stats for future use */}
            <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-6 border border-[var(--border-color)] relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4 text-[var(--text-secondary)] opacity-60">
                    <div className="p-2 bg-[var(--bg-main)] rounded-xl">
                        <Users className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">إجمالي المسجلين اليوم</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-[var(--text-primary)] font-display">---</h3>
                    <span className="text-sm font-bold text-[var(--text-secondary)] opacity-40">طالب</span>
                </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-6 border border-[var(--border-color)] relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4 text-[var(--text-secondary)] opacity-60">
                    <div className="p-2 bg-[var(--bg-main)] rounded-xl">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">طلبات مرفوضة مؤخراً</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-[var(--text-primary)] font-display">---</h3>
                    <span className="text-sm font-bold text-[var(--text-secondary)] opacity-40">طلب</span>
                </div>
            </div>
        </div>
    );
}
