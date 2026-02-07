import { useEffect, useMemo, useState } from 'react';
import { contactMessagesService, ContactMessage } from '../services/ContactMessagesService';
import { useToast } from '@/store/uiStore';
import { Search, Mail, Phone, CheckCircle2, AlertCircle, Clock, Reply } from 'lucide-react';
import { clsx } from 'clsx';

export default function ContactMessagesPage() {
    const toast = useToast();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | ContactMessage['status']>('all');
    const [selected, setSelected] = useState<ContactMessage | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await contactMessagesService.list();
            setMessages(data);
        } catch (e: any) {
            toast.show({ type: 'error', title: 'فشل تحميل الرسائل', message: e.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = useMemo(() => {
        return messages.filter(m => {
            const okStatus = statusFilter === 'all' ? true : m.status === statusFilter;
            const text = (m.name + ' ' + (m.email || '') + ' ' + (m.phone || '') + ' ' + m.message).toLowerCase();
            const okQuery = query ? text.includes(query.toLowerCase()) : true;
            return okStatus && okQuery;
        });
    }, [messages, query, statusFilter]);

    const statusBadge = (s: ContactMessage['status']) => {
        const map = {
            new: { label: 'جديدة', color: 'bg-sky-500/15 text-sky-600 border-sky-500/30' },
            sent: { label: 'أُرسلت بالبريد', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
            failed: { label: 'فشل الإرسال', color: 'bg-rose-500/15 text-rose-600 border-rose-500/30' },
            responded: { label: 'تم الرد', color: 'bg-orange-500/15 text-orange-600 border-orange-500/30' },
        } as const;
        const cfg = map[s];
        return <span className={clsx('px-3 py-1 rounded-full text-xs font-black border', cfg.color)}>{cfg.label}</span>;
    };

    const handleStatus = async (id: string, status: ContactMessage['status']) => {
        try {
            const updated = await contactMessagesService.updateStatus(id, status);
            setMessages(prev => prev.map(m => (m.id === id ? updated : m)));
            toast.show({ type: 'success', title: 'تم تحديث الحالة' });
        } catch (e: any) {
            toast.show({ type: 'error', title: 'فشل تحديث الحالة', message: e.message });
        }
    };

    const handleReply = async () => {
        if (!selected) return;
        if (replyText.trim().length < 3) {
            toast.show({ type: 'warning', title: 'الرد قصير', message: 'اكتب رد مناسب' });
            return;
        }
        setReplyLoading(true);
        try {
            await contactMessagesService.reply(selected.id, replyText.trim());
            await fetchData();
            setReplyText('');
            toast.show({ type: 'success', title: 'تم إرسال الرد' });
        } catch (e: any) {
            toast.show({ type: 'error', title: 'فشل إرسال الرد', message: e.message });
        } finally {
            setReplyLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-slide-up pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-[var(--text-primary)] font-display flex items-center gap-3">
                    <Mail className="w-8 h-8 text-brand-500" />
                    رسائل التواصل
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500/30 transition-all"
                    >
                        تحديث
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <Search className="w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ابحث بالاسم/الهاتف/النص"
                        className="flex-1 bg-transparent outline-none text-[var(--text-primary)] font-bold"
                    />
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full bg-transparent outline-none text-[var(--text-primary)] font-bold"
                    >
                        <option value="all">كل الحالات</option>
                        <option value="new">جديدة</option>
                        <option value="sent">أُرسلت بالبريد</option>
                        <option value="failed">فشل الإرسال</option>
                        <option value="responded">تم الرد</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-[var(--bg-main)]/40">
                        <tr>
                            <th className="p-4 text-xs font-black text-[var(--text-secondary)] uppercase">الاسم</th>
                            <th className="p-4 text-xs font-black text-[var(--text-secondary)] uppercase">البريد</th>
                            <th className="p-4 text-xs font-black text-[var(--text-secondary)] uppercase">الهاتف</th>
                            <th className="p-4 text-xs font-black text-[var(--text-secondary)] uppercase">الحالة</th>
                            <th className="p-4 text-xs font-black text-[var(--text-secondary)] uppercase">الوقت</th>
                            <th className="p-4 text-xs font-black text-[var(--text-secondary)] uppercase">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={5} className="p-6 text-center text-[var(--text-secondary)]">جارِ التحميل...</td></tr>
                        )}
                        {!loading && filtered.map((m) => (
                            <tr key={m.id} className="border-t border-[var(--border-color)] hover:bg-[var(--bg-main)]/30">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-brand-500" />
                                        <div>
                                            <div className="font-black">{m.name}</div>
                                            <div className="text-xs opacity-70 line-clamp-1 max-w-[420px]">{m.message}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Mail className="w-4 h-4" />
                                        <span className="font-bold">{m.email}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                        <Phone className="w-4 h-4" />
                                        <span className="font-bold">{m.phone}</span>
                                    </div>
                                </td>
                                <td className="p-4">{statusBadge(m.status)}</td>
                                <td className="p-4 text-[var(--text-secondary)] font-bold">{new Date(m.created_at).toLocaleString('ar-EG')}</td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 text-xs font-black hover:bg-emerald-500/25"
                                            onClick={() => handleStatus(m.id, 'sent')}
                                        >
                                            <CheckCircle2 className="inline w-4 h-4 mr-1" /> تعليم أُرسلت
                                        </button>
                                        <button
                                            className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-700 text-xs font-black hover:bg-rose-500/25"
                                            onClick={() => handleStatus(m.id, 'failed')}
                                        >
                                            <AlertCircle className="inline w-4 h-4 mr-1" /> تعليم فشل
                                        </button>
                                        <button
                                            className="px-3 py-1.5 rounded-xl bg-orange-500/15 text-orange-700 text-xs font-black hover:bg-orange-500/25"
                                            onClick={() => { setSelected(m); setReplyText(''); }}
                                        >
                                            <Reply className="inline w-4 h-4 mr-1" /> رد
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={5} className="p-6 text-center text-[var(--text-secondary)]">لا توجد نتائج</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reply Box */}
            {selected && (
                <div className="p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-black text-[var(--text-primary)]">{selected.name}</div>
                            <div className="text-xs font-bold text-[var(--text-secondary)]">{selected.email} {selected.phone ? `— ${selected.phone}` : ''}</div>
                        </div>
                        <button
                            className="px-3 py-2 rounded-xl bg-white/5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-600"
                            onClick={() => setSelected(null)}
                        >
                            إغلاق
                        </button>
                    </div>
                    <p className="p-4 rounded-2xl bg-[var(--bg-main)]/30 border border-[var(--border-color)] text-sm font-bold text-[var(--text-primary)]">
                        {selected.message}
                    </p>
                    <div className="space-y-3">
                        <label className="text-sm font-black text-[var(--text-primary)]">نص الرد (يُرسل بريد إلكتروني)</label>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            className="w-full p-4 rounded-2xl bg-white border border-[#e2e8f0] outline-none text-[#0f172a] font-bold placeholder:text-[#94a3b8] focus:border-brand-500/50"
                            placeholder="اكتب الرد هنا..."
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={replyLoading}
                            onClick={handleReply}
                            className="px-5 py-3 rounded-2xl bg-brand-600 text-white font-black hover:bg-brand-700 active:scale-95"
                        >
                            {replyLoading ? 'جارِ الإرسال...' : 'إرسال الرد'}
                        </button>
                        <button
                            onClick={() => handleStatus(selected.id, 'responded')}
                            className="px-5 py-3 rounded-2xl bg-orange-500 text-white font-black hover:bg-orange-600 active:scale-95"
                        >
                            تعليم تم الرد
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
