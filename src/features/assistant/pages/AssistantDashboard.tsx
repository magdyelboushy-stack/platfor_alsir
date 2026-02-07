
// ============================================================
// Assistant Dashboard Home
// ============================================================

import {
    Clock, CheckCircle, FileText,
    MessageSquare, Ticket
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const mockActivity = [
    { id: 1, action: 'تصحيح واجب (النحو - الدرس الأول)', student: 'أحمد محمود', time: 'منذ 10 دقائق', type: 'grading' },
    { id: 2, action: 'تفعيل كود للطالبة سارة علي', student: 'سارة علي', time: 'منذ 30 دقيقة', type: 'code' },
    { id: 3, action: 'الرد على تذكرة دعم فني', student: 'كريم عادل', time: 'منذ ساعة', type: 'support' },
];

const mockStats = [
    { title: 'واجبات تم تصحيحها', value: '0', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'تذاكر دعم مفتوحة', value: '0', icon: MessageSquare, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { title: 'أكواد تم تفعيلها', value: '0', icon: Ticket, color: 'text-blue-500', bg: 'bg-blue-500/10' },
];

export function AssistantDashboardPage() {
    const { user } = useAuthStore();
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">مرحباً بك، {user?.name || 'مساعدنا'} 👋</h1>
                <p className="text-[var(--text-secondary)] font-bold">إليك ملخص سريع لنشاطك اليوم والمهام المعلقة.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockStats.map((stat, idx) => (
                    <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[var(--text-secondary)]">{stat.title}</p>
                            <h3 className="text-3xl font-black text-[var(--text-primary)] mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Tasks */}
                <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-xl text-[var(--text-primary)] flex items-center gap-2">
                            <Clock className="w-5 h-5 text-brand-500" />
                            مهام تتطلب انتباهك
                        </h3>
                        <span className="text-xs font-bold bg-brand-500/10 text-brand-500 px-2 py-1 rounded-lg">5 مهام معلقة</span>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)] hover:border-brand-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-12 bg-brand-500 rounded-full" />
                                    <div>
                                        <h4 className="font-bold text-[var(--text-primary)]">مراجعة 50 واجب جديد</h4>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">كورس القواعد النحوية - الصف الثالث الثانوي</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-bold transition-colors">
                                    بدء العمل
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
                    <h3 className="font-black text-xl text-[var(--text-primary)] mb-6">سجل النشاط</h3>
                    <div className="space-y-6 relative before:absolute before:right-2.5 before:top-10 before:bottom-0 before:w-0.5 before:bg-[var(--border-color)]">
                        {mockActivity.map((activity) => (
                            <div key={activity.id} className="relative pr-8">
                                <div className={`absolute right-0 top-1 w-5 h-5 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center ${activity.type === 'grading' ? 'bg-emerald-500' :
                                    activity.type === 'code' ? 'bg-brand-500' : 'bg-cyan-500'
                                    }`}>
                                    <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">{activity.action}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-[var(--text-secondary)]">{activity.student}</span>
                                        <span className="text-[10px] text-[var(--text-secondary)] opacity-60">• {activity.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
