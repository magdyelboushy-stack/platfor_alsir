
// ============================================================
// Teacher Wallet & Reports Page - Premium Redesign
// ============================================================

import { TeacherWalletBalanceCard } from './components/TeacherWalletBalanceCard';
import { TeacherRevenueChart } from './components/TeacherRevenueChart';
import { TeacherTransactionHistory } from './components/TeacherTransactionHistory';
import { TeacherWalletActions } from './components/TeacherWalletActions';

export function TeacherWalletPage() {
    // Zeroed data (Waiting for API integration)
    const currentBalance = 0;
    const totalEarnings = 0;
    const pendingWithdrawals = 0;

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto">
            {/* 1. Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="text-right">
                    <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight">
                        إدارة <span className="text-emerald-500">الأرباح</span>
                    </h2>
                    <div className="h-1.5 w-24 bg-emerald-500 rounded-full mb-4 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                    <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                        تابع أداءك المالي، حلل إيراداتك الشهرية، وقم بسحب أرباحك بكل سهولة وأمان عبر وسائل الدفع المتاحة.
                    </p>
                </div>
                <TeacherWalletActions />
            </div>

            {/* 2. Balance Card Wrapper */}
            <div className="px-2">
                <TeacherWalletBalanceCard
                    balance={currentBalance}
                    totalEarnings={totalEarnings}
                    pendingWithdrawals={pendingWithdrawals}
                />
            </div>

            {/* 3. Analytics & History Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                <div className="lg:col-span-2">
                    <TeacherRevenueChart />
                </div>
                <div>
                    <TeacherTransactionHistory />
                </div>
            </div>

            {/* Background Decorative Blobs */}
            <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
