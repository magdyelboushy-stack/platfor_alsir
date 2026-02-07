// ============================================================
// Admin Student Details Page
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Phone,
    MapPin,
    Calendar,
    CheckCircle,
    Ban,
    Shield,
    BookOpen,
    PlayCircle,
    User,
    GraduationCap,
    Clock
} from 'lucide-react';
import { studentService, Student } from '../services/StudentService';
import { getAvatarUrl, getFileUrl } from '@/utils/fileUrl';
import clsx from 'clsx';

export function AdminStudentDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [studentCourses, setStudentCourses] = useState<any[]>([]);
    const [standaloneExams, setStandaloneExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchDetails(id);
    }, [id]);

    const fetchDetails = async (studentId: string) => {
        try {
            setLoading(true);
            // Fetch both profile and courses in parallel
            const [profileData, data] = await Promise.all([
                studentService.getStudentById(studentId),
                studentService.getStudentDetails(studentId)
            ]);

            setStudent(profileData);

            // Handle new response format: { courses: [], standaloneExams: [] }
            const courses = Array.isArray(data) ? data : (data?.courses || []);
            const standalone = data?.standaloneExams || [];

            setStudentCourses(courses);
            setStandaloneExams(standalone);
        } catch (err: any) {
            setError(err.response?.data?.error || 'حدث خطأ في جلب بيانات الطالب');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="w-16 h-16 border-4 rounded-full border-brand-500/30 border-t-brand-500 animate-spin" />
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-red-500/5 rounded-[2.5rem] border border-red-500/10 p-10">
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2 font-display">حدث خطأ</h2>
                <p className="text-[var(--text-secondary)] mb-6">{error || 'لم يتم العثور على الطالب'}</p>
                <button
                    onClick={() => navigate('/admin/students')}
                    className="px-6 py-2.5 bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--bg-main)] rounded-xl font-bold transition-all"
                >
                    العودة للقائمة
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Header & Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/students')}
                    className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl hover:bg-brand-500/10 hover:border-brand-500/30 transition-all group"
                >
                    <ArrowRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-brand-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] font-display">ملف الطالب</h1>
                    <p className="text-[var(--text-secondary)] opacity-80 text-sm">عرض البيانات الشخصية والتقدم الدراسي</p>
                </div>
            </div>

            {/* Student Profile Card */}
            <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Avatar & Status */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-4 w-full lg:w-auto">
                        <div className="relative">


                            <div className="w-32 h-32 rounded-[2rem] p-1 bg-gradient-to-br from-blue-500 to-cyan-400 shadow-xl">
                                <img
                                    src={getAvatarUrl(student.avatar, student.email)}
                                    alt={student.name}
                                    className="w-full h-full rounded-[1.8rem] bg-[var(--bg-main)] object-cover"
                                />
                            </div>
                            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border-4 border-[var(--bg-secondary)] flex items-center justify-center ${student.status === 'active' ? 'bg-emerald-500 text-white' : student.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
                                {student.status === 'active' ? <CheckCircle className="w-4 h-4" /> : student.status === 'pending' ? <Clock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <h2 className="text-xl font-black text-[var(--text-primary)] font-display">{student.name}</h2>
                            <span className="text-sm font-bold text-[var(--text-secondary)] opacity-60 dir-ltr font-mono">{student.email}</span>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-brand-500 flex items-center gap-2 mb-4">
                                <User className="w-4 h-4" />
                                البيانات الشخصية
                            </h3>

                            <InfoItem label="رقم الهاتف" value={student.phone} icon={Phone} isLtr />
                            <InfoItem label="العنوان" value={`${student.governorate} - ${student.city}`} icon={MapPin} />
                            <InfoItem label="المرحلة الدراسية" value={`${student.educationStage} - ${student.gradeLevel}`} icon={GraduationCap} />
                            <InfoItem label="تاريخ الانضمام" value={student.joinedAt} icon={Calendar} />
                        </div>

                        {/* Guardian Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-emerald-500 flex items-center gap-2 mb-4">
                                <Shield className="w-4 h-4" />
                                بيانات ولي الأمر
                            </h3>

                            <InfoItem
                                label="اسم ولي الأمر"
                                value={student.guardianName || 'غير مسجل'}
                                icon={User}
                                highlight={!student.guardianName}
                            />
                            <InfoItem
                                label="هاتف ولي الأمر"
                                value={student.parentPhone || 'غير مسجل'}
                                icon={Phone}
                                isLtr
                                highlight={!student.parentPhone}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses List */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2 px-2">
                    <BookOpen className="w-5 h-5 text-brand-500" />
                    الكورسات والمحتوى ({studentCourses.length})
                </h2>

                {studentCourses.length === 0 ? (
                    <div className="p-12 text-center bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] border-dashed">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-main)] flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-[var(--text-secondary)] opacity-30" />
                        </div>
                        <p className="text-[var(--text-secondary)] font-medium opacity-60">لا يوجد كورسات مشترك بها هذا الطالب حالياً.</p>
                    </div>
                ) : (
                    studentCourses.map((course) => (
                        <div key={course.id} className="bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6 border-b border-[var(--border-color)] flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-[var(--bg-main)] flex-shrink-0">
                                    <img src={getFileUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-3">
                                        <h3 className="text-xl font-black text-[var(--text-primary)]">{course.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {course.status === 'active' ? 'اشتراك نشط' : 'اشتراك معلق'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)] mb-6 opacity-80 font-medium">
                                        <span>بواسطة: <span className="text-[var(--text-primary)] font-bold">{course.teacher}</span></span>
                                        <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                                        <span>تاريخ الاشتراك: <span className="font-mono">{new Date(course.enrolledAt).toLocaleDateString('ar-EG')}</span></span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                                            <span>نسبة الاكتمال</span>
                                            <span className="text-[var(--text-primary)]">{course.progress}%</span>
                                        </div>
                                        <div className="w-full bg-[var(--bg-main)] h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-brand-600 to-brand-400 h-full transition-all duration-1000 ease-out"
                                                style={{ width: `${course.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lessons Breakdown */}
                            <div className="bg-[var(--bg-main)]/30">
                                <details className="group">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-main)] transition-colors select-none">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                                                <PlayCircle className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm text-[var(--text-primary)]">سجل مشاهدات الدروس ({course.completedLessons} / {course.lessons})</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] transform group-open:rotate-90 transition-transform" />
                                    </summary>

                                    <div className="p-4 pt-0 border-t border-[var(--border-color)] border-dashed">
                                        <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {course.lessonDetails?.length > 0 ? (
                                                course.lessonDetails.map((lesson: any) => (
                                                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-full flex-shrink-0 ${lesson.isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--bg-main)] text-[var(--text-secondary)]'}`}>
                                                                {lesson.isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">{lesson.title}</div>
                                                                <div className="text-[10px] text-[var(--text-secondary)] opacity-60 flex items-center gap-1">
                                                                    <span>{lesson.duration}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {lesson.isCompleted && (
                                                            <div className="text-right">
                                                                <span className="block text-[10px] font-bold text-emerald-600">تم اكتماله</span>
                                                                <span className="text-[10px] font-mono text-[var(--text-secondary)] opacity-50">
                                                                    {new Date(lesson.completed_at).toLocaleDateString('ar-EG')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center text-xs text-[var(--text-secondary)] py-4">لا يوجد دروس في هذا الكورس بعد.</p>
                                            )}
                                        </div>
                                    </div>
                                </details>
                            </div>

                            {/* Exams Results */}
                            {course.examAttempts?.length > 0 && (
                                <div className="bg-[var(--bg-main)]/30 border-t border-[var(--border-color)]">
                                    <details className="group">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-main)] transition-colors select-none">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-cyan-500">
                                                    <BookOpen className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-sm text-[var(--text-primary)]">نتائج الاختبارات ({course.examAttempts.length})</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] transform group-open:rotate-90 transition-transform" />
                                        </summary>

                                        <div className="p-4 pt-0 border-t border-[var(--border-color)] border-dashed">
                                            <div className="space-y-3 mt-4">
                                                {course.examAttempts.map((attempt: any) => (
                                                    <div key={attempt.attempt_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={clsx(
                                                                "w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg",
                                                                attempt.passed ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20"
                                                            )}>
                                                                <span className="font-black text-sm">{Math.round(attempt.percentage)}%</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black text-[var(--text-primary)] mb-0.5">{attempt.exam_title}</h4>
                                                                <p className="text-[10px] text-[var(--text-secondary)] opacity-60">تاريخ الحل: {new Date(attempt.submitted_at).toLocaleDateString('ar-EG')}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between sm:justify-end gap-6">
                                                            <div className="text-right">
                                                                <span className={clsx(
                                                                    "block text-xs font-black mb-0.5",
                                                                    attempt.passed ? "text-emerald-500" : "text-red-500"
                                                                )}>{attempt.passed ? 'ناجح ✓' : 'لم ينجح ✗'}</span>
                                                                <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">{attempt.score} / {attempt.total_points} درجة</span>
                                                            </div>

                                                            <button
                                                                onClick={() => window.open(`/exam/review/${attempt.attempt_id}`, '_blank')}
                                                                className="px-4 py-2 bg-[var(--bg-main)] hover:bg-brand-500 hover:text-white border border-[var(--border-color)] hover:border-brand-500 rounded-xl text-[10px] font-black transition-all"
                                                            >
                                                                مراجعة الأخطاء
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Standalone / General Exams */}
            {standaloneExams.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2 px-2">
                        <BookOpen className="w-5 h-5 text-cyan-500" />
                        امتحانات عامة ({standaloneExams.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {standaloneExams.map((attempt: any) => (
                            <div key={attempt.attempt_id} className="bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] p-6 hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0",
                                            attempt.passed ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-red-500 shadow-lg shadow-red-500/20"
                                        )}>
                                            <span className="font-black text-xs">{Math.round(attempt.percentage)}%</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-[var(--text-primary)] mb-0.5">{attempt.exam_title}</h4>
                                            <p className="text-[10px] text-[var(--text-secondary)] opacity-60">تاريخ الحل: {new Date(attempt.submitted_at).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                    </div>
                                    <div className={clsx(
                                        "px-3 py-1 rounded-xl text-[10px] font-black",
                                        attempt.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                                    )}>
                                        {attempt.passed ? 'ناجح ✓' : 'لم ينجح ✗'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4 mt-6">
                                    <div className="flex-1 text-right">
                                        <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">الدرجة: {attempt.score} / {attempt.total_points}</span>
                                    </div>
                                    <button
                                        onClick={() => window.open(`/exam/review/${attempt.attempt_id}`, '_blank')}
                                        className="px-4 py-2 bg-[var(--bg-main)] hover:bg-brand-500 hover:text-white border border-[var(--border-color)] hover:border-brand-500 rounded-xl text-[10px] font-black transition-all"
                                    >
                                        مراجعة الأخطاء
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoItem({ label, value, icon: Icon, isLtr = false, highlight = false }: any) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border-color)] group-hover:border-brand-500/30 transition-colors">
                <Icon className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-brand-500 transition-colors" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 mb-0.5">{label}</p>
                <p className={`font-bold text-sm ${highlight ? 'text-amber-500' : 'text-[var(--text-primary)]'} ${isLtr ? 'dir-ltr font-mono' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}
