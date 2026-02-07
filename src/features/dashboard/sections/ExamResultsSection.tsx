import { useState, useEffect } from 'react';
import { apiClient } from '@/core/api/client';
import { ExamStats } from '../components/exams/ExamStats';
import { ExamResultsList } from '../components/exams/ExamResultsList';

export function ExamResultsSection() {
    const [exams, setExams] = useState<any[]>([]);
    const [stats, setStats] = useState({
        total_exams: 0,
        avg_score: 0,
        passed_exams: 0,
        pass_rate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await apiClient.get('/student/exam-results');
                // Backend returns { attempts: [], stats: {} }
                if (res.data) {
                    const attempts = res.data.attempts || [];
                    const mappedExams = attempts.map((a: any) => ({
                        id: a.attempt_id,
                        title: a.exam_title,
                        course: a.course_name || 'كورس عام',
                        score: Number(a.score),
                        maxScore: Number(a.total_points),
                        date: a.submitted_at,
                        passed: !!a.passed,
                        duration: a.duration_minutes ? `${a.duration_minutes} دقيقة` : 'غير محدد'
                    }));
                    setExams(mappedExams);
                    setStats(res.data.stats || {
                        total_exams: 0,
                        avg_score: 0,
                        passed_exams: 0,
                        pass_rate: 0
                    });
                }
            } catch (error) {
                console.error('Failed to fetch exam results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-[var(--text-secondary)]">جاري تحميل النتائج...</div>;
    }

    return (
        <div className="space-y-12 pb-20 max-w-6xl mx-auto">
            {/* 1. Header Area - Luxe Alignment */}
            <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight transition-colors">
                    نتائج <span className="text-[var(--color-brand)]">الاختبارات</span>
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                    هنا تجد تحليلاً كاملاً لأدائك في الاختبارات، درجاتك، ونسب النجاح لمساعدتك على التحسن المستمر.
                </p>
            </div>

            {/* 2. Stats Module */}
            <ExamStats
                total={stats.total_exams}
                avgScore={stats.avg_score}
                passed={stats.passed_exams}
                passRate={stats.pass_rate}
            />

            {/* 3. Main Results Repository */}
            <ExamResultsList results={exams} />

            {/* Decorative Element */}
            <div className="absolute top-[30%] left-[-5%] w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
