import { motion } from 'framer-motion';
import { Wallet, TrendingUp } from 'lucide-react';
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

type CoursePreview = {
    id: number;
    title: string;
    enrollmentCount: number;
    price: number;
};

export function TeacherSidebar() {
    const [withdrawableBalance, setWithdrawableBalance] = useState<number>(0);
    const [topCourses, setTopCourses] = useState<CoursePreview[]>([]);

    useEffect(() => {
        let mounted = true;
        // 1) Fetch teacher financial stats (net earnings as temporary withdrawable balance)
        apiClient
            .get<TeacherStatsResponse>(ENDPOINTS.TEACHER.DASHBOARD.STATS)
            .then((res) => {
                if (!mounted) return;
                setWithdrawableBalance(res.data.netEarnings || 0);
            })
            .catch(() => {
                if (!mounted) return;
                setWithdrawableBalance(0);
            });

        // 2) Fetch teacher courses and compute top-selling
        apiClient
            .get<CoursePreview[]>(ENDPOINTS.ADMIN.COURSES.LIST)
            .then((res) => {
                if (!mounted) return;
                const sorted = [...res.data]
                    .sort((a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0))
                    .slice(0, 5)
                    .map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        enrollmentCount: Number(c.enrollmentCount || 0),
                        price: Number(c.price || 0),
                    }));
                setTopCourses(sorted);
            })
            .catch(() => {
                if (!mounted) return;
                setTopCourses([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <motion.section
            variants={itemVariants}
            className="space-y-6"
        >
            {/* Wallet Card */}
            <div className="bg-gradient-to-br from-brand-500/20 to-amber-500/10 border border-brand-500/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all duration-500" />
                <div className="relative z-10 text-right">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-brand-500/20 text-brand-500 rounded-xl">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <button className="text-brand-500 text-sm font-bold hover:underline">التفاصيل</button>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1 font-display">المحفظة والأرباح</h3>
                    <p className="text-slate-400 text-sm mb-6">الرصيد القابل للسحب: <span className="text-white font-black">{withdrawableBalance.toFixed(2)} ج.م</span></p>
                    <button className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-brand-500/20">
                        طلب سحب رصيد
                    </button>
                </div>
            </div>

            {/* Top Courses List */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white font-display text-right">الأعلى مبيعاً</h3>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="space-y-5">
                    {topCourses.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500 text-sm">لا يوجد بيانات حالياً</p>
                        </div>
                    ) : (
                        topCourses.map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="text-right">
                                    <p className="text-white font-bold">{course.title}</p>
                                    <p className="text-slate-400 text-xs">المشتركين: {course.enrollmentCount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-400 font-black">{(course.price * course.enrollmentCount).toFixed(2)} ج.م</p>
                                    <p className="text-slate-500 text-xs">الإجمالي</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </motion.section>
    );
}
