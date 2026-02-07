import { motion } from 'framer-motion';
import { Users, BookOpen, GraduationCap, DollarSign } from 'lucide-react';
import { StatCard } from '../../../dashboard/components/StatCard';
import { useEffect, useState } from 'react';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

type TeacherStatsResponse = {
    totalStudents: number;
    courseSubscriptions: number;
    answeredExams: number;
    netEarnings: number;
};

export function TeacherStats() {
    const [statsData, setStatsData] = useState<TeacherStatsResponse | null>(null);


    useEffect(() => {
        let mounted = true;
        apiClient
            .get<TeacherStatsResponse>(ENDPOINTS.TEACHER.DASHBOARD.STATS)
            .then((res) => {
                if (!mounted) return;
                setStatsData(res.data);
            })
            .catch(() => {
                if (!mounted) return;
                setStatsData({ totalStudents: 0, courseSubscriptions: 0, answeredExams: 0, netEarnings: 0 });
            });
        return () => {
            mounted = false;
        };
    }, []);

    const stats = [
        {
            title: 'إجمالي الطلاب',
            value: String(statsData?.totalStudents ?? 0),
            icon: Users,
            trend: { value: 0, isPositive: true },
            color: 'indigo' as const,
        },
        {
            title: 'اشتراكات الكورسات',
            value: String(statsData?.courseSubscriptions ?? 0),
            icon: BookOpen,
            trend: { value: 0, isPositive: true },
            color: 'violet' as const,
        },
        {
            title: 'الامتحانات المجابة',
            value: String(statsData?.answeredExams ?? 0),
            icon: GraduationCap,
            trend: { value: 0, isPositive: false },
            color: 'emerald' as const,
        },
        {
            title: 'صافي الأرباح',
            value: `${(statsData?.netEarnings ?? 0).toFixed(2)} ج.م`,
            icon: DollarSign,
            trend: { value: 0, isPositive: true },
            color: 'amber' as const,
        },
    ];

    return (
        <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <StatCard
                    key={stat.title}
                    {...stat}
                    delay={index * 0.05}
                />
            ))}
        </motion.section>
    );
}
