import { CourseCard } from './CourseCard';
import { Clock, CheckCircle } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    progress: number;
    teacher: string;
    lessons: number;
    completedLessons: number;
    enrolledAt: string;
}

interface CourseListProps {
    courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
    const activeCourses = courses.filter(c => c.progress < 100);
    const completedCourses = courses.filter(c => c.progress === 100);

    return (
        <div className="space-y-12">
            {/* Active Courses Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                        <Clock className="w-5 h-5 text-[var(--color-brand)]" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight">كورسات قيد الدراسة</h3>
                </div>
                <div className="space-y-4">
                    {activeCourses.length > 0 ? (
                        activeCourses.map((course, index) => (
                            <CourseCard key={course.id} course={course} index={index} />
                        ))
                    ) : (
                        <div className="p-8 rounded-[2rem] border-2 border-dashed border-brand-500/10 text-center opacity-60">
                            <p className="text-[var(--text-secondary)] font-bold italic">لا توجد دروس حالياً</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Completed Courses Section */}
            <div className="space-y-6 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight">كورسات مكتملة</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {completedCourses.length > 0 ? (
                        completedCourses.map((course, index) => (
                            <CourseCard key={course.id} course={course} index={index + activeCourses.length} />
                        ))
                    ) : (
                        <div className="p-8 rounded-[2rem] border-2 border-dashed border-emerald-500/10 text-center opacity-60">
                            <p className="text-[var(--text-secondary)] font-bold italic">لا توجد كورسات مكتملة</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
