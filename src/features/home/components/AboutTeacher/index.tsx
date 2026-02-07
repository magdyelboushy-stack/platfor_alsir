import { motion } from 'framer-motion';
import { GraduationCap, Users, BookOpen, Star } from 'lucide-react';

// Static teacher info (السير الشامي - Math Teacher)
const teacherInfo = {
    name: 'السير الشامي',
    subject: 'الرياضيات',
    bio: 'مدرس رياضيات متخصص بخبرة واسعة في تبسيط المفاهيم الرياضية للمرحلة الثانوية',
    avatar: '/assets/images/السير_الشامي/577042863_1456895286440707_6069203572316920901_n.jpg',
    stats: {
        students: 0, // Will be dynamic later
        courses: 0,
        rating: 5.0
    }
};

export function AboutTeacher() {
    return (
        <section className="py-24 bg-[var(--bg-secondary)]/30 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black text-[var(--text-primary)] font-display mb-4"
                    >
                        تعلم مع <span className="text-brand-500">{teacherInfo.name}</span>
                    </motion.h2>
                    <p className="text-xl text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">
                        {teacherInfo.subject} • {teacherInfo.bio}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="bg-[var(--bg-secondary)] rounded-3xl p-8 border border-[var(--border-color)] shadow-xl"
                >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-brand-500/20 shadow-xl">
                            <img
                                src={teacherInfo.avatar}
                                alt={teacherInfo.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher';
                                }}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-right">
                            <h3 className="text-3xl font-black text-[var(--text-primary)] mb-2">
                                {teacherInfo.name}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-brand-500 mb-4">
                                <GraduationCap className="w-5 h-5" />
                                <span className="font-bold">{teacherInfo.subject}</span>
                            </div>
                            <p className="text-[var(--text-secondary)] max-w-md">
                                {teacherInfo.bio}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[var(--border-color)]">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-brand-500" />
                            </div>
                            <div className="text-2xl font-black text-[var(--text-primary)]">
                                {teacherInfo.stats.students}+
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">طالب</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <BookOpen className="w-5 h-5 text-brand-500" />
                            </div>
                            <div className="text-2xl font-black text-[var(--text-primary)]">
                                {teacherInfo.stats.courses}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">كورس</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="text-2xl font-black text-[var(--text-primary)]">
                                {teacherInfo.stats.rating}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">تقييم</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
