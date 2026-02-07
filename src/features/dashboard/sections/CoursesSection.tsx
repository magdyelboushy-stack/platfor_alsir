// ============================================================
// CoursesSection - عرض كورسات الطالب
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { CourseStats } from '../components/courses/CourseStats';
import { CourseList } from '../components/courses/CourseList';

export function CoursesSection() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const response = await apiClient.get(ENDPOINTS.COURSES.MY_COURSES);
                setCourses(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Failed to fetch enrolled courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrolledCourses();
    }, []);

    const { activeCount, completedCount, avgProgress } = useMemo(() => {
        if (courses.length === 0) return { activeCount: 0, completedCount: 0, avgProgress: 0 };

        const active = courses.filter(c => (c.progress || 0) < 100).length;
        const completed = courses.filter(c => (c.progress || 0) === 100).length;
        const totalProgress = courses.reduce((acc, c) => acc + (c.progress || 0), 0);

        return {
            activeCount: active,
            completedCount: completed,
            avgProgress: Math.round(totalProgress / courses.length)
        };
    }, [courses]);

    return (
        <div className="space-y-12 pb-20 max-w-6xl mx-auto">
            {/* 1. Header Area - Luxe Alignment */}
            <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight transition-colors">
                    إدارة <span className="text-[var(--color-brand)]">كورساتي</span>
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                    هنا تجد جميع الكورسات التي قمت بالاشتراك فيها، تابع تقدمك وانجز دروسك للوصول إلى القمة.
                </p>
            </div>

            {/* 2. Stats Module */}
            <CourseStats
                total={courses.length}
                active={activeCount}
                completed={completedCount}
                averageProgress={avgProgress}
            />

            {/* 3. Main Course Repository (Clean List) */}
            {loading ? (
                <div className="py-20 text-center animate-pulse text-[var(--text-secondary)] font-black">جاري تحميل بياناتك...</div>
            ) : (
                <CourseList courses={courses} />
            )}

            {/* Decorative Element */}
            <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
