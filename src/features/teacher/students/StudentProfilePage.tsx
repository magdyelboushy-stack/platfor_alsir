import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useUIStore } from '@/store/uiStore';
import { CheckCircle, BookOpen, Clock } from 'lucide-react';
import clsx from 'clsx';

export function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const student = (location.state as any)?.student || null;
  const { showToast } = useUIStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [standaloneExams, setStandaloneExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await api.get<any>(ENDPOINTS.ADMIN.STUDENT_COURSES_DETAIL(id));
        const coursesRaw = Array.isArray(data) ? data : (data?.courses || data?.data || []);
        const standaloneRaw = data?.standaloneExams || [];

        const payload = (coursesRaw || []).map((c: any) => ({
          ...c,
          progress: c?.progress ?? c?.progress_percent ?? 0,
          teacher_name: c?.teacher_name ?? c?.teacherName ?? c?.teacher ?? undefined,
          lessons: (Array.isArray(c?.lessons) ? c.lessons : (c?.lessonDetails || [])).map((l: any) => ({
            id: l?.id,
            title: l?.title,
            completed: l?.completed ?? l?.isCompleted ?? false,
            watched_seconds: l?.watched_seconds ?? l?.watchedSeconds ?? 0,
            duration_seconds: l?.duration_seconds ?? (
              typeof l?.duration === 'string' ? (parseInt(l.duration) || 0) * 60 : ((l?.duration_minutes || 0) * 60)
            ),
          })),
        }));
        setCourses(payload);
        setStandaloneExams(standaloneRaw);
      } catch (error: any) {
        console.error('Failed to fetch student courses:', error);
        const backendMsg = error?.response?.data?.error || error?.response?.data?.message || 'حدث خطأ في جلب تفاصيل الكورسات للطالب';
        showToast({ type: 'error', title: 'خطأ', message: backendMsg });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [id, showToast]);

  const headerName = student?.name || 'الطالب';

  return (
    <div className="space-y-8 p-6 lg:p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
            متابعة <span className="text-gradient">الكورسات والتقدم</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 font-medium opacity-80">{headerName}</p>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Courses Sections */}
              {courses.length === 0 ? (
                <div className="p-10 text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem]">
                  <BookOpen className="w-10 h-10 mx-auto text-brand-500 mb-4" />
                  <p className="text-lg font-black">لا يوجد كورسات مسجلة لهذا الطالب</p>
                  <p className="text-[var(--text-secondary)] font-bold mt-1">يمكنك تسجيله في كورسات مناسبة من صفحة الكورسات.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {courses.map((course) => (
                    <div key={course.id} className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-black">{course.title}</h3>
                          <p className="text-xs text-slate-400">معلم: {course.teacher_name || 'غير متاح'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <ProgressBadge percent={course.progress} />
                          <span className="text-xs text-slate-500">مسجل منذ: {formatDate(course.enrolled_at)}</span>
                        </div>
                      </div>

                      {/* Lessons List */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {course.lessons?.map((lesson: any) => (
                          <div key={lesson.id} className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-[var(--border-color)]">
                            <div className="flex items-center justify-between">
                              <p className="font-bold">{lesson.title}</p>
                              {lesson.completed ? (
                                <span className="flex items-center gap-1 text-brand-600 text-xs font-black">
                                  <CheckCircle className="w-4 h-4" /> مكتمل
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                                  <Clock className="w-4 h-4" /> قيد التقدم
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">مدة المشاهدة: {formatDuration(lesson.watched_seconds)} / {formatDuration(lesson.duration_seconds)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Exam Attempts within Course */}
                      {course.examAttempts?.length > 0 && (
                        <div className="mt-8 space-y-4">
                          <div className="flex items-center gap-2 mb-2 px-2">
                            <BookOpen className="w-4 h-4 text-cyan-500" />
                            <h4 className="font-black text-sm text-[var(--text-primary)]">نتائج الاختبارات ({course.examAttempts.length})</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {course.examAttempts.map((attempt: any) => (
                              <div key={attempt.attempt_id} className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] group hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <p className="text-sm font-black text-[var(--text-primary)] mb-1">{attempt.exam_title}</p>
                                    <p className="text-[10px] text-[var(--text-secondary)] opacity-60 font-medium">{formatDate(attempt.submitted_at)}</p>
                                  </div>
                                  <div className={clsx(
                                    "px-3 py-1 rounded-xl text-xs font-black",
                                    attempt.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                                  )}>
                                    {attempt.passed ? 'ناجح' : 'لم ينجح'}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                      <span>{Math.round(attempt.percentage)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                      <div className={clsx("h-full transition-all", attempt.passed ? "bg-emerald-500" : "bg-red-500")} style={{ width: `${attempt.percentage}%` }} />
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => window.open(`/exam/review/${attempt.attempt_id}`, '_blank')}
                                    className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-black shadow-lg shadow-brand-500/20 hover:scale-105 transition-all"
                                  >
                                    عرض الأخطاء
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Standalone / General Exams */}
              {standaloneExams.length > 0 && (
                <div className="mt-8 space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[var(--text-primary)] font-display">امتحانات عامة</h2>
                      <p className="text-xs text-[var(--text-secondary)] opacity-60 font-medium">امتحانات خارج المنهج أو غير مرتبطة بكورسات معينة</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {standaloneExams.map((attempt: any) => (
                      <div key={attempt.attempt_id} className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">{attempt.exam_title}</h3>
                            <p className="text-xs text-[var(--text-secondary)] opacity-60">{formatDate(attempt.submitted_at)}</p>
                          </div>
                          <div className={clsx(
                            "px-3 py-1 rounded-xl text-xs font-black",
                            attempt.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                          )}>
                            {attempt.passed ? 'ناجح ✓' : 'لم ينجح ✗'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-6">
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>{Math.round(attempt.percentage)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div className={clsx("h-full transition-all", attempt.passed ? "bg-emerald-500" : "bg-red-500")} style={{ width: `${attempt.percentage}%` }} />
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(`/exam/review/${attempt.attempt_id}`, '_blank')}
                            className="px-5 py-2.5 bg-brand-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-brand-500/20 hover:scale-105 transition-all"
                          >
                            عرض الأخطاء
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProgressBadge({ percent }: { percent: number }) {
  const p = Math.round(percent || 0);
  const color = p >= 80 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-500' : 'bg-slate-500';
  return (
    <span className={`px-3 py-1 rounded-xl text-white text-xs font-black ${color}`}>{p}%</span>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'غير متاح';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG');
  } catch {
    return dateStr;
  }
}

function formatDuration(sec?: number) {
  const s = Math.round(sec || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}