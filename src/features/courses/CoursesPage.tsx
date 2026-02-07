// ============================================================
// CoursesPage - Arabic Language Expert (Smart Modular Edition)
// ============================================================

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from '@/core/components/Navbar';
import { Footer } from '@/core/components/Footer';
import { ContactSection } from '@/core/components/ContactSection';

// Modular Premium Components
import { CoursesHero } from './components/CoursesHero';
import { CoursesFilters } from './components/CoursesFilters';
import { CoursesGrid } from './components/CoursesGrid';

// Level Mapping for Smart Logic (Expanding to Prep)
// Comprehensive Level Mapping for Data Normalization
const LEVEL_MAP: Record<string, string> = {
    // Primary
    "4": "الصف الرابع", "primary_4": "الصف الرابع", "الصف الرابع": "الصف الرابع",
    "5": "الصف الخامس", "primary_5": "الصف الخامس", "الصف الخامس": "الصف الخامس",
    "6": "الصف السادس", "primary_6": "الصف السادس", "الصف السادس": "الصف السادس",

    // Prep (الإعدادي)
    "7": "الصف الأول الإعدادي", "first_prep": "الصف الأول الإعدادي", "الصف الأول الإعدادي": "الصف الأول الإعدادي",
    "8": "الصف الثاني الإعدادي", "second_prep": "الصف الثاني الإعدادي", "الصف الثاني الإعدادي": "الصف الثاني الإعدادي",
    "9": "الصف الثالث الإعدادي", "third_prep": "الصف الثالث الإعدادي", "الصف الثالث الإعدادي": "الصف الثالث الإعدادي",
    "prep": "المرحلة الإعدادية",

    // Secondary (الثانوي)
    "10": "الصف الأول الثانوي", "first_sec": "الصف الأول الثانوي", "الصف الأول الثانوي": "الصف الأول الثانوي",
    "11": "الصف الثاني الثانوي", "second_sec": "الصف الثاني الثانوي", "الصف الثاني الثانوي": "الصف الثاني الثانوي",
    "12": "الصف الثالث الثانوي", "third_sec": "الصف الثالث الثانوي", "الصف الثالث الثانوي": "الصف الثالث الثانوي",
    "secondary": "المرحلة الثانوية"
};

import { useEffect } from 'react';
import { api } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { Helmet } from 'react-helmet-async';

export function CoursesPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Core filtering states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("الكل");

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get<any[]>(ENDPOINTS.COURSES.LIST);
            const raw = Array.isArray(response) ? response : [];
            const normalized = raw.map((c: any) => ({
                ...c,
                // Normalize naming from backend (supports snake_case and camelCase)
                lessonCount: c.lessonCount ?? c.lessonsCount ?? c.lesson_count ?? c.lessons_count ?? 0,
                enrollmentCount: c.enrollmentCount ?? c.enrollment_count ?? 0,
                gradeLevel: c.gradeLevel ?? c.grade_level ?? c.grade ?? c.level ?? c.grade,
                educationStage: c.educationStage ?? c.education_stage ?? c.stage ?? c.educationStage,
                teacherName: c.teacherName ?? c.teacher_name ?? c.teacher ?? c.instructor ?? '',
                isSubscribed: c.isSubscribed ?? c.isEnrolled ?? c.is_enrolled ?? false,
                rating: c.rating ?? c.average_rating ?? c.avg_rating ?? 4.9,
            }));
            setCourses(normalized);
        } catch (error) {
            console.error("Failed to fetch real courses:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Real Data from API
    useEffect(() => {
        fetchCourses();
    }, []);

    const handleEnroll = async (courseId: string) => {
        try {
            await api.post(ENDPOINTS.COURSES.ENROLL(courseId));
            fetchCourses();
        } catch (error) {
            console.error("Enrollment failed:", error);
        }
    };

    // Smart Logic: Pre-lock level if user is logged in
    const defaultLevel = useMemo(() => {
        if (isAuthenticated && user?.grade_level) {
            const rawLevel = user.grade_level.toString();
            return LEVEL_MAP[rawLevel] || rawLevel;
        }
        return "جميع الصفوف";
    }, [isAuthenticated, user]);

    const [selectedLevel, setSelectedLevel] = useState(defaultLevel);

    // Orchestrated filtering logic
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSubject = selectedSubject === "الكل" || course.subject === selectedSubject;

            // Normalize levels for robust comparison
            const courseLevelNormalized = LEVEL_MAP[course.gradeLevel] || course.gradeLevel;
            const selectedLevelNormalized = LEVEL_MAP[selectedLevel] || selectedLevel;
            const userLevelNormalized = user?.grade_level ? (LEVEL_MAP[user.grade_level] || user.grade_level) : null;

            // SECURITY GATE: Logged-in students CANNOT see other levels
            let matchesLevel = true;
            if (isAuthenticated && user?.education_stage) {
                // Lock strictly to student's stage and grade (Normalized)
                matchesLevel = course.educationStage === user.education_stage &&
                    courseLevelNormalized === userLevelNormalized;
            } else {
                // Public view or filter
                matchesLevel = (selectedLevel === "جميع الصفوف" || courseLevelNormalized === selectedLevelNormalized);
            }

            const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSubject && matchesLevel && matchesSearch;
        });
    }, [selectedSubject, selectedLevel, searchQuery, isAuthenticated, user, courses]);

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-500" dir="rtl">
            <Helmet>
                <title>كورسات السير الشامي | جميع المواد الدراسية (ابتدائي، إعدادي، ثانوي)</title>
                <meta name="description" content="تصفح مكتبة شاملة من الكورسات التعليمية في جميع المواد الدراسية. شرح مبسط، مراجعات نهائية، وامتحانات تفاعلية لجميع المراحل (ابتدائي، إعدادي، ثانوي)." />
                <meta name="keywords" content="كورسات تعليمية, شرح مناهج, فيزياء, كيمياء, لغة عربية, رياضيات, أحياء, لغة انجليزية, الصف الثالث الثانوي" />
                <link rel="canonical" href={`${window.location.origin}/courses`} />
            </Helmet>
            <Navbar />

            <main>
                {/* 1. High-Fidelity Hero */}
                <CoursesHero />

                {/* 2. Advanced Smart Filters */}
                <CoursesFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                    selectedLevel={selectedLevel}
                    setSelectedLevel={setSelectedLevel}
                    isLevelLocked={isAuthenticated} // Disable choice for students
                />

                {/* 3. Personalized Courses Grid */}
                {loading ? (
                    <div className="py-32 text-center text-[var(--text-secondary)] font-black text-2xl animate-pulse">
                        جارٍ تحميل الكورسات...
                    </div>
                ) : (
                    <CoursesGrid
                        courses={filteredCourses}
                        levelName={selectedLevel}
                        onEnroll={handleEnroll}
                    />
                )}
            </main>

            <ContactSection />
            <Footer />
        </div>
    );
}
