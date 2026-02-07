
import { Navbar } from '@/core/components/Navbar';
import { Footer } from '@/core/components/Footer';
import { ContactSection } from '@/core/components/ContactSection';
import { Helmet } from 'react-helmet-async';

// Modular Premium Components
import { AboutHero } from './components/AboutHero';
import { AboutVision } from './components/AboutVision';
import { AboutValues } from './components/AboutValues';
import { AboutFounder } from './components/AboutFounder';
import { AboutExperience } from './components/AboutExperience';

export function AboutPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-500 selection:bg-brand-500 selection:text-white" dir="rtl">
            <Helmet>
                <title>عن السير الشامي | رؤيتنا وأهدافنا</title>
                <meta name="description" content="تعرف على قصة نجاح السير الشامي، رؤيتنا لتطوير التعليم في مصر، وفريق العمل المتميز الذي يسعى لتقديم أفضل تجربة تعليمية للطلاب." />
                <meta name="keywords" content="عن السير الشامي, قصة النجاح, رؤية المنصة, فريق العمل, التعليم الإلكتروني" />
                <link rel="canonical" href={`${window.location.origin}/about`} />
            </Helmet>
            <Navbar />

            <main className="relative">
                {/* 1. Hero Section - The Premium Hook */}
                <AboutHero />

                {/* 2. Vision & Mission - The Strategic Depth */}
                <AboutVision />

                {/* 3. Global Values - The Foundation */}
                <AboutValues />

                {/* 4. Experience & Stats - Proof of Impact */}
                <AboutExperience />

                {/* 5. Founder's Message - The Emotional Connection */}
                <AboutFounder />
            </main>

            <ContactSection />
            <Footer />
        </div>
    );
}
