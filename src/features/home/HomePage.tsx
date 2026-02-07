// ============================================================
// HomePage - Al-Seer Al-Shami Math Platform
// ============================================================

import {
    MonitorPlay,
    ShieldCheck,
    Award,
    TrendingUp,
    Calculator
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/core/components/Navbar';
import { Footer } from '@/core/components/Footer';
import { ContactSection } from '@/core/components/ContactSection';

// Luxe Components
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';

import { useSettings } from '@/contexts/SettingsContext';
import { getFileUrl } from '@/utils/fileUrl';

// Default Assets
const DEFAULT_LOGO = '/assets/السير_الشامي/594930133_1456894779774091_6490422839217536606_n.jpg';
const DEFAULT_BANNER = '/assets/السير_الشامي/577042863_1456895286440707_6069203572316920901_n.jpg';

// Features (Math Focused)
const features_data = [
    {
        icon: Calculator,
        title: "شرح مبسط للرياضيات",
        desc: "مع السير الشامي، الجبر والهندسة والتفاضل بقوا أسهل بكتير.",
        gradient: "from-[var(--brand-primary)] to-[var(--brand-secondary)]",
        bgGlow: "bg-[var(--brand-primary)]/20"
    },
    {
        icon: TrendingUp,
        title: "من الصفر للدرجة النهائية",
        desc: "مش محتاج تكون شاطر عشان تبدأ، هنأسسك صح لحد ما تقفل الامتحان.",
        gradient: "from-[var(--brand-accent)] to-[var(--brand-primary)]",
        bgGlow: "bg-[var(--brand-accent)]/20"
    },
    {
        icon: ShieldCheck,
        title: "متابعة اسبوعية وامتحانات",
        desc: "امتحانات دورية على كل درس ومتابعة مستمرة لمستواك عشان نضمن تفوقك.",
        gradient: "from-brand-700 to-brand-900",
        bgGlow: "bg-[var(--brand-secondary)]/20"
    }
];

// Stats (Al-Seer Impact)
const stats_data = [
    { value: "+15K", label: "طالب متفوق", icon: Award },
    { value: "+20", label: "عام خبرة", icon: TrendingUp },
    { value: "+1000", label: "فيديو شرح", icon: MonitorPlay },
];

// Testimonials (Math)
const testimonials_data = [
    {
        name: "أحمد محمود",
        grade: "الثالث الثانوي",
        text: "مع السير الشامي الرياضيات بقت أسهل مادة عندي، جبت 59 من 60 في التفاضل والتكامل.",
        rating: 5
    },
    {
        name: "نورهان علي",
        grade: "الثاني الثانوي",
        text: "أفضل شرح رياضيات شوفته، الامتحانات والمتابعة فرقت معايا جداً.",
        rating: 5
    },
    {
        name: "محمد سعيد",
        grade: "الأول الثانوي",
        text: "السير عبقري في الهندسة، كل مسألة بيحلها بأكتر من طريقة.",
        rating: 5
    }
];

// FAQs (Math)
const faqs_data = [
    {
        q: "هل المنصة بتشمل كل فروع الرياضيات؟",
        a: "أيوه، المنصة بتشمل شرح الجبر، الهندسة، التفاضل والتكامل، الاستاتيكا والديناميكا للصف الثالث الثانوي."
    },
    {
        q: "إزاي أقدر أشترك في المنصة؟",
        a: "بكل سهولة اضغط على زر 'ابدأ رحلتك الآن' وسجل بياناتك، أو تواصل معانا واتساب."
    },
    {
        q: "هل الفيديوهات مسجلة ولا لايف؟",
        a: "الفيديوهات مسجلة بجودة عالية عشان تقدر تتفرج عليها في أي وقت وتراجع براحتك."
    }
];

export function HomePage() {
    const { settings } = useSettings();

    const logoUrl = getFileUrl(settings?.logo_url) || DEFAULT_LOGO;
    const bannerUrl = getFileUrl(settings?.banner_url) || DEFAULT_BANNER;
    const appName = settings?.app_name || 'السير الشامي';

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-300" dir="rtl">
            <Helmet>
                <title>{`${appName} | منصة تعليمية للمراحل الإعدادية والثانوية`}</title>
                <meta name="description" content={`منصة ${appName} التعليمية - أفضل منصة لشرح المناهج الدراسية للمرحلة الإعدادية والثانوية مع نخبة من أقوى المدرسين. فيديوهات، مذكرات، وامتحانات تفاعلية.`} />
                <meta name="keywords" content={`${appName}, تعليم أونلاين, ثانوية عامة, إعدادي, دروس خصوصية, منصة تعليمية, امتحانات الكترونية`} />
                <link rel="canonical" href={window.location.origin} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "EducationalOrganization",
                        "name": appName,
                        "url": window.location.origin,
                        "logo": logoUrl,
                        "sameAs": [
                            "https://www.facebook.com/bastnhalk",
                            "https://www.youtube.com/bastnhalk"
                        ],
                        "description": "منصة تعليمية رائدة تقدم محتوى تعليمي متطور للمراحل الدراسية المختلفة."
                    })}
                </script>
            </Helmet>
            <Navbar />

            {/* Main Page Layout with Luxe Parts */}
            <Hero
                teacherImage={logoUrl} // Using logo as teacher image/main visual for now
                brandImage={bannerUrl}
                appName={appName}
                stats={stats_data}
            />

            <Features features={features_data} />

            <Testimonials testimonials={testimonials_data} />

            <FAQ faqs={faqs_data} />

            <ContactSection />
            <Footer />
        </div>
    );
}
