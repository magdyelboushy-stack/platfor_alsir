import { SubscriptionCard } from './SubscriptionCard';
import { CheckCircle, XCircle } from 'lucide-react';

interface Subscription {
    id: number;
    courseName: string;
    teacher: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired';
    price: number;
    daysRemaining: number;
}

interface SubscriptionListProps {
    subscriptions: Subscription[];
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const expiredSubs = subscriptions.filter(s => s.status === 'expired');

    return (
        <div className="space-y-12">
            {/* 1. Active Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight">اشتراكات نشطة</h3>
                </div>
                <div className="space-y-4">
                    {activeSubs.length > 0 ? (
                        activeSubs.map((sub, index) => (
                            <SubscriptionCard key={sub.id} subscription={sub} index={index} />
                        ))
                    ) : (
                        <div className="p-10 rounded-[3rem] border-2 border-dashed border-brand-500/10 text-center opacity-60 bg-white/5 backdrop-blur-sm">
                            <p className="text-[var(--text-secondary)] font-bold italic">لا توجد اشتراكات نشطة حالياً.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Expired Section */}
            {expiredSubs.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-sm">
                            <XCircle className="w-5 h-5 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight">سجل الاشتراكات المنتهية</h3>
                    </div>
                    <div className="space-y-4">
                        {expiredSubs.map((sub, index) => (
                            <SubscriptionCard key={sub.id} subscription={sub} index={index} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
