import { Ticket, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface CodesStatsProps {
    stats: {
        total: number;
        used: number;
        remaining: number;
        expired: number;
    };
}

export function CodesStats({ stats }: CodesStatsProps) {
    const items = [
        {
            label: 'إجمالي الأكواد',
            value: stats.total,
            icon: Ticket,
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10'
        },
        {
            label: 'تم استخدامها',
            value: stats.used,
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            label: 'غير مستخدمة',
            value: stats.remaining,
            icon: Clock,
            color: 'text-brand-500',
            bg: 'bg-brand-500/10'
        },
        {
            label: 'منتهية',
            value: stats.expired,
            icon: XCircle,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6 flex flex-col gap-4 hover:border-brand-500/50 transition-all group relative overflow-hidden"
                >
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[var(--text-secondary)] font-black text-xs uppercase tracking-wider mb-1">{item.label}</p>
                        <h3 className="text-3xl font-black text-[var(--text-primary)]">
                            {item.value.toLocaleString()}
                        </h3>
                    </div>
                    {/* Decorative Background Icon */}
                    <item.icon className={`absolute -bottom-4 -left-4 w-24 h-24 opacity-5 ${item.color} rotate-12`} />
                </div>
            ))}
        </div>
    );
}
