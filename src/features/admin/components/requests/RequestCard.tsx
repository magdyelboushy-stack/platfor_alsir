import { useState } from 'react';
import {
    CheckCircle,
    XCircle,
    MapPin,
    Phone,
    Calendar,
    User,
    MoreVertical,
    School
} from 'lucide-react';
import { RegistrationRequest } from '../../services/RequestsService';
import { getAvatarUrl } from '@/utils/fileUrl';

interface RequestCardProps {
    request: RegistrationRequest;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isProcessing?: boolean;
}

export function RequestCard({ request, onApprove, onReject, isProcessing = false }: RequestCardProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const { details } = request;

    return (
        <div className="bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
            {/* Header / Summary */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-br from-blue-500 to-cyan-400">
                                <img
                                    src={getAvatarUrl(details.avatar, details.email)}
                                    alt={details.fullName}
                                    className="w-full h-full rounded-[14px] bg-[var(--bg-main)] object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-[var(--bg-secondary)]">
                                {request.time}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[var(--text-primary)] font-display mb-1">{details.fullName}</h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] opacity-70">
                                <span className="font-mono">{details.email}</span>
                                <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                                <span>{details.educationStage === 'secondary' ? 'ثانوي' : 'إعدادي'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[var(--bg-main)] rounded-xl p-3 border border-[var(--border-color)]">
                        <div className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            الموقع
                        </div>
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                            {details.governorate}، {details.city}
                        </div>
                    </div>
                    <div className="bg-[var(--bg-main)] rounded-xl p-3 border border-[var(--border-color)]">
                        <div className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 mb-1 flex items-center gap-1">
                            <School className="w-3 h-3" />
                            السنة الدراسية
                        </div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                            {details.gradeLevel}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onApprove(request.id)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 h-10 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle className="w-4 h-4" />
                        قبول
                    </button>
                    <button
                        onClick={() => onReject(request.id)}
                        disabled={isProcessing}
                        className="w-10 h-10 flex items-center justify-center bg-[var(--bg-main)] hover:bg-red-500/10 text-red-500 rounded-xl border border-[var(--border-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="رفض وحذف"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        className={`w-10 h-10 flex items-center justify-center bg-[var(--bg-main)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl border border-[var(--border-color)] transition-colors ${isDetailsOpen ? 'bg-brand-500/10 text-brand-500 border-brand-500/30' : ''}`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Expandable Details */}
            {isDetailsOpen && (
                <div className="border-t border-[var(--border-color)] bg-[var(--bg-main)]/50 p-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-3">تفاصيل إضافية</h4>

                        <div className="space-y-3">
                            <InfoRow icon={Phone} label="هاتف الطالب" value={details.phone} isLtr />
                            <InfoRow icon={User} label="ولي الأمر" value={details.guardianName} />
                            <InfoRow icon={Phone} label="هاتف ولي الأمر" value={details.guardianPhone} isLtr />
                            <InfoRow icon={Calendar} label="تاريخ الميلاد" value={details.birthDate} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ icon: Icon, label, value, isLtr = false }: any) {
    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] opacity-80">
                <Icon className="w-4 h-4" />
                <span className="font-bold">{label}</span>
            </div>
            <span className={`font-bold text-[var(--text-primary)] ${isLtr ? 'dir-ltr font-mono' : ''}`}>{value || '---'}</span>
        </div>
    );
}
