import { useState, useEffect } from 'react';
import {
    PieChart,
    Download,
    RefreshCw
} from 'lucide-react';
import { reportsService, FinancialReportData } from '../services/ReportsService';
import { FinancialStatsCards } from '../components/reports/FinancialStatsCards';
import { TeachersRevenueTable } from '../components/reports/TeachersRevenueTable';
import { useUIStore } from '@/store/uiStore';

export function AdminReportsPage() {
    const [data, setData] = useState<FinancialReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useUIStore();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsService.getFinancialReport();
            setData(result);
        } catch (error) {
            console.error(error);
            showToast({
                type: 'error',
                title: 'خطأ',
                message: 'فشل تحميل التقارير المالية'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 rounded-full border-brand-500/30 border-t-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] font-display flex items-center gap-3">
                        <PieChart className="w-8 h-8 text-emerald-500" />
                        التقارير المالية
                    </h1>
                    <p className="text-[var(--text-secondary)] opacity-70 mt-2 font-medium">
                        نظرة شاملة على العائدات، الأكواد، وأداء المدرسين المالي
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500/30 transition-all hover:rotate-180 active:scale-95 duration-500"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                        <Download className="w-4 h-4" />
                        <span>تصدير PDF</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <FinancialStatsCards stats={data.summary} />

            {/* Teachers Table */}
            <TeachersRevenueTable teachers={data.teachers} />
        </div>
    );
}
