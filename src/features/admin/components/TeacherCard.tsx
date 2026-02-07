import {
    MoreVertical,
    CheckCircle,
    Ban,
    BookOpen,
    Users,
    GraduationCap,
    Trash2
} from 'lucide-react';
import { Teacher } from '../services/TeacherService';
import { useState } from 'react';
import { getAvatarUrl } from '@/utils/fileUrl';

interface TeacherCardProps {
    teacher: Teacher;
    onUpdateStatus: (id: string, status: 'active' | 'blocked') => void;
    onDelete?: (id: string) => void;
}

export function TeacherCard({ teacher, onUpdateStatus, onDelete }: TeacherCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; text: string; icon: any }> = {
            active: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle },
            pending: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: Users },
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
                            <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-br from-brand-500 to-amber-600">
                                <img
                                    src={getAvatarUrl(teacher.avatar, teacher.email)}
                                    alt={teacher.name}
                                    className="w-full h-full rounded-[14px] bg-[var(--bg-main)] object-cover"
                                />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--bg-secondary)] ${teacher.status === 'active' ? 'bg-emerald-500' : teacher.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        </div>
                        <div>
                            <h3 className="font-black text-[var(--text-primary)] text-lg font-display mb-0.5">{teacher.name}</h3>
                            <p className="text-xs text-[var(--text-secondary)] opacity-70 font-medium font-mono">{teacher.email}</p>
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
                                <a
                                    href={`/admin/teachers/${teacher.id}`}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] rounded-xl transition-colors"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    عرض التفاصيل
                                </a>
                                {teacher.status !== 'active' && (
                                    <button
                                        onClick={() => onUpdateStatus(teacher.id, 'active')}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-emerald-500 hover:bg-emerald-500/5 rounded-xl transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        تفعيل الحساب
                                    </button>
                                )}
                                {teacher.status !== 'blocked' && (
                                    <button
                                        onClick={() => onUpdateStatus(teacher.id, 'blocked')}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/5 rounded-xl transition-colors"
                                    >
                                        <Ban className="w-4 h-4" />
                                        حظر الحساب
                                    </button>
                                )}
                                <div className="h-px bg-[var(--border-color)] my-1" />
                                <button
                                    onClick={() => {
                                        if (window.confirm('هل أنت متأكد من حذف هذا المعلم وجميع بياناته؟ لا يمكن التراجع عن هذه الخطوة.')) {
                                            onDelete?.(teacher.id);
                                        }
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-500/5 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    حذف المعلم نهائياً
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {getStatusBadge(teacher.status)}
                    <span className="text-[10px] text-[var(--text-secondary)] opacity-50 font-bold">
                        {new Date(teacher.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="p-6 grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] group/stat hover:border-brand-500/20 transition-colors">
                    <BookOpen className="w-4 h-4 text-brand-500 mx-auto mb-2 opacity-70 group-hover/stat:opacity-100" />
                    <div className="text-lg font-black text-[var(--text-primary)] mb-0.5">{teacher.stats.courses}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] opacity-50 font-bold">كورسات</div>
                </div>
                <div className="text-center p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] group/stat hover:border-blue-500/20 transition-colors">
                    <Users className="w-4 h-4 text-blue-500 mx-auto mb-2 opacity-70 group-hover/stat:opacity-100" />
                    <div className="text-lg font-black text-[var(--text-primary)] mb-0.5">{teacher.stats.students}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] opacity-50 font-bold">طلاب</div>
                </div>
                <div className="text-center p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] group/stat hover:border-purple-500/20 transition-colors">
                    <GraduationCap className="w-4 h-4 text-purple-500 mx-auto mb-2 opacity-70 group-hover/stat:opacity-100" />
                    <div className="text-lg font-black text-[var(--text-primary)] mb-0.5">{teacher.stats.assistants}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] opacity-50 font-bold">مساعدين</div>
                </div>
            </div>
        </div>
    );
}
