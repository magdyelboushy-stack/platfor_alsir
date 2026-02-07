// ============================================================
// Footer - Magdy Elboushy Platform
// ============================================================

import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

// Custom Icons for TikTok and Telegram
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

const LOGO_PATH = '/assets/السير_الشامي/594930133_1456894779774091_6490422839217536606_n.jpg';

import { useSettings } from '@/contexts/SettingsContext';

export function Footer() {
    const { settings } = useSettings();

    const socialLinks = [
        { icon: Facebook, url: settings?.facebook_url || "#", label: "فيسبوك" },
        { icon: Instagram, url: settings?.instagram_url || "#", label: "انستجرام" },
        { icon: Youtube, url: settings?.youtube_url || "#", label: "يوتيوب" },
        { icon: TikTokIcon, url: settings?.tiktok_url || "#", label: "تيك توك" },
        { icon: TelegramIcon, url: settings?.telegram_url || "#", label: "تيليجرام" },
    ];

    const groupLinks = [
        { icon: TelegramIcon, url: settings?.telegram_group || "#", label: "جروب تيليجرام", color: "bg-[#0088cc]" },
        { icon: Facebook, url: settings?.facebook_group || "#", label: "جروب فيسبوك", color: "bg-[#1877F2]" },
    ];

    return (
        <footer className="relative py-20 bg-[#020617] text-white overflow-hidden border-t border-white/5">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex flex-col items-center lg:items-start gap-4">
                            <img src={LOGO_PATH} alt="Al-Seer Al-Shami Platform" className="h-20 w-20 rounded-2xl object-contain border border-brand-500/30 shadow-2xl bg-white/5 p-1" />
                            <span className="text-2xl font-black font-display text-center lg:text-right">منصة <span className="text-brand-500">السير الشامي</span></span>
                        </Link>
                        <p className="text-slate-400 font-bold leading-relaxed text-sm">
                            أقوى منصة لشرح الرياضيات للمرحلة الثانوية. من الصفر للدرجة النهائية.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map((social, i) => {
                                const IconComponent = social.icon;
                                return (
                                    <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" title={social.label} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-500 hover:border-brand-500 transition-all group">
                                        <IconComponent className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                    </a>
                                );
                            })}
                        </div>
                        {/* Groups */}
                        <div className="mt-4">
                            <p className="text-xs text-slate-500 font-bold mb-2">انضم للجروبات:</p>
                            <div className="flex flex-wrap gap-2">
                                {groupLinks.filter(g => g.url && g.url !== '#').map((group, i) => (
                                    <a key={i} href={group.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${group.color} text-white text-xs font-bold hover:opacity-80 transition-all`}>
                                        <group.icon />
                                        <span>{group.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xl font-black mb-6 font-display">روابط سريعة</h4>
                        <ul className="space-y-4 font-bold text-slate-400">
                            <li><Link to="/" className="hover:text-cyan-500 transition-colors">الرئيسية</Link></li>
                            <li><Link to="/about" className="hover:text-cyan-500 transition-colors">عن المنصة</Link></li>
                            <li><Link to="/courses" className="hover:text-cyan-500 transition-colors">الكورسات</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-xl font-black mb-6 font-display">الدعم والمساعدة</h4>
                        <ul className="space-y-4 font-bold text-slate-400">
                            <li><a href="#" className="hover:text-cyan-500 transition-colors">الأسئلة الشائعة</a></li>
                            <li><a href="#" className="hover:text-cyan-500 transition-colors">سياسة الخصوصية</a></li>
                            <li><a href="#" className="hover:text-cyan-500 transition-colors">تواصل معنا</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-xl font-black mb-6 font-display">تواصل معنا</h4>
                        <ul className="space-y-5">
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-lg">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-300">{settings?.contact_phone || "01000000000"}</span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-lg">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-300">{settings?.contact_email || "contact@alseershami.com"}</span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-lg">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-300">{settings?.address || "القاهرة، مصر"}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div className="flex flex-col sm:flex-row items-center gap-2 text-slate-500 font-bold text-sm">
        <p>© 2026 {settings?.app_name || 'منصة '}. جميع الحقوق محفوظة.</p>
        <span className="hidden sm:inline">•</span>
        <p>
            تم التطوير بواسطة{' '}
            <a 
                href="https://www.facebook.com/profile.php?id=61584654992405" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-500 hover:text-brand-400 transition-colors font-black"
            >
                Magdy Elboushy
            </a>
        </p>
    </div>
    <div className="flex gap-6 text-slate-500 font-bold text-sm">
        <a href="#" className="hover:text-brand-500 transition-colors">شروط الاستخدام</a>
        <a href="#" className="hover:text-brand-500 transition-colors">سياسة الخصوصية</a>
    </div>
</div>
            </div>
        </footer>
    );
}
