import { HardDrive, FileText, Download } from 'lucide-react';

interface FilesStatsProps {
    stats: {
        totalSpace: string;
        usedSpace: string;
        filesCount: number;
        totalDownloads: number;
    };
}

export function FilesStats({ stats }: FilesStatsProps) {
    const items = [
        {
            label: 'إجمالي المساحة',
            value: stats.usedSpace,
            subValue: `/ ${stats.totalSpace}`,
            icon: HardDrive,
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10'
        },
        {
            label: 'عدد الملفات',
            value: stats.filesCount,
            subValue: 'ملف',
            icon: FileText,
            color: 'text-brand-500',
            bg: 'bg-brand-500/10'
        },
        {
            label: 'التنزيلات',
            value: stats.totalDownloads,
            subValue: 'مرة',
            icon: Download,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-8 flex items-center gap-6 hover:border-brand-500/50 transition-all hover:shadow-xl hover:shadow-black/5 group"
                >
                    <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[var(--text-secondary)] font-black text-xs uppercase tracking-wider mb-1">{item.label}</p>
                        <h3 className="text-2xl font-black text-[var(--text-primary)]">
                            {item.value} <span className="text-xs text-[var(--text-secondary)] font-bold">{item.subValue}</span>
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
