// ============================================================
// StudentDashboard - Premium Student Dashboard View
// ============================================================

import { motion } from 'framer-motion';
import {
    RefreshCw,
    Bell,
    ChevronRight,
    Calendar,
    PlayCircle
} from 'lucide-react';
import { clsx } from 'clsx';

// Components
import { DashboardGrid } from '../components/DashboardGrid';
import { CourseProgressCard } from '../components/CourseProgressCard';

// Hooks
import { useDashboardData } from '../hooks/useDashboardStats';
import { useAuthStore } from '@/store/authStore';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export function StudentDashboard() {
    const user = useAuthStore((state) => state.user);
    const { data, isLoading, refetchAll } = useDashboardData();

    const greeting = getGreeting();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 p-6 lg:p-8"
        >
            {/* Header Section */}
            <motion.header
                variants={itemVariants}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white font-display">
                        {greeting}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Here's what's happening with your learning journey
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Refresh Button */}
                    <button
                        onClick={refetchAll}
                        className={clsx(
                            'p-2.5 rounded-xl',
                            'bg-slate-800/50 border border-white/5',
                            'text-slate-400 hover:text-white',
                            'transition-all duration-300',
                            'hover:bg-slate-800 hover:border-white/10',
                            isLoading && 'animate-spin'
                        )}
                        disabled={isLoading}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>

                    {/* Notifications */}
                    <button
                        className={clsx(
                            'relative p-2.5 rounded-xl',
                            'bg-slate-800/50 border border-white/5',
                            'text-slate-400 hover:text-white',
                            'transition-all duration-300',
                            'hover:bg-slate-800 hover:border-white/10'
                        )}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                    </button>
                </div>
            </motion.header>

            {/* Stats Grid */}
            <motion.section variants={itemVariants}>
                {data?.stats && (
                    <DashboardGrid stats={data.stats} isLoading={isLoading} />
                )}
            </motion.section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Continue Learning - Spans 2 columns */}
                <motion.section
                    variants={itemVariants}
                    className="lg:col-span-2 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-indigo-400" />
                            Continue Learning
                        </h2>
                        <a
                            href="/courses"
                            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                            View All <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="space-y-3">
                        {data?.courseProgress?.slice(0, 4).map((course, index) => (
                            <CourseProgressCard
                                key={course.courseId}
                                course={course}
                                index={index}
                                onContinue={() => { /* Continue course logic */ }}
                            />
                        ))}

                        {/* Empty State */}
                        {(!data?.courseProgress || data.courseProgress.length === 0) && !isLoading && (
                            <EmptyState
                                title="No courses yet"
                                description="Start your learning journey by enrolling in a course"
                                actionLabel="Browse Courses"
                                actionHref="/courses"
                            />
                        )}
                    </div>
                </motion.section>

                {/* Upcoming Exams - Right Sidebar */}
                <motion.section
                    variants={itemVariants}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-400" />
                            Upcoming Exams
                        </h2>
                    </div>

                    <div className="glass-card p-4 space-y-4">
                        {data?.upcomingExams?.slice(0, 3).map((exam) => (
                            <ExamItem key={exam.id} exam={exam} />
                        ))}

                        {(!data?.upcomingExams || data.upcomingExams.length === 0) && !isLoading && (
                            <p className="text-center text-slate-500 py-4 text-sm">
                                No upcoming exams
                            </p>
                        )}
                    </div>
                </motion.section>
            </div>
        </motion.div>
    );
}

// ============================================================
// Helper Components
// ============================================================

interface ExamItemProps {
    exam: {
        id: string;
        title: string;
        courseTitle: string;
        scheduledAt: string;
        duration: number;
    };
}

function ExamItem({ exam }: ExamItemProps) {
    const examDate = new Date(exam.scheduledAt);
    const formattedDate = examDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
    const formattedTime = examDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 flex flex-col items-center justify-center">
                <span className="text-xs text-amber-400 font-medium">
                    {formattedDate.split(' ')[0]}
                </span>
                <span className="text-lg font-bold text-amber-400">
                    {formattedDate.split(' ')[1]}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{exam.title}</h4>
                <p className="text-xs text-slate-400 truncate">{exam.courseTitle}</p>
                <p className="text-xs text-slate-500 mt-1">
                    {formattedTime} • {exam.duration} min
                </p>
            </div>
        </div>
    );
}

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
}

function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
    return (
        <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-white font-medium mb-1">{title}</h3>
            <p className="text-slate-400 text-sm mb-4">{description}</p>
            <a
                href={actionHref}
                className="btn-primary inline-flex items-center gap-2 text-sm"
            >
                {actionLabel}
                <ChevronRight className="w-4 h-4" />
            </a>
        </div>
    );
}

// ============================================================
// Utility Functions
// ============================================================

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}
