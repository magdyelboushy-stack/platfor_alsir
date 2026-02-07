// ============================================================
// Admin Dashboard Page - Premium Platform Overview
// ============================================================

import { useState, useEffect } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { DashboardStats, dashboardService } from '../services/DashboardService';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { EnrollmentSummary } from '../components/dashboard/EnrollmentSummary';
import { DetailedStatusGrid } from '../components/dashboard/DetailedStatusGrid';

export function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await dashboardService.getStats();
                setStats(data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'حدث خطأ في جلب البيانات');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="w-16 h-16 border-4 rounded-full border-brand-500/30 border-t-brand-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-red-500/5 rounded-3xl border border-red-500/10 p-10">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2 font-display">حدث خطأ</h2>
                <p className="text-[var(--text-secondary)]">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2 font-display">نظرة عامة على المنصة</h1>
                    <p className="text-[var(--text-secondary)] opacity-80 font-medium">متابعة شاملة لجميع الأنشطة والإحصائيات</p>
                </div>
                <div className="hidden sm:flex px-4 py-2 bg-brand-500/10 rounded-xl border border-brand-500/20 items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-bold text-brand-600">لوحة المراقبة المركزية</span>
                </div>
            </div>

            {/* Stats Grid */}
            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Chart */}
                <ActivityChart stats={stats} />

                {/* Enrollment Summary */}
                <EnrollmentSummary stats={stats} />
            </div>

            {/* Detailed Status Grid */}
            <DetailedStatusGrid stats={stats} />
        </div>
    );
}
