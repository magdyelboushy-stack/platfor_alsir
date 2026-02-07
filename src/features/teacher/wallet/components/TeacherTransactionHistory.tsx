import { motion } from 'framer-motion';
import { DollarSign, Calendar, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

const mockTransactions: any[] = [];

export function TeacherTransactionHistory() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 flex flex-col h-full shadow-xl shadow-black/5"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-2xl text-[var(--text-primary)]">آخر المعاملات</h3>
                <button className="text-sm font-black text-emerald-500 hover:text-emerald-400 transition-colors">عرض الكل</button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 min-h-[400px]">
                {mockTransactions.map((tx, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={tx.id}
                        className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-emerald-500/30 transition-all group hover:shadow-lg hover:shadow-emerald-500/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {tx.type === 'income' ? <DollarSign className="w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
                            </div>
                            <div>
                                <h4 className="font-black text-base text-[var(--text-primary)] line-clamp-1">{tx.title}</h4>
                                <p className="text-sm text-[var(--text-secondary)] font-bold flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {tx.date}
                                </p>
                            </div>
                        </div>
                        <div className="text-left">
                            <div className={`font-black text-lg dir-ltr ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                {tx.type === 'income' ? '+' : '-'}{tx.amount} ج.م
                            </div>
                            <div className={`flex items-center gap-1 justify-end mt-1 text-xs font-black ${tx.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'
                                }`}>
                                {tx.status === 'completed' ? (
                                    <><CheckCircle2 className="w-3.5 h-3.5" /> ناجحة</>
                                ) : (
                                    <><Clock className="w-3.5 h-3.5" /> معلقة</>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
