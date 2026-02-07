
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { SettingsProvider } from '@/contexts/SettingsContext';

import { Toasts } from '@/core/components/Toasts';
import type { UserRole } from '@/core/types/common';

// Admin Layout (used for all admin/teacher functionality)
import { AdminLayout } from '@/features/admin/layouts/AdminLayout';

// Lazy load pages
const HomePage = lazy(() => import('@/features/home/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('@/features/auth/components/LoginForm').then(m => ({ default: m.LoginForm })));
const RegisterPage = lazy(() => import('@/features/auth/components/RegisterForm').then(m => ({ default: m.RegisterForm })));
const StaffLoginPage = lazy(() => import('@/features/auth/components/StaffLoginPage').then(m => ({ default: m.StaffLoginPage })));
const AboutPage = lazy(() => import('@/features/about/AboutPage').then(m => ({ default: m.AboutPage })));
const CoursesPage = lazy(() => import('@/features/courses/CoursesPage').then(m => ({ default: m.CoursesPage })));
const CourseDetailsPage = lazy(() => import('@/features/courses/CourseDetailsPage').then(m => ({ default: m.CourseDetailsPage })));
const CoursePlayerPage = lazy(() => import('@/features/courses/CoursePlayerPage').then(m => ({ default: m.CoursePlayerPage })));
const FilesPage = lazy(() => import('@/features/courses/FilesPage').then(m => ({ default: m.FilesPage })));
const ExamPage = lazy(() => import('@/features/exams/ExamPage').then(m => ({ default: m.ExamPage })));
const ExamReviewPage = lazy(() => import('@/features/exams/ExamReviewPage').then(m => ({ default: m.ExamReviewPage })));
const StudentDashboardPage = lazy(() => import('@/features/dashboard/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })));
const StudentProfilePage = lazy(() => import('@/features/teacher/students/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));
const EvaluationsListPage = lazy(() => import('@/features/evaluations/EvaluationsList'));
// Teacher functionality (now used by Admin)
const TeacherDashboardPage = lazy(() => import('@/features/teacher/pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const TeacherCoursesPage = lazy(() => import('@/features/teacher/courses/CoursesListPage').then(m => ({ default: m.CoursesListPage })));
const CreateCoursePage = lazy(() => import('@/features/teacher/courses/CreateCoursePage').then(m => ({ default: m.CreateCoursePage })));
const EditCoursePage = lazy(() => import('@/features/teacher/courses/EditCoursePage').then(m => ({ default: m.EditCoursePage })));
const ExamsListPage = lazy(() => import('@/features/teacher/exams/ExamsListPage').then(m => ({ default: m.ExamsListPage })));
const ExamEditorPage = lazy(() => import('@/features/teacher/exams/ExamEditorPage').then(m => ({ default: m.ExamEditorPage })));
const FilesManagerPage = lazy(() => import('@/features/teacher/files/FilesManagerPage').then(m => ({ default: m.FilesManagerPage })));
const CodesManagerPage = lazy(() => import('@/features/teacher/codes/CodesManagerPage').then(m => ({ default: m.CodesManagerPage })));
const StudentsManagerPage = lazy(() => import('@/features/teacher/students/StudentsManagerPage').then(m => ({ default: m.StudentsManagerPage })));
const RequestsManagerPage = lazy(() => import('@/features/teacher/requests/RequestsManagerPage').then(m => ({ default: m.RequestsManagerPage })));
const HomeworkManagerPage = lazy(() => import('@/features/teacher/homework/HomeworkManagerPage').then(m => ({ default: m.HomeworkManagerPage })));
const AssistantsManagerPage = lazy(() => import('@/features/teacher/assistants/AssistantsManagerPage').then(m => ({ default: m.AssistantsManagerPage })));
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const TeacherWalletPage = lazy(() => import('@/features/teacher/wallet/TeacherWalletPage').then(m => ({ default: m.TeacherWalletPage })));
const TeacherSupportPage = lazy(() => import('@/features/teacher/support/TeacherSupportPage').then(m => ({ default: m.TeacherSupportPage })));

// Dashboard Sections (Lazy Loaded)
const CoursesSection = lazy(() => import('@/features/dashboard/sections/CoursesSection').then(m => ({ default: m.CoursesSection })));
const ExamResultsSection = lazy(() => import('@/features/dashboard/sections/ExamResultsSection').then(m => ({ default: m.ExamResultsSection })));
const HomeworkResultsSection = lazy(() => import('@/features/dashboard/sections/HomeworkResultsSection').then(m => ({ default: m.HomeworkResultsSection })));
const HomeworkVideosSection = lazy(() => import('@/features/dashboard/sections/HomeworkVideosSection').then(m => ({ default: m.HomeworkVideosSection })));
const BillingSection = lazy(() => import('@/features/dashboard/sections/BillingSection').then(m => ({ default: m.BillingSection })));
const SettingsSection = lazy(() => import('@/features/dashboard/sections/SettingsSection').then(m => ({ default: m.SettingsSection })));
const NotificationsSection = lazy(() => import('@/features/dashboard/sections/NotificationsSection').then(m => ({ default: m.NotificationsSection })));
const UploadSection = lazy(() => import('@/features/dashboard/sections/UploadSection').then(m => ({ default: m.UploadSection })));
const SupportSection = lazy(() => import('@/features/dashboard/sections/SupportSection').then(m => ({ default: m.SupportSection })));

// Assistant Pages
import { AssistantLayout } from '@/features/assistant/layouts/AssistantLayout';
import { PermissionGuard } from '@/core/components/PermissionGuard';
const AssistantDashboardPage = lazy(() => import('@/features/assistant/pages/AssistantDashboard').then(m => ({ default: m.AssistantDashboardPage })));

// Admin Pages
const AdminReportsPage = lazy(() => import('@/features/admin/pages/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));
const AdminActivityLogsPage = lazy(() => import('@/features/admin/pages/AdminActivityLogsPage').then(m => ({ default: m.AdminActivityLogsPage })));
const EvaluationManagerPage = lazy(() => import('@/features/admin/pages/EvaluationManager'));
const ContactMessagesPage = lazy(() => import('@/features/admin/pages/ContactMessagesPage'));

// Profile Section
const ProfileSection = lazy(() => import('@/features/dashboard/sections/ProfileSection').then(m => ({ default: m.ProfileSection })));

// Loading Fallback
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
            <div className="w-12 h-12 border-4 rounded-full border-cyan-500/30 border-t-cyan-500 animate-spin" />
        </div>
    );
}

// Protected Route Wrapper - For logged-in users only
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) {
    const { isAuthenticated, user, logout, hasRole } = useAuthStore();
    const { showToast } = useUIStore();

    useEffect(() => {
        if (!isAuthenticated) return;

        // Role check side-effect
        if (isAuthenticated && allowedRoles && !hasRole(allowedRoles)) {
            showToast({
                type: 'error',
                title: 'غير مصرح',
                message: 'ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.',
            });
        }

        // Account status side-effects
        if (user?.status === 'pending') {
            logout();
            showToast({
                type: 'warning',
                title: 'حسابك قيد المراجعة',
                message: 'سيتم تفعيل حسابك فور مراجعة البيانات من قبل الإدارة.',
            });
        } else if (user?.status === 'blocked') {
            logout();
            showToast({
                type: 'error',
                title: 'حساب محظور',
                message: 'تم تعطيل حسابك. يرجى التواصل مع الدعم الفني للاستفسار.',
            });
        }
    }, [isAuthenticated, user, allowedRoles, hasRole, logout, showToast]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role check redirect (render logic only)
    if (allowedRoles && !hasRole(allowedRoles)) {
        if (user?.role === 'student') return <Navigate to="/dashboard" replace />;
        if (user?.role === 'assistant') return <Navigate to="/assistant/dashboard" replace />;
        if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

        return <Navigate to="/" replace />;
    }

    // Handle account status redirect (render logic only)
    if (user?.status === 'pending' || user?.status === 'blocked') {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

// Public Route Wrapper - Only for non-authenticated users (login/register)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated) {
        if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user?.role === 'assistant') return <Navigate to="/assistant/dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

import { useThemeStore } from '@/store/themeStore';
import { useEffect } from 'react';

export default function App() {
    const { theme } = useThemeStore();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const fetchUser = useAuthStore((s) => s.fetchUser);

    useEffect(() => {
        // Apply theme to html element for global tailwind dark mode
        document.documentElement.className = theme;
    }, [theme]);

    // جلب بيانات المستخدم من /auth/me عند فتح التطبيق (لتحديث الأفاتار من DB)
    useEffect(() => {
        if (isAuthenticated) fetchUser();
    }, [isAuthenticated, fetchUser]);

    // Content Protection: Enhanced Anti-Inspect
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const isForbidden =
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
                (e.ctrlKey && e.key.toUpperCase() === 'U');

            if (isForbidden) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        window.addEventListener('contextmenu', handleContextMenu, { capture: true });
        window.addEventListener('keydown', handleKeyDown, { capture: true });

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
        };
    }, []);

    return (
        <SettingsProvider>
            <div className={theme}>
                <Toasts />
                <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300">
                    <Suspense fallback={<LoadingScreen />}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                            <Route path="/admin/login" element={<PublicRoute><StaffLoginPage /></PublicRoute>} />
                            <Route path="/assistant/login" element={<PublicRoute><StaffLoginPage /></PublicRoute>} />

                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/courses" element={<CoursesPage />} />
                            <Route path="/mozakrat" element={<EvaluationsListPage />} />
                            <Route path="/course/:id" element={<CourseDetailsPage />} />
                            <Route path="/course/:courseId/learn/:lessonId" element={<CoursePlayerPage />} />
                            <Route path="/course/:courseId/files" element={<FilesPage />} />
                            <Route path="/course/:courseId/exam/:examId" element={<ExamPage />} />
                            <Route
                                path="/exam/review/:attemptId"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'assistant', 'admin']}>
                                        <ExamReviewPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Student Dashboard Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'parent', 'admin']}>
                                        <StudentDashboardPage />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<Navigate to="profile" replace />} />
                                <Route path="profile" element={<ProfileSection />} />
                                <Route path="courses" element={<CoursesSection />} />
                                <Route path="exams" element={<ExamResultsSection />} />
                                <Route path="homework" element={<HomeworkResultsSection />} />
                                <Route path="upload" element={<UploadSection />} />
                                <Route path="homework-videos" element={<HomeworkVideosSection />} />
                                <Route path="billing" element={<BillingSection />} />
                                <Route path="wallet" element={<Navigate to="../billing" replace />} />
                                <Route path="subscriptions" element={<Navigate to="../billing" replace />} />
                                <Route path="support" element={<SupportSection />} />
                                <Route path="notifications" element={<NotificationsSection />} />
                                <Route path="settings" element={<SettingsSection />} />
                            </Route>

                            {/* Assistant Dashboard Routes */}
                            <Route
                                path="/assistant"
                                element={
                                    <ProtectedRoute allowedRoles={['assistant', 'admin']}>
                                        <AssistantLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route path="dashboard" element={<AssistantDashboardPage />} />

                                <Route path="students" element={
                                    <PermissionGuard permission="students">
                                        <StudentsManagerPage />
                                    </PermissionGuard>
                                } />
                                <Route path="students/:id" element={
                                    <PermissionGuard permission="students">
                                        <StudentProfilePage />
                                    </PermissionGuard>
                                } />
                                <Route path="grading" element={
                                    <PermissionGuard permission="homework">
                                        <HomeworkManagerPage />
                                    </PermissionGuard>
                                } />

                                <Route path="exams">
                                    <Route index element={
                                        <PermissionGuard permission="exams">
                                            <ExamsListPage />
                                        </PermissionGuard>
                                    } />
                                    <Route path="new" element={
                                        <PermissionGuard permission="exams">
                                            <ExamEditorPage />
                                        </PermissionGuard>
                                    } />
                                    <Route path=":id" element={
                                        <PermissionGuard permission="exams">
                                            <ExamEditorPage />
                                        </PermissionGuard>
                                    } />
                                </Route>

                                <Route path="requests" element={
                                    <PermissionGuard permission="requests">
                                        <RequestsManagerPage />
                                    </PermissionGuard>
                                } />

                                <Route path="codes" element={
                                    <PermissionGuard permission="codes">
                                        <CodesManagerPage />
                                    </PermissionGuard>
                                } />

                                <Route path="support" element={
                                    <PermissionGuard permission="support">
                                        <TeacherSupportPage />
                                    </PermissionGuard>
                                } />

                                <Route path="courses">
                                    <Route index element={
                                        <PermissionGuard permission="courses">
                                            <TeacherCoursesPage />
                                        </PermissionGuard>
                                    } />
                                    <Route path="new" element={
                                        <PermissionGuard permission="courses">
                                            <CreateCoursePage />
                                        </PermissionGuard>
                                    } />
                                    <Route path=":id" element={
                                        <PermissionGuard permission="courses">
                                            <EditCoursePage />
                                        </PermissionGuard>
                                    } />
                                </Route>

                                <Route path="files" element={
                                    <PermissionGuard permission="files">
                                        <FilesManagerPage />
                                    </PermissionGuard>
                                } />

                                <Route path="wallet" element={
                                    <PermissionGuard permission="wallet">
                                        <TeacherWalletPage />
                                    </PermissionGuard>
                                } />

                                <Route path="homework" element={
                                    <PermissionGuard permission="homework">
                                        <HomeworkManagerPage />
                                    </PermissionGuard>
                                } />
                            </Route>

                            {/* Admin Dashboard Routes (Admin = Teacher in single-teacher mode) */}
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                <Route path="dashboard" element={<TeacherDashboardPage />} />

                                {/* Course Management (Teacher functionality) */}
                                <Route path="courses" element={<TeacherCoursesPage />} />
                                <Route path="courses/new" element={<CreateCoursePage />} />
                                <Route path="courses/:id" element={<EditCoursePage />} />

                                {/* Exam Management */}
                                <Route path="exams" element={<ExamsListPage />} />
                                <Route path="exams/new" element={<ExamEditorPage />} />
                                <Route path="exams/:id" element={<ExamEditorPage />} />

                                {/* Files Management */}
                                <Route path="files" element={<FilesManagerPage />} />

                                {/* Activation Codes */}
                                <Route path="codes" element={<CodesManagerPage />} />

                                {/* Student Management */}
                                <Route path="students" element={<StudentsManagerPage />} />
                                <Route path="students/:id" element={<StudentProfilePage />} />

                                {/* Registration Requests */}
                                <Route path="registrations" element={<RequestsManagerPage />} />

                                {/* Homework */}
                                <Route path="homework" element={<HomeworkManagerPage />} />

                                {/* Assistants */}
                                <Route path="assistants" element={<AssistantsManagerPage />} />

                                {/* Financial */}
                                <Route path="wallet" element={<TeacherWalletPage />} />
                                <Route path="reports" element={<AdminReportsPage />} />

                                {/* System */}
                                <Route path="logs" element={<AdminActivityLogsPage />} />
                                <Route path="settings" element={<AdminSettingsPage />} />
                                <Route path="evaluations" element={<EvaluationManagerPage />} />
                                <Route path="support" element={<TeacherSupportPage />} />
                                <Route path="contact-messages" element={<ContactMessagesPage />} />
                            </Route>

                            {/* Legacy redirect: /teacher/* -> /admin/* */}
                            <Route path="/teacher/*" element={<Navigate to="/admin/dashboard" replace />} />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </div>
            </div>
        </SettingsProvider>
    );
}
