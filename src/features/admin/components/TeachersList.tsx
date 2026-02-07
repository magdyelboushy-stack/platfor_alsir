import { Teacher } from '../services/TeacherService';
import { TeacherCard } from './TeacherCard';
import { Users } from 'lucide-react';

interface TeachersListProps {
    teachers: Teacher[];
    loading: boolean;
    onUpdateStatus: (id: string, status: 'active' | 'blocked') => void;
    onDelete: (id: string) => void;
    onAddClick: () => void;
}

export function TeachersList({ teachers, loading, onUpdateStatus, onDelete, onAddClick }: TeachersListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[280px] bg-[var(--bg-secondary)] rounded-[2rem] animate-pulse border border-[var(--border-color)]" />
                ))}
            </div>
        );
    }

    if (teachers.length === 0) {
        return (
            <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] border-dashed">
                <div className="w-20 h-20 mx-auto bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-[var(--text-secondary)] opacity-20" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 font-display">لا يوجد معلمين</h3>
                <p className="text-sm text-[var(--text-secondary)] opacity-60 mb-6 font-bold">لم يتم العثور على معلمين مطابقين للبحث</p>
                <button
                    onClick={onAddClick}
                    className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
                >
                    إضافة معلم جديد
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
                <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    onUpdateStatus={onUpdateStatus}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
