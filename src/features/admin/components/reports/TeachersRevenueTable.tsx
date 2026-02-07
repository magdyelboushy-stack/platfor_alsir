import {
    Search,
    BookOpen,
    QrCode,
    TrendingUp
} from 'lucide-react';
import { TeacherRevenue } from '../../services/ReportsService';
import { getAvatarUrl } from '@/utils/fileUrl';
import { useState } from 'react';

interface Props {
    teachers: TeacherRevenue[];
}

export function TeachersRevenueTable({ teachers }: Props) {
    const [search, setSearch] = useState('');

    const filtered = teachers.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
    };

    return (
        <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-[var(--border-color)] flex flex-col md:flex-row gap-4 justify-between items-center">
                <div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        تفاصيل أرباح المدرسين
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] opacity-60 font-medium">تحليل لأداء مبيعات الكورسات لكل مدرس</p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] opacity-50" />
                    <input
                        type="text"
                        placeholder="بحث عن مدرس..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-11 pr-11 pl-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)] text-sm font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-50 focus:outline-none focus:border-brand-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="bg-[var(--bg-main)]/50 text-[var(--text-secondary)] text-xs font-black uppercase tracking-wider">
                            <th className="px-6 py-4 text-right first:rounded-tr-2xl">المدرس</th>
                            <th className="px-6 py-4 text-center">الكورسات</th>
                            <th className="px-6 py-4 text-center">الأكواد (تفعيل / كلي)</th>
                            <th className="px-6 py-4 text-center">نسبة الاستخدام</th>
                            <th className="px-6 py-4 text-left last:rounded-tl-2xl">إجمالي الأرباح</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {filtered.length > 0 ? (
                            filtered.map((t) => (
                                <tr key={t.id} className="group hover:bg-[var(--bg-main)]/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] p-0.5 border border-[var(--border-color)]">
                                                <img
                                                    src={getAvatarUrl(t.avatar, t.email)}
                                                    alt={t.name}
                                                    className="w-full h-full rounded-[10px] object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[var(--text-primary)] text-sm">{t.name}</div>
                                                <div className="text-[10px] font-mono text-[var(--text-secondary)] opacity-60">{t.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)]">
                                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                            {t.coursesCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold font-mono text-[var(--text-primary)] dir-ltr">
                                            <span className="text-emerald-500">{t.codes.used}</span>
                                            <span className="opacity-30">/</span>
                                            <span>{t.codes.generated}</span>
                                            <QrCode className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-50 ml-1" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 max-w-[140px] mx-auto">
                                            <div className="flex-1 h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${t.codes.usageRate > 70 ? 'bg-emerald-500' : t.codes.usageRate > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{ width: `${t.codes.usageRate}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold font-mono text-[var(--text-secondary)] w-8 text-left">{t.codes.usageRate}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <div className="inline-flex items-center gap-1 font-black text-emerald-500 dir-ltr text-sm">
                                            {formatCurrency(t.revenue)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-[var(--text-secondary)] text-sm opacity-60">
                                    لا توجد بيانات مطابقة للبحث
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
