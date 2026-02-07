
// ============================================================
// Teacher Support Center Page
// ============================================================

import { useState } from 'react';
import {
    MessageSquare, Search, Send, Paperclip,
    Archive
} from 'lucide-react';


// Tickets data - to be fetched from API
const tickets: any[] = [];

export function TeacherSupportPage() {
    const [selectedTicket, setSelectedTicket] = useState<any>(null);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">مركز الدعم والمحادثات</h1>
                <p className="text-[var(--text-secondary)] font-bold">الرد على استفسارات الطلاب وحل المشاكل التقنية.</p>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-lg">
                {/* Tickets List */}
                <div className={`w-full md:w-80 lg:w-96 border-l border-[var(--border-color)] flex flex-col ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-[var(--border-color)]">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="بحث في المحادثات..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-cyan-500 outline-none text-sm font-bold text-[var(--text-primary)]"
                            />
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-[var(--text-secondary)]" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {tickets.map((ticket: any) => (
                            <button
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-[var(--bg-main)] transition-colors border-b border-[var(--border-color)] last:border-0 text-right ${selectedTicket?.id === ticket.id ? 'bg-[var(--bg-main)] relative before:absolute before:right-0 before:top-0 before:h-full before:w-1 before:bg-cyan-500' : ''
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                                    <span className="font-bold">{ticket.student.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-[var(--text-primary)] truncate">{ticket.student}</h3>
                                        <span className="text-[10px] text-[var(--text-secondary)] font-medium">{ticket.time}</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] truncate mb-1">{ticket.subject}</p>
                                    <p className="text-xs text-[var(--text-secondary)] truncate opacity-70">{ticket.lastMsg}</p>
                                </div>
                                {ticket.unread > 0 && (
                                    <div className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                        {ticket.unread}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                    {selectedTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[var(--bg-card)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white md:hidden">
                                        <span className="font-bold">{selectedTicket.student.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--text-primary)]">{selectedTicket.student}</h3>
                                        <p className="text-xs text-[var(--text-secondary)]">{selectedTicket.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-[var(--bg-main)] rounded-lg text-[var(--text-secondary)]" title="أرشفة المحادثة">
                                        <Archive className="w-5 h-5" />
                                    </button>
                                    <button
                                        className="p-2 hover:bg-[var(--bg-main)] rounded-lg text-[var(--text-secondary)] md:hidden"
                                        onClick={() => setSelectedTicket(null)}
                                    >
                                        عودة
                                    </button>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 bg-[var(--bg-main)] overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                <div className="flex justify-center">
                                    <span className="bg-[var(--bg-card)] px-3 py-1 rounded-full text-[10px] text-[var(--text-secondary)] border border-[var(--border-color)]">اليوم</span>
                                </div>

                                <div className="flex items-end gap-2">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                        {selectedTicket.student.charAt(0)}
                                    </div>
                                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl rounded-br-none p-3 max-w-[80%]">
                                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">السلام عليكم يا مستر، انا عندي مشكلة في تحميل ملف الدرس الأول، بيطلعلي رسالة خطأ.</p>
                                        <span className="text-[10px] text-[var(--text-secondary)] block mt-1 text-left">10:30 ص</span>
                                    </div>
                                </div>

                                <div className="flex items-end gap-2 flex-row-reverse" dir="ltr">
                                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                                        me
                                    </div>
                                    <div className="bg-cyan-600 text-white rounded-2xl rounded-bl-none p-3 max-w-[80%]">
                                        <p className="text-sm leading-relaxed" dir="rtl">وعليكم السلام، ابعتلي صورة من رسالة الخطأ اللي بتظهرلك.</p>
                                        <span className="text-[10px] text-white/70 block mt-1 text-right">10:32 ص</span>
                                    </div>
                                </div>

                                <div className="flex items-end gap-2">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                        {selectedTicket.student.charAt(0)}
                                    </div>
                                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl rounded-br-none p-3 max-w-[80%]">
                                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">حاولت أحمل الملف ومفيش فايدة... دي الصورة</p>
                                        <div className="mt-2 rounded-lg overflow-hidden border border-[var(--border-color)]">
                                            <img src="https://via.placeholder.com/300x200" alt="Error" className="w-full h-auto" />
                                        </div>
                                        <span className="text-[10px] text-[var(--text-secondary)] block mt-1 text-left">10:35 ص</span>
                                    </div>
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
                                <div className="flex items-center gap-2">
                                    <button className="p-3 hover:bg-[var(--bg-main)] rounded-xl text-[var(--text-secondary)] transition-colors">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="اكتب ردك هنا..."
                                        className="flex-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-[var(--text-primary)] font-medium"
                                    />
                                    <button className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 transition-all rotate-180">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-[var(--bg-main)] flex items-center justify-center border-4 border-[var(--border-color)] mb-4">
                                <MessageSquare className="w-8 h-8 text-[var(--text-secondary)]" />
                            </div>
                            <h2 className="text-xl font-black text-[var(--text-primary)] mb-2">اختر محادثة للبدء</h2>
                            <p className="text-[var(--text-secondary)] max-w-xs mx-auto">قم باختيار طالب من القائمة الجانبية لعرض التذاكر والرد على الاستفسارات.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
