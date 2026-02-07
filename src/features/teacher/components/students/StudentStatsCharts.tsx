import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { Users } from 'lucide-react';
import { formatEducationValue } from '@/core/utils/educationMapping';
import { clsx } from 'clsx';

interface StudentStatsChartsProps {
    stats: {
        gender: Array<{ gender: string; count: number }>;
        stages: Array<{ education_stage: string; count: number }>;
        governorates: Array<{ governorate: string; count: number }>;
        cities: Array<{ city: string; count: number }>;
        total: number;
    } | null;
}

export function StudentStatsCharts({ stats }: StudentStatsChartsProps) {
    if (!stats) return null;

    const genderData = stats.gender.map(g => ({
        name: g.gender === 'male' ? 'ذكور' : 'إناث',
        value: Number(g.count),
        color: g.gender === 'male' ? '#3B82F6' : '#F472B6'
    }));

    const stageData = stats.stages.map(s => ({
        name: formatEducationValue(s.education_stage),
        count: Number(s.count)
    }));

    const govData = (stats.governorates || []).map(g => ({
        name: g.governorate,
        count: Number(g.count)
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    const cityData = (stats.cities || []).map(c => ({
        name: c.city,
        count: Number(c.count)
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8" dir="rtl">
            {/* Gender Distribution Chart */}
            <ChartContainer title="توزيع الطلاب حسب النوع" subtitle="نسبة الذكور والإناث">
                {genderData.length > 0 ? (
                    <div className="h-[280px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="inside"
                                        fill="#fff"
                                        style={{ fontWeight: '900', fontSize: '16px' }}
                                    />
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `${value} طالب`}
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border-color)',
                                        borderRadius: '1.25rem',
                                        padding: '12px',
                                        textAlign: 'right',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ fontWeight: '900', fontSize: '12px', color: 'var(--text-primary)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={50}
                                    iconType="circle"
                                    wrapperStyle={{
                                        paddingTop: '20px',
                                        fontSize: '14px',
                                        fontWeight: '900'
                                    }}
                                    formatter={(value) => (
                                        <span style={{
                                            color: 'var(--text-primary)',
                                            marginRight: '8px',
                                            fontSize: '14px',
                                            fontWeight: '900'
                                        }}>
                                            {value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : <EmptyChartState />}
            </ChartContainer>

            {/* Stage Distribution Chart */}
            <ChartContainer title="توزيع الطلاب حسب المراحل" subtitle="عدد الطلاب في كل مرحلة">
                {stageData.length > 0 ? (
                    <div className="h-[280px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stageData} margin={{ top: 25, right: 10, left: 10, bottom: 45 }}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    angle={-15}
                                    textAnchor="end"
                                    height={60}
                                    tick={{
                                        fill: 'var(--text-secondary)',
                                        fontSize: 12,
                                        fontWeight: '900'
                                    }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    formatter={(value) => `${value} طالب`}
                                    cursor={{ fill: 'rgba(197,160,89, 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border-color)',
                                        borderRadius: '1.25rem',
                                        textAlign: 'right',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ fontWeight: '900', fontSize: '12px', color: 'var(--text-primary)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="var(--color-brand)"
                                    radius={[12, 12, 0, 0]}
                                    barSize={45}
                                >
                                    <LabelList
                                        dataKey="count"
                                        position="top"
                                        fill="var(--text-primary)"
                                        offset={8}
                                        style={{ fontWeight: '900', fontSize: '14px' }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : <EmptyChartState />}
            </ChartContainer>

            {/* Governorate Distribution Chart */}
            <ChartContainer title="أكثر المحافظات تواجداً" subtitle="توزيع الطلاب جغرافياً">
                {govData.length > 0 ? (
                    <div className="h-[280px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={govData}
                                layout="vertical"
                                margin={{ top: 10, right: 50, left: 5, bottom: 10 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: 'var(--text-primary)',
                                        fontSize: 13,
                                        fontWeight: '900',
                                        textAnchor: 'end'
                                    }}
                                    tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
                                />
                                <Tooltip
                                    formatter={(value) => `${value} طالب`}
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border-color)',
                                        borderRadius: '1.25rem',
                                        textAlign: 'right',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ fontWeight: '900', fontSize: '12px', color: 'var(--text-primary)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#8B5CF6"
                                    radius={[0, 12, 12, 0]}
                                    barSize={28}
                                >
                                    <LabelList
                                        dataKey="count"
                                        position="insideLeft"
                                        fill="#fff"
                                        offset={10}
                                        style={{ fontWeight: '900', fontSize: '14px' }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : <EmptyChartState />}
            </ChartContainer>

            {/* City Distribution Chart */}
            <ChartContainer title="أكثر المدن تواجداً" subtitle="توزيع الطلاب حسب المدن">
                {cityData.length > 0 ? (
                    <div className="h-[280px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={cityData}
                                layout="vertical"
                                margin={{ top: 10, right: 50, left: 5, bottom: 10 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: 'var(--text-primary)',
                                        fontSize: 13,
                                        fontWeight: '900',
                                        textAnchor: 'end'
                                    }}
                                    tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
                                />
                                <Tooltip
                                    formatter={(value) => `${value} طالب`}
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border-color)',
                                        borderRadius: '1.25rem',
                                        padding: '12px',
                                        textAlign: 'right',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ fontWeight: '900', fontSize: '12px', color: 'var(--text-primary)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#10B981"
                                    radius={[0, 12, 12, 0]}
                                    barSize={28}
                                >
                                    <LabelList
                                        dataKey="count"
                                        position="insideLeft"
                                        fill="#fff"
                                        offset={10}
                                        style={{ fontWeight: '900', fontSize: '14px' }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : <EmptyChartState />}
            </ChartContainer>
        </div>
    );
}

function EmptyChartState() {
    return (
        <div className="h-[280px] flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mb-4 border border-brand-500/10">
                <Users className="w-8 h-8 text-brand-500" />
            </div>
            <p className="text-sm font-black text-[var(--text-primary)]">لا توجد بيانات متاحة حالياً</p>
        </div>
    );
}

function ChartContainer({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) {
    return (
        <div className={clsx(
            "p-6 lg:p-8 rounded-[2.5rem] bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl transition-all duration-500 flex flex-col justify-between min-w-0",
            "hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5 shadow-sm"
        )}>
            <div className="text-right mb-4">
                <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight">{title}</h3>
                <p className="text-[var(--text-secondary)] text-xs font-bold opacity-60 mt-1">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}