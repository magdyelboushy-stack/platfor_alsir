import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const mockData: any[] = [];

export function TeacherRevenueChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-xl shadow-black/5"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-black text-2xl text-[var(--text-primary)]">تحليل الإيرادات</h3>
                    <p className="text-[var(--text-secondary)] font-bold text-sm">معدل نمو أرباحك خلال الفترة الأخيرة</p>
                </div>
                <select className="bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-black rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-colors">
                    <option>آخر 6 شهور</option>
                    <option>السنة الحالية</option>
                </select>
            </div>

            <div className="h-[350px] w-full dir-ltr">
                <div className="w-full">
                    {/* Use aspect ratio to avoid invalid height in auto-sized parents */}
                    <ResponsiveContainer width="100%" aspect={2} minWidth={0}>
                        <AreaChart data={mockData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} strokeOpacity={0.5} />
                            <XAxis
                                dataKey="name"
                                stroke="var(--text-secondary)"
                                tick={{ fontSize: 12, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="var(--text-secondary)"
                                tick={{ fontSize: 12, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderColor: 'var(--border-color)',
                                    borderRadius: '20px',
                                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                                    border: '1px solid var(--border-color)'
                                }}
                                itemStyle={{ color: 'var(--text-primary)', fontWeight: 800 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke="#10b981"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}
