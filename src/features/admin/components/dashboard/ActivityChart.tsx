import { Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { DashboardStats } from '../../services/DashboardService';

interface ActivityChartProps {
    stats: DashboardStats | null;
}

export function ActivityChart({ stats }: ActivityChartProps) {
    const chartData = stats?.recentActivity.map(item => ({
        name: new Date(item.date).toLocaleDateString('ar-EG', { weekday: 'short' }),
        value: item.new_students
    })).reverse() || [];

    return (
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] rounded-[2.5rem] p-8 border border-[var(--border-color)] shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] font-display mb-1">نشاط التسجيل</h3>
                    <p className="text-xs text-[var(--text-secondary)] opacity-60 font-bold">الطلاب الجدد - آخر 7 أيام</p>
                </div>
                <div className="p-3 bg-brand-500/5 rounded-2xl">
                    <Activity className="w-6 h-6 text-brand-500" />
                </div>
            </div>

            <div className="h-[300px] w-full" dir="ltr">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12, opacity: 0.7 }}
                                dy={10}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--bg-main)', opacity: 0.5 }}
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Bar
                                dataKey="value"
                                fill="var(--brand-primary)"
                                radius={[8, 8, 8, 8]}
                                barSize={40}
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
                        <Activity className="w-12 h-12 mb-2 stroke-1" />
                        <span className="text-sm">لا يوجد نشاط حديث</span>
                    </div>
                )}
            </div>
        </div>
    );
}
