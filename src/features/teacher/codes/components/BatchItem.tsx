import { Printer, Download, Clock, CreditCard, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

interface BatchItemProps {
    batch: any;
    onPrint: (id: string) => void;
    onDownload: (id: string) => void;
}

export function BatchItem({ batch, onPrint, onDownload }: BatchItemProps) {
    const usagePercent = (batch.used / batch.count) * 100;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 hover:border-brand-500 transition-all flex flex-col gap-6 shadow-sm hover:shadow-xl hover:shadow-black/5"
        >
            {/* Header: Name & Status */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-[var(--text-primary)] group-hover:text-brand-500 transition-colors">
                            {batch.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${batch.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {batch.status === 'active' ? 'نشط' : 'مكتمل'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] font-bold text-sm opacity-60">
                        <Clock className="w-4 h-4" />
                        <span>تم الإنشاء في {batch.createdAt}</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border-color)] text-[var(--text-secondary)]">
                    <Ticket className="w-6 h-6" />
                </div>
            </div>

            {/* Course Tag */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase opacity-60">الكورس المرتبط</p>
                    <p className="font-bold text-[var(--text-primary)] truncate">{batch.course}</p>
                </div>
            </div>

            {/* Usage Stats */}
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase opacity-60">قيمة الكود</p>
                        <p className="text-lg font-black text-brand-500">{batch.value} ج.م</p>
                    </div>
                    <p className="text-sm font-black text-[var(--text-primary)]">
                        {batch.used} / {batch.count} <span className="text-[var(--text-secondary)] text-xs opacity-60">مستخدم</span>
                    </p>
                </div>
                <div className="h-3 bg-[var(--bg-main)] rounded-full border border-[var(--border-color)] overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercent}%` }}
                        className={`h-full rounded-full ${usagePercent > 80 ? 'bg-emerald-500' : 'bg-brand-500'} shadow-brand-500/30`}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-2 pt-6 border-t border-[var(--border-color)]">
                <button
                    onClick={() => onPrint(batch.id)}
                    className="h-14 rounded-2xl bg-[var(--bg-main)] hover:bg-brand-500/10 hover:text-brand-500 transition-all flex items-center justify-center gap-2 font-black border border-[var(--border-color)]"
                >
                    <Printer className="w-4 h-4" />
                    <span>طباعة الكروت</span>
                </button>
                <button
                    onClick={() => onDownload(batch.id)}
                    className="h-14 rounded-2xl bg-[var(--bg-main)] hover:bg-emerald-500/10 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 font-black border border-[var(--border-color)]"
                >
                    <Download className="w-4 h-4" />
                    <span>تحميل Excel</span>
                </button>
            </div>
        </motion.div>
    );
}
