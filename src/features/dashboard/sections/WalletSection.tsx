// ============================================================
// WalletSection - بيانات المحفظة
// ============================================================

import { WalletBalanceCard } from '../components/wallet/WalletBalanceCard';
import { WalletActions } from '../components/wallet/WalletActions';
import { TransactionHistory } from '../components/wallet/TransactionHistory';
import { useState, useEffect } from 'react';
import { api } from '@/core/api/client';
import { Loader2 } from 'lucide-react';

export function WalletSection() {
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, historyRes] = await Promise.all([
                api.get<any>('/dashboard/stats'),
                api.get<any>('/dashboard/wallet/history')
            ]);
            setStats(statsRes?.data || statsRes);
            setTransactions(Array.isArray(historyRes) ? historyRes : (historyRes as any)?.data || []);
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
                <p className="text-[var(--text-secondary)] font-bold">جاري تحميل بيانات المحفظة...</p>
            </div>
        );
    }

    const currentBalance = stats?.walletBalance || 0;
    const totalSpent = transactions
        .filter(t => !['deposit'].includes(t.type) && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalDeposits = transactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return (
        <div className="space-y-12 pb-20 max-w-6xl mx-auto">
            {/* 1. Header Area - Luxe Alignment */}
            <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight transition-colors">
                    بيانات <span className="text-[var(--color-brand)]">المحفظة</span>
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                    تحكم بالكامل في رصيدك المالي، تابع عملياتك الشرائية، واشحن محفظتك بكل سهولة وأمان.
                </p>
            </div>

            {/* 2. Visual Balance Module */}
            <WalletBalanceCard
                balance={currentBalance}
                totalDeposits={totalDeposits}
                totalSpent={totalSpent}
            />

            {/* 3. Financial Engine (Actions & Recharge) */}
            <WalletActions onSuccess={fetchData} />

            {/* 4. Transaction Audit Log */}
            <TransactionHistory transactions={transactions} />

            {/* Decorative Element */}
            <div className="absolute top-[20%] left-[-5%] w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
