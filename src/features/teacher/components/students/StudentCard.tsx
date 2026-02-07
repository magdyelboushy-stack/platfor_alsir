import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, GraduationCap, MapPin, MoreVertical, Ban, Eye, QrCode } from 'lucide-react';
import { formatEducationValue } from '@/core/utils/educationMapping';
import { getImageUrl } from '@/core/utils/url';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/store/uiStore';
import { clsx } from 'clsx';
import { StudentQRDetailsModal } from './StudentQRDetailsModal';

interface StudentCardProps {
    student: any;
    onView: (student: any) => void;
    onEdit: (student: any) => void;
    onRefresh: () => void;
}

export function StudentCard({ student, onView, onEdit, onRefresh }: StudentCardProps) {
    const { user, hasRole } = useAuthStore();
    const toast = useToast();
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Permissions check: Teacher, Admin, or Assistant with 'students' permission
    const canManage = user?.role === 'teacher' || user?.role === 'admin' ||
        (user?.role === 'assistant' && hasRole('assistant') && (user as any).permissions?.includes('students'));

    const avatarUrl = getImageUrl(student.avatar);

    const handleStatusUpdate = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            await apiClient.post(ENDPOINTS.ADMIN.UPDATE_STUDENT_STATUS(student.id), { status: newStatus });
            toast.show({
                type: 'success',
                title: 'تم التحديث',
                message: 'تم تغيير حالة الطالب بنجاح'
            });
            onRefresh();
        } catch (error: any) {
            // Error is handled by global interceptor if it's a 403/401
            if (error.response?.status !== 403 && error.response?.status !== 401) {
                toast.show({
                    type: 'error',
                    title: 'خطأ',
                    message: error.response?.data?.error || 'فشل تحديث حالة الطالب'
                });
            }
        } finally {
            setIsUpdating(false);
            setIsMenuOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف حساب هذا الطالب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) return;

        setIsUpdating(true);
        try {
            await apiClient.post(ENDPOINTS.ADMIN.DELETE_STUDENT(student.id));
            toast.show({
                type: 'success',
                title: 'تم الحذف',
                message: 'تم حذف حساب الطالب بنجاح'
            });
            onRefresh();
        } catch (error: any) {
            // Error is handled by global interceptor if it's a 403/401
            if (error.response?.status !== 403 && error.response?.status !== 401) {
                toast.show({
                    type: 'error',
                    title: 'خطأ',
                    message: error.response?.data?.error || 'فشل حذف الطالب'
                });
            }
        } finally {
            setIsUpdating(false);
            setIsMenuOpen(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            dir="rtl"
            className="group"
        >
            <div className={clsx(
                "p-6 rounded-[2.5rem] transition-all duration-500 relative overflow-hidden flex flex-col h-full",
                "bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl",
                "hover:border-brand-500/50 hover:shadow-brand-500/20",
                "dark:hover:bg-[var(--dark-panel)]"
            )}>
                {/* Header Information */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                            <div className={clsx(
                                "w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl flex items-center justify-center overflow-hidden border-2 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2 shadow-inner",
                                "bg-brand-500/10 border-brand-500/5"
                            )}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 lg:w-8 lg:h-8 text-brand-500" />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-emerald-500 rounded-full border-2 lg:border-4 border-white dark:border-[#1a1a1a] shadow-sm" />
                        </div>
                        <div className="text-right min-w-0">
                            <h3 className="text-base lg:text-lg font-black text-[var(--text-primary)] font-display line-clamp-1 group-hover:text-[var(--color-brand)] transition-colors truncate">
                                {student.name}
                            </h3>
                            <p className="text-[9px] lg:text-[10px] font-black text-[var(--text-secondary)] opacity-60 flex items-center gap-1.5 mt-0.5">
                                <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-brand-500" />
                                انضم في {student.joinedAt}
                            </p>
                        </div>
                    </div>

                    {canManage && (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 bg-brand-500/5 hover:bg-brand-500/10 text-[var(--text-secondary)] rounded-xl transition-all"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute left-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-2 space-y-1">
                                                {canManage && (
                                                    <button
                                                        onClick={() => {
                                                            onEdit(student);
                                                            setIsMenuOpen(false);
                                                        }}
                                                        className="w-full text-right px-4 py-2 text-[10px] font-black hover:bg-brand-500/10 text-brand-500 rounded-lg transition-colors border-b border-[var(--border-color)] mb-1 pb-2"
                                                    >
                                                        تعديل البيانات
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleStatusUpdate('active')}
                                                    disabled={student.status === 'active' || isUpdating}
                                                    className="w-full text-right px-4 py-2 text-[10px] font-black hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors disabled:opacity-30"
                                                >
                                                    تفعيل الحساب
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate('pending')}
                                                    disabled={student.status === 'pending' || isUpdating}
                                                    className="w-full text-right px-4 py-2 text-[10px] font-black hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors disabled:opacity-30"
                                                >
                                                    نقل للمراجعة
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate('blocked')}
                                                    disabled={student.status === 'blocked' || isUpdating}
                                                    className="w-full text-right px-4 py-2 text-[10px] font-black hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors disabled:opacity-30"
                                                >
                                                    حظر الطالب
                                                </button>
                                                <div className="h-px bg-[var(--border-color)] my-1" />
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={isUpdating}
                                                    className="w-full text-right px-4 py-2 text-[10px] font-black hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition-colors"
                                                >
                                                    حذف الطالب نهائياً
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Quick Details Area */}
                <div className="space-y-3 mb-8 bg-brand-500/[0.03] p-5 rounded-3xl border border-brand-500/5 relative overflow-hidden flex-1 group-hover:bg-brand-500/[0.05] transition-colors text-right">
                    <DetailRow icon={GraduationCap} label="الصف الدراسي" value={formatEducationValue(student.gradeLevel)} />
                    <DetailRow icon={MapPin} label="المحافظة" value={student.governorate} />
                    <DetailRow icon={Phone} label="رقم الهاتف" value={student.phone} isDirLtr />

                    {/* Main Interaction Hub */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => onView(student)}
                            className="flex-1 py-3 bg-white dark:bg-black/20 text-[var(--color-brand)] text-[11px] font-black rounded-2xl border border-brand-500/10 hover:bg-[var(--color-brand)] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm"
                        >
                            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            الملف الكامل
                        </button>

                        <button
                            onClick={() => setIsQRModalOpen(true)}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-all group/qrbtn"
                            title="عرض الهوية الرقمية"
                        >
                            <QrCode className="w-5 h-5 group-hover/qrbtn:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* QR Code Modal Integration */}
                <StudentQRDetailsModal
                    isOpen={isQRModalOpen}
                    onClose={() => setIsQRModalOpen(false)}
                    student={student}
                />

                {/* Status Bar */}
                <div className="pt-4 border-t border-brand-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={clsx(
                            "w-2 h-2 rounded-full",
                            student.status === 'active' ? "bg-emerald-500 animate-pulse" :
                                student.status === 'blocked' ? "bg-rose-500" : "bg-amber-500"
                        )} />
                        <span className={clsx(
                            "text-[10px] font-black uppercase tracking-widest",
                            student.status === 'active' ? "text-emerald-500" :
                                student.status === 'blocked' ? "text-rose-500" : "text-amber-500"
                        )}>
                            {student.status === 'active' ? 'نشط الآن' :
                                student.status === 'blocked' ? 'محظور' : 'قيد المراجعة'}
                        </span>
                    </div>
                    {canManage && student.status !== 'blocked' && (
                        <button
                            onClick={() => handleStatusUpdate('blocked')}
                            disabled={isUpdating}
                            className="flex items-center gap-1 text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest disabled:opacity-50"
                        >
                            <Ban className="w-3 h-3" />
                            حظر الطالب
                        </button>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
        </motion.div>
    );
}

function DetailRow({ icon: Icon, label, value, isDirLtr }: { icon: any, label: string, value: string, isDirLtr?: boolean }) {
    return (
        <div className="flex items-center justify-between group/row">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] opacity-60 flex-shrink-0">
                <Icon className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                <span className="text-[9px] lg:text-[10px] font-black whitespace-nowrap">{label}:</span>
            </div>
            <span className={clsx(
                "text-[10px] lg:text-xs font-black text-[var(--text-primary)] transition-colors group-hover/row:text-[var(--color-brand)] truncate ml-2",
                isDirLtr && "dir-ltr text-left"
            )}>
                {value || '---'}
            </span>
        </div>
    );
}
