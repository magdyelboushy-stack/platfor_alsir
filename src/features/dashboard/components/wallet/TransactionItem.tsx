import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, CheckCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface Transaction {
    id: string;
    type: string;
    amount: number;
    description: string;
    date: string;
    status: string;
}

interface TransactionItemProps {
    transaction: Transaction;
    index: number;
}

export function TransactionItem({ transaction, index }: TransactionItemProps) {
    const isIncome = transaction.amount > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2rem] bg-white/30 dark:bg-black/10 border border-white/5 hover:border-brand-500/20 transition-all duration-500"
        >
            {/* 1. Category Icon */}
            <div className={clsx(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                isIncome
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
            )}>
                {isIncome ? <ArrowDownLeft className="w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
            </div>

            {/* 2. Transaction Details */}
            <div className="flex-1 min-w-0 text-center md:text-right">
                <h4 className="font-black text-[var(--text-primary)] truncate text-lg line-clamp-1 mb-1">{transaction.description}</h4>
                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">
                    <span>{new Date(transaction.date).toLocaleDateString('ar-EG')}</span>
                </div>
            </div>

            {/* 3. Amount & Status */}
            <div className="flex flex-col items-center md:items-end gap-1 shrink-0">
                <p className={clsx(
                    "text-xl font-black tabular-nums",
                    isIncome ? "text-emerald-500" : "text-rose-500"
                )}>
                    {isIncome ? '+' : ''}{transaction.amount} <span className="text-xs">ج.م</span>
                </p>
                <div className={clsx(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border",
                    transaction.status === 'completed'
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                    {transaction.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {transaction.status === 'completed' ? "عملية ناجحة" : "قيد المعالجة"}
                </div>
            </div>
        </motion.div>
    );
}
