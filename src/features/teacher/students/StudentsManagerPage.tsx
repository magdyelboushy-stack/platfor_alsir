import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LayoutGrid, List, CheckCircle } from 'lucide-react';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useToast } from '@/store/uiStore';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Components
import { StudentFilters } from '../components/students/StudentFilters';
import { StudentCard } from '../components/students/StudentCard';
import { ParentCard } from '../components/students/ParentCard';
import { StudentStatsCharts } from '../components/students/StudentStatsCharts';
import { StudentEditModal } from '../components/students/StudentEditModal';

export function StudentsManagerPage() {
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [directoryType, setDirectoryType] = useState<'students' | 'parents'>('students');

    // Selection State
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ stage: '', grade: '' });

    const toast = useToast();

    // Navigation base path for teacher/assistant
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const basePath = user?.role === 'assistant' ? '/assistant' : '/admin';

    // Fetch Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [studentsRes, statsRes] = await Promise.all([
                apiClient.get(ENDPOINTS.ADMIN.LIST_ACTIVE_STUDENTS),
                apiClient.get(ENDPOINTS.ADMIN.GET_STUDENT_STATS)
            ]);
            setAllStudents(studentsRes.data);
            setFilteredStudents(studentsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch students data:', error);
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: 'حدث خطأ أثناء جلب بيانات الطلاب'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = allStudents;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(term) ||
                s.phone.includes(term) ||
                (s.email && s.email.toLowerCase().includes(term))
            );
        }

        if (filters.stage) {
            result = result.filter(s => s.educationStage === filters.stage);
        }

        if (filters.grade) {
            result = result.filter(s => s.gradeLevel === filters.grade);
        }

        setFilteredStudents(result);
    }, [searchTerm, filters, allStudents]);

    const handleFilterChange = (key: string, val: string) => {
        setFilters(prev => ({ ...prev, [key]: val }));
    };

    const handleOpenEditModal = (student: any) => {
        setSelectedStudent(student);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (data: any) => {
        if (!selectedStudent) return;
        setIsUpdating(true);
        try {
            await apiClient.post(ENDPOINTS.ADMIN.UPDATE_STUDENT(selectedStudent.id), data);
            toast.show({
                type: 'success',
                title: 'تم التحديث',
                message: 'تم تحديث بيانات الطالب بنجاح'
            });
            setIsEditModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل تحديث بيانات الطالب'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-10 p-6 lg:p-8" dir="rtl">
            {/* Header with Stats Highlights */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="text-right">
                    <h1 className="text-2xl lg:text-4xl font-black text-[var(--text-primary)] font-display tracking-tight">
                        إدارة <span className="text-gradient">الطلاب والمتابعة</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2 font-medium opacity-80 max-w-xl">
                        متابعة قائمة الطلاب النشطين، تحليل البيانات الديموغرافية، وإدارة الحسابات المسجلة.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <QuickStat label="إجمالي الطلاب" value={stats?.total || 0} icon={Users} color="brand" />
                    <QuickStat label="نشط اليوم" value={Math.floor((stats?.total || 0) * 0.4)} icon={CheckCircle} color="indigo" />
                </div>
            </div>

            {/* Statistics Charts Section */}
            <AnimatePresence>
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="animate-in fade-in duration-700"
                    >
                        <StudentStatsCharts stats={stats} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters & Control Bar */}
            <div className="sticky top-0 z-30 pt-4 pb-2 bg-[var(--bg-main)]/80 backdrop-blur-md">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div className="w-full lg:max-w-3xl">
                        <StudentFilters
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        <div className="flex bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 p-1 rounded-2xl shadow-sm flex-1 lg:flex-none">
                            <button
                                onClick={() => setDirectoryType('students')}
                                className={clsx(
                                    "px-4 lg:px-6 py-2.5 rounded-xl text-[10px] lg:text-xs font-black transition-all flex-1 lg:flex-none",
                                    directoryType === 'students' ? "bg-brand-500 text-white shadow-md" : "text-[var(--text-secondary)] hover:bg-brand-500/10"
                                )}
                            >
                                دليل الطلاب
                            </button>
                            <button
                                onClick={() => setDirectoryType('parents')}
                                className={clsx(
                                    "px-4 lg:px-6 py-2.5 rounded-xl text-[10px] lg:text-xs font-black transition-all flex-1 lg:flex-none",
                                    directoryType === 'parents' ? "bg-brand-500 text-white shadow-md" : "text-[var(--text-secondary)] hover:bg-brand-500/10"
                                )}
                            >
                                دليل أولياء الأمور
                            </button>
                        </div>

                        <div className="flex items-center gap-2 p-1.5 bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 rounded-2xl shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={clsx(
                                    "p-2.5 rounded-xl transition-all",
                                    viewMode === 'grid' ? "bg-brand-500 text-white shadow-md" : "text-[var(--text-secondary)] hover:bg-brand-500/10"
                                )}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={clsx(
                                    "p-2.5 rounded-xl transition-all",
                                    viewMode === 'list' ? "bg-brand-500 text-white shadow-md" : "text-[var(--text-secondary)] hover:bg-brand-500/10"
                                )}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students Grid */}
            <div className={clsx(
                "grid gap-6 transition-all duration-500",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
                ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                        directoryType === 'students' ? (
                            <StudentCard
                                key={student.id}
                                student={student}
                                onRefresh={fetchData}
                                onEdit={handleOpenEditModal}
                                onView={(s) => navigate(`${basePath}/students/${s.id}`, { state: { student: s } })}
                            />
                        ) : (
                            <ParentCard
                                key={`parent-${student.id}`}
                                student={student}
                                onViewStudent={(s) => navigate(`${basePath}/students/${s.id}`, { state: { student: s } })}
                            // Note: ParentCard might not need edit yet, but we have it for onView
                            />
                        )
                    ))
                ) : (
                    <div className="lg:col-span-3 py-20 flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mb-4 border border-brand-500/10">
                            <Users className="w-10 h-10 text-brand-500" />
                        </div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">لا يوجد طلاب متوافقين</h3>
                        <p className="text-[var(--text-secondary)] font-bold mt-1">حاول تغيير معايير البحث أو الفلاتر.</p>
                    </div>
                )}
            </div>
            {/* Full Profile Modal */}
            {/* Standalone page is used instead of modal */}
            {/*
            <StudentProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                student={selectedStudent}
                onEdit={handleOpenEditModal}
                onRefresh={fetchData}
            />
            */}

            <StudentEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={selectedStudent}
                onSubmit={handleEditSubmit}
                isUpdating={isUpdating}
            />
        </div>
    );
}

function QuickStat({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: 'brand' | 'indigo' }) {
    return (
        <div className={clsx(
            "px-6 py-3 rounded-2xl border backdrop-blur-md flex items-center gap-4 transition-all duration-500 group",
            "bg-white/40 dark:bg-[var(--bg-card)] border-brand-500/10 shadow-sm hover:border-brand-500/30",
            color === 'brand' ? "hover:shadow-brand-500/5" : "hover:shadow-indigo-500/5"
        )}>
            <div className={clsx(
                "w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
                color === 'brand' ? "bg-brand-500/10 border-brand-500/10 text-brand-500" : "bg-indigo-500/10 border-indigo-500/10 text-indigo-500"
            )}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-[var(--text-secondary)] opacity-60 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-[var(--text-primary)] font-display tracking-tight">{value.toLocaleString()}</p>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="p-6 rounded-[2.5rem] bg-white/20 dark:bg-white/5 border border-brand-500/5 h-80 animate-pulse relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2 opacity-50" />
                </div>
            </div>
            <div className="space-y-4">
                <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-[2rem] opacity-40" />
            </div>
        </div>
    );
}
