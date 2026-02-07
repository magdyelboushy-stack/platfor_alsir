import { TransactionItem } from './TransactionItem';
import { CreditCard } from 'lucide-react';

interface Transaction {
    id: string;
    type: string;
    amount: number;
    description: string;
    date: string;
    status: string;
}

interface TransactionHistoryProps {
    transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <CreditCard className="w-5 h-5 text-[var(--color-brand)]" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight">سجل المعاملات المالية</h3>
            </div>

            <div className="space-y-4">
                {transactions.length > 0 ? (
                    transactions.map((tx, index) => (
                        <TransactionItem key={tx.id} transaction={tx} index={index} />
                    ))
                ) : (
                    <div className="p-16 rounded-[3rem] border-2 border-dashed border-brand-500/10 text-center bg-white/5 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50 shadow-inner">
                            <CreditCard className="w-10 h-10 text-[var(--color-brand)]" />
                        </div>
                        <p className="text-2xl font-black text-[var(--text-secondary)] opacity-60 mb-2">لا توجد عمليات سابقة</p>
                        <p className="text-xs font-bold text-[var(--text-secondary)] opacity-40">بمجرد شحن رصيدك أو الاشتراك في كورس، ستجد تفاصيل العملية هنا.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
