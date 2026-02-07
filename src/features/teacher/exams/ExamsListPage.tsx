import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Clock, FileQuestion, Users, MoreVertical, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/client';
import { toast } from 'sonner';

interface Exam {
    id: string;
    title: string;
    courseTitle: string | null;
    status: 'draft' | 'published';
    questionsCount: number;
    duration: number;
    attemptsCount: number;
    createdAt: string;
}

export function ExamsListPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    const basePath = user?.role === 'assistant' ? '/assistant' : '/admin';

    useEffect(() => {
        apiClient.get('/admin/exams')
            .then(res => setExams(res.data.items || []))
            .catch(err => {
                console.error('Failed to load exams:', err);
                toast.error('فشل تحميل الامتحانات');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الامتحان؟')) return;

        try {
            await apiClient.post(`/admin/exams/${id}/delete`);
            setExams(prev => prev.filter(e => e.id !== id));
            toast.success('تم حذف الامتحان بنجاح');
        } catch (err) {
            toast.error('فشل حذف الامتحان');
        }
    };

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exam.courseTitle && exam.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">بنك الأسئلة والامتحانات</h1>
                    <p className="text-[var(--text-secondary)] font-medium">قم بإنشاء وتصحيح الامتحانات، ومتابعة أداء الطلاب.</p>
                </div>
                <button
                    onClick={() => navigate(`${basePath}/exams/new`)}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-1"
                >
                    <Plus className="w-5 h-5" />
                    <span>امتحان جديد</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        placeholder="ابحث عن امتحان..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none transition-colors"
                    />
                </div>
                <button className="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold flex items-center gap-2 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>تصفية</span>
                </button>
            </div>

            {/* Exams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* New Exam Card */}
                <button
                    onClick={() => navigate(`${basePath}/exams/new`)}
                    className="border-2 border-dashed border-[var(--border-color)] rounded-2xl flex flex-col items-center justify-center gap-4 p-8 text-[var(--text-secondary)] hover:border-cyan-500 hover:text-cyan-500 hover:bg-cyan-500/5 transition-all group min-h-[250px]"
                >
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-main)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-[var(--border-color)]">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-lg">إنشاء امتحان جديد</span>
                </button>

                {filteredExams.map((exam) => (
                    <div
                        key={exam.id}
                        className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col"
                    >
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${exam.status === 'published'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    {exam.status === 'published' ? 'منشور' : 'مسودة'}
                                </div>
                                <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-lg font-black text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-cyan-500 transition-colors">
                                {exam.title}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] font-bold mb-6 flex items-center gap-1">
                                <span>تابع لـ:</span>
                                <span className={exam.courseTitle ? "text-[var(--text-primary)]" : "text-amber-500"}>
                                    {exam.courseTitle || 'غير مربوط بكورس'}
                                </span>
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                                    <FileQuestion className="w-4 h-4 text-cyan-500" />
                                    <span>{exam.questionsCount} سؤال</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                                    <Clock className="w-4 h-4 text-cyan-500" />
                                    <span>{exam.duration} دقيقة</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                                    <Users className="w-4 h-4 text-cyan-500" />
                                    <span>{exam.attemptsCount} محاولة</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-[var(--bg-main)] p-4 border-t border-[var(--border-color)] flex justify-between items-center gap-2">
                            <button
                                onClick={() => navigate(`${basePath}/exams/${exam.id}`)}
                                className="flex-1 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:border-cyan-500 hover:text-cyan-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit2 className="w-3 h-3" />
                                تعديل
                            </button>
                            <button
                                onClick={() => handleDelete(exam.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
