
import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { settingsService } from '@/features/admin/services/SettingsService';
import { Save, Layout, Loader, Phone, Mail, Users } from 'lucide-react';

export function AdminSettingsPage() {
    const { settings, refreshSettings } = useSettings();
    const [loading, setLoading] = useState(false);

    // Contact Info State
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [telegramUrl, setTelegramUrl] = useState('');
    // Groups
    const [telegramGroup, setTelegramGroup] = useState('');
    const [whatsappGroup, setWhatsappGroup] = useState('');
    const [facebookGroup, setFacebookGroup] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (settings) {
            setContactEmail(settings.contact_email || '');
            setContactPhone(settings.contact_phone || '');
            setWhatsappNumber(settings.whatsapp_number || '');
            setFacebookUrl(settings.facebook_url || '');
            setInstagramUrl(settings.instagram_url || '');
            setYoutubeUrl(settings.youtube_url || '');
            setTiktokUrl(settings.tiktok_url || '');
            setTelegramUrl(settings.telegram_url || '');
            setTelegramGroup(settings.telegram_group || '');
            setWhatsappGroup(settings.whatsapp_group || '');
            setFacebookGroup(settings.facebook_group || '');
            setAddress(settings.address || '');
        }
    }, [settings]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('contact_email', contactEmail);
            formData.append('contact_phone', contactPhone);
            formData.append('whatsapp_number', whatsappNumber);
            formData.append('facebook_url', facebookUrl);
            formData.append('instagram_url', instagramUrl);
            formData.append('youtube_url', youtubeUrl);
            formData.append('tiktok_url', tiktokUrl);
            formData.append('telegram_url', telegramUrl);
            formData.append('telegram_group', telegramGroup);
            formData.append('whatsapp_group', whatsappGroup);
            formData.append('facebook_group', facebookGroup);
            formData.append('address', address);

            await settingsService.updateSettings(formData);
            await refreshSettings();

            // Optional: Show Success Toast
            alert('تم حفظ الإعدادات بنجاح!'); // Placeholder for Toast
        } catch (error) {
            alert('حدث خطأ أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    if (!settings) return <div className="p-8"><Loader className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-slide-up space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2 font-display flex items-center gap-3">
                    <Layout className="w-8 h-8 text-brand-500" />
                    إعدادات النظام العامة
                </h1>
                <p className="text-[var(--text-secondary)] opacity-80 font-medium">
                    إدارة معلومات التواصل وروابط المجتمع.
                </p>
            </div>

            {/* Contact & Support Information */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3">
                    <Phone className="w-6 h-6 text-brand-500" />
                    معلومات التواصل والدعم
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Contact */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right flex items-center justify-end gap-2">
                                <Mail className="w-4 h-4" />
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                                placeholder="example@domain.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">رقم الهاتف الأساسي</label>
                            <input
                                type="tel"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                                placeholder="012345678912"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">رقم الواتساب</label>
                            <input
                                type="tel"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                                placeholder="012345678912"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">العنوان / المقر</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                                placeholder="القاهرة، مصر"
                            />
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">رابط فيسبوك (Facebook)</label>
                            <input
                                type="url"
                                value={facebookUrl}
                                onChange={(e) => setFacebookUrl(e.target.value)}
                                className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                                placeholder="https://facebook.com/yourpage"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">رابط إنستجرام (Instagram)</label>
                            <input
                                type="url"
                                value={instagramUrl}
                                onChange={(e) => setInstagramUrl(e.target.value)}
                                className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                                placeholder="https://instagram.com/yourprofile"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">رابط يوتيوب (YouTube)</label>
                            <input
                                type="url"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                                placeholder="https://youtube.com/yourchannel"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">رابط تيك توك (TikTok)</label>
                            <input
                                type="url"
                                value={tiktokUrl}
                                onChange={(e) => setTiktokUrl(e.target.value)}
                                className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                                placeholder="https://tiktok.com/@yourprofile"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">رابط تيليجرام (Telegram)</label>
                            <input
                                type="url"
                                value={telegramUrl}
                                onChange={(e) => setTelegramUrl(e.target.value)}
                                className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                                placeholder="https://t.me/yourchannel"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Groups Section */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3">
                    <Users className="w-6 h-6 text-brand-500" />
                    روابط الجروبات والمجتمعات
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">جروب تيليجرام (Telegram Group)</label>
                        <input
                            type="url"
                            value={telegramGroup}
                            onChange={(e) => setTelegramGroup(e.target.value)}
                            className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                            placeholder="https://t.me/yourgroup"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">جروب واتساب (WhatsApp Group)</label>
                        <input
                            type="url"
                            value={whatsappGroup}
                            onChange={(e) => setWhatsappGroup(e.target.value)}
                            className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                            placeholder="https://chat.whatsapp.com/..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-right">جروب فيسبوك (Facebook Group)</label>
                        <input
                            type="url"
                            value={facebookGroup}
                            onChange={(e) => setFacebookGroup(e.target.value)}
                            className="w-full px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-[var(--text-primary)] text-right"
                            placeholder="https://facebook.com/groups/..."
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-[var(--border-color)]">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    حفظ التغييرات
                </button>
            </div>
        </div>
    );
}
