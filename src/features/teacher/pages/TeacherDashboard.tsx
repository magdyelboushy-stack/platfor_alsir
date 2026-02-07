// ============================================================
// Teacher Dashboard - Premium Teacher Experience
// ============================================================

import { motion } from 'framer-motion';

// Components
import { TeacherHeader } from '../components/dashboard/TeacherHeader';
import { TeacherStats } from '../components/dashboard/TeacherStats';
import { TeacherCharts } from '../components/dashboard/TeacherCharts';
import { TeacherSidebar } from '../components/dashboard/TeacherSidebar';

// Hooks
import { useAuthStore } from '@/store/authStore';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export function TeacherDashboard() {
    const user = useAuthStore((state) => state.user);
    const greeting = getGreeting();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 p-6 lg:p-8"
        >
            {/* Header Section */}
            <TeacherHeader user={user} greeting={greeting} />

            {/* Stats Grid */}
            <TeacherStats />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Analytics Chart */}
                <TeacherCharts />

                {/* Sidebar */}
                <TeacherSidebar />
            </div>
        </motion.div>
    );
}

// ============================================================
// Utility Functions
// ============================================================

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'ليلة سعيدة';
}
