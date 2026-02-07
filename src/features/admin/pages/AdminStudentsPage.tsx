// ============================================================
// Admin Students Page
// ============================================================

import { useState, useEffect } from 'react';
import { Search, Users, Filter, Download } from 'lucide-react';
import { Student, studentService } from '../services/StudentService';
import { StudentsList } from '../components/students/StudentsList';

export function AdminStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked' | 'pending'>('all');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const data = await studentService.getAllStudents();
            setStudents(data);
        } catch (error) {
            console.error('Failed to load students', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'active' | 'blocked') => {
        if (!confirm('هل أنت متأكد من تغيير حالة الطالب؟')) return;
        try {
            await studentService.updateStatus(id, status);
            loadStudents(); // Refresh list
        } catch (error) {
            alert('حدث خطأ أثناء تحديث الحالة');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الطالب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        try {
            await studentService.deleteStudent(id);
            setStudents(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            alert('حدث خطأ أثناء حذف الطالب');
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.phone.includes(searchQuery);

        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2 font-display">إدارة الطلاب</h1>
                    <p className="text-[var(--text-secondary)] opacity-80 font-medium">عرض وإدارة حسابات الطلاب المسجلين في المنصة</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)]">
                        <Users className="w-4 h-4" />
                        <span>{students.length} طالب</span>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-50" />
                    <input
                        type="text"
                        placeholder="بحث باسم الطالب، البريد الإلكتروني، أو رقم الهاتف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pr-12 pl-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none font-medium"
                    />
                </div>

                <div className="md:col-span-3">
                    <div className="relative">
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-50" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full h-12 pr-12 pl-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none font-medium appearance-none cursor-pointer"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="pending">معلق</option>
                            <option value="blocked">محظور</option>
                        </select>
                    </div>
                </div>

                <div className="md:col-span-3">
                    <button className="w-full h-12 flex items-center justify-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--bg-main)] transition-colors">
                        <Download className="w-5 h-5" />
                        تصدير البيانات
                    </button>
                </div>
            </div>

            {/* Students List */}
            <StudentsList
                students={filteredStudents}
                loading={loading}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
            />
        </div>
    );
}
