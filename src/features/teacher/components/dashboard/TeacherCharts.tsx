import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const incomeData: any[] = [];

export function TeacherCharts() {
    return (
        <motion.section
            variants={itemVariants}
            className="lg:col-span-2 glass-card rounded-3xl p-6 md:p-8"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="text-right">
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2 font-display justify-end">
                        <Activity className="w-5 h-5 text-brand-500" />
                        إحصائيات الأداء
                    </h3>
                    <p className="text-slate-400 text-xs">تحليل الأرباح ونمو الطلاب في الـ 7 أشهر الماضية</p>
                </div>
                <select className="bg-slate-900/50 text-slate-300 text-sm px-4 py-2 rounded-xl border border-white/5 outline-none focus:border-brand-500/50 transition-colors">
                    <option>آخر 7 أشهر</option>
                    <option>هذا العام</option>
                </select>
            </div>

            <div className="w-full">
                <ResponsiveContainer width="100%" aspect={2} minWidth={0}>
                    <AreaChart data={incomeData}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }}
                            itemStyle={{ color: '#f8fafc' }}
                        />
                        <Area type="monotone" dataKey="income" stroke="var(--brand-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="الأرباح" />
                        <Area type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" name="الطلاب" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.section>
    );
}
