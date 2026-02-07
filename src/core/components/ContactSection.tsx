// ============================================================
// ContactSection - Shared Contact & Social Section
// ============================================================

import { motion } from 'framer-motion';
import { Send, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { apiClient } from '@/core/api/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/store/uiStore';

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
);

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

import { useSettings } from '@/contexts/SettingsContext';

export function ContactSection() {
    const { settings } = useSettings();
    const toast = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const contactItems = [
        { icon: Phone, label: "اتصل بنا", value: settings?.contact_phone || "01000000000", color: "text-brand-500", bg: "bg-brand-500/10" },
        { icon: Mail, label: "الإيميل", value: settings?.contact_email || "contact@alsershami.com", color: "text-brand-500", bg: "bg-brand-500/10" },
    ];

    const socialLinks = [
        { name: "فيسبوك", icon: FacebookIcon, url: settings?.facebook_url || "#", color: "bg-[#1877F2]" },
        { name: "واتساب", icon: WhatsAppIcon, url: `https://wa.me/${settings?.whatsapp_number}` || "#", color: "bg-[#25D366]" },
        { name: "تيك توك", icon: TikTokIcon, url: settings?.tiktok_url || "#", color: "bg-[#000000]" },
        { name: "تيليجرام", icon: TelegramIcon, url: settings?.telegram_url || "#", color: "bg-[#0088cc]" },
    ];

    const groupLinks = [
        { name: "جروب تيليجرام", icon: TelegramIcon, url: settings?.telegram_group || "#", color: "bg-[#0088cc]" },
        { name: "جروب واتساب", icon: WhatsAppIcon, url: settings?.whatsapp_group || "#", color: "bg-[#25D366]" },
        { name: "جروب فيسبوك", icon: FacebookIcon, url: settings?.facebook_group || "#", color: "bg-[#1877F2]" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (name.trim().length < 3) {
            toast.show({ type: 'warning', title: 'الاسم غير صالح', message: 'يرجى إدخال الاسم بالكامل' });
            return;
        }
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
        if (!emailOk) {
            toast.show({ type: 'warning', title: 'البريد غير صالح', message: 'يرجى إدخال بريد إلكتروني صحيح' });
            return;
        }
        if (phone.trim() && !/^0\d{10}$/.test(phone.trim())) {
            toast.show({ type: 'warning', title: 'رقم الموبايل غير صالح', message: 'يجب أن يكون 11 رقم ويبدأ بـ 0 أو اتركه فارغاً' });
            return;
        }
        if (message.trim().length < 10) {
            toast.show({ type: 'warning', title: 'الرسالة قصيرة', message: 'يرجى توضيح الاستفسار بشكل أكبر' });
            return;
        }

        setLoading(true);
        try {
            const csrfToken = await useAuthStore.getState().fetchCsrfToken();
            await apiClient.post('/contact', { name, email, phone, message, csrf_token: csrfToken });
            toast.show({ type: 'success', title: 'تم الإرسال', message: 'وصلت رسالتك وسنرد عليك قريباً' });
            setName('');
            setEmail('');
            setPhone('');
            setMessage('');
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'تعذر إرسال الرسالة حالياً';
            toast.show({ type: 'error', title: 'خطأ في الإرسال', message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-24 relative overflow-hidden" id="contact">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[var(--brand-primary)]/5 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Info */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-6 font-display">
                                عندك استفسار؟ <br />
                                <span className="text-brand-500">كلم فريقنا دلوقتي</span>
                            </h2>
                            <p className="text-lg text-[var(--text-secondary)] font-bold max-w-md leading-relaxed">
                                فريق الدعم الفني متاح 24/7 عشان يساعدك في أي مشكلة أو استفسار بخصوص المنصة أو المدرسين.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {contactItems.map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="p-6 rounded-[2.5rem] glass-card border-none bg-white/[0.03] flex items-center gap-5"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-lg`}>
                                        <item.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)] font-bold mb-1">{item.label}</p>
                                        <p className="text-lg font-black text-[var(--text-primary)]">{item.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <p className="text-sm font-bold text-[var(--text-secondary)] mb-6">تابعنا على السوشيال ميديا:</p>
                            <div className="flex flex-wrap gap-4">
                                {socialLinks.filter(link => link.url && link.url !== '#').map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 px-6 py-3 rounded-full ${link.color} text-white font-black text-sm shadow-xl transition-all hover:-translate-y-1`}
                                    >
                                        <link.icon />
                                        <span>{link.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Groups Section */}
                        {groupLinks.some(g => g.url && g.url !== '#') && (
                            <div className="pt-6">
                                <p className="text-sm font-bold text-[var(--text-secondary)] mb-4">انضم لجروباتنا:</p>
                                <div className="flex flex-wrap gap-3">
                                    {groupLinks.filter(g => g.url && g.url !== '#').map((group, i) => (
                                        <a
                                            key={i}
                                            href={group.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${group.color} text-white font-bold text-sm shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl`}
                                        >
                                            <group.icon />
                                            <span>{group.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-10 lg:p-14 rounded-[3.5rem] glass-card relative"
                    >
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-[var(--text-secondary)] mr-4" htmlFor="name">الاسم بالكامل</label>
                                    <input id="name" type="text" placeholder="محمد أحمد" className="w-full h-16 px-8 rounded-full bg-white/5 border border-white/10 text-white font-bold outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-[var(--text-secondary)] mr-4" htmlFor="email">البريد الإلكتروني</label>
                                    <input id="email" type="email" placeholder="name@example.com" className="w-full h-16 px-8 rounded-full bg-white/5 border border-white/10 text-white font-bold outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-[var(--text-secondary)] mr-4" htmlFor="phone">رقم الموبايل</label>
                                    <input id="phone" type="tel" placeholder="012345678912" className="w-full h-16 px-8 rounded-full bg-white/5 border border-white/10 text-white font-bold outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-[var(--text-secondary)] mr-4" htmlFor="message">نص الرسالة</label>
                                <textarea id="message" placeholder="اكتب استفسارك هنا..." rows={4} className="w-full p-8 rounded-[2rem] bg-white/5 border border-white/10 text-white font-bold outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all resize-none" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                            </div>
                            <button
                                className="w-full py-5 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 text-white font-black text-xl shadow-2xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all flex items-center justify-center gap-4 group"
                                aria-label="إرسال الرسالة"
                                disabled={loading}
                            >
                                <span>{loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}</span>
                                <Send className="w-6 h-6 group-hover:translate-x-[-4px] transition-transform" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
