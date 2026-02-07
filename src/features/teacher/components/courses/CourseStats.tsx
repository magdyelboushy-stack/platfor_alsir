import { motion } from 'framer-motion';
import { BookOpen, Users, Wallet, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';

interface StatCardProps {
    label: string;
    value: string;
    icon: any;
    color: string;
    delay?: number;
}

function StatCard({ label, value, icon: Icon, color, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-[2.5rem] relative overflow-hidden group shadow-sm"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-${color}-500/10 transition-colors duration-500`} />

            <div className="flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-500 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1 opacity-60">
                        {label}
                    </p>
                    <h3 className="text-2xl font-black text-[var(--text-primary)] font-display">
                        {value}
                    </h3>
                </div>
            </div>
        </motion.div>
    );
}

export function CourseStats({ totalCourses }: { totalCourses: number }) {
    const [statsData, setStatsData] = useState({
        totalStudents: 0,
        netEarnings: 0,
        contentHours: 0
    });

    useEffect(() => {
        // Fetch dashboard stats for students and earnings
        apiClient.get(ENDPOINTS.TEACHER.DASHBOARD.STATS)
            .then(res => {
                setStatsData(prev => ({
                    ...prev,
                    totalStudents: res.data.totalStudents || 0,
                    netEarnings: res.data.netEarnings || 0
                }));
            })
            .catch(err => console.error('Failed to fetch course stats:', err));
    }, []);

    const stats = [
        { label: 'إجمالي الكورسات', value: String(totalCourses), icon: BookOpen, color: 'brand' },
        { label: 'الطلاب المشتركين', value: String(statsData.totalStudents), icon: Users, color: 'emerald' },
        { label: 'إجمالي الأرباح', value: `${statsData.netEarnings.toFixed(2)} ج.م`, icon: Wallet, color: 'amber' },
        { label: 'ساعات المحتوى', value: '0 ساعة', icon: Clock, color: 'rose' }, // Content hours not yet available in API
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} delay={index * 0.1} />
            ))}
        </div>
    );
}
