import { motion } from 'framer-motion';
import { Mail, Edit, Trash2, Shield, Circle } from 'lucide-react';

interface AssistantCardProps {
    assistant: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: 'active' | 'inactive';
        permissions: string[];
    };
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export function AssistantCard({ assistant, onEdit, onDelete }: AssistantCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 hover:border-brand-500 transition-all relative overflow-hidden flex flex-col gap-6 shadow-sm hover:shadow-2xl hover:shadow-black/5"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 group-hover:bg-brand-500/10" />

            {/* Header: Avatar & Status */}
            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/20 font-black text-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        {assistant.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">{assistant.name}</h3>
                        <p className="text-xs font-black text-brand-500 uppercase tracking-wider">{assistant.role}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${assistant.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                    <Circle className={`w-2 h-2 fill-current ${assistant.status === 'active' ? 'animate-pulse' : ''}`} />
                    <span>{assistant.status === 'active' ? 'نشط' : 'غير متصل'}</span>
                </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] group-hover:border-brand-500/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-secondary)]">
                    <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-[var(--text-secondary)] truncate dir-ltr">{assistant.email}</span>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Shield className="w-4 h-4 opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">الصلاحيات الممنوحة</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {assistant.permissions.map((perm, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[10px] font-black text-[var(--text-secondary)] group-hover:border-brand-500/30 transition-colors">
                            {perm}
                        </span>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 mt-2 border-t border-[var(--border-color)]">
                <button
                    onClick={() => onEdit(assistant.id)}
                    className="flex-[2] h-12 rounded-2xl bg-[var(--bg-main)] hover:bg-brand-500/10 hover:text-brand-500 border border-[var(--border-color)] hover:border-brand-500/30 font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Edit className="w-4 h-4" />
                    تعديل
                </button>
                <button
                    onClick={() => onDelete(assistant.id)}
                    className="flex-1 h-12 rounded-2xl bg-[var(--bg-main)] hover:bg-rose-500/10 hover:text-rose-500 border border-[var(--border-color)] hover:border-rose-500/30 font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
