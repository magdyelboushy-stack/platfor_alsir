// ============================================================
// SubscriptionsSection - الاشتراكات
// ============================================================

import { useState, useEffect } from 'react';
import { api } from '@/core/api/client';
import { SubscriptionStats } from '../components/subscriptions/SubscriptionStats';
import { SubscriptionList } from '../components/subscriptions/SubscriptionList';
import { RedeemCodeSection } from './RedeemCodeSection';
import { Loader2 } from 'lucide-react';

export function SubscriptionsSection() {
    const [stats, setStats] = useState<any>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, subsRes] = await Promise.all([
                api.get<any>('/dashboard/stats'),
                api.get<any>('/student/courses')
            ]);
            setStats(statsRes?.data || statsRes);

            const rawSubs = Array.isArray(subsRes) ? subsRes : (subsRes as any)?.data || [];
            const mappedSubs = rawSubs.map((s: any) => ({
                id: s.id,
                courseName: s.title,
                teacher: s.teacher || 'السير الشامي',
                startDate: s.enrolledAt,
                endDate: s.expiresAt,
                status: s.status === 'active' ? 'active' : 'expired',
                price: s.price || 0,
                daysRemaining: s.daysRemaining || 0
            }));

            setSubscriptions(mappedSubs);
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
                <p className="text-[var(--text-secondary)] font-bold">جاري تحميل بيانات الاشتراكات...</p>
            </div>
        );
    }

    const totalSubscriptions = stats?.totalSubscriptions || subscriptions.length || 0;
    const activeSubCount = stats?.activeSubCount || subscriptions.filter((s: any) => s.status === 'active').length || 0;
    const expiredSubCount = stats?.expiredSubCount || 0;
    const totalPaid = stats?.totalPaid || 0;

    return (
        <div className="space-y-12 pb-20 max-w-6xl mx-auto">
            {/* 1. Header Area - Luxe Alignment */}
            <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight transition-colors">
                    سجل <span className="text-[var(--color-brand)]">الاشتراكات</span>
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                    هنا تتابع جميع اشتراكاتك الحالية والسابقة، فترات الصلاحية، وتاريخ الدفع لكل كورس.
                </p>
            </div>

            {/* 2. Redeem Activation Code */}
            <RedeemCodeSection onSuccess={fetchData} />

            {/* 3. Stats Module */}
            <SubscriptionStats
                total={totalSubscriptions}
                active={activeSubCount}
                expired={expiredSubCount}
                totalPaid={totalPaid}
            />

            {/* 4. Main Subscriptions Repository */}
            <SubscriptionList subscriptions={subscriptions} />

            {/* Decorative Element */}
            <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        </div>
    );
}

