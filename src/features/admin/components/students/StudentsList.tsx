import { StudentCard } from './StudentCard';
import { Student } from '../../services/StudentService';
import { Users } from 'lucide-react';

interface StudentsListProps {
    students: Student[];
    loading: boolean;
    onUpdateStatus: (id: string, status: 'active' | 'blocked') => void;
    onDelete: (id: string) => void;
}

export function StudentsList({ students, loading, onUpdateStatus, onDelete }: StudentsListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-[var(--bg-secondary)] h-[280px] rounded-[2rem] border border-[var(--border-color)] p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-main)]" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-2/3 bg-[var(--bg-main)] rounded-lg" />
                                <div className="h-3 w-1/2 bg-[var(--bg-main)] rounded-lg" />
                            </div>
                        </div>
                        <div className="h-20 bg-[var(--bg-main)] rounded-xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] border-dashed">
                <div className="w-20 h-20 mx-auto rounded-full bg-[var(--bg-main)] flex items-center justify-center mb-6 shadow-inner">
                    <Users className="w-10 h-10 text-[var(--text-secondary)] opacity-40" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 font-display">لا يوجد طلاب</h3>
                <p className="text-[var(--text-secondary)] opacity-60">لم يتم العثور على أي طلاب مطابقين للبحث</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
                <StudentCard
                    key={student.id}
                    student={student}
                    onUpdateStatus={onUpdateStatus}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
