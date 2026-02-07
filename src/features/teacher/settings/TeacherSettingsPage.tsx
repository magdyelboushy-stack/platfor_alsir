
// ============================================================
// Teacher Settings Page
// ============================================================

import { useState } from 'react';
import {
    User, Mail, Phone, Lock, Save, Camera,
    Shield, Bell, Globe
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function TeacherSettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">إعدادات الحساب</h1>
                <p className="text-[var(--text-secondary)] font-bold">تعديل الملف الشخصي، الأمان، وتفضيلات النظام.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 space-y-2">
                    {[
                        { id: 'profile', label: 'الملف الشخصي', icon: User },
                        { id: 'security', label: 'الأمان وكلمة المرور', icon: Lock },
                        { id: 'notifications', label: 'الإشعارات والتنبيهات', icon: Bell },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id
                                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Avatar Section */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                <div className="relative mb-4 group cursor-pointer">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--bg-main)] shadow-xl">
                                        <img
                                            src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher"}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-[var(--text-primary)]">{user?.name}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">خبير ومعلم الرياضيات</p>
                                <button className="mt-4 px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm font-bold text-[var(--text-secondary)] hover:text-cyan-500 transition-colors">
                                    تغيير الصورة
                                </button>
                            </div>

                            {/* Personal Info Form */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-6">
                                <h3 className="font-black text-xl text-[var(--text-primary)] mb-4">البيانات الأساسية</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)]">الاسم بالكامل</label>
                                        <div className="relative">
                                            <input type="text" defaultValue={user?.name} className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-cyan-500 outline-none font-bold text-[var(--text-primary)] pr-10" />
                                            <User className="absolute right-3 top-3.5 w-5 h-5 text-[var(--text-secondary)]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)]">البريد الإلكتروني</label>
                                        <div className="relative">
                                            <input type="email" defaultValue={user?.email} disabled className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] outline-none font-bold text-[var(--text-secondary)] pr-10 dir-ltr cursor-not-allowed" />
                                            <Mail className="absolute right-3 top-3.5 w-5 h-5 text-[var(--text-secondary)]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)]">رقم الهاتف</label>
                                        <div className="relative">
                                            <input type="tel" defaultValue="01012345678" className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-cyan-500 outline-none font-bold text-[var(--text-primary)] pr-10 dir-ltr text-right" />
                                            <Phone className="absolute right-3 top-3.5 w-5 h-5 text-[var(--text-secondary)]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)]">المادة الدراسية</label>
                                        <div className="relative">
                                            <input type="text" defaultValue="الرياضيات" className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-cyan-500 outline-none font-bold text-[var(--text-primary)] pr-10" />
                                            <Globe className="absolute right-3 top-3.5 w-5 h-5 text-[var(--text-secondary)]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-[var(--border-color)] flex justify-end">
                                    <button className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all">
                                        <Save className="w-5 h-5" />
                                        <span>حفظ التغييرات</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-6">
                            <h3 className="font-black text-xl text-[var(--text-primary)] mb-4">تغيير كلمة المرور</h3>
                            <div className="space-y-4 max-w-xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[var(--text-secondary)]">كلمة المرور الحالية</label>
                                    <div className="relative">
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-cyan-500 outline-none font-bold text-[var(--text-primary)] pr-10 dir-ltr" />
                                        <Lock className="absolute right-3 top-3.5 w-5 h-5 text-[var(--text-secondary)]" />
                                    </div>
                                </div>
                                <div className="pt-2"></div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[var(--text-secondary)]">كلمة المرور الجديدة</label>
                                    <div className="relative">
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-cyan-500 outline-none font-bold text-[var(--text-primary)] pr-10 dir-ltr" />
                                        <Shield className="absolute right-3 top-3.5 w-5 h-5 text-[var(--text-secondary)]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[var(--text-secondary)]">تأكيد كلمة المرور</label>
                                    <div className="relative">
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-cyan-500 outline-none font-bold text-[var(--text-primary)] pr-10 dir-ltr" />
                                        <Shield className="absolute right-3 top-3.5 w-5 h-5 text-[var(--text-secondary)]" />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
                                        <Save className="w-5 h-5" />
                                        <span>تحديث كلمة المرور</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
