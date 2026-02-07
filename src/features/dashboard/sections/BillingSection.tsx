// ============================================================
// BillingSection - المحفظة والاشتراكات
// ============================================================

import { useState, useEffect } from 'react';
import { api } from '@/core/api/client';
import { Loader2, Award, Clock } from 'lucide-react';
import { WalletBalanceCard } from '../components/wallet/WalletBalanceCard';
import { TransactionHistory } from '../components/wallet/TransactionHistory';
import { SubscriptionStats } from '../components/subscriptions/SubscriptionStats';
import { SubscriptionList } from '../components/subscriptions/SubscriptionList';
import { RedeemCodeSection } from './RedeemCodeSection';
import { clsx } from 'clsx';

export function BillingSection() {
    const [stats, setStats] = useState<any>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'history'>('overview');

    const fetchData = async () => {
        try {
            const [statsRes, subsRes, historyRes] = await Promise.all([
                api.get<any>('/dashboard/stats'),
                api.get<any>('/student/courses'),
                api.get<any>('/dashboard/wallet/history')
            ]);

            setStats(statsRes?.data || statsRes);

            // Map Subscriptions
            const rawSubs = Array.isArray(subsRes) ? subsRes : (subsRes as any)?.data || [];
            setSubscriptions(rawSubs.map((s: any) => ({
                id: s.id,
                courseName: s.title,
                teacher: s.teacher || 'السير الشامي',
                startDate: s.enrolledAt,
                endDate: s.expiresAt,
                status: s.status === 'active' ? 'active' : 'expired',
                price: s.price || 0,
                daysRemaining: s.daysRemaining || 0
            })));

            // Set Transactions
            setTransactions(Array.isArray(historyRes) ? historyRes : (historyRes as any)?.data || []);

        } catch (error) {
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
                <p className="text-[var(--text-secondary)] font-bold">جاري تحميل البيانات المالية...</p>
            </div>
        );
    }

    const currentBalance = stats?.walletBalance || 0;
    const totalSpent = stats?.totalPaid || 0;
    const totalDeposits = transactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalSubscriptions = stats?.totalSubscriptions || subscriptions.length || 0;
    const activeSubCount = stats?.activeSubCount || subscriptions.filter(s => s.status === 'active').length || 0;
    const expiredSubCount = stats?.expiredSubCount || 0;

    return (
        <div className="space-y-10 pb-20 max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight transition-colors">
                    إدارة <span className="text-[var(--color-brand)]">المالية والاشتراكات</span>
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                    تحكم في ميزانيتك، تابع اشتراكاتك في الكورسات، وراجع تاريخ عملياتك المالية في مكان واحد.
                </p>
            </div>

            {/* Quick Actions & Code Redemption */}
            <RedeemCodeSection onSuccess={fetchData} />

            {/* Combined Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WalletBalanceCard
                    balance={currentBalance}
                    totalDeposits={totalDeposits}
                    totalSpent={totalSpent}
                />
                <SubscriptionStats
                    total={totalSubscriptions}
                    active={activeSubCount}
                    expired={expiredSubCount}
                    totalPaid={totalSpent}
                />
            </div>

            {/* Tabs for Detailed Views */}
            <div className="space-y-8">
                <div className="flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-fit mr-auto md:mr-0">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                            activeTab === 'overview' ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" : "text-[var(--text-secondary)] hover:text-white"
                        )}
                    >
                        <Award className="w-4 h-4" />
                        الاشتراكات الحالية
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                            activeTab === 'history' ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" : "text-[var(--text-secondary)] hover:text-white"
                        )}
                    >
                        <Clock className="w-4 h-4" />
                        سجل المعاملات
                    </button>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'overview' ? (
                        <SubscriptionList subscriptions={subscriptions} />
                    ) : (
                        <TransactionHistory transactions={transactions} />
                    )}
                </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute top-[20%] left-[-5%] w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
