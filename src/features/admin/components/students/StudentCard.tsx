import { Link } from 'react-router-dom';
import {
    MoreVertical,
    CheckCircle,
    Ban,
    Clock,
    BookOpen,
    Trash2,
    MapPin,
    GraduationCap,
    Phone
} from 'lucide-react';
import { Student } from '../../services/StudentService';
import { getAvatarUrl } from '@/utils/fileUrl';
import { useState } from 'react';

interface StudentCardProps {
    student: Student;
    onUpdateStatus: (id: string, status: 'active' | 'blocked') => void;
    onDelete: (id: string) => void;
}

export function StudentCard({ student, onUpdateStatus, onDelete }: StudentCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; text: string; icon: any }> = {
            active: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle },
            pending: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: Clock },
            blocked: { bg: 'bg-red-500/10', text: 'text-red-500', icon: Ban },
        };
        const style = styles[status] || styles.pending;
        return (
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${style.bg} ${style.text} border border-current/10`}>
                <style.icon className="w-3 h-3" />
                {status === 'active' ? 'نشط' : status === 'pending' ? 'قيد المراجعة' : 'محظور'}
            </span>
        );
    };

    return (
        <div className="bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] overflow-hidden hover:border-brand-500/30 transition-all hover:translate-y-[-4px] shadow-sm hover:shadow-lg group">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-color)]">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-br from-blue-500 to-cyan-400">


                                <img
                                    src={getAvatarUrl(student.avatar, student.email)}
                                    alt={student.name}
                                    className="w-full h-full rounded-[14px] bg-[var(--bg-main)] object-cover"
                                />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--bg-secondary)] ${student.status === 'active' ? 'bg-emerald-500' : student.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        </div>
                        <div>
                            <h3 className="font-black text-[var(--text-primary)] text-lg font-display mb-0.5">{student.name}</h3>
                            <p className="text-xs text-[var(--text-secondary)] opacity-70 font-medium font-mono">{student.email}</p>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                            className="p-2 hover:bg-[var(--bg-main)] rounded-xl transition-colors text-[var(--text-secondary)] opacity-60 hover:opacity-100"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute left-0 top-full mt-2 w-48 bg-[var(--bg-secondary)] rounded-2xl shadow-xl border border-[var(--border-color)] p-1.5 z-20 animate-in fade-in zoom-in-95 duration-200">
                                <Link
                                    to={`/admin/students/${student.id}`}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] rounded-xl transition-colors"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    عرض التفاصيل
                                </Link>
                                {student.status !== 'active' && (
                                    <button
                                        onClick={() => onUpdateStatus(student.id, 'active')}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        تفعيل الحساب
                                    </button>
                                )}
                                {student.status === 'active' && (
                                    <button
                                        onClick={() => onUpdateStatus(student.id, 'blocked')}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors"
                                    >
                                        <Ban className="w-4 h-4" />
                                        حظر الحساب
                                    </button>
                                )}
                                <div className="h-px bg-[var(--border-color)] my-1" />
                                <button
                                    onClick={() => onDelete(student.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    حذف الطالب
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {getStatusBadge(student.status)}
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                        <GraduationCap className="w-3 h-3" />
                        {student.gradeLevel || 'غير محدد'}
                    </span>
                </div>
            </div>

            {/* Stats / Footer */}
            <div className="p-6 grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[var(--text-secondary)] opacity-60 font-bold">الموقع</span>
                    <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate max-w-[100px]">{student.city || '---'}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[var(--text-secondary)] opacity-60 font-bold">الهاتف</span>
                    <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)] dir-ltr">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-mono text-xs">{student.phone}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
