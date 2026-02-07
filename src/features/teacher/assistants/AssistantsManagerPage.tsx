// ============================================================
// Teacher Assistants Manager - Premium Staff Redesign
// ============================================================

import { useState, useEffect } from 'react';
import { AssistantHeader } from './components/AssistantHeader';
import { AssistantCard } from './components/AssistantCard';
import { AssistantFormModal } from './components/AssistantFormModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserMinus } from 'lucide-react';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useToast } from '@/store/uiStore';

export function AssistantsManagerPage() {
    const [assistants, setAssistants] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssistant, setSelectedAssistant] = useState<any>(null); // For Edit Mode
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    // Fetch Assistants
    const fetchAssistants = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.ASSISTANTS.LIST);
            setAssistants(response.data);
        } catch (error) {
            console.error('Fetch assistants error:', error);
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: 'فشل جلب قائمة المساعدين'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAssistants();
    }, []);

    const handleOpenAddModal = () => {
        setSelectedAssistant(null); // Clear selection for add mode
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (assistant: any) => {
        setSelectedAssistant(assistant); // Set selection for edit mode
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (selectedAssistant) {
                // Update Mode
                await apiClient.post(ENDPOINTS.ADMIN.ASSISTANTS.UPDATE(selectedAssistant.id), data);
                toast.show({
                    type: 'success',
                    title: 'تم التحديث',
                    message: 'تم تحديث بيانات المساعد بنجاح'
                });
            } else {
                // Create Mode
                await apiClient.post(ENDPOINTS.ADMIN.ASSISTANTS.CREATE, data);
                toast.show({
                    type: 'success',
                    title: 'تم الإضافة',
                    message: 'تم إضافة المساعد الجديد بنجاح'
                });
            }
            fetchAssistants(); // Refresh list
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'حدث خطأ أثناء تنفيذ العملية'
            });
        }
    };

    const handleDeleteAssistant = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المساعد؟ لا يمكن التراجع عن هذا الإجراء.')) return;

        try {
            await apiClient.post(ENDPOINTS.ADMIN.ASSISTANTS.DELETE(id));
            toast.show({
                type: 'success',
                title: 'تم الحذف',
                message: 'تم حذف حساب المساعد بنجاح'
            });
            setAssistants(prev => prev.filter(a => a.id !== id));
        } catch (error: any) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: error.response?.data?.error || 'فشل حذف المساعد'
            });
        }
    };

    const filteredAssistants = assistants.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 max-w-[1600px] mx-auto py-8 animate-in fade-in duration-700">
            {/* 1. Header Section */}
            <AssistantHeader onAdd={handleOpenAddModal} />

            {/* 2. Search Toolbar */}
            <div className="px-2">
                <div className="relative group max-w-2xl mx-auto">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="ابحث عن اسم مساعد أو بريد إلكتروني..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-16 pr-14 pl-6 rounded-[1.5rem] bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* 3. Assistants Grid */}
            <div className="px-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-12 h-12 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredAssistants.map((assistant) => (
                                <motion.div
                                    layout
                                    key={assistant.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <AssistantCard
                                        assistant={assistant}
                                        onEdit={() => handleOpenEditModal(assistant)} // Pass full object or ID based on your need, but Modal needs object
                                        onDelete={handleDeleteAssistant}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Empty State */}
                        {filteredAssistants.length === 0 && (
                            <div className="col-span-full py-32 text-center">
                                <div className="w-28 h-28 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <UserMinus className="w-12 h-12 text-[var(--text-secondary)] opacity-20" />
                                </div>
                                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">لا يوجد مساعدين</h3>
                                <p className="text-[var(--text-secondary)] font-bold opacity-60 max-w-xs mx-auto leading-relaxed">
                                    ابدأ بإضافة فريق العمل الخاص بك لغرض التعاون في إدارة المنصة.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 4. Add/Edit Modal */}
            <AssistantFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedAssistant}
            />

            {/* Aesthetics Decor */}
            <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
