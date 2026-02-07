import { ActivityLog } from '../../services/ActivityLogService';
import { getAvatarUrl } from '@/utils/fileUrl';
import {
    LogIn,
    PlusCircle,
    Trash2,
    Edit,
    FileText,
    Clock,
    Globe
} from 'lucide-react';

interface Props {
    log: ActivityLog;
}

export function ActivityLogItem({ log }: Props) {

    const getIcon = (action: string) => {
        if (action.includes('login')) return LogIn;
        if (action.includes('create')) return PlusCircle;
        if (action.includes('delete')) return Trash2;
        if (action.includes('update')) return Edit;
        return FileText;
    };

    const getColors = (action: string) => {
        if (action.includes('login')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        if (action.includes('create')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        if (action.includes('delete')) return 'bg-red-500/10 text-red-500 border-red-500/20';
        if (action.includes('update')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    };

    const Icon = getIcon(log.action);
    const colorClass = getColors(log.action);

    return (
        <div className="group relative bg-[var(--bg-secondary)] hover:bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-color)] hover:border-brand-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/5">
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl ${colorClass} border`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm group-hover:text-brand-500 transition-colors">
                            {log.action_label}
                        </h4>
                        <span className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-[var(--text-secondary)] opacity-60 bg-[var(--bg-main)] px-2 py-1 rounded-lg border border-[var(--border-color)]">
                            <Clock className="w-3 h-3" />
                            {new Date(log.created_at).toLocaleString('ar-EG')}
                        </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mb-3">
                        تم إجراء العملية على <span className="font-mono bg-[var(--bg-main)] px-1 rounded mx-1">{log.target}</span>
                    </p>

                    {/* Actor & Metadata Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] group-hover:border-dashed">

                        {/* Actor */}
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[var(--bg-main)] p-0.5 border border-[var(--border-color)]">
                                <img
                                    src={getAvatarUrl(log.actor.avatar, log.actor.email)}
                                    alt={log.actor.name}
                                    className="w-full h-full roundedmd object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[var(--text-primary)]">{log.actor.name}</span>
                                <span className="text-[9px] text-[var(--text-secondary)] opacity-70">{log.actor.role}</span>
                            </div>
                        </div>

                        {/* Tech Info */}
                        <div className="flex items-center gap-3">
                            {log.meta.ip && (
                                <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] opacity-50 font-mono" title="IP Address">
                                    <Globe className="w-3 h-3" />
                                    {log.meta.ip}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
